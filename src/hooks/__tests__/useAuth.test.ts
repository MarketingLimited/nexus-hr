import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { createTestQueryClient } from '../../test-utils'
import { 
  useCurrentUser, 
  useUsers, 
  useLogin,
  useLogout,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useChangePassword,
  authKeys
} from '../useAuth'

// Mock all auth service functions
vi.mock('../../services/api', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    getUsers: vi.fn(),
    login: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    changePassword: vi.fn()
  }
}))

describe('useAuth Hooks', () => {
  let queryClient: QueryClient
  let wrapper: any

  beforeEach(() => {
    queryClient = createTestQueryClient()
    wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('useCurrentUser', () => {
    it('should fetch current user', async () => {
      const mockUser = { data: { id: 'user-1', name: 'John Doe' } } as any
      const mockService = await import('../../services/api') as any
      vi.mocked(mockService.authService.getCurrentUser).mockResolvedValue(mockUser)

      const { result } = renderHook(() => useCurrentUser(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUser.data)
    })
  })

  describe('useUsers', () => {
    it('should fetch all users', async () => {
      const mockUsers = { data: [{ id: 'user-1', name: 'John' }] } as any
      const mockService = await import('../../services/api') as any
      vi.mocked(mockService.authService.getUsers).mockResolvedValue(mockUsers)

      const { result } = renderHook(() => useUsers(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUsers)
    })
  })

  describe('Query Keys', () => {
    it('should generate correct query keys', () => {
      expect(authKeys.all).toEqual(['auth'])
      expect(authKeys.currentUser()).toEqual(['auth', 'currentUser'])
      expect(authKeys.users()).toEqual(['auth', 'users'])
    })
  })
})