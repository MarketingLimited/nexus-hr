import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/dataService'
import { User } from '../mocks/data/auth'
import { toast } from 'sonner'

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
  users: (params?: any) => [...authKeys.all, 'users', params] as const,
  user: (id: string) => [...authKeys.all, 'user', id] as const,
  roles: () => [...authKeys.all, 'roles'] as const,
  permissions: (params?: any) => [...authKeys.all, 'permissions', params] as const,
}

// Get current authenticated user
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: () => authService.getCurrentUser(),
    select: (data) => data.data,
    retry: false,
  })
}

// Get all users with filters
export function useUsers(params?: { role?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: authKeys.users(params),
    queryFn: () => authService.getUsers(params),
    select: (data) => data.data,
  })
}

// Get single user by ID
export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: authKeys.user(id),
    queryFn: () => authService.getUserById(id),
    enabled: enabled && !!id,
    select: (data) => data.data,
  })
}

// Get all roles
export function useRoles() {
  return useQuery({
    queryKey: authKeys.roles(),
    queryFn: () => authService.getRoles(),
    select: (data) => data.data,
  })
}

// Get permissions
export function usePermissions(params?: { role?: string }) {
  return useQuery({
    queryKey: authKeys.permissions(params),
    queryFn: () => authService.getPermissions(params),
    select: (data) => data.data,
  })
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authService.login(credentials),
    onSuccess: (data) => {
      // Store auth token
      localStorage.setItem('auth_token', data.data.session.token)
      localStorage.setItem('refresh_token', data.data.session.refreshToken)
      
      // Update current user cache
      queryClient.setQueryData(authKeys.currentUser(), { data: data.data.user })
      
      toast.success('Logged in successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed')
    },
  })
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear tokens
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      
      // Clear all queries
      queryClient.clear()
      
      toast.success('Logged out successfully')
    },
    onError: (error: Error) => {
      // Even if logout fails on server, clear local data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      queryClient.clear()
      
      toast.error(error.message || 'Logout failed')
    },
  })
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<User>) => authService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() })
      toast.success('User created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user')
    },
  })
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      authService.updateUser(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() })
      queryClient.invalidateQueries({ queryKey: authKeys.user(variables.id) })
      toast.success('User updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user')
    },
  })
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => authService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() })
      toast.success('User deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user')
    },
  })
}

// Change password mutation
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password')
    },
  })
}