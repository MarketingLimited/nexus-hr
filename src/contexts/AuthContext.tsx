import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { User } from '@/mocks/data/auth'
import { authService } from '@/services/dataService'
import { toast } from 'sonner'

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
      const response = await authService.getCurrentUser()
      clearTimeout(timeoutId)
      
      console.log('✅ User authenticated:', response.data.email)
      dispatch({ type: 'SET_USER', payload: response.data })
      
      // Get user permissions
      try {
        const permissionsResponse = await authService.getPermissions({ 
          role: response.data.role.name 
        })
        dispatch({ type: 'SET_PERMISSIONS', payload: permissionsResponse.data })
        console.log('✅ Permissions loaded:', permissionsResponse.data.length, 'permissions')
      } catch (permError) {
        console.warn('⚠️ Failed to load permissions:', permError)
        // Continue without permissions
        dispatch({ type: 'SET_PERMISSIONS', payload: [] })
      }
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('❌ Auth check failed:', error)
      dispatch({ type: 'LOGOUT' })
    }
  }

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await authService.login({ email, password })
      
      localStorage.setItem('auth_token', response.data.session.token)
      dispatch({ type: 'SET_USER', payload: response.data.user })
      
      // Get user permissions
      const permissionsResponse = await authService.getPermissions({ 
        role: response.data.user.role.name 
      })
      dispatch({ type: 'SET_PERMISSIONS', payload: permissionsResponse.data })
      
      toast.success('Login successful')
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      toast.error('Login failed. Please check your credentials.')
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      dispatch({ type: 'LOGOUT' })
      toast.success('Logged out successfully')
    } catch (error) {
      dispatch({ type: 'LOGOUT' })
      toast.error('Logout failed')
    }
  }

  const hasPermission = (permission: string): boolean => {
    return state.permissions.includes(permission) || state.user?.role.name === 'Admin'
  }

  const hasRole = (role: string): boolean => {
    return state.user?.role.name === role
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