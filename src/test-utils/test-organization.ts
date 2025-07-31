import { describe, it, expect } from 'vitest'

/**
 * Test categorization and organization utilities
 */

// Test category decorators
export const testCategories = {
  unit: (name: string, fn: () => void) => describe(`[UNIT] ${name}`, fn),
  integration: (name: string, fn: () => void) => describe(`[INTEGRATION] ${name}`, fn),
  e2e: (name: string, fn: () => void) => describe(`[E2E] ${name}`, fn),
  performance: (name: string, fn: () => void) => describe(`[PERFORMANCE] ${name}`, fn),
  accessibility: (name: string, fn: () => void) => describe(`[A11Y] ${name}`, fn),
  visual: (name: string, fn: () => void) => describe(`[VISUAL] ${name}`, fn),
  api: (name: string, fn: () => void) => describe(`[API] ${name}`, fn),
  security: (name: string, fn: () => void) => describe(`[SECURITY] ${name}`, fn),
}

// Test priority levels
export const testPriority = {
  critical: (name: string, fn: () => void) => describe(`[CRITICAL] ${name}`, fn),
  high: (name: string, fn: () => void) => describe(`[HIGH] ${name}`, fn),
  medium: (name: string, fn: () => void) => describe(`[MEDIUM] ${name}`, fn),
  low: (name: string, fn: () => void) => describe(`[LOW] ${name}`, fn),
}

// Feature-based test organization
export const testFeatures = {
  auth: (name: string, fn: () => void) => describe(`[AUTH] ${name}`, fn),
  employees: (name: string, fn: () => void) => describe(`[EMPLOYEES] ${name}`, fn),
  attendance: (name: string, fn: () => void) => describe(`[ATTENDANCE] ${name}`, fn),
  leave: (name: string, fn: () => void) => describe(`[LEAVE] ${name}`, fn),
  payroll: (name: string, fn: () => void) => describe(`[PAYROLL] ${name}`, fn),
  performance: (name: string, fn: () => void) => describe(`[PERFORMANCE] ${name}`, fn),
  reports: (name: string, fn: () => void) => describe(`[REPORTS] ${name}`, fn),
  dashboard: (name: string, fn: () => void) => describe(`[DASHBOARD] ${name}`, fn),
}

// Component-based test organization
export const testComponents = {
  ui: (name: string, fn: () => void) => describe(`[UI] ${name}`, fn),
  layout: (name: string, fn: () => void) => describe(`[LAYOUT] ${name}`, fn),
  forms: (name: string, fn: () => void) => describe(`[FORMS] ${name}`, fn),
  tables: (name: string, fn: () => void) => describe(`[TABLES] ${name}`, fn),
  navigation: (name: string, fn: () => void) => describe(`[NAVIGATION] ${name}`, fn),
  modals: (name: string, fn: () => void) => describe(`[MODALS] ${name}`, fn),
}

// Browser-specific tests
export const testBrowsers = {
  chrome: (name: string, fn: () => void) => describe(`[CHROME] ${name}`, fn),
  firefox: (name: string, fn: () => void) => describe(`[FIREFOX] ${name}`, fn),
  safari: (name: string, fn: () => void) => describe(`[SAFARI] ${name}`, fn),
  edge: (name: string, fn: () => void) => describe(`[EDGE] ${name}`, fn),
}

// Device-specific tests
export const testDevices = {
  mobile: (name: string, fn: () => void) => describe(`[MOBILE] ${name}`, fn),
  tablet: (name: string, fn: () => void) => describe(`[TABLET] ${name}`, fn),
  desktop: (name: string, fn: () => void) => describe(`[DESKTOP] ${name}`, fn),
}

/**
 * Test fixture management
 */
interface TestFixture<T = any> {
  name: string
  data: T
  setup?: () => Promise<void> | void
  teardown?: () => Promise<void> | void
}

class FixtureManager {
  private fixtures = new Map<string, TestFixture>()

  register<T>(fixture: TestFixture<T>) {
    this.fixtures.set(fixture.name, fixture)
  }

  async get<T>(name: string): Promise<T> {
    const fixture = this.fixtures.get(name)
    if (!fixture) {
      throw new Error(`Fixture '${name}' not found`)
    }

    if (fixture.setup) {
      await fixture.setup()
    }

    return fixture.data as T
  }

  async cleanup(name: string) {
    const fixture = this.fixtures.get(name)
    if (fixture?.teardown) {
      await fixture.teardown()
    }
  }

  async cleanupAll() {
    for (const [name] of this.fixtures) {
      await this.cleanup(name)
    }
  }

  list(): string[] {
    return Array.from(this.fixtures.keys())
  }
}

export const fixtureManager = new FixtureManager()

/**
 * Pre-defined test fixtures
 */
export const testFixtures = {
  employees: {
    singleEmployee: {
      name: 'single-employee',
      data: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        department: { id: '1', name: 'Engineering' },
        role: { id: '1', name: 'Developer' },
        status: 'active'
      }
    },
    
    employeeList: {
      name: 'employee-list',
      data: Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        firstName: `Employee${i + 1}`,
        lastName: `Last${i + 1}`,
        email: `employee${i + 1}@example.com`,
        department: { id: '1', name: 'Engineering' },
        role: { id: '1', name: 'Developer' },
        status: 'active'
      }))
    },

    largeEmployeeList: {
      name: 'large-employee-list',
      data: Array.from({ length: 1000 }, (_, i) => ({
        id: `${i + 1}`,
        firstName: `Employee${i + 1}`,
        lastName: `Last${i + 1}`,
        email: `employee${i + 1}@example.com`,
        department: { id: Math.floor(i / 100) + 1, name: `Department${Math.floor(i / 100) + 1}` },
        role: { id: (i % 3) + 1, name: ['Developer', 'Manager', 'Analyst'][i % 3] },
        status: ['active', 'inactive'][i % 2]
      }))
    }
  },

  auth: {
    adminUser: {
      name: 'admin-user',
      data: {
        id: '1',
        email: 'admin@example.com',
        role: { name: 'Admin' },
        permissions: ['read', 'write', 'delete', 'admin']
      }
    },

    regularUser: {
      name: 'regular-user',
      data: {
        id: '2',
        email: 'user@example.com',
        role: { name: 'Employee' },
        permissions: ['read']
      }
    },

    managerUser: {
      name: 'manager-user',
      data: {
        id: '3',
        email: 'manager@example.com',
        role: { name: 'Manager' },
        permissions: ['read', 'write', 'approve']
      }
    }
  },

  attendance: {
    weeklyAttendance: {
      name: 'weekly-attendance',
      data: Array.from({ length: 7 }, (_, i) => ({
        id: `${i + 1}`,
        employeeId: '1',
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        clockIn: '09:00:00',
        clockOut: '17:00:00',
        status: 'present'
      }))
    },

    monthlyAttendance: {
      name: 'monthly-attendance',
      data: Array.from({ length: 30 }, (_, i) => ({
        id: `${i + 1}`,
        employeeId: '1',
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        clockIn: '09:00:00',
        clockOut: '17:00:00',
        status: ['present', 'absent', 'late'][i % 3]
      }))
    }
  }
}

// Register all fixtures
Object.values(testFixtures).forEach(category => {
  Object.values(category).forEach(fixture => {
    fixtureManager.register(fixture)
  })
})

/**
 * Test suite builder for complex scenarios
 */
export class TestSuiteBuilder {
  private suites: Array<{ name: string; tests: Array<() => void> }> = []

  addSuite(name: string) {
    this.suites.push({ name, tests: [] })
    return this
  }

  addTest(testFn: () => void) {
    const currentSuite = this.suites[this.suites.length - 1]
    if (currentSuite) {
      currentSuite.tests.push(testFn)
    }
    return this
  }

  addCRUDTests(entityName: string, operations: {
    create?: () => void
    read?: () => void
    update?: () => void
    delete?: () => void
  }) {
    this.addSuite(`${entityName} CRUD Operations`)

    if (operations.create) this.addTest(operations.create)
    if (operations.read) this.addTest(operations.read)
    if (operations.update) this.addTest(operations.update)
    if (operations.delete) this.addTest(operations.delete)

    return this
  }

  addPermissionTests(entityName: string, permissions: string[], testFn: (permission: string) => void) {
    this.addSuite(`${entityName} Permission Tests`)
    
    permissions.forEach(permission => {
      this.addTest(() => testFn(permission))
    })

    return this
  }

  addResponsiveTests(componentName: string, viewports: string[], testFn: (viewport: string) => void) {
    this.addSuite(`${componentName} Responsive Tests`)
    
    viewports.forEach(viewport => {
      this.addTest(() => testFn(viewport))
    })

    return this
  }

  build() {
    this.suites.forEach(suite => {
      describe(suite.name, () => {
        suite.tests.forEach((testFn, index) => {
          it(`Test ${index + 1}`, testFn)
        })
      })
    })
  }
}

/**
 * Test data builder with fluent API
 */
export class TestDataBuilder<T = any> {
  private data: Partial<T> = {}

  with<K extends keyof T>(key: K, value: T[K]): TestDataBuilder<T> {
    this.data[key] = value
    return this
  }

  withDefaults(defaults: Partial<T>): TestDataBuilder<T> {
    this.data = { ...defaults, ...this.data }
    return this
  }

  build(): T {
    return this.data as T
  }

  buildList(count: number): T[] {
    return Array.from({ length: count }, (_, i) => ({
      ...this.data,
      id: `${i + 1}`,
    } as T))
  }
}

// Convenience function to create test data builder
export const testData = <T = any>() => new TestDataBuilder<T>()

/**
 * Test environment configuration
 */
export interface TestEnvironmentConfig {
  viewport?: { width: number; height: number }
  theme?: 'light' | 'dark'
  locale?: string
  timezone?: string
  userAgent?: string
  connectionType?: 'slow' | 'fast' | 'offline'
}

export const configureTestEnvironment = (config: TestEnvironmentConfig) => {
  if (config.viewport) {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: config.viewport.width,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: config.viewport.height,
    })
  }

  if (config.theme) {
    document.documentElement.setAttribute('data-theme', config.theme)
    if (config.theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }

  if (config.userAgent) {
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: config.userAgent,
    })
  }

  if (config.connectionType) {
    // Mock network connection
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: {
        effectiveType: config.connectionType === 'slow' ? '2g' : '4g',
        downlink: config.connectionType === 'slow' ? 0.5 : 10,
        rtt: config.connectionType === 'slow' ? 2000 : 100,
      }
    })
  }
}

/**
 * Export all test organization utilities
 */
export const testOrganization = {
  categories: testCategories,
  priority: testPriority,
  features: testFeatures,
  components: testComponents,
  browsers: testBrowsers,
  devices: testDevices,
  fixtures: testFixtures,
  fixtureManager,
  TestSuiteBuilder,
  TestDataBuilder,
  testData,
  configureTestEnvironment,
}