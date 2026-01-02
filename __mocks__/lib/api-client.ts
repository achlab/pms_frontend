/**
 * Mock API Client for Testing
 */

// Shared mock state
export const mockState = {
  response: null as any,
  error: null as any,
}

export const setMockResponse = (response: any) => {
  mockState.response = response
  mockState.error = null
}

export const setMockError = (error: any) => {
  mockState.error = error
  mockState.response = null
}

export const resetMock = () => {
  mockState.response = null
  mockState.error = null
}

// Create mock methods that directly access mockState
const get = jest.fn(() => {
  if (mockState.error) {
    return Promise.reject(mockState.error)
  }
  return Promise.resolve(mockState.response)
})

const post = jest.fn(() => {
  if (mockState.error) {
    return Promise.reject(mockState.error)
  }
  return Promise.resolve(mockState.response)
})

const put = jest.fn(() => {
  if (mockState.error) {
    return Promise.reject(mockState.error)
  }
  return Promise.resolve(mockState.response)
})

const deleteMethod = jest.fn(() => {
  if (mockState.error) {
    return Promise.reject(mockState.error)
  }
  return Promise.resolve(mockState.response)
})

const patch = jest.fn(() => {
  if (mockState.error) {
    return Promise.reject(mockState.error)
  }
  return Promise.resolve(mockState.response)
})

const apiClient = {
  get,
  post,
  put,
  delete: deleteMethod,
  patch,
}

export const tokenManager = {
  setToken: jest.fn((token: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }),
  getToken: jest.fn(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }),
  clearToken: jest.fn(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }),
  setUserData: jest.fn((user: any) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }),
  getUserData: jest.fn(() => {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem('user')
      return data ? JSON.parse(data) : null
    }
    return null
  }),
  clearAll: jest.fn(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }),
}

export default apiClient
export { apiClient as ApiClient }

