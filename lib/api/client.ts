/**
 * HTTP Client
 * Core HTTP client with token management, refresh-on-401, and retry logic.
 *
 * Responses are returned as the parsed JSON body itself. The API has no
 * `data` envelope — see the note in types/api.types.ts.
 */

import { apiConfig, API_ENDPOINTS, STORAGE_KEYS } from './config'
import type { RequestConfig, HttpMethod } from './types'
import {
  ApiError,
  NetworkError,
  TimeoutError,
  AuthenticationError,
  parseApiError,
} from './errors'

/**
 * Token Manager
 * Handles token storage and retrieval
 */
export const tokenManager = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  },

  setTokens(access: string, refresh?: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access)
    // A refresh response may rotate only the access token.
    if (refresh) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh)
  },

  clearTokens(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_TYPE)
  },

  getUserType(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.USER_TYPE)
  },

  setUserType(type: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.USER_TYPE, type)
  },
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * HTTP Client Class
 */
class HttpClient {
  private baseUrl: string
  private timeout: number
  private retryAttempts: number
  private retryDelay: number

  /**
   * In-flight refresh, shared so that N concurrent 401s trigger one refresh
   * rather than N competing ones (which would rotate the token out from under
   * each other and log the user out).
   */
  private refreshInFlight: Promise<string | null> | null = null

  constructor() {
    this.baseUrl = apiConfig.baseUrl
    this.timeout = apiConfig.timeout
    this.retryAttempts = apiConfig.retryAttempts
    this.retryDelay = apiConfig.retryDelay
  }

  private buildHeaders(
    config?: RequestConfig,
    customToken?: string
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config?.headers,
    }

    const token = customToken || tokenManager.getAccessToken()
    if (token && !config?.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(`${this.baseUrl}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError()
      }
      throw error
    }
  }

  /**
   * Parse a response body, tolerating non-JSON.
   *
   * The backend serves Flask's HTML error page for unmatched routes, so a
   * wrong path yields `text/html` rather than JSON. Returning null here lets
   * parseApiError fall back to a status-based message instead of throwing an
   * unhelpful SyntaxError.
   */
  private async parseBody(
    response: Response
  ): Promise<Record<string, unknown> | null> {
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) return null

    try {
      return (await response.json()) as Record<string, unknown>
    } catch {
      return null
    }
  }

  /**
   * Exchange the refresh token for a fresh access token.
   * Returns the new access token, or null if the session is unrecoverable.
   */
  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = tokenManager.getRefreshToken()
    if (!refreshToken) return null

    try {
      const url = this.buildUrl(API_ENDPOINTS.AUTH.REFRESH_TOKEN)
      const response = await this.fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            // The refresh endpoint authenticates with the REFRESH token.
            Authorization: `Bearer ${refreshToken}`,
          },
        },
        this.timeout
      )

      if (!response.ok) return null

      const body = await this.parseBody(response)
      if (!body) return null

      // Accept either { access: { token, refresh_token } } or a bare { token }.
      const access = body.access as
        | { token?: string; refresh_token?: string }
        | undefined
      const newAccess = access?.token || (body.token as string | undefined)
      if (!newAccess) return null

      tokenManager.setTokens(newAccess, access?.refresh_token)
      return newAccess
    } catch {
      return null
    }
  }

  /** Coalesce concurrent refresh attempts into one request. */
  private refreshOnce(): Promise<string | null> {
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.refreshAccessToken().finally(() => {
        this.refreshInFlight = null
      })
    }
    return this.refreshInFlight
  }

  /**
   * Session is over: drop tokens and let the auth context redirect.
   */
  private handleUnauthorized(): void {
    tokenManager.clearTokens()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
  }

  /**
   * Main request method.
   */
  async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
    customToken?: string
  ): Promise<T> {
    const url = this.buildUrl(endpoint, config?.params)
    const timeout = config?.timeout || this.timeout

    const send = (headers: Record<string, string>) =>
      this.fetchWithTimeout(
        url,
        { method, headers, body: data ? JSON.stringify(data) : undefined },
        timeout
      )

    let attempts = 0
    let lastError: Error | null = null

    while (attempts < this.retryAttempts) {
      try {
        let response = await send(this.buildHeaders(config, customToken))

        // A 401 on an authenticated call may just mean the access token aged
        // out. Try one refresh before giving up on the session.
        const canRefresh =
          response.status === 401 &&
          !config?.skipAuth &&
          !config?.skipRefresh &&
          !customToken

        if (canRefresh) {
          const newToken = await this.refreshOnce()
          if (newToken) {
            response = await send(this.buildHeaders(config, newToken))
          }
        }

        if (response.status === 401) {
          // Refresh was impossible or itself rejected — the session is done.
          if (!config?.skipAuth) this.handleUnauthorized()
          const body = await this.parseBody(response)
          throw parseApiError(401, body)
        }

        const body = await this.parseBody(response)

        if (!response.ok) {
          throw parseApiError(response.status, body)
        }

        // Some endpoints report failure in the body while still returning 2xx.
        if (body && body.success === false) {
          throw parseApiError(response.status, body)
        }

        return (body ?? {}) as T
      } catch (error) {
        lastError = error as Error

        if (
          error instanceof AuthenticationError ||
          error instanceof ApiError ||
          error instanceof TimeoutError
        ) {
          throw error
        }

        // Retry only genuine connection failures.
        if (error instanceof TypeError) {
          attempts++
          if (attempts < this.retryAttempts) {
            await sleep(this.retryDelay * Math.pow(2, attempts - 1))
            continue
          }
          throw new NetworkError()
        }

        throw error
      }
    }

    throw lastError || new NetworkError()
  }

  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, config)
  }

  post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
    customToken?: string
  ): Promise<T> {
    return this.request<T>('POST', endpoint, data, config, customToken)
  }

  put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', endpoint, data, config)
  }

  patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, config)
  }

  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, config)
  }
}

export const httpClient = new HttpClient()
