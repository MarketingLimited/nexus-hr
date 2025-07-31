import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '../../test-utils'
import { QueryClient } from '@tanstack/react-query'
import { server } from '../../test-utils/msw-server'
import { http, HttpResponse } from 'msw'

// Component imports for benchmarking
import EmployeeList from '../../components/employees/EmployeeList'
import AttendanceTracker from '../../components/attendance/AttendanceTracker'
import PayrollProcessing from '../../components/payroll/PayrollProcessing'
import PerformanceReviews from '../../components/performance/PerformanceReviews'
import StatsCard from '../../components/dashboard/StatsCard'
import ModuleCard from '../../components/dashboard/ModuleCard'
import { Header } from '../../components/layout/Header'
import Sidebar from '../../components/layout/Sidebar'

// Benchmark utilities
interface BenchmarkResult {
  name: string
  duration: number
  operations: number
  opsPerSecond: number
  memoryUsage: number
  timestamp: string
}

interface BenchmarkSuite {
  name: string
  results: BenchmarkResult[]
  summary: {
    totalTests: number
    averageDuration: number
    totalOperations: number
    averageOpsPerSecond: number
    memoryDelta: number
  }
}

class BenchmarkRunner {
  private suites: Map<string, BenchmarkSuite> = new Map()
  private currentSuite: string | null = null

  startSuite(name: string): void {
    this.currentSuite = name
    if (!this.suites.has(name)) {
      this.suites.set(name, {
        name,
        results: [],
        summary: {
          totalTests: 0,
          averageDuration: 0,
          totalOperations: 0,
          averageOpsPerSecond: 0,
          memoryDelta: 0
        }
      })
    }
  }

  async runBenchmark(
    name: string,
    operation: () => Promise<void> | void,
    operationCount: number = 1
  ): Promise<BenchmarkResult> {
    const startTime = performance.now()
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0

    // Run the operation
    for (let i = 0; i < operationCount; i++) {
      await operation()
    }

    const endTime = performance.now()
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0

    const duration = endTime - startTime
    const opsPerSecond = operationCount / (duration / 1000)
    const memoryUsage = endMemory - startMemory

    const result: BenchmarkResult = {
      name,
      duration,
      operations: operationCount,
      opsPerSecond,
      memoryUsage,
      timestamp: new Date().toISOString()
    }

    if (this.currentSuite) {
      const suite = this.suites.get(this.currentSuite)!
      suite.results.push(result)
      this.updateSummary(this.currentSuite)
    }

    return result
  }

  private updateSummary(suiteName: string): void {
    const suite = this.suites.get(suiteName)!
    const results = suite.results

    suite.summary = {
      totalTests: results.length,
      averageDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      totalOperations: results.reduce((sum, r) => sum + r.operations, 0),
      averageOpsPerSecond: results.reduce((sum, r) => sum + r.opsPerSecond, 0) / results.length,
      memoryDelta: results.reduce((sum, r) => sum + r.memoryUsage, 0)
    }
  }

  getSuite(name: string): BenchmarkSuite | undefined {
    return this.suites.get(name)
  }

  getAllSuites(): BenchmarkSuite[] {
    return Array.from(this.suites.values())
  }

  exportResults(): string {
    const allSuites = this.getAllSuites()
    return JSON.stringify(allSuites, null, 2)
  }

  clear(): void {
    this.suites.clear()
    this.currentSuite = null
  }
}

// Test data generators
const generateBenchmarkEmployeeData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `bench-emp-${i + 1}`,
    employeeId: `BE${(i + 1).toString().padStart(4, '0')}`,
    firstName: `Benchmark${i + 1}`,
    lastName: `Employee${i + 1}`,
    email: `bench.emp${i + 1}@benchmark.com`,
    phone: `+1-111-${(i + 1).toString().padStart(4, '0')}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=bench${i}`,
    position: 'Benchmark Engineer',
    department: 'Engineering',
    status: 'active' as const,
    startDate: new Date(2023, 0, 1).toISOString(),
    salary: 100000 + (i * 1000),
    manager: i > 0 ? `bench-emp-${Math.floor(i / 5) + 1}` : null,
    location: 'Benchmark Office',
    emergencyContact: {
      name: `Emergency${i + 1}`,
      phone: `+1-222-${(i + 1).toString().padStart(4, '0')}`,
      relationship: 'Spouse'
    },
    permissions: ['read', 'write'],
    createdAt: new Date(2023, 0, 1).toISOString(),
    updatedAt: new Date().toISOString()
  }))
}

describe('Benchmark Suite - Phase 7 Performance Tests', () => {
  let benchmarkRunner: BenchmarkRunner
  let queryClient: QueryClient

  beforeAll(() => {
    // Mock performance.memory if not available
    if (!(performance as any).memory) {
      (performance as any).memory = {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000
      }
    }
  })

  beforeEach(() => {
    benchmarkRunner = new BenchmarkRunner()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 0 },
        mutations: { retry: false }
      }
    })
  })

  afterEach(() => {
    benchmarkRunner.clear()
    queryClient.clear()
  })

  afterAll(() => {
    // Export benchmark results for analysis
    const results = benchmarkRunner.exportResults()
    console.log('Benchmark Results:', results)
  })

  describe('Component Rendering Benchmarks', () => {
    beforeEach(() => {
      benchmarkRunner.startSuite('Component Rendering')
    })

    it('should benchmark EmployeeList rendering performance', async () => {
      const employeeData = generateBenchmarkEmployeeData(100)
      
      server.use(
        http.get('/api/employees', () => 
          HttpResponse.json({
            data: employeeData,
            meta: { total: 100, page: 1, limit: 100, totalPages: 1 }
          })
        )
      )

      const result = await benchmarkRunner.runBenchmark(
        'EmployeeList-100-items',
        async () => {
          render(<EmployeeList searchTerm="" selectedDepartment="" selectedStatus="" viewMode="grid" />)
          await waitFor(() => {
            expect(screen.getByTestId('employee-list')).toBeInTheDocument()
          })
        },
        5 // Run 5 times for average
      )

      expect(result.opsPerSecond).toBeGreaterThan(0.5) // At least 0.5 renders per second
      expect(result.duration).toBeLessThan(10000) // Should complete within 10 seconds
    })

    it('should benchmark StatsCard rendering with large numbers', async () => {
      const statsData = [
        { title: 'Total Employees', value: '10,000', icon: 'users' },
        { title: 'Revenue', value: '$1,000,000', icon: 'dollar-sign' },
        { title: 'Projects', value: '5,000', icon: 'briefcase' },
        { title: 'Tasks', value: '50,000', icon: 'check' }
      ]

      const result = await benchmarkRunner.runBenchmark(
        'StatsCard-rendering',
        () => {
          statsData.forEach(stat => {
            render(
              <StatsCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon as any}
              />
            )
          })
        },
        10 // Render 10 times
      )

      expect(result.opsPerSecond).toBeGreaterThan(5) // At least 5 renders per second
      expect(result.memoryUsage).toBeLessThan(1024 * 1024) // Less than 1MB memory per operation
    })

    it('should benchmark Header component with navigation', async () => {
      const result = await benchmarkRunner.runBenchmark(
        'Header-component',
        () => {
          render(<Header />)
        },
        20 // Render 20 times
      )

      expect(result.opsPerSecond).toBeGreaterThan(10) // At least 10 renders per second
      expect(result.duration / result.operations).toBeLessThan(100) // Average under 100ms per render
    })

    it('should benchmark Sidebar component rendering', async () => {
      const result = await benchmarkRunner.runBenchmark(
        'Sidebar-component',
        () => {
          render(<Sidebar />)
        },
        15 // Render 15 times
      )

      expect(result.opsPerSecond).toBeGreaterThan(8) // At least 8 renders per second
      expect(result.memoryUsage / result.operations).toBeLessThan(50000) // Less than 50KB per render
    })
  })

  describe('Data Processing Benchmarks', () => {
    beforeEach(() => {
      benchmarkRunner.startSuite('Data Processing')
    })

    it('should benchmark large dataset filtering', async () => {
      const largeDataset = generateBenchmarkEmployeeData(5000)

      const result = await benchmarkRunner.runBenchmark(
        'Dataset-filtering',
        () => {
          // Simulate various filtering operations
          const activeEmployees = largeDataset.filter(emp => emp.status === 'active')
          const engineeringDept = largeDataset.filter(emp => emp.department === 'Engineering')
          const highSalary = largeDataset.filter(emp => emp.salary > 120000)
          const recentHires = largeDataset.filter(emp => 
            new Date(emp.startDate) > new Date('2023-01-01')
          )

          expect(activeEmployees.length).toBeGreaterThan(0)
          expect(engineeringDept.length).toBeGreaterThan(0)
          expect(highSalary.length).toBeGreaterThan(0)
          expect(recentHires.length).toBeGreaterThan(0)
        },
        100 // Run 100 filtering operations
      )

      expect(result.opsPerSecond).toBeGreaterThan(50) // At least 50 operations per second
      expect(result.duration).toBeLessThan(3000) // Should complete within 3 seconds
    })

    it('should benchmark data sorting operations', async () => {
      const dataset = generateBenchmarkEmployeeData(2000)

      const result = await benchmarkRunner.runBenchmark(
        'Dataset-sorting',
        () => {
          // Test various sorting operations
          const sortedByName = [...dataset].sort((a, b) => 
            a.lastName.localeCompare(b.lastName)
          )
          const sortedBySalary = [...dataset].sort((a, b) => b.salary - a.salary)
          const sortedByDate = [...dataset].sort((a, b) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          )

          expect(sortedByName[0].lastName).toBeTruthy()
          expect(sortedBySalary[0].salary).toBeGreaterThanOrEqual(sortedBySalary[1].salary)
          expect(sortedByDate).toHaveLength(dataset.length)
        },
        50 // Run 50 sorting operations
      )

      expect(result.opsPerSecond).toBeGreaterThan(20) // At least 20 sorts per second
    })

    it('should benchmark data aggregation operations', async () => {
      const dataset = generateBenchmarkEmployeeData(3000)

      const result = await benchmarkRunner.runBenchmark(
        'Dataset-aggregation',
        () => {
          // Complex aggregation operations
          const totalSalary = dataset.reduce((sum, emp) => sum + emp.salary, 0)
          const avgSalary = totalSalary / dataset.length
          
          const deptGroups = dataset.reduce((groups, emp) => {
            if (!groups[emp.department]) groups[emp.department] = []
            groups[emp.department].push(emp)
            return groups
          }, {} as Record<string, any[]>)
          
          const statusCounts = dataset.reduce((counts, emp) => {
            counts[emp.status] = (counts[emp.status] || 0) + 1
            return counts
          }, {} as Record<string, number>)

          expect(totalSalary).toBeGreaterThan(0)
          expect(avgSalary).toBeGreaterThan(0)
          expect(Object.keys(deptGroups).length).toBeGreaterThan(0)
          expect(statusCounts.active).toBeGreaterThan(0)
        },
        30 // Run 30 aggregation operations
      )

      expect(result.opsPerSecond).toBeGreaterThan(10) // At least 10 aggregations per second
    })
  })

  describe('API Response Benchmarks', () => {
    beforeEach(() => {
      benchmarkRunner.startSuite('API Performance')
    })

    it('should benchmark API response times', async () => {
      const responses = [
        { endpoint: '/api/employees', data: generateBenchmarkEmployeeData(100) },
        { endpoint: '/api/departments', data: [] },
        { endpoint: '/api/attendance', data: [] },
        { endpoint: '/api/payroll', data: [] }
      ]

      responses.forEach(({ endpoint, data }) => {
        server.use(
          http.get(endpoint, () => 
            HttpResponse.json({ data, meta: { total: data.length } })
          )
        )
      })

      const result = await benchmarkRunner.runBenchmark(
        'API-response-times',
        async () => {
          const promises = responses.map(({ endpoint }) => 
            fetch(endpoint).then(res => res.json())
          )
          const results = await Promise.all(promises)
          expect(results).toHaveLength(responses.length)
        },
        25 // Run 25 times
      )

      expect(result.opsPerSecond).toBeGreaterThan(5) // At least 5 API calls per second
      expect(result.duration / result.operations).toBeLessThan(200) // Average under 200ms per call
    })

    it('should benchmark pagination API performance', async () => {
      const totalRecords = 1000
      const pageSize = 50

      server.use(
        http.get('/api/employees', ({ request }) => {
          const url = new URL(request.url)
          const page = parseInt(url.searchParams.get('page') || '1')
          const limit = parseInt(url.searchParams.get('limit') || '50')
          
          const startIndex = (page - 1) * limit
          const endIndex = Math.min(startIndex + limit, totalRecords)
          const pageData = generateBenchmarkEmployeeData(endIndex - startIndex)
          
          return HttpResponse.json({
            data: pageData,
            meta: {
              total: totalRecords,
              page,
              limit,
              totalPages: Math.ceil(totalRecords / pageSize)
            }
          })
        })
      )

      const result = await benchmarkRunner.runBenchmark(
        'Pagination-API',
        async () => {
          // Test pagination through 10 pages
          const promises = Array.from({ length: 10 }, (_, i) => 
            fetch(`/api/employees?page=${i + 1}&limit=${pageSize}`)
              .then(res => res.json())
          )
          const results = await Promise.all(promises)
          expect(results).toHaveLength(10)
        },
        10 // Run 10 times
      )

      expect(result.opsPerSecond).toBeGreaterThan(2) // At least 2 pagination sets per second
    })
  })

  describe('Memory Management Benchmarks', () => {
    beforeEach(() => {
      benchmarkRunner.startSuite('Memory Management')
    })

    it('should benchmark memory usage with large datasets', async () => {
      const result = await benchmarkRunner.runBenchmark(
        'Memory-large-datasets',
        () => {
          // Create and process large datasets
          const dataset1 = generateBenchmarkEmployeeData(2000)
          const dataset2 = generateBenchmarkEmployeeData(1500)
          const dataset3 = generateBenchmarkEmployeeData(1000)
          
          // Process data
          const combined = [...dataset1, ...dataset2, ...dataset3]
          const processed = combined.map(emp => ({
            ...emp,
            fullName: `${emp.firstName} ${emp.lastName}`,
            salaryFormatted: emp.salary.toLocaleString(),
            tenure: new Date().getFullYear() - new Date(emp.startDate).getFullYear()
          }))
          
          expect(processed.length).toBe(combined.length)
        },
        20 // Run 20 times
      )

      // Memory usage should be reasonable
      expect(result.memoryUsage / result.operations).toBeLessThan(5 * 1024 * 1024) // Less than 5MB per operation
    })

    it('should benchmark garbage collection efficiency', async () => {
      const result = await benchmarkRunner.runBenchmark(
        'Garbage-collection',
        () => {
          // Create temporary large objects
          const tempData = []
          for (let i = 0; i < 100; i++) {
            tempData.push(generateBenchmarkEmployeeData(100))
          }
          
          // Process and discard
          const processed = tempData.map(dataset => 
            dataset.filter(emp => emp.status === 'active').length
          )
          
          expect(processed.length).toBe(100)
          
          // Clear references
          tempData.length = 0
        },
        15 // Run 15 times
      )

      expect(result.opsPerSecond).toBeGreaterThan(1) // At least 1 operation per second
    })
  })

  describe('Overall Performance Metrics', () => {
    it('should generate comprehensive benchmark report', () => {
      const allSuites = benchmarkRunner.getAllSuites()
      const overallMetrics = {
        totalSuites: allSuites.length,
        totalTests: allSuites.reduce((sum, suite) => sum + suite.summary.totalTests, 0),
        totalOperations: allSuites.reduce((sum, suite) => sum + suite.summary.totalOperations, 0),
        averageOpsPerSecond: allSuites.reduce((sum, suite) => sum + suite.summary.averageOpsPerSecond, 0) / allSuites.length,
        totalMemoryDelta: allSuites.reduce((sum, suite) => sum + suite.summary.memoryDelta, 0)
      }

      // Verify overall performance meets benchmarks
      expect(overallMetrics.totalTests).toBeGreaterThan(0)
      expect(overallMetrics.averageOpsPerSecond).toBeGreaterThan(1)
      expect(overallMetrics.totalMemoryDelta).toBeLessThan(100 * 1024 * 1024) // Less than 100MB total

      console.log('Overall Performance Metrics:', overallMetrics)
    })
  })
})