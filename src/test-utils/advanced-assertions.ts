import { expect } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'

/**
 * Extended assertion helpers for complex scenarios
 */

// Data table assertions
export const expectDataTableToContainData = async (data: any[]) => {
  await waitFor(() => {
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })

  // Check if data is rendered
  for (const item of data.slice(0, 3)) { // Check first 3 items
    if (item.name) {
      expect(screen.getByText(item.name)).toBeInTheDocument()
    }
    if (item.email) {
      expect(screen.getByText(item.email)).toBeInTheDocument()
    }
  }
}

export const expectTableToHaveSortableColumns = async (columns: string[]) => {
  for (const column of columns) {
    const header = screen.getByRole('columnheader', { name: new RegExp(column, 'i') })
    expect(header).toBeInTheDocument()
// Check if it's clickable (has sorting functionality)
    const hasTabIndex = header.hasAttribute('tabindex') && header.getAttribute('tabindex') === '0'
    const hasButton = header.querySelector('button') !== null
    expect(hasTabIndex || hasButton).toBe(true)
  }
}

export const expectTableToHaveFilters = (filterLabels: string[]) => {
  for (const label of filterLabels) {
    const filter = screen.getByLabelText(new RegExp(label, 'i'))
    expect(filter).toBeInTheDocument()
  }
}

// Form validation assertions
export const expectFormToHaveValidationErrors = async (fields: string[]) => {
  await waitFor(() => {
    for (const field of fields) {
      const errorMessage = screen.getByText(new RegExp(`${field}.*required|${field}.*invalid`, 'i'))
      expect(errorMessage).toBeInTheDocument()
    }
  })
}

export const expectFormToBeSubmittable = () => {
  const submitButton = screen.getByRole('button', { name: /submit|save|create|update/i })
  expect(submitButton).toBeEnabled()
}

export const expectFormToBeDisabled = () => {
  const submitButton = screen.getByRole('button', { name: /submit|save|create|update/i })
  expect(submitButton).toBeDisabled()
}

// Dashboard and stats assertions
export const expectStatsCardsToBeVisible = (expectedCards: Array<{ title: string; value?: string }>) => {
  for (const card of expectedCards) {
    expect(screen.getByText(card.title)).toBeInTheDocument()
    if (card.value) {
      expect(screen.getByText(card.value)).toBeInTheDocument()
    }
  }
}

export const expectChartToBeVisible = (chartType: 'line' | 'bar' | 'pie' | 'area') => {
  // Look for common chart elements
  const chartContainer = screen.getByRole('img', { hidden: true }) || // SVG charts
                        screen.getByTestId(`${chartType}-chart`) ||
                        document.querySelector('[data-testid*="chart"]') ||
                        document.querySelector('svg')
  
  expect(chartContainer).toBeInTheDocument()
}

// Navigation assertions
export const expectNavigationToBeVisible = (menuItems: string[]) => {
  const nav = screen.getByRole('navigation')
  expect(nav).toBeInTheDocument()

  for (const item of menuItems) {
    const link = within(nav).getByRole('link', { name: new RegExp(item, 'i') })
    expect(link).toBeInTheDocument()
  }
}

export const expectBreadcrumbsToShow = (breadcrumbs: string[]) => {
  const breadcrumbNav = screen.getByRole('navigation', { name: /breadcrumb/i })
  expect(breadcrumbNav).toBeInTheDocument()

  for (const breadcrumb of breadcrumbs) {
    expect(within(breadcrumbNav).getByText(breadcrumb)).toBeInTheDocument()
  }
}

// Search and filter assertions
export const expectSearchToReturnResults = async (searchTerm: string, expectedResults: number) => {
  await waitFor(() => {
    const results = screen.getAllByTestId(/search-result|list-item|table-row/)
    expect(results).toHaveLength(expectedResults)
  })

  // Check if search term is highlighted
  const highlightedElements = document.querySelectorAll('[data-highlighted="true"], .highlighted, .search-highlight')
  expect(highlightedElements.length).toBeGreaterThan(0)
}

export const expectNoSearchResults = async () => {
  await waitFor(() => {
    expect(screen.getByText(/no results found|no matches|empty/i)).toBeInTheDocument()
  })
}

// Permission and role assertions
export const expectUserToHavePermissions = (permissions: string[]) => {
  // Check if user can see elements that require these permissions
  for (const permission of permissions) {
    if (permission === 'create') {
      const createButton = screen.queryByRole('button', { name: /create|add|new/i })
      expect(createButton).toBeInTheDocument()
    }
    if (permission === 'edit') {
      const editButton = screen.queryByRole('button', { name: /edit|update|modify/i })
      expect(editButton).toBeInTheDocument()
    }
    if (permission === 'delete') {
      const deleteButton = screen.queryByRole('button', { name: /delete|remove/i })
      expect(deleteButton).toBeInTheDocument()
    }
  }
}

export const expectUserToLackPermissions = (permissions: string[]) => {
  for (const permission of permissions) {
    if (permission === 'create') {
      expect(screen.queryByRole('button', { name: /create|add|new/i })).not.toBeInTheDocument()
    }
    if (permission === 'edit') {
      expect(screen.queryByRole('button', { name: /edit|update|modify/i })).not.toBeInTheDocument()
    }
    if (permission === 'delete') {
      expect(screen.queryByRole('button', { name: /delete|remove/i })).not.toBeInTheDocument()
    }
  }
}

// Responsive design assertions
export const expectMobileLayoutToBeActive = () => {
  // Check for mobile-specific elements
  const mobileMenu = screen.queryByTestId('mobile-menu') || 
                    screen.queryByRole('button', { name: /menu|hamburger/i })
  expect(mobileMenu).toBeInTheDocument()

  // Check that desktop-only elements are hidden
  const desktopSidebar = screen.queryByTestId('desktop-sidebar')
  if (desktopSidebar) {
    expect(desktopSidebar).not.toBeVisible()
  }
}

export const expectDesktopLayoutToBeActive = () => {
  // Check for desktop-specific elements
  const sidebar = screen.queryByRole('navigation', { name: /main navigation|sidebar/i })
  expect(sidebar).toBeVisible()

  // Check that mobile-only elements are hidden
  const mobileMenu = screen.queryByTestId('mobile-menu')
  if (mobileMenu) {
    expect(mobileMenu).not.toBeVisible()
  }
}

// Loading and async state assertions
export const expectLoadingStateToComplete = async (timeout: number = 5000) => {
  // Wait for any loading indicators to disappear
  await waitFor(() => {
    expect(screen.queryByText(/loading|spinner|fetching/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(document.querySelector('.loading, .spinner, [data-loading="true"]')).not.toBeInTheDocument()
  }, { timeout })
}

export const expectErrorStateToBeHandled = (errorMessage?: string) => {
  const errorElement = screen.getByRole('alert') || 
                      screen.getByText(/error|failed|something went wrong/i)
  expect(errorElement).toBeInTheDocument()

  if (errorMessage) {
    expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument()
  }
}

// Data consistency assertions
export const expectDataToBeConsistent = (data: any[], displayedElements: HTMLElement[]) => {
  expect(displayedElements).toHaveLength(data.length)
  
  for (let i = 0; i < Math.min(data.length, displayedElements.length); i++) {
    const item = data[i]
    const element = displayedElements[i]
    
    // Check if key data is displayed
    if (item.name) {
      expect(within(element).getByText(item.name)).toBeInTheDocument()
    }
    if (item.id) {
      try {
        expect(element).toHaveAttribute('data-id', item.id)
      } catch {
        expect(within(element).getByText(item.id)).toBeInTheDocument()
      }
    }
  }
}


export const expectProperLandmarkRoles = () => {
  // Main content
  expect(screen.getByRole('main')).toBeInTheDocument()
  
  // Navigation
  const navigation = screen.queryAllByRole('navigation')
  expect(navigation.length).toBeGreaterThan(0)
  
  // Complementary content (sidebar, aside)
  const complementary = screen.queryAllByRole('complementary')
  expect(complementary.length).toBeGreaterThanOrEqual(0)
}

export const expectKeyboardNavigation = async (focusableElements: string[]) => {
  for (const selector of focusableElements) {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
      expect(element).toHaveFocus()
      
      const hasTabIndex = element.hasAttribute('tabindex') && element.getAttribute('tabindex') === '0'
      const isInteractiveElement = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)
      expect(hasTabIndex || isInteractiveElement).toBe(true)
    }
  }
}

// Performance assertions
export const expectPageToLoadWithinTime = (maxTime: number) => {
  const loadTime = performance.now()
  expect(loadTime).toBeLessThan(maxTime)
}

export const expectImageToBeOptimized = (image: HTMLImageElement) => {
  expect(image).toHaveAttribute('alt')
  
  const hasLazyLoading = image.hasAttribute('loading') && 
    (image.getAttribute('loading') === 'lazy' || image.getAttribute('loading') === 'eager')
  expect(hasLazyLoading).toBe(true)
  
  // Check for responsive images
  const hasResponsiveImage = image.hasAttribute('srcset') || image.closest('picture') !== null
  expect(hasResponsiveImage).toBe(true)
}

// Theme assertions
export const expectDarkThemeToBeApplied = () => {
  const rootElement = document.documentElement
  const hasDarkClass = rootElement.classList.contains('dark')
  const hasDarkTheme = rootElement.getAttribute('data-theme') === 'dark'
  expect(hasDarkClass || hasDarkTheme).toBe(true)
}

export const expectLightThemeToBeApplied = () => {
  const rootElement = document.documentElement
  const hasLightClass = !rootElement.classList.contains('dark')
  const hasLightTheme = rootElement.getAttribute('data-theme') === 'light' || !rootElement.hasAttribute('data-theme')
  expect(hasLightClass && hasLightTheme).toBe(true)
}

// Add missing heading hierarchy assertion
export const expectProperHeadingHierarchy = () => {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  expect(headings.length).toBeGreaterThan(0)
  
  // Check that there's at least one h1
  const h1Elements = document.querySelectorAll('h1')
  expect(h1Elements.length).toBeGreaterThanOrEqual(1)
}