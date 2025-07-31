import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '../../test-utils'
import { server } from '../../test-utils/msw-server'
import { http, HttpResponse } from 'msw'
import {
  testResponsiveDesign,
  testThemeConsistency,
  createVisualSnapshots,
  testCrossBrowserCompatibility,
  runVisualTestSuite
} from '../../test-utils/visual-testing-helpers'

// Import components for visual testing
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import StatsCard from '../../components/dashboard/StatsCard'
import ModuleCard from '../../components/dashboard/ModuleCard'
import { Header } from '../../components/layout/Header'
import { Sidebar } from '../../components/layout/Sidebar'
import EmployeeList from '../../components/employees/EmployeeList'
import { LoginForm } from '../../components/auth/LoginForm'

// Mock ResizeObserver for testing
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('Phase 8.2: Visual Regression & Quality Tests', () => {
  beforeEach(() => {
    // Reset viewport and theme
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080
    })
    
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.className = ''
  })

  afterEach(() => {
    // Clean up
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.className = ''
  })

  describe('Responsive Design Testing', () => {
    it('should handle responsive layout for Button components', async () => {
      const buttonComponent = (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button size="sm">Small Button</Button>
            <Button>Default Button</Button>
            <Button size="lg">Large Button</Button>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </div>
      )

      const results = await testResponsiveDesign(buttonComponent, {
        breakpoints: [
          { name: 'mobile', width: 375, height: 667 },
          { name: 'tablet', width: 768, height: 1024 },
          { name: 'desktop', width: 1920, height: 1080 }
        ]
      })

      // Check that components remain visible at all breakpoints
      results.results.forEach(result => {
        expect(result.layoutIssues.length).toBe(0)
        expect(result.visibleElements.length).toBeGreaterThan(0)
      })
    })

    it('should handle responsive layout for Card components', async () => {
      const cardComponent = (
        <div style={{ padding: '20px', display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <Card>
            <CardHeader>
              <CardTitle>Card Title 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This is some card content that should wrap properly on mobile devices.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Card Title 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Another card with different content to test responsiveness.</p>
            </CardContent>
          </Card>
        </div>
      )

      const results = await testResponsiveDesign(cardComponent)

      // Verify cards stack properly on mobile
      const mobileResult = results.results.find(r => r.breakpoint === 'mobile')
      expect(mobileResult?.layoutIssues.length).toBe(0)
    })

    it('should handle responsive navigation components', async () => {
      const navigationComponent = (
        <div>
          <Header />
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '20px' }}>
              <h1>Main Content</h1>
              <p>Content that should be responsive</p>
            </main>
          </div>
        </div>
      )

      const results = await testResponsiveDesign(navigationComponent, {
        testOrientation: true
      })

      // Check mobile responsiveness
      const mobileResults = results.results.filter(r => r.breakpoint.includes('mobile'))
      expect(mobileResults.length).toBeGreaterThan(0)
      
      mobileResults.forEach(result => {
        expect(result.layoutIssues.filter(issue => 
          issue.includes('exceeds viewport width')
        ).length).toBe(0)
      })
    })

    it('should handle data table responsiveness', async () => {
      server.use(
        http.get('/api/employees', () => 
          HttpResponse.json({
            data: Array.from({ length: 5 }, (_, i) => ({
              id: `emp-${i}`,
              employeeId: `E00${i}`,
              firstName: `Employee${i}`,
              lastName: `LastName${i}`,
              email: `employee${i}@company.com`,
              position: 'Developer',
              department: 'Engineering',
              status: 'active'
            })),
            meta: { total: 5, page: 1, limit: 10, totalPages: 1 }
          })
        )
      )

      const tableComponent = (
        <EmployeeList 
          searchTerm="" 
          selectedDepartment="" 
          selectedStatus="" 
          viewMode="table" 
        />
      )

      const results = await testResponsiveDesign(tableComponent)

      // Tables should handle overflow properly on mobile
      const mobileResult = results.results.find(r => r.breakpoint === 'mobile')
      expect(mobileResult).toBeDefined()
    })
  })

  describe('Theme Consistency Testing', () => {
    it('should maintain consistent theming across light and dark modes', async () => {
      const themedComponent = (
        <div style={{ padding: '20px' }}>
          <h1>Dashboard</h1>
          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <StatsCard
              title="Total Employees"
              value="1,234"
              icon={'users' as any}
            />
            <StatsCard
              title="Revenue"
              value="$1,234,567"
              icon={'dollar-sign' as any}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )

      const results = await testThemeConsistency(themedComponent, {
        themes: ['light', 'dark']
      })

      expect(results.themeResults.length).toBe(2)
      expect(results.consistency.consistent).toBe(true)
      
      // Both themes should have color properties defined
      const lightTheme = results.themeResults.find(t => t.theme === 'light')
      const darkTheme = results.themeResults.find(t => t.theme === 'dark')
      
      expect(lightTheme?.colorProperties).toBeDefined()
      expect(darkTheme?.colorProperties).toBeDefined()
      
      // Check for hardcoded color issues
      results.themeResults.forEach(theme => {
        const hardcodedColorIssues = theme.issues.filter(issue => 
          issue.includes('Hardcoded color detected')
        )
        expect(hardcodedColorIssues.length).toBe(0)
      })
    })

    it('should handle theme transitions properly', async () => {
      const transitionComponent = (
        <div style={{ padding: '20px' }}>
          <Button>Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Card style={{ marginTop: '20px' }}>
            <CardContent>
              <p>Content that should transition smoothly between themes</p>
            </CardContent>
          </Card>
        </div>
      )

      // Test multiple theme switches
      const themes = ['light', 'dark', 'light']
      const results = []

      for (const theme of themes) {
        const themeResult = await testThemeConsistency(transitionComponent, {
          themes: [theme]
        })
        results.push(themeResult)
      }

      // Each theme switch should be consistent
      results.forEach(result => {
        expect(result.consistency.issues.length).toBe(0)
      })
    })

    it('should validate color contrast in both themes', async () => {
      const contrastComponent = (
        <div>
          <div style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)', padding: '20px' }}>
            <h1>Main Heading</h1>
            <p>Body text that should have sufficient contrast ratio</p>
            <Button>Primary Button</Button>
            <Button variant="outline">Outline Button</Button>
          </div>
          <div style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)', padding: '20px', marginTop: '10px' }}>
            <p>Muted text content</p>
          </div>
        </div>
      )

      const results = await testThemeConsistency(contrastComponent, {
        themes: ['light', 'dark']
      })

      // Check for contrast-related issues
      results.themeResults.forEach(theme => {
        const contrastIssues = theme.issues.filter(issue => 
          issue.includes('contrast issue')
        )
        // Should have minimal contrast issues
        expect(contrastIssues.length).toBeLessThan(3)
      })
    })
  })

  describe('Visual Snapshot Testing', () => {
    it('should create consistent snapshots for UI components', async () => {
      const snapshotComponent = (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Sample Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This is a sample card for snapshot testing</p>
              <div style={{ marginTop: '10px' }}>
                <Badge>Active</Badge>
                <Badge variant="secondary" style={{ marginLeft: '10px' }}>Inactive</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )

      const snapshots = await createVisualSnapshots(snapshotComponent, {
        viewports: [
          { width: 375, height: 667, name: 'mobile' },
          { width: 1920, height: 1080, name: 'desktop' }
        ],
        themes: ['light', 'dark'],
        waitForAnimations: true
      })

      expect(snapshots.snapshots.length).toBe(4) // 2 viewports × 2 themes
      expect(snapshots.metadata.totalSnapshots).toBe(4)
      
      // Each snapshot should have content
      snapshots.snapshots.forEach(snapshot => {
        expect(snapshot.html.length).toBeGreaterThan(0)
        expect(snapshot.name).toMatch(/^(light|dark)-(mobile|desktop)$/)
      })
    })

    it('should capture form components consistently', async () => {
      const formComponent = (
        <div style={{ padding: '20px', maxWidth: '400px' }}>
          <h2>Login Form</h2>
          <LoginForm authState={{
            user: null,
            login: vi.fn(),
            logout: vi.fn(),
            isLoading: false,
            error: null
          }} />
        </div>
      )

      const snapshots = await createVisualSnapshots(formComponent)
      
      expect(snapshots.snapshots.length).toBeGreaterThan(0)
      
      // Check for form-specific content in snapshots
      snapshots.snapshots.forEach(snapshot => {
        expect(snapshot.html).toContain('input')
        expect(snapshot.html).toContain('button')
      })
    })

    it('should handle complex dashboard layouts', async () => {
      server.use(
        http.get('/api/employees', () => 
          HttpResponse.json({
            data: [],
            meta: { total: 0, page: 1, limit: 10, totalPages: 0 }
          })
        )
      )

      const dashboardComponent = (
        <div>
          <Header />
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '20px' }}>
              <h1>Dashboard</h1>
              <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '20px' }}>
                <StatsCard title="Employees" value="1,234" icon={'users' as any} />
                <StatsCard title="Revenue" value="$1.2M" icon={'dollar-sign' as any} />
              </div>
              <EmployeeList 
                searchTerm="" 
                selectedDepartment="" 
                selectedStatus="" 
                viewMode="grid" 
              />
            </main>
          </div>
        </div>
      )

      const snapshots = await createVisualSnapshots(dashboardComponent, {
        viewports: [{ width: 1920, height: 1080, name: 'desktop' }],
        themes: ['light']
      })

      expect(snapshots.snapshots.length).toBe(1)
      expect(snapshots.snapshots[0].html).toContain('Dashboard')
    })
  })

  describe('Cross-Browser Compatibility Testing', () => {
    it('should assess CSS feature compatibility', async () => {
      const modernComponent = (
        <div style={{ 
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ 
            backgroundColor: 'var(--background)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            aspectRatio: '16/9'
          }}>
            <p>Modern CSS features</p>
          </div>
        </div>
      )

      const compatibility = await testCrossBrowserCompatibility(modernComponent)

      expect(compatibility.browserTests.length).toBeGreaterThan(0)
      
      // Check that modern browsers have good compatibility
      const modernBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge']
      const modernResults = compatibility.browserTests.filter(test => 
        modernBrowsers.includes(test.browser)
      )
      
      modernResults.forEach(result => {
        expect(result.compatibilityScore).toBeGreaterThan(80)
      })
      
      // IE should have lower compatibility
      const ieResult = compatibility.browserTests.find(test => test.browser === 'IE')
      if (ieResult) {
        expect(ieResult.compatibilityScore).toBeLessThan(60)
        expect(ieResult.features.polyfillsNeeded.length).toBeGreaterThan(0)
      }
    })

    it('should identify JavaScript feature requirements', async () => {
      const jsComponent = (
        <div>
          <Button onClick={() => {
            // Modern JavaScript features
            const data = { name: 'test', value: 123 }
            const { name, value } = data // Destructuring
            const message = `Name: ${name}, Value: ${value}` // Template literals
            console.log(message)
          }}>
            Modern JS Button
          </Button>
        </div>
      )

      const compatibility = await testCrossBrowserCompatibility(jsComponent)

      expect(compatibility.overallCompatibility.score).toBeGreaterThan(0)
      
      // Should have recommendations for older browsers
      if (compatibility.overallCompatibility.issues.length > 0) {
        expect(compatibility.overallCompatibility.recommendations.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Comprehensive Visual Test Suite', () => {
    it('should run complete visual testing suite on key components', async () => {
      server.use(
        http.get('/api/employees', () => 
          HttpResponse.json({
            data: [
              {
                id: 'emp-1',
                employeeId: 'E001',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@company.com',
                position: 'Developer',
                department: 'Engineering',
                status: 'active'
              }
            ],
            meta: { total: 1, page: 1, limit: 10, totalPages: 1 }
          })
        )
      )

      const comprehensiveComponent = (
        <div>
          <Header />
          <main style={{ padding: '20px' }}>
            <h1>HR Management System</h1>
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '20px' }}>
              <StatsCard title="Total Employees" value="1,234" icon={'users' as any} />
              <StatsCard title="Active Projects" value="56" icon={'briefcase' as any} />
              <StatsCard title="Pending Reviews" value="12" icon={'clock' as any} />
            </div>
            <EmployeeList 
              searchTerm="" 
              selectedDepartment="" 
              selectedStatus="" 
              viewMode="grid" 
            />
          </main>
        </div>
      )

      const results = await runVisualTestSuite(comprehensiveComponent, {
        breakpoints: [
          { name: 'mobile', width: 375, height: 667 },
          { name: 'desktop', width: 1920, height: 1080 }
        ],
        themes: ['light', 'dark']
      })

      expect(results.summary.score).toBeGreaterThan(70) // At least 70% pass rate
      expect(results.responsive.results.length).toBe(2) // 2 breakpoints
      expect(results.themes.themeResults.length).toBe(2) // 2 themes
      expect(results.snapshots.snapshots.length).toBe(4) // 2 breakpoints × 2 themes
      expect(results.crossBrowser.browserTests.length).toBeGreaterThan(0)
      
      // Log comprehensive results
      console.log('Visual Test Suite Results:', {
        overallScore: results.summary.score,
        totalTests: results.summary.totalTests,
        passedTests: results.summary.passedTests,
        issueCount: results.summary.issues.length,
        responsiveIssues: results.responsive.results.flatMap(r => r.layoutIssues).length,
        themeIssues: results.themes.themeResults.flatMap(t => t.issues).length,
        browserCompatibility: results.crossBrowser.overallCompatibility.score
      })
    })

    it('should validate visual quality across user workflows', async () => {
      const workflows = [
        {
          name: 'User Authentication',
          component: <LoginForm authState={{
            user: null,
            login: vi.fn(),
            logout: vi.fn(),
            isLoading: false,
            error: null
          }} />
        },
        {
          name: 'Dashboard Overview',
          component: (
            <div>
              <h1>Dashboard</h1>
              <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <StatsCard title="Employees" value="100" icon={'users' as any} />
                <StatsCard title="Revenue" value="$50K" icon={'dollar-sign' as any} />
              </div>
            </div>
          )
        }
      ]

      for (const workflow of workflows) {
        const results = await runVisualTestSuite(workflow.component, {
          breakpoints: [
            { name: 'mobile', width: 375, height: 667 },
            { name: 'desktop', width: 1920, height: 1080 }
          ]
        })

        expect(results.summary.score).toBeGreaterThan(60)
        
        // Log workflow-specific results
        console.log(`Visual quality for ${workflow.name}:`, {
          score: results.summary.score,
          responsiveIssues: results.responsive.results.flatMap(r => r.layoutIssues).length,
          snapshotCount: results.snapshots.snapshots.length
        })
      }
    })
  })
})