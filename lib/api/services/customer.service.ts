/**
 * Customer Service
 * Handles all customer (tenant) related API calls
 */

import { httpClient } from '../client'
import { API_ENDPOINTS } from '../config'
import type {
  CustomerRegistrationData,
  CustomerRegistrationResponse,
  CustomerUpdateData,
  CustomerUpdateResponse,
  Customer,
  CustomerAccountResponse,
} from '../types/customer.types'

/**
 * Pull the customer object out of an account response.
 *
 * The exact nesting is unconfirmed (activation is blocked on OTP delivery), so
 * accept the three plausible shapes rather than guessing one and breaking the
 * dashboard on first contact.
 */
export function extractCustomer(response: CustomerAccountResponse): Customer | null {
  if (response.customer) return response.customer
  if (response.account) return response.account

  // Flat: fields sit alongside msg/success. Only trust it if something
  // identifying is actually present.
  if (response.id || response.email || response.msisdn) {
    const { msg, success, customer, account, ...rest } = response
    void msg
    void success
    void customer
    void account
    return rest as Customer
  }

  return null
}

export const customerService = {
  /**
   * Register a new customer (tenant).
   * Returns only { msg, success } — no customer object, no tokens.
   * The account starts INACTIVE and must be verified by OTP before login.
   */
  async register(
    data: CustomerRegistrationData
  ): Promise<CustomerRegistrationResponse> {
    return httpClient.post<CustomerRegistrationResponse>(
      API_ENDPOINTS.CUSTOMERS.REGISTER,
      data,
      { skipAuth: true }
    )
  },

  /**
   * Update customer profile.
   * `id` goes in the query string — the backend has no /customers/update/<id>
   * route, and sending one 404s.
   */
  async update(
    id: string,
    data: CustomerUpdateData
  ): Promise<CustomerUpdateResponse> {
    return httpClient.patch<CustomerUpdateResponse>(
      API_ENDPOINTS.CUSTOMERS.UPDATE,
      data,
      { params: { id } }
    )
  },

  /**
   * Get the logged-in customer's account.
   */
  async getMyAccount(): Promise<CustomerAccountResponse> {
    return httpClient.get<CustomerAccountResponse>(
      API_ENDPOINTS.CUSTOMERS.MY_ACCOUNT
    )
  },
}
