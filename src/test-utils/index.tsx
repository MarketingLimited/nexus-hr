export * from './test-utils'

// Re-export React Testing Library functions
import React, { ReactElement } from 'react'
import { render as rtlRender, RenderOptions, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'

// Create a new QueryClient for each test to prevent cross-test pollution
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

// Custom render function with providers
function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    const queryClient = createTestQueryClient()
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {children}
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    )
  }

  return rtlRender(ui, { wrapper: AllTheProviders, ...options })
}

export { render, screen, waitFor, fireEvent }
export { renderHook } from '@testing-library/react'
export { act } from '@testing-library/react'