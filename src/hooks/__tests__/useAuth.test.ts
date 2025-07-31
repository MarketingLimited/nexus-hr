import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@/test-utils'
import { useAuth } from '../useAuth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import React, { ReactNode } from 'react'

// Mock the API
const mockLoginAPI = vi.fn()
const mockLogoutAPI = vi.fn()
const mockGetCurrentUser = vi.fn()

vi.mock('@/services/api', () => ({
  login: (...args: any[]) => mockLoginAPI(...args),
  logout: (...args: any[]) => mockLogoutAPI(...args),
  getCurrentUser: (...args: any[]) => mockGetCurrentUser(...args)
}))

describe('useAuth Hook', () => {
  let queryClient: QueryClient

  const wrapper = ({ children }: { children: ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(AuthProvider, null, children)
    )
  )

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('starts with no user and not loading', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Login Function', () => {
    it('successfully logs in user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@company.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'employee' as const,
        avatar: '/avatar.jpg'
      }

      mockLoginAPI.mockResolvedValueOnce({
        data: {
          user: mockUser,
          token: 'jwt-token'
        }
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('test@company.com', 'password123')
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockLoginAPI).toHaveBeenCalledWith('test@company.com', 'password123')
    })

    it('handles login failure', async () => {
      mockLoginAPI.mockRejectedValueOnce(new Error('Invalid credentials'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await expect(async () => {
        await act(async () => {
          await result.current.login('test@company.com', 'wrongpassword')
        })
      }).rejects.toThrow('Invalid credentials')

      expect(result.current.user).toBeNull()
    })

    it('sets loading state during login', async () => {
      let resolveLogin: (value: any) => void
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve
      })
      mockLoginAPI.mockReturnValueOnce(loginPromise)

      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        result.current.login('test@company.com', 'password123')
      })

      // Should be loading
      expect(result.current.isLoading).toBe(true)

      // Resolve the login
      act(() => {
        resolveLogin({
          data: {
            user: { id: '1', email: 'test@company.com' },
            token: 'jwt-token'
          }
        })
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('Logout Function', () => {
    it('successfully logs out user', async () => {
      // First log in
      const mockUser = {
        id: '1',
        email: 'test@company.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'employee' as const,
        avatar: '/avatar.jpg'
      }

      mockLoginAPI.mockResolvedValueOnce({
        data: {
          user: mockUser,
          token: 'jwt-token'
        }
      })

      mockLogoutAPI.mockResolvedValueOnce({ success: true })

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Login
      await act(async () => {
        await result.current.login('test@company.com', 'password123')
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      // Logout
      await act(async () => {
        await result.current.logout()
      })

      await waitFor(() => {
        expect(result.current.user).toBeNull()
      })

      expect(mockLogoutAPI).toHaveBeenCalled()
    })

    it('handles logout failure gracefully', async () => {
      mockLogoutAPI.mockRejectedValueOnce(new Error('Logout failed'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Should not throw error but still clear user
      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
    })
  })

  describe('Token Management', () => {
    it('stores token in localStorage on login', async () => {
      const mockToken = 'jwt-token-123'
      mockLoginAPI.mockResolvedValueOnce({
        data: {
          user: { id: '1', email: 'test@company.com' },
          token: mockToken
        }
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('test@company.com', 'password123')
      })

      await waitFor(() => {
        expect(localStorage.getItem('auth_token')).toBe(mockToken)
      })
    })

    it('removes token from localStorage on logout', async () => {
      // Set initial token
      localStorage.setItem('auth_token', 'existing-token')
      
      mockLogoutAPI.mockResolvedValueOnce({ success: true })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.logout()
      })

      await waitFor(() => {
        expect(localStorage.getItem('auth_token')).toBeNull()
      })
    })
  })

  describe('User Session Restoration', () => {
    it('restores user session from stored token', async () => {
      const mockUser = {
        id: '1',
        email: 'test@company.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'employee' as const,
        avatar: '/avatar.jpg'
      }

      // Simulate stored token
      localStorage.setItem('auth_token', 'stored-token')
      
      mockGetCurrentUser.mockResolvedValueOnce({
        data: mockUser
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      expect(mockGetCurrentUser).toHaveBeenCalled()
    })

    it('handles invalid stored token', async () => {
      localStorage.setItem('auth_token', 'invalid-token')
      
      mockGetCurrentUser.mockRejectedValueOnce(new Error('Invalid token'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(localStorage.getItem('auth_token')).toBeNull()
      })
    })
  })

  describe('Permission Checking', () => {
    it('provides hasPermission utility', async () => {
      const mockUser = {
        id: '1',
        email: 'admin@company.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin' as const,
        avatar: '/avatar.jpg',
        permissions: ['users.read', 'users.write', 'employees.manage']
      }

      mockLoginAPI.mockResolvedValueOnce({
        data: {
          user: mockUser,
          token: 'jwt-token'
        }
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('admin@company.com', 'password123')
      })

      await waitFor(() => {
        expect(result.current.hasPermission('users.read')).toBe(true)
        expect(result.current.hasPermission('users.write')).toBe(true)
        expect(result.current.hasPermission('employees.manage')).toBe(true)
        expect(result.current.hasPermission('admin.delete')).toBe(false)
      })
    })

    it('checks role-based permissions', async () => {
      const mockUser = {
        id: '1',
        email: 'hr@company.com',
        firstName: 'HR',
        lastName: 'User',
        role: 'hr' as const,
        avatar: '/avatar.jpg'
      }

      mockLoginAPI.mockResolvedValueOnce({
        data: {
          user: mockUser,
          token: 'jwt-token'
        }
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('hr@company.com', 'password123')
      })

      await waitFor(() => {
        expect(result.current.isAdmin()).toBe(false)
        expect(result.current.isHR()).toBe(true)
        expect(result.current.isManager()).toBe(false)
        expect(result.current.isEmployee()).toBe(false)
      })
    })
  })

  describe('Loading States', () => {
    it('manages loading state correctly during operations', async () => {
      let resolveLogin: (value: any) => void
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve
      })
      mockLoginAPI.mockReturnValueOnce(loginPromise)

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Start login
      act(() => {
        result.current.login('test@company.com', 'password123')
      })

      expect(result.current.isLoading).toBe(true)

      // Complete login
      act(() => {
        resolveLogin({
          data: {
            user: { id: '1', email: 'test@company.com' },
            token: 'jwt-token'
          }
        })
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('Error Handling', () => {
    it('handles network errors during login', async () => {
      mockLoginAPI.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await expect(async () => {
        await act(async () => {
          await result.current.login('test@company.com', 'password123')
        })
      }).rejects.toThrow('Network error')

      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })
  })
})