import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { createTestQueryClient } from '../test-utils'
import { 
  useCurrentUser, 
  useUsers, 
  useUser, 
  useRoles, 
  usePermissions,
  useLogin,
  useLogout,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useChangePassword,
  authKeys
} from '../useAuth'
import { authService } from '../../services/dataService'
import { toast } from 'sonner'

// Mock dependencies
vi.mock('../../services/dataService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    getUsers: vi.fn(),
    getUserById: vi.fn(),
    getRoles: vi.fn(),
    getPermissions: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    changePassword: vi.fn()
  }
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

describe('useAuth Hooks', () => {
  let queryClient: QueryClient
  let wrapper: React.FC<{ children: React.ReactNode }>

  beforeEach(() => {
    queryClient = createTestQueryClient()
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('useCurrentUser', () => {
    it('should fetch current user successfully', async () => {
      const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' }
      const mockResponse = { data: mockUser }
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCurrentUser(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUser)
      expect(authService.getCurrentUser).toHaveBeenCalledOnce()
    })

    it('should handle errors when fetching current user', async () => {
      const mockError = new Error('Authentication failed')
      vi.mocked(authService.getCurrentUser).mockRejectedValue(mockError)

      const { result } = renderHook(() => useCurrentUser(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })

    it('should use correct query key', () => {
      renderHook(() => useCurrentUser(), { wrapper })
      
      const queries = queryClient.getQueryCache().getAll()
      expect(queries.some(query => 
        JSON.stringify(query.queryKey) === JSON.stringify(authKeys.currentUser())
      )).toBe(true)
    })

    it('should not retry on failure', async () => {
      vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Auth failed'))

      const { result } = renderHook(() => useCurrentUser(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(authService.getCurrentUser).toHaveBeenCalledTimes(1) // No retries
    })
  })

  describe('useUsers', () => {
    it('should fetch users with filters', async () => {
      const mockUsers = [
        { id: '1', name: 'John Doe', role: 'admin' },
        { id: '2', name: 'Jane Smith', role: 'employee' }
      ]
      const mockResponse = { data: mockUsers }
      vi.mocked(authService.getUsers).mockResolvedValue(mockResponse)

      const params = { role: 'admin', status: 'active' }
      const { result } = renderHook(() => useUsers(params), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUsers)
      expect(authService.getUsers).toHaveBeenCalledWith(params)
    })

    it('should fetch users without filters', async () => {
      const mockResponse = { data: [] }
      vi.mocked(authService.getUsers).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useUsers(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(authService.getUsers).toHaveBeenCalledWith(undefined)
    })
  })

  describe('useUser', () => {
    it('should fetch user by ID when enabled', async () => {
      const mockUser = { id: 'user-1', name: 'John Doe' }
      const mockResponse = { data: mockUser }
      vi.mocked(authService.getUserById).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useUser('user-1', true), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUser)
      expect(authService.getUserById).toHaveBeenCalledWith('user-1')
    })

    it('should not fetch when disabled', () => {
      const { result } = renderHook(() => useUser('user-1', false), { wrapper })

      expect(result.current.isFetching).toBe(false)
      expect(authService.getUserById).not.toHaveBeenCalled()
    })

    it('should not fetch when ID is empty', () => {
      const { result } = renderHook(() => useUser('', true), { wrapper })

      expect(result.current.isFetching).toBe(false)
      expect(authService.getUserById).not.toHaveBeenCalled()
    })
  })

  describe('useRoles', () => {
    it('should fetch available roles', async () => {
      const mockRoles = ['admin', 'manager', 'employee']
      const mockResponse = { data: mockRoles }
      vi.mocked(authService.getRoles).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useRoles(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockRoles)
      expect(authService.getRoles).toHaveBeenCalledOnce()
    })
  })

  describe('usePermissions', () => {
    it('should fetch permissions with filters', async () => {
      const mockPermissions = ['read', 'write', 'admin']
      const mockResponse = { data: mockPermissions }
      vi.mocked(authService.getPermissions).mockResolvedValue(mockResponse)

      const params = { role: 'admin' }
      const { result } = renderHook(() => usePermissions(params), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockPermissions)
      expect(authService.getPermissions).toHaveBeenCalledWith(params)
    })
  })

  describe('useLogin', () => {
    it('should login successfully and store tokens', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', name: 'John Doe', email: 'john@example.com' },
          session: {
            token: 'auth-token',
            refreshToken: 'refresh-token'
          }
        }
      }
      vi.mocked(authService.login).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useLogin(), { wrapper })

      const credentials = { email: 'john@example.com', password: 'password' }
      result.current.mutate(credentials)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(authService.login).toHaveBeenCalledWith(credentials)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', 'auth-token')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh-token')
      expect(toast.success).toHaveBeenCalledWith('Logged in successfully')
    })

    it('should handle login failure', async () => {
      const mockError = new Error('Invalid credentials')
      vi.mocked(authService.login).mockRejectedValue(mockError)

      const { result } = renderHook(() => useLogin(), { wrapper })

      const credentials = { email: 'wrong@example.com', password: 'wrong' }
      result.current.mutate(credentials)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
    })

    it('should update current user cache on successful login', async () => {
      const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' }
      const mockResponse = {
        data: {
          user: mockUser,
          session: { token: 'token', refreshToken: 'refresh' }
        }
      }
      vi.mocked(authService.login).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useLogin(), { wrapper })

      result.current.mutate({ email: 'john@example.com', password: 'password' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const cachedUser = queryClient.getQueryData(authKeys.currentUser())
      expect(cachedUser).toEqual({ data: mockUser })
    })
  })

  describe('useLogout', () => {
    it('should logout successfully and clear data', async () => {
      vi.mocked(authService.logout).mockResolvedValue({})

      const { result } = renderHook(() => useLogout(), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(authService.logout).toHaveBeenCalledOnce()
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refresh_token')
      expect(toast.success).toHaveBeenCalledWith('Logged out successfully')
    })

    it('should clear local data even if logout fails', async () => {
      const mockError = new Error('Logout failed')
      vi.mocked(authService.logout).mockRejectedValue(mockError)

      const { result } = renderHook(() => useLogout(), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refresh_token')
      expect(toast.error).toHaveBeenCalledWith('Logout failed')
    })
  })

  describe('useCreateUser', () => {
    it('should create user successfully and invalidate cache', async () => {
      const mockUser = { id: '1', name: 'New User', email: 'new@example.com' }
      const mockResponse = { data: mockUser }
      vi.mocked(authService.createUser).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCreateUser(), { wrapper })

      const userData = { name: 'New User', email: 'new@example.com', role: 'employee' }
      result.current.mutate(userData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(authService.createUser).toHaveBeenCalledWith(userData)
      expect(toast.success).toHaveBeenCalledWith('User created successfully')
    })

    it('should handle create user failure', async () => {
      const mockError = new Error('Creation failed')
      vi.mocked(authService.createUser).mockRejectedValue(mockError)

      const { result } = renderHook(() => useCreateUser(), { wrapper })

      result.current.mutate({ name: 'Test User' })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(toast.error).toHaveBeenCalledWith('Creation failed')
    })
  })

  describe('useUpdateUser', () => {
    it('should update user successfully', async () => {
      const mockResponse = { data: { id: '1', name: 'Updated User' } }
      vi.mocked(authService.updateUser).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useUpdateUser(), { wrapper })

      const updateData = { id: '1', data: { name: 'Updated User' } }
      result.current.mutate(updateData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(authService.updateUser).toHaveBeenCalledWith('1', { name: 'Updated User' })
      expect(toast.success).toHaveBeenCalledWith('User updated successfully')
    })
  })

  describe('useDeleteUser', () => {
    it('should delete user successfully', async () => {
      const mockResponse = { message: 'User deleted' }
      vi.mocked(authService.deleteUser).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useDeleteUser(), { wrapper })

      result.current.mutate('user-1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(authService.deleteUser).toHaveBeenCalledWith('user-1')
      expect(toast.success).toHaveBeenCalledWith('User deleted successfully')
    })
  })

  describe('useChangePassword', () => {
    it('should change password successfully', async () => {
      const mockResponse = { message: 'Password changed' }
      vi.mocked(authService.changePassword).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useChangePassword(), { wrapper })

      const passwordData = { currentPassword: 'old', newPassword: 'new' }
      result.current.mutate(passwordData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(authService.changePassword).toHaveBeenCalledWith(passwordData)
      expect(toast.success).toHaveBeenCalledWith('Password changed successfully')
    })

    it('should handle password change failure', async () => {
      const mockError = new Error('Current password is incorrect')
      vi.mocked(authService.changePassword).mockRejectedValue(mockError)

      const { result } = renderHook(() => useChangePassword(), { wrapper })

      result.current.mutate({ currentPassword: 'wrong', newPassword: 'new' })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(toast.error).toHaveBeenCalledWith('Current password is incorrect')
    })
  })

  describe('Query Keys', () => {
    it('should generate correct query keys', () => {
      expect(authKeys.currentUser()).toEqual(['auth', 'currentUser'])
      expect(authKeys.users({ role: 'admin' })).toEqual(['auth', 'users', { role: 'admin' }])
      expect(authKeys.user('123')).toEqual(['auth', 'user', '123'])
      expect(authKeys.roles()).toEqual(['auth', 'roles'])
      expect(authKeys.permissions({ role: 'admin' })).toEqual(['auth', 'permissions', { role: 'admin' }])
    })
  })
})