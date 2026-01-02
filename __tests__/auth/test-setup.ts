/**
 * Authentication Test Setup and Utilities
 * Provides shared test utilities for authentication testing
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Create axios instance mock
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  request: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
  },
}

// Make axios.create return our mock instance
mockedAxios.create = jest.fn(() => mockAxiosInstance as any)

// Export for direct access in tests
export { mockAxiosInstance }

// Mock localStorage
export const mockLocalStorage = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
  }
})()

// Setup localStorage mock
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })
  mockLocalStorage.clear()
})

// Mock API client response
export const mockFetch = (response: any, options: { status?: number; ok?: boolean } = {}) => {
  const status = options.status || 200
  const isSuccess = options.ok !== undefined ? options.ok : status >= 200 && status < 300
  
  if (isSuccess) {
    // Mock successful response
    mockAxiosInstance.get.mockResolvedValueOnce({ data: response })
    mockAxiosInstance.post.mockResolvedValueOnce({ data: response })
    mockAxiosInstance.put.mockResolvedValueOnce({ data: response })
    mockAxiosInstance.delete.mockResolvedValueOnce({ data: response })
    mockAxiosInstance.patch.mockResolvedValueOnce({ data: response })
  } else {
    // Mock error response
    const error: any = new Error('Request failed with status code ' + status)
    error.response = {
      data: response,
      status: status,
      statusText: status === 401 ? 'Unauthorized' : status === 422 ? 'Unprocessable Entity' : 'Error',
      headers: {},
      config: {},
    }
    error.isAxiosError = true
    error.code = 'ERR_BAD_REQUEST'
    
    mockAxiosInstance.get.mockRejectedValueOnce(error)
    mockAxiosInstance.post.mockRejectedValueOnce(error)
    mockAxiosInstance.put.mockRejectedValueOnce(error)
    mockAxiosInstance.delete.mockRejectedValueOnce(error)
    mockAxiosInstance.patch.mockRejectedValueOnce(error)
  }
}

// Reset API client mock
export const resetFetchMock = () => {
  mockAxiosInstance.get.mockReset()
  mockAxiosInstance.post.mockReset()
  mockAxiosInstance.put.mockReset()
  mockAxiosInstance.delete.mockReset()
  mockAxiosInstance.patch.mockReset()
}

// Custom render function for tests
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { ...options })
}

// Wait for async operations
export const waitFor = (callback: () => void, options?: { timeout?: number }) => {
  return new Promise<void>((resolve) => {
    const timeout = options?.timeout || 1000
    const startTime = Date.now()

    const check = () => {
      try {
        callback()
        resolve()
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          throw error
        }
        setTimeout(check, 50)
      }
    }

    check()
  })
}

export default {
  mockLocalStorage,
  mockFetch,
  resetFetchMock,
  renderWithProviders,
  waitFor,
}

