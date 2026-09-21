/**
 * Auth Context
 * Provides authentication state and methods throughout the app
 */

'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { tokenManager } from '@/lib/api/client'
import { authService } from '@/lib/api/services'
import { customerService, extractCustomer } from '@/lib/api/services/customer.service'
import { merchantService, extractMerchant } from '@/lib/api/services/merchant.service'
import type { UserType } from '@/lib/api/config'
import type { Customer } from '@/lib/api/types/customer.types'
import type { Merchant } from '@/lib/api/types/merchant.types'

/**
 * Auth State Types
 */
export type AuthUser = Customer | Merchant | null

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser
  userType: UserType | null
}

export interface AuthContextValue extends AuthState {
  /**
   * Hydrate session state after authService.login has stored the tokens.
   * Tokens are the service's responsibility; this only loads the profile.
   */
  login: (type: UserType) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Protected routes that require authentication
 */
const PROTECTED_ROUTES = ['/dashboard']

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    userType: null,
  })

  /**
   * Fetch current user based on user type.
   */
  const fetchUser = useCallback(async (type: UserType): Promise<AuthUser> => {
    try {
      if (type === 'customer') {
        return extractCustomer(await customerService.getMyAccount())
      }
      return extractMerchant(await merchantService.getMyAccount())
    } catch {
      return null
    }
  }, [])

  /**
   * Mark the session live and load the profile.
   *
   * Authentication is decided by the token, not by whether the profile call
   * succeeds — a flaky /my-account must not bounce a user who just logged in
   * back to the login screen.
   */
  const login = useCallback(
    async (type: UserType) => {
      tokenManager.setUserType(type)
      const user = await fetchUser(type)

      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        userType: type,
      })
    },
    [fetchUser]
  )

  const logout = useCallback(async () => {
    await authService.logout()
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      userType: null,
    })
    router.push('/login')
  }, [router])

  const refreshUser = useCallback(async () => {
    const type = tokenManager.getUserType() as UserType | null
    if (!type) return

    const user = await fetchUser(type)
    setState((prev) => ({ ...prev, user }))
  }, [fetchUser])

  /**
   * Initialize auth state on mount.
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenManager.getAccessToken()
      const type = tokenManager.getUserType() as UserType | null

      if (!token || !type) {
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          userType: null,
        })
        return
      }

      const user = await fetchUser(type)

      // A held token that the API rejects is handled by the client's
      // auth:logout event, not here — a transient network failure on
      // /my-account should not silently sign the user out.
      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        userType: type,
      })
    }

    initAuth()
  }, [fetchUser])

  /**
   * Listen for logout events (dispatched when a refresh attempt fails).
   */
  useEffect(() => {
    const handleLogoutEvent = () => {
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        userType: null,
      })
      router.push('/login')
    }

    window.addEventListener('auth:logout', handleLogoutEvent)
    return () => window.removeEventListener('auth:logout', handleLogoutEvent)
  }, [router])

  /**
   * Route protection
   */
  useEffect(() => {
    if (state.isLoading) return

    // Local development escape hatch, for working on dashboard UI without
    // re-authenticating every time a token expires.
    //
    // Gated on NODE_ENV as well as the flag, deliberately. NODE_ENV is fixed to
    // 'production' by `next build`, so this branch is unreachable in a
    // production bundle even if NEXT_PUBLIC_DISABLE_AUTH_GUARD is set in the
    // deploy environment by mistake. The flag alone would not be safe: anything
    // NEXT_PUBLIC_ is inlined into client JS and would ship.
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.NEXT_PUBLIC_DISABLE_AUTH_GUARD === 'true'
    ) {
      return
    }

    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    )

    if (isProtectedRoute && !state.isAuthenticated) {
      router.push('/login')
    }
  }, [state.isLoading, state.isAuthenticated, pathname, router])

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth Hook
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
