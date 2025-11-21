import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { api } from '@/services/api'
import { toast } from 'sonner'
import type { Employee } from '@/types'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  employee?: Employee
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  permissions: string[]
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PERMISSIONS'; payload: string[] }
  | { type: 'LOGOUT' }

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  permissions: []
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false
      }
    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload }
    case 'LOGOUT':
      localStorage.removeItem('auth_token')
      return { ...initialState, isLoading: false }
    default:
      return state
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    console.log('🔍 Checking auth status...')
    const token = localStorage.getItem('auth_token')

    if (!token) {
      console.log('❌ No token found, setting loading to false')
      dispatch({ type: 'SET_LOADING', payload: false })
      return
    }

    console.log('🔑 Token found, validating...')

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('⏰ Auth check timeout, forcing logout')
      dispatch({ type: 'LOGOUT' })
    }, 10000) // 10 second timeout

    try {
      const response = await api.get<{ status: string; data: { user: User } }>('/auth/profile')
      clearTimeout(timeoutId)

      console.log('✅ User authenticated:', response.data.user.email)
      dispatch({ type: 'SET_USER', payload: response.data.user })

      // Set basic permissions based on role
      const basicPermissions = generatePermissionsFromRole(response.data.user.role)
      dispatch({ type: 'SET_PERMISSIONS', payload: basicPermissions })
      console.log('✅ Permissions set for role:', response.data.user.role)
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('❌ Auth check failed:', error)
      dispatch({ type: 'LOGOUT' })
    }
  }

  // Generate permissions based on role
  const generatePermissionsFromRole = (role: string): string[] => {
    const permissions: string[] = []

    if (role === 'ADMIN') {
      return ['*'] // Admin has all permissions
    }

    if (role === 'HR') {
      permissions.push(
        'employees.read', 'employees.write', 'employees.delete',
        'attendance.read', 'attendance.write',
        'leave.read', 'leave.write', 'leave.approve',
        'documents.read', 'documents.write',
        'performance.read', 'performance.write',
        'onboarding.read', 'onboarding.write'
      )
    }

    if (role === 'MANAGER') {
      permissions.push(
        'employees.read',
        'attendance.read', 'attendance.write',
        'leave.read', 'leave.approve',
        'performance.read', 'performance.write',
        'documents.read'
      )
    }

    if (role === 'EMPLOYEE') {
      permissions.push(
        'employees.read',
        'attendance.read', 'attendance.write',
        'leave.read', 'leave.write',
        'documents.read',
        'performance.read'
      )
    }

    return permissions
  }

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await api.post<{ status: string; data: { token: string; user: User } }>(
        '/auth/login',
        { email, password }
      )

      localStorage.setItem('auth_token', response.data.token)
      dispatch({ type: 'SET_USER', payload: response.data.user })

      // Set permissions based on role
      const basicPermissions = generatePermissionsFromRole(response.data.user.role)
      dispatch({ type: 'SET_PERMISSIONS', payload: basicPermissions })

      toast.success('Login successful')
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      toast.error('Login failed. Please check your credentials.')
      throw error
    }
  }

  const logout = async () => {
    try {
      dispatch({ type: 'LOGOUT' })
      toast.success('Logged out successfully')
    } catch (error) {
      dispatch({ type: 'LOGOUT' })
      toast.error('Logout failed')
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (state.permissions.includes('*')) return true // Admin has all permissions
    return state.permissions.includes(permission) || state.user?.role === 'ADMIN'
  }

  const hasRole = (role: string): boolean => {
    return state.user?.role === role || state.user?.role === 'ADMIN'
  }

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    hasPermission,
    hasRole
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}