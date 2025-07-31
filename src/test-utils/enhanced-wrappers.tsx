import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { vi, MockedFunction } from 'vitest'

// Enhanced test wrapper configurations
export interface TestWrapperOptions {
  /** Initial route for MemoryRouter */
  initialEntries?: string[]
  /** Query client options override */
  queryClientOptions?: Partial<ConstructorParameters<typeof QueryClient>[0]>
  /** Mock auth state */
  authState?: {
    user?: any
    isAuthenticated?: boolean
    isLoading?: boolean
    permissions?: string[]
  }
  /** Theme to apply */
  theme?: 'light' | 'dark'
  /** Viewport size for responsive testing */
  viewport?: { width: number; height: number }
}

/**
 * Enhanced test wrapper with comprehensive provider support
 */
export const createTestWrapper = (options: TestWrapperOptions = {}) => {
  const {
    initialEntries = ['/'],
    queryClientOptions = {},
    authState,
    theme = 'light',
    viewport
  } = options

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient({
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
      ...queryClientOptions,
    })

    // Apply viewport if specified
    if (viewport) {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: viewport.width,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: viewport.height,
      })
      window.dispatchEvent(new Event('resize'))
    }

    const RouterComponent = initialEntries.length > 1 || initialEntries[0] !== '/' 
      ? MemoryRouter 
      : BrowserRouter

    const routerProps = initialEntries.length > 1 || initialEntries[0] !== '/' 
      ? { initialEntries }
      : {}

    return (
      <div className={theme === 'dark' ? 'dark' : ''} data-theme={theme}>
        <QueryClientProvider client={queryClient}>
          <RouterComponent {...routerProps}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </RouterComponent>
        </QueryClientProvider>
      </div>
    )
  }
}

/**
 * Render with comprehensive test wrapper
 */
export const renderWithProviders = (
  ui: ReactElement,
  options: TestWrapperOptions & Omit<RenderOptions, 'wrapper'> = {}
) => {
  const { 
    initialEntries, 
    queryClientOptions, 
    authState, 
    theme, 
    viewport, 
    ...renderOptions 
  } = options

  const wrapper = createTestWrapper({
    initialEntries,
    queryClientOptions,
    authState,
    theme,
    viewport,
  })

  return render(ui, { wrapper, ...renderOptions })
}

/**
 * Render for mobile testing
 */
export const renderMobile = (ui: ReactElement, options: Omit<TestWrapperOptions, 'viewport'> = {}) => {
  return renderWithProviders(ui, {
    ...options,
    viewport: { width: 375, height: 667 }
  })
}

/**
 * Render for tablet testing
 */
export const renderTablet = (ui: ReactElement, options: Omit<TestWrapperOptions, 'viewport'> = {}) => {
  return renderWithProviders(ui, {
    ...options,
    viewport: { width: 768, height: 1024 }
  })
}

/**
 * Render for desktop testing
 */
export const renderDesktop = (ui: ReactElement, options: Omit<TestWrapperOptions, 'viewport'> = {}) => {
  return renderWithProviders(ui, {
    ...options,
    viewport: { width: 1200, height: 800 }
  })
}

/**
 * Render with dark theme
 */
export const renderDarkTheme = (ui: ReactElement, options: Omit<TestWrapperOptions, 'theme'> = {}) => {
  return renderWithProviders(ui, {
    ...options,
    theme: 'dark'
  })
}

/**
 * Render with authenticated user
 */
export const renderWithAuth = (
  ui: ReactElement, 
  user: any = { id: '1', email: 'test@example.com', role: { name: 'Admin' } },
  options: TestWrapperOptions = {}
) => {
  return renderWithProviders(ui, {
    ...options,
    authState: {
      user,
      isAuthenticated: true,
      isLoading: false,
      permissions: ['read', 'write', 'delete'],
    }
  })
}

/**
 * Render with unauthenticated state
 */
export const renderWithoutAuth = (ui: ReactElement, options: TestWrapperOptions = {}) => {
  return renderWithProviders(ui, {
    ...options,
    authState: {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      permissions: [],
    }
  })
}

/**
 * Mock window methods commonly used in tests
 */
export const mockWindowMethods = () => {
  const originalLocation = window.location
  const originalOpen = window.open
  const originalAlert = window.alert
  const originalConfirm = window.confirm

  // Mock location
  delete (window as any).location
  window.location = {
    ...originalLocation,
    assign: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn(),
  }

  // Mock other window methods
  window.open = vi.fn()
  window.alert = vi.fn()
  window.confirm = vi.fn(() => true)

  // Return cleanup function
  return () => {
    window.location = originalLocation
    window.open = originalOpen
    window.alert = originalAlert
    window.confirm = originalConfirm
  }
}

/**
 * Mock console methods to avoid noise in tests
 */
export const mockConsole = () => {
  const originalConsole = { ...console }
  
  console.log = vi.fn()
  console.warn = vi.fn()
  console.error = vi.fn()
  console.info = vi.fn()

  return () => {
    Object.assign(console, originalConsole)
  }
}

/**
 * Mock date for consistent testing
 */
export const mockDate = (date: string | Date = '2024-01-15T10:00:00Z') => {
  const mockDate = new Date(date)
  const originalDate = Date
  
  global.Date = class extends Date {
    constructor(value?: any) {
      if (value) {
        super(value)
      } else {
        super(mockDate)
      }
    }
    
    static now() {
      return mockDate.getTime()
    }
  } as any

  return () => {
    global.Date = originalDate
  }
}

/**
 * Setup test environment with common mocks
 */
export const setupTestEnvironment = () => {
  const cleanupWindow = mockWindowMethods()
  const cleanupConsole = mockConsole()
  const cleanupDate = mockDate()

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Mock HTMLElement.scrollIntoView
  HTMLElement.prototype.scrollIntoView = vi.fn()

  return () => {
    cleanupWindow()
    cleanupConsole()
    cleanupDate()
  }
}

/**
 * Wait for async operations to complete
 */
export const waitForAsyncOperations = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Create a mock file for file upload testing
 */
export const createMockFile = (
  name: string = 'test.txt',
  content: string = 'test content',
  type: string = 'text/plain'
): File => {
  const blob = new Blob([content], { type })
  return new File([blob], name, { type })
}

/**
 * Create mock image file
 */
export const createMockImageFile = (
  name: string = 'test.jpg',
  width: number = 100,
  height: number = 100
): File => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ff0000'
  ctx.fillRect(0, 0, width, height)
  
  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob!], name, { type: 'image/jpeg' }))
    }, 'image/jpeg')
  }) as any
}

/**
 * Mock fetch with custom responses
 */
export const mockFetch = (responses: Record<string, any>) => {
  const originalFetch = global.fetch
  
  global.fetch = vi.fn((url: string) => {
    const response = responses[url] || responses['*'] // '*' as default
    
    return Promise.resolve({
      ok: response.ok !== false,
      status: response.status || 200,
      json: () => Promise.resolve(response.data || response),
      text: () => Promise.resolve(JSON.stringify(response.data || response)),
    }) as any
  })

  return () => {
    global.fetch = originalFetch
  }
}

/**
 * Mock local storage
 */
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}

  const mockStorage = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    length: 0,
    key: vi.fn(() => null),
  }

  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  })

  return mockStorage
}

/**
 * Mock session storage
 */
export const mockSessionStorage = () => {
  const store: Record<string, string> = {}

  const mockStorage = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    length: 0,
    key: vi.fn(() => null),
  }

  Object.defineProperty(window, 'sessionStorage', {
    value: mockStorage,
    writable: true,
  })

  return mockStorage
}

// Export enhanced render function as default
export { renderWithProviders as render }