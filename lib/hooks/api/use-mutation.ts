/**
 * Generic Mutation Hook
 * Provides loading, error, and success states for API mutations
 */

'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { handleApiError, getErrorMessage } from '@/lib/api/errors'

export interface MutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error, variables: TVariables) => void
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void
  successMessage?: string
  errorMessage?: string
  showSuccessToast?: boolean
  showErrorToast?: boolean
}

export interface MutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | undefined>
  mutateAsync: (variables: TVariables) => Promise<TData>
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  error: Error | null
  data: TData | undefined
  reset: () => void
}

export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationOptions<TData, TVariables> = {}
): MutationResult<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<TData | undefined>(undefined)

  const {
    onSuccess,
    onError,
    onSettled,
    successMessage,
    errorMessage,
    showSuccessToast = true,
    showErrorToast = true,
  } = options

  const reset = useCallback(() => {
    setIsLoading(false)
    setIsError(false)
    setIsSuccess(false)
    setError(null)
    setData(undefined)
  }, [])

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true)
      setIsError(false)
      setIsSuccess(false)
      setError(null)

      try {
        const result = await mutationFn(variables)
        setData(result)
        setIsSuccess(true)

        if (showSuccessToast && successMessage) {
          toast.success('Success', { description: successMessage })
        }

        onSuccess?.(result, variables)
        onSettled?.(result, null, variables)

        return result
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error('An error occurred')
        setError(errorInstance)
        setIsError(true)

        if (showErrorToast) {
          handleApiError(err, errorMessage)
        }

        onError?.(errorInstance, variables)
        onSettled?.(undefined, errorInstance, variables)

        throw errorInstance
      } finally {
        setIsLoading(false)
      }
    },
    [mutationFn, onSuccess, onError, onSettled, successMessage, errorMessage, showSuccessToast, showErrorToast]
  )

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | undefined> => {
      try {
        return await mutateAsync(variables)
      } catch {
        return undefined
      }
    },
    [mutateAsync]
  )

  return {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    isSuccess,
    error,
    data,
    reset,
  }
}
