import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { ReactElement } from 'react'

// Snapshot interface
export interface SnapshotOptions {
  name: string
  viewport: { width: number; height: number }
  threshold?: number
  animations?: boolean
}

// Visual snapshot result
export interface VisualSnapshot {
  name: string
  html: string
  timestamp: string
  viewport: { width: number; height: number }
}

/**
 * Take a visual snapshot of a container
 */
export const takeSnapshot = async (
  container: HTMLElement,
  options: SnapshotOptions
): Promise<VisualSnapshot> => {
  const { name, viewport, animations = false } = options

  // Set viewport size
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: viewport.width
  })
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: viewport.height
  })

  // Wait for animations if requested
  if (animations) {
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return {
    name,
    html: container.innerHTML,
    timestamp: new Date().toISOString(),
    viewport
  }
}

/**
 * Compare two visual snapshots
 */
export const compareSnapshots = async (
  snapshot1: VisualSnapshot,
  snapshot2: VisualSnapshot
): Promise<{
  similarity: number
  differences: string[]
  passed: boolean
}> => {
  // Simple comparison based on HTML content
  const similarity = snapshot1.html === snapshot2.html ? 1.0 : 0.0
  const differences = snapshot1.html !== snapshot2.html ? ['HTML content differs'] : []
  
  return {
    similarity,
    differences,
    passed: similarity > 0.9
  }
}

/**
 * Create a screenshot test suite
 */
export const createScreenshotTestSuite = async (options: {
  components: Array<{ name: string; component: ReactElement }>
  pages?: Array<{ name: string; component: ReactElement }>
  viewports: Array<{ name: string; width: number; height: number }>
  themes: string[]
}): Promise<{
  results: Array<{ name: string; snapshot: VisualSnapshot; passed: boolean }>
  passed: boolean
  failedTests: string[]
}> => {
  const { components, pages = [], viewports, themes } = options
  const results = []
  const failedTests = []

  const allTestItems = [...components, ...pages]

  for (const theme of themes) {
    for (const viewport of viewports) {
      for (const item of allTestItems) {
        try {
          const { container } = render(item.component)
          const snapshot = await takeSnapshot(container, {
            name: `${item.name}-${theme}-${viewport.name}`,
            viewport
          })
          
          results.push({
            name: snapshot.name,
            snapshot,
            passed: true
          })
        } catch (error) {
          failedTests.push(`${item.name}-${theme}-${viewport.name}`)
          results.push({
            name: `${item.name}-${theme}-${viewport.name}`,
            snapshot: {
              name: `${item.name}-${theme}-${viewport.name}`,
              html: '',
              timestamp: new Date().toISOString(),
              viewport
            },
            passed: false
          })
        }
      }
    }
  }

  return {
    results,
    passed: failedTests.length === 0,
    failedTests
  }
}

// Visual testing utilities
export interface VisualTestOptions {
  /** Viewport sizes to test */
  viewports?: Array<{ width: number; height: number; name: string }>
  /** Themes to test */
  themes?: string[]
  /** Wait for animations to complete */
  waitForAnimations?: boolean
  /** Custom snapshot options */
  snapshotOptions?: any
}

export interface ResponsiveTestOptions {
  /** Breakpoints to test */
  breakpoints?: Array<{ name: string; width: number; height?: number }>
  /** Elements to check visibility at each breakpoint */
  elementsToCheck?: string[]
  /** Test orientation changes */
  testOrientation?: boolean
}

/**
 * Test component at different viewport sizes
 */
export const testResponsiveDesign = async (
  container: HTMLElement,
  options: ResponsiveTestOptions & { viewports?: Array<{ name: string; width: number; height: number }> } = {}
): Promise<{
  breakpointTests: Record<string, boolean>
  results: Array<{
    breakpoint: string
    width: number
    height: number
    visibleElements: Element[]
    hiddenElements: Element[]
    layoutIssues: string[]
  }>
}> => {
  const {
    viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'ultrawide', width: 2560, height: 1440 }
    ],
    elementsToCheck = ['*'],
    testOrientation = false
  } = options
  
  const results = []
  const breakpointTests: Record<string, boolean> = {}
  
  for (const viewport of viewports) {
    // Set viewport size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: viewport.width
    })
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: viewport.height || 800
    })
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'))
    
    // Wait for any responsive changes
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Check element visibility
    const visibleElements: Element[] = []
    const hiddenElements: Element[] = []
    const layoutIssues: string[] = []
    
    elementsToCheck.forEach(selector => {
      const elements = Array.from(container.querySelectorAll(selector))
      
      elements.forEach(element => {
        const htmlEl = element as HTMLElement
        const styles = window.getComputedStyle(htmlEl)
        const rect = htmlEl.getBoundingClientRect()
        
        // Check visibility
        if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
          hiddenElements.push(element)
        } else if (rect.width > 0 && rect.height > 0) {
          visibleElements.push(element)
        }
        
        // Check for layout issues
        if (rect.width > viewport.width) {
          layoutIssues.push(`Element ${htmlEl.tagName} exceeds viewport width at ${viewport.name}`)
        }
        
        // Check for text overflow
        if (htmlEl.scrollWidth > htmlEl.clientWidth) {
          layoutIssues.push(`Text overflow detected in ${htmlEl.tagName} at ${viewport.name}`)
        }
        
        // Check for overlapping elements (simplified)
        if (rect.left < 0 || rect.top < 0) {
          layoutIssues.push(`Element ${htmlEl.tagName} positioned outside viewport at ${viewport.name}`)
        }
      })
    })
    
    breakpointTests[viewport.name] = layoutIssues.length === 0
    
    results.push({
      breakpoint: viewport.name,
      width: viewport.width,
      height: viewport.height || 800,
      visibleElements,
      hiddenElements,
      layoutIssues
    })
    
    // Test orientation if requested
    if (testOrientation && viewport.name === 'mobile') {
      // Simulate landscape orientation
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: viewport.height || 667
      })
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: viewport.width
      })
      
      window.dispatchEvent(new Event('resize'))
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Check landscape layout
      const landscapeIssues: string[] = []
      const landscapeElements = Array.from(container.querySelectorAll('*'))
      
      landscapeElements.forEach(element => {
        const htmlEl = element as HTMLElement
        const rect = htmlEl.getBoundingClientRect()
        
        if (rect.width > (viewport.height || 667)) {
          landscapeIssues.push(`Element exceeds landscape viewport width`)
        }
      })
      
      if (landscapeIssues.length > 0) {
        results.push({
          breakpoint: `${viewport.name}-landscape`,
          width: viewport.height || 667,
          height: viewport.width,
          visibleElements: [],
          hiddenElements: [],
          layoutIssues: landscapeIssues
        })
      }
    }
  }
  
  return { breakpointTests, results }
}

/**
 * Test theme consistency
 */
export const testThemeConsistency = async (
  container: HTMLElement,
  options: { themes?: string[]; components?: string[] } = {}
): Promise<{
  consistencyScore: number
  themeResults: Array<{
    theme: string
    colorProperties: Record<string, string>
    issues: string[]
  }>
  consistency: {
    consistent: boolean
    issues: string[]
  }
}> => {
  const { themes = ['light', 'dark'], components = ['*'] } = options
  const themeResults = []
  
  for (const theme of themes) {
    // Apply theme (this assumes your app uses data-theme attribute)
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.className = theme
    
    // Wait for theme to apply
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const colorProperties: Record<string, string> = {}
    const issues: string[] = []
    
    // Check color properties for consistency
    components.forEach(selector => {
      const elements = Array.from(container.querySelectorAll(selector))
      
      elements.forEach((element, index) => {
        const htmlEl = element as HTMLElement
        const styles = window.getComputedStyle(htmlEl)
        
        // Collect color-related properties
        const colorProps = [
          'color',
          'backgroundColor',
          'borderColor',
          'fill',
          'stroke'
        ]
        
        colorProps.forEach(prop => {
          const value = styles.getPropertyValue(prop)
          if (value && value !== 'initial' && value !== 'inherit') {
            const key = `${selector}-${index}-${prop}`
            colorProperties[key] = value
            
            // Check for potential contrast issues
            if (prop === 'color' && styles.backgroundColor) {
              // This is a simplified check - you'd use a proper contrast calculator
              if (value === styles.backgroundColor) {
                issues.push(`Potential contrast issue: same color and background-color on ${htmlEl.tagName}`)
              }
            }
            
            // Check for hardcoded colors (simplified)
            if (value.includes('#') || value.includes('rgb(')) {
              issues.push(`Hardcoded color detected: ${prop} = ${value} on ${htmlEl.tagName}`)
            }
          }
        })
      })
    })
    
    themeResults.push({
      theme,
      colorProperties,
      issues
    })
  }
  
  // Check consistency between themes
  const consistency = {
    consistent: true,
    issues: [] as string[]
  }
  
  if (themeResults.length > 1) {
    const lightTheme = themeResults.find(t => t.theme === 'light')
    const darkTheme = themeResults.find(t => t.theme === 'dark')
    
    if (lightTheme && darkTheme) {
      // Check that both themes have the same elements styled
      const lightKeys = new Set(Object.keys(lightTheme.colorProperties))
      const darkKeys = new Set(Object.keys(darkTheme.colorProperties))
      
      const missingInDark = [...lightKeys].filter(key => !darkKeys.has(key))
      const missingInLight = [...darkKeys].filter(key => !lightKeys.has(key))
      
      if (missingInDark.length > 0) {
        consistency.consistent = false
        consistency.issues.push(`Properties missing in dark theme: ${missingInDark.join(', ')}`)
      }
      
      if (missingInLight.length > 0) {
        consistency.consistent = false
        consistency.issues.push(`Properties missing in light theme: ${missingInLight.join(', ')}`)
      }
    }
  }
  
  // Calculate consistency score
  const totalIssues = themeResults.reduce((sum, result) => sum + result.issues.length, 0)
  const consistencyScore = Math.max(0, 1 - (totalIssues / 10)) // Normalize to 0-1 scale

  return {
    consistencyScore,
    themeResults,
    consistency
  }
}

/**
 * Create visual snapshots for components
 */
export const createVisualSnapshots = async (
  ui: ReactElement,
  options: VisualTestOptions = {}
): Promise<{
  snapshots: Array<{
    name: string
    viewport: { width: number; height: number }
    theme: string
    html: string
  }>
  metadata: {
    timestamp: string
    totalSnapshots: number
    viewports: number
    themes: number
  }
}> => {
  const {
    viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 1920, height: 1080, name: 'desktop' }
    ],
    themes = ['light', 'dark'],
    waitForAnimations = true
  } = options
  
  const snapshots = []
  
  for (const theme of themes) {
    // Apply theme
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.className = theme
    
    for (const viewport of viewports) {
      // Set viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: viewport.width
      })
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: viewport.height
      })
      
      window.dispatchEvent(new Event('resize'))
      
      const { container } = render(ui)
      
      // Wait for animations and layout
      if (waitForAnimations) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      snapshots.push({
        name: `${theme}-${viewport.name}`,
        viewport,
        theme,
        html: container.innerHTML
      })
    }
  }
  
  return {
    snapshots,
    metadata: {
      timestamp: new Date().toISOString(),
      totalSnapshots: snapshots.length,
      viewports: viewports.length,
      themes: themes.length
    }
  }
}

/**
 * Test cross-browser compatibility (simulated)
 */
export const testCrossBrowserCompatibility = async (
  ui: ReactElement
): Promise<{
  browserTests: Array<{
    browser: string
    version: string
    features: {
      supported: string[]
      unsupported: string[]
      polyfillsNeeded: string[]
    }
    compatibilityScore: number
  }>
  overallCompatibility: {
    score: number
    issues: string[]
    recommendations: string[]
  }
}> => {
  // Simulate different browser environments
  const browsers = [
    { name: 'Chrome', version: '120+' },
    { name: 'Firefox', version: '100+' },
    { name: 'Safari', version: '15+' },
    { name: 'Edge', version: '110+' },
    { name: 'IE', version: '11' }
  ]
  
  const browserTests = []
  
  for (const browser of browsers) {
    const { container } = render(ui)
    
    // Simulate browser-specific feature detection
    const features = {
      supported: [] as string[],
      unsupported: [] as string[],
      polyfillsNeeded: [] as string[]
    }
    
    // Check for modern CSS features
    const cssFeatures = [
      'grid',
      'flexbox',
      'custom-properties',
      'backdrop-filter',
      'aspect-ratio'
    ]
    
    cssFeatures.forEach(feature => {
      // Simulate feature support based on browser
      const isSupported = browser.name !== 'IE' || feature === 'flexbox'
      
      if (isSupported) {
        features.supported.push(feature)
      } else {
        features.unsupported.push(feature)
        if (feature === 'custom-properties') {
          features.polyfillsNeeded.push('css-custom-properties-polyfill')
        }
      }
    })
    
    // Check for JavaScript features
    const jsFeatures = [
      'arrow-functions',
      'template-literals',
      'destructuring',
      'async-await',
      'optional-chaining'
    ]
    
    jsFeatures.forEach(feature => {
      const isSupported = browser.name !== 'IE'
      
      if (isSupported) {
        features.supported.push(feature)
      } else {
        features.unsupported.push(feature)
        features.polyfillsNeeded.push('babel-polyfill')
      }
    })
    
    // Calculate compatibility score
    const totalFeatures = cssFeatures.length + jsFeatures.length
    const supportedFeatures = features.supported.length
    const compatibilityScore = (supportedFeatures / totalFeatures) * 100
    
    browserTests.push({
      browser: browser.name,
      version: browser.version,
      features,
      compatibilityScore
    })
  }
  
  // Calculate overall compatibility
  const averageScore = browserTests.reduce((sum, test) => sum + test.compatibilityScore, 0) / browserTests.length
  
  const allUnsupported = new Set()
  const allPolyfills = new Set()
  
  browserTests.forEach(test => {
    test.features.unsupported.forEach(feature => allUnsupported.add(feature))
    test.features.polyfillsNeeded.forEach(polyfill => allPolyfills.add(polyfill))
  })
  
  const issues = Array.from(allUnsupported).map(feature => 
    `Feature "${feature}" not supported in some browsers`
  )
  
  const recommendations = Array.from(allPolyfills).map(polyfill => 
    `Consider adding ${polyfill} for better browser support`
  )
  
  return {
    browserTests,
    overallCompatibility: {
      score: averageScore,
      issues,
      recommendations
    }
  }
}

/**
 * Comprehensive visual testing suite
 */
export const runVisualTestSuite = async (
  ui: ReactElement,
  options: VisualTestOptions & ResponsiveTestOptions = {}
): Promise<{
  responsive: Awaited<ReturnType<typeof testResponsiveDesign>>
  themes: Awaited<ReturnType<typeof testThemeConsistency>>
  snapshots: Awaited<ReturnType<typeof createVisualSnapshots>>
  crossBrowser: Awaited<ReturnType<typeof testCrossBrowserCompatibility>>
  summary: {
    totalTests: number
    passedTests: number
    issues: string[]
    score: number
  }
}> => {
  // Get container from render
  const { container } = render(ui)
  
  const responsive = await testResponsiveDesign(container, options)
  const themes = await testThemeConsistency(container, options)
  const snapshots = await createVisualSnapshots(ui, options)
  const crossBrowser = await testCrossBrowserCompatibility(ui)
  
  // Calculate summary
  const allIssues = [
    ...responsive.results.flatMap(r => r.layoutIssues),
    ...themes.themeResults.flatMap(t => t.issues),
    ...themes.consistency.issues,
    ...crossBrowser.overallCompatibility.issues
  ]
  
  const totalTests = responsive.results.length + 
                    themes.themeResults.length + 
                    snapshots.snapshots.length + 
                    crossBrowser.browserTests.length
  
  const passedTests = totalTests - allIssues.length
  const score = (passedTests / totalTests) * 100
  
  return {
    responsive,
    themes,
    snapshots,
    crossBrowser,
    summary: {
      totalTests,
      passedTests,
      issues: allIssues,
      score
    }
  }
}