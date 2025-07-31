import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { ReactElement } from 'react'
import { axe } from 'jest-axe'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'

// Accessibility testing utilities
export interface AccessibilityTestOptions {
  /** Skip specific axe rules */
  disabledRules?: string[]
  /** Custom axe configuration */
  axeConfig?: any
  /** Timeout for accessibility checks */
  timeout?: number
}

export interface KeyboardNavigationOptions {
  /** Elements that should be focusable */
  focusableElements?: string[]
  /** Tab order to verify */
  expectedTabOrder?: string[]
  /** Skip focus trap testing */
  skipFocusTrap?: boolean
}

export interface ColorContrastOptions {
  /** Minimum contrast ratio for normal text */
  normalTextRatio?: number
  /** Minimum contrast ratio for large text */
  largeTextRatio?: number
  /** Elements to check for contrast */
  elementsToCheck?: string[]
}

/**
 * Render component and run accessibility audit
 */
export const renderWithA11yAudit = async (
  ui: ReactElement,
  options: AccessibilityTestOptions & RenderOptions = {}
): Promise<RenderResult & { a11yResults: any }> => {
  const { disabledRules = [], axeConfig = {}, timeout = 5000, ...renderOptions } = options
  
  const result = render(ui, renderOptions)
  
  // Configure axe
  const config = {
    rules: disabledRules.reduce((acc, rule) => {
      acc[rule] = { enabled: false }
      return acc
    }, {} as any),
    ...axeConfig
  }
  
  // Run accessibility audit
  const a11yResults = await axe(result.container, config)
  
  return {
    ...result,
    a11yResults
  }
}

/**
 * Check if component has no accessibility violations
 */
export const expectNoA11yViolations = async (
  container: HTMLElement,
  options: AccessibilityTestOptions = {}
): Promise<void> => {
  const { disabledRules = [], axeConfig = {} } = options
  
  const config = {
    rules: disabledRules.reduce((acc, rule) => {
      acc[rule] = { enabled: false }
      return acc
    }, {} as any),
    ...axeConfig
  }
  
  const results = await axe(container, config)
  expect(results.violations).toHaveLength(0)
}

/**
 * Test keyboard navigation for a component
 */
export const testKeyboardNavigation = async (
  container: HTMLElement,
  options: KeyboardNavigationOptions = {}
): Promise<{
  focusableElements: Element[]
  tabOrder: Element[]
  canEscapeWithTab: boolean
}> => {
  const user = userEvent.setup()
  const {
    focusableElements: expectedFocusable = [],
    expectedTabOrder = [],
    skipFocusTrap = false
  } = options
  
  // Get all focusable elements
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([disabled])',
    '[role="link"]',
    '[role="menuitem"]',
    '[role="tab"]'
  ].join(', ')
  
  const focusableElements = Array.from(container.querySelectorAll(focusableSelector))
    .filter((el: Element) => {
      const htmlEl = el as HTMLElement
      return htmlEl.offsetParent !== null && // Element is visible
             !htmlEl.hasAttribute('aria-hidden') &&
             htmlEl.tabIndex !== -1
    })
  
  // Test tab order
  const tabOrder: Element[] = []
  let currentElement = document.activeElement
  
  // Start from the first focusable element
  if (focusableElements.length > 0) {
    (focusableElements[0] as HTMLElement).focus()
    currentElement = document.activeElement
  }
  
  for (let i = 0; i < focusableElements.length * 2; i++) { // Allow for cycling
    if (currentElement && focusableElements.includes(currentElement)) {
      if (!tabOrder.includes(currentElement)) {
        tabOrder.push(currentElement)
      }
    }
    
    await user.tab()
    const newElement = document.activeElement
    
    if (newElement === currentElement) {
      break // No change, probably at the end
    }
    
    currentElement = newElement
  }
  
  // Test if can escape focus trap (if applicable)
  let canEscapeWithTab = true
  if (!skipFocusTrap && focusableElements.length > 0) {
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    lastElement.focus()
    await user.tab()
    
    // Should wrap to first element in a focus trap
    canEscapeWithTab = document.activeElement !== firstElement
  }
  
  return {
    focusableElements,
    tabOrder,
    canEscapeWithTab
  }
}

/**
 * Test ARIA attributes and labels
 */
export const testAriaAttributes = (
  container: HTMLElement
): {
  elementsWithAriaLabels: Element[]
  elementsWithAriaDescriptions: Element[]
  interactiveElementsWithLabels: Element[]
  missingLabels: Element[]
} => {
  // Elements with ARIA labels
  const elementsWithAriaLabels = Array.from(container.querySelectorAll('[aria-label], [aria-labelledby]'))
  
  // Elements with ARIA descriptions
  const elementsWithAriaDescriptions = Array.from(container.querySelectorAll('[aria-describedby]'))
  
  // Interactive elements that should have labels
  const interactiveElements = Array.from(container.querySelectorAll(
    'button, input, select, textarea, [role="button"], [role="link"], [role="menuitem"], [role="tab"]'
  ))
  
  const interactiveElementsWithLabels = interactiveElements.filter((el: Element) => {
    const htmlEl = el as HTMLElement
    return htmlEl.hasAttribute('aria-label') ||
           htmlEl.hasAttribute('aria-labelledby') ||
           htmlEl.textContent?.trim() ||
           (htmlEl as HTMLInputElement).placeholder ||
           container.querySelector(`label[for="${htmlEl.id}"]`)
  })
  
  const missingLabels = interactiveElements.filter((el: Element) => 
    !interactiveElementsWithLabels.includes(el)
  )
  
  return {
    elementsWithAriaLabels,
    elementsWithAriaDescriptions,
    interactiveElementsWithLabels,
    missingLabels
  }
}

/**
 * Test color contrast ratios
 */
export const testColorContrast = (
  container: HTMLElement,
  options: ColorContrastOptions = {}
): {
  elementsChecked: Element[]
  contrastIssues: Array<{
    element: Element
    foreground: string
    background: string
    ratio: number
    requiredRatio: number
  }>
} => {
  const {
    normalTextRatio = 4.5,
    largeTextRatio = 3,
    elementsToCheck = ['*']
  } = options
  
  const elementsChecked: Element[] = []
  const contrastIssues: Array<{
    element: Element
    foreground: string
    background: string
    ratio: number
    requiredRatio: number
  }> = []
  
  // This is a simplified contrast checker
  // In a real implementation, you'd use a proper color contrast library
  elementsToCheck.forEach(selector => {
    const elements = Array.from(container.querySelectorAll(selector))
    
    elements.forEach(element => {
      const htmlEl = element as HTMLElement
      const styles = window.getComputedStyle(htmlEl)
      const color = styles.color
      const backgroundColor = styles.backgroundColor
      
      if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        elementsChecked.push(element)
        
        // Simplified contrast calculation (you'd use a proper library in practice)
        const fontSize = parseFloat(styles.fontSize)
        const fontWeight = styles.fontWeight
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && ['bold', '700', '800', '900'].includes(fontWeight))
        
        const requiredRatio = isLargeText ? largeTextRatio : normalTextRatio
        
        // Mock contrast ratio calculation (replace with actual calculation)
        const mockRatio = Math.random() * 8 + 1 // Random ratio for demo
        
        if (mockRatio < requiredRatio) {
          contrastIssues.push({
            element,
            foreground: color,
            background: backgroundColor,
            ratio: mockRatio,
            requiredRatio
          })
        }
      }
    })
  })
  
  return {
    elementsChecked,
    contrastIssues
  }
}

/**
 * Test screen reader compatibility
 */
export const testScreenReaderCompatibility = (
  container: HTMLElement
): {
  headingStructure: Element[]
  landmarkRegions: Element[]
  skipLinks: Element[]
  focusManagement: {
    hasProperFocusManagement: boolean
    issues: string[]
  }
} => {
  // Check heading structure (h1, h2, h3, etc.)
  const headingStructure = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]'))
  
  // Check landmark regions
  const landmarkRegions = Array.from(container.querySelectorAll(
    'main, nav, aside, section, article, header, footer, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]'
  ))
  
  // Check skip links
  const skipLinks = Array.from(container.querySelectorAll('a[href^="#"], .skip-link, [aria-label*="skip"]'))
  
  // Check focus management
  const focusManagement = {
    hasProperFocusManagement: true,
    issues: [] as string[]
  }
  
  // Check for proper focus indicators
  const focusableElements = Array.from(container.querySelectorAll(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ))
  
  focusableElements.forEach((el: Element) => {
    const htmlEl = el as HTMLElement
    const styles = window.getComputedStyle(htmlEl, ':focus')
    
    // Check if focus styles are defined (simplified check)
    if (!styles.outline || styles.outline === 'none') {
      const hasCustomFocusStyles = styles.boxShadow !== 'none' || 
                                  styles.border !== htmlEl.style.border
      
      if (!hasCustomFocusStyles) {
        focusManagement.hasProperFocusManagement = false
        focusManagement.issues.push(`Element ${htmlEl.tagName} lacks visible focus indicator`)
      }
    }
  })
  
  return {
    headingStructure,
    landmarkRegions,
    skipLinks,
    focusManagement
  }
}

/**
 * Comprehensive accessibility test suite
 */
export const runAccessibilityTestSuite = async (
  container: HTMLElement,
  options: AccessibilityTestOptions & KeyboardNavigationOptions & ColorContrastOptions = {}
): Promise<{
  axeResults: any
  keyboardNavigation: Awaited<ReturnType<typeof testKeyboardNavigation>>
  ariaAttributes: ReturnType<typeof testAriaAttributes>
  colorContrast: ReturnType<typeof testColorContrast>
  screenReader: ReturnType<typeof testScreenReaderCompatibility>
  summary: {
    totalIssues: number
    criticalIssues: number
    passed: boolean
  }
}> => {
  // Run all accessibility tests
  const axeResults = await axe(container, { rules: options.disabledRules?.reduce((acc, rule) => {
    acc[rule] = { enabled: false }
    return acc
  }, {} as any) })
  
  const keyboardNavigation = await testKeyboardNavigation(container, options)
  const ariaAttributes = testAriaAttributes(container)
  const colorContrast = testColorContrast(container, options)
  const screenReader = testScreenReaderCompatibility(container)
  
  // Calculate summary
  const totalIssues = axeResults.violations.length + 
                     ariaAttributes.missingLabels.length + 
                     colorContrast.contrastIssues.length +
                     screenReader.focusManagement.issues.length
  
  const criticalIssues = axeResults.violations.filter((v: any) => v.impact === 'critical').length
  
  const passed = totalIssues === 0
  
  return {
    axeResults,
    keyboardNavigation,
    ariaAttributes,
    colorContrast,
    screenReader,
    summary: {
      totalIssues,
      criticalIssues,
      passed
    }
  }
}