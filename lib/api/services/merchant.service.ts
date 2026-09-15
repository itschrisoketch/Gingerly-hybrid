/**
 * Merchant Service
 * Handles all merchant (landlord) related API calls
 */

import { httpClient } from '../client'
import { API_ENDPOINTS } from '../config'
import type { MessageResponse } from '../types'
import type {
  MerchantRegistrationData,
  MerchantRegistrationResponse,
  MerchantUpdateData,
  MerchantUpdateResponse,
  Merchant,
  MerchantAccountResponse,
} from '../types/merchant.types'

/**
 * Pull the merchant object out of an account response.
 * Same unconfirmed-nesting caveat as extractCustomer.
 */
export function extractMerchant(response: MerchantAccountResponse): Merchant | null {
  if (response.merchant) return response.merchant
  if (response.account) return response.account

  if (response.id || response.merchant_id || response.email || response.msisdn) {
    const { msg, success, merchant, account, ...rest } = response
    void msg
    void success
    void merchant
    void account
    return rest as Merchant
  }

  return null
}

export const merchantService = {
  /**
   * Register a new merchant (landlord).
   * Takes a single `full_name` — not first_name/last_name.
   * The account starts INACTIVE and must be verified by OTP before login.
   */
  async register(
    data: MerchantRegistrationData
  ): Promise<MerchantRegistrationResponse> {
    return httpClient.post<MerchantRegistrationResponse>(
      API_ENDPOINTS.MERCHANTS.REGISTER,
      data,
      { skipAuth: true }
    )
  },

  /**
   * Update merchant profile. Here the id IS a path segment
   * (unlike customers — that asymmetry is the backend's).
   */
  async update(
    id: string,
    data: MerchantUpdateData
  ): Promise<MerchantUpdateResponse> {
    return httpClient.patch<MerchantUpdateResponse>(
      API_ENDPOINTS.MERCHANTS.UPDATE(id),
      data
    )
  },

  /**
   * Get the logged-in merchant's account.
   */
  async getMyAccount(): Promise<MerchantAccountResponse> {
    return httpClient.get<MerchantAccountResponse>(
      API_ENDPOINTS.MERCHANTS.MY_ACCOUNT
    )
  },

  /**
   * Get a single merchant by id.
   */
  async getById(id: string): Promise<MerchantAccountResponse> {
    return httpClient.get<MerchantAccountResponse>(
      API_ENDPOINTS.MERCHANTS.DETAIL(id)
    )
  },

  /**
   * List merchants.
   */
  async list(): Promise<MessageResponse & { merchants?: Merchant[] }> {
    return httpClient.get(API_ENDPOINTS.MERCHANTS.LIST)
  },
}
