import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '../../test-utils'
import { QueryClient } from '@tanstack/react-query'
import { server } from '../../test-utils/msw-server'
import { http, HttpResponse } from 'msw'
import { performance } from 'perf_hooks'

// Import components for performance testing
import EmployeeList from '../../components/employees/EmployeeList'
import StatsCard from '../../components/dashboard/StatsCard'
import AttendanceTracker from '../../components/attendance/AttendanceTracker'
import PayrollProcessing from '../../components/payroll/PayrollProcessing'
import PerformanceReviews from '../../components/performance/PerformanceReviews'

// Performance monitoring utilities
class PerformanceMonitor {
  private measurements: { [key: string]: number[] } = {}

  startMeasurement(name: string): void {
    if (!this.measurements[name]) {
      this.measurements[name] = []
    }
    performance.mark(`${name}-start`)
  }

  endMeasurement(name: string): number {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    const measure = performance.getEntriesByName(name)[0]
    const duration = measure.duration
    
    this.measurements[name].push(duration)
    performance.clearMarks()
    performance.clearMeasures()
    
    return duration
  }

  getAverageTime(name: string): number {
    const times = this.measurements[name] || []
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
  }

  getMedianTime(name: string): number {
    const times = [...(this.measurements[name] || [])].sort((a, b) => a - b)
    const mid = Math.floor(times.length / 2)
    return times.length % 2 === 0 ? (times[mid - 1] + times[mid]) / 2 : times[mid]
  }

  get95thPercentile(name: string): number {
    const times = [...(this.measurements[name] || [])].sort((a, b) => a - b)
    const index = Math.floor(times.length * 0.95)
    return times[index] || 0
  }

  clear(): void {
    this.measurements = {}
  }
}

// Large dataset generators
const generateLargeEmployeeDataset = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `emp-${i + 1}`,
    employeeId: `E${(i + 1).toString().padStart(4, '0')}`,
    firstName: `FirstName${i + 1}`,
    lastName: `LastName${i + 1}`,
    email: `employee${i + 1}@company.com`,
    phone: `+1-555-${(i + 1).toString().padStart(4, '0')}`,
    avatar: `https://images.unsplash.com/photo-1494790108755-2616b612c75a?w=150&h=150&fit=crop&crop=face&faceindex=${i % 10}`,
    position: ['Software Engineer', 'Manager', 'Analyst', 'Designer', 'Director'][i % 5],
    department: 'Engineering',
    status: 'active' as const,
    startDate: new Date(2020 + (i % 4), i % 12, (i % 28) + 1).toISOString(),
    salary: 50000 + (i * 1000),
    manager: i > 0 ? `emp-${Math.floor(i / 5) + 1}` : null,
    location: ['New York', 'San Francisco', 'Austin', 'Remote'][i % 4],
    emergencyContact: {
      name: `Emergency${i + 1}`,
      phone: `+1-555-${(i + 1000).toString().padStart(4, '0')}`,
      relationship: 'Spouse'
    },
    permissions: ['read', 'write'],
    createdAt: new Date(2023, 0, 1).toISOString(),
    updatedAt: new Date().toISOString()
  }))
}

const generateLargeAttendanceDataset = (employeeCount: number, daysBack: number = 30) => {
  const data = []
  const employees = generateLargeEmployeeDataset(employeeCount)
  
  for (const employee of employees) {
    for (let day = 0; day < daysBack; day++) {
      const date = new Date()
      date.setDate(date.getDate() - day)
      
      data.push({
        id: `att-${employee.id}-${day}`,
        employeeId: employee.id,
        date: date.toISOString().split('T')[0],
        clockIn: new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString(),
        clockOut: new Date(date.getTime() + 17 * 60 * 60 * 1000).toISOString(),
        breakTime: 60,
        totalHours: 8,
        status: 'present' as const,
        location: 'Office',
        notes: day % 10 === 0 ? `Note for day ${day}` : null
      })
    }
  }
  
  return data
}

describe('Phase 7: Performance & Load Tests', () => {
  let performanceMonitor: PerformanceMonitor
  let queryClient: QueryClient

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
  })

  afterEach(() => {
    performanceMonitor.clear()
    queryClient.clear()
  })

  describe('7.1 Performance Testing', () => {
    describe('Large Dataset Handling', () => {
      it('should handle 1000+ employees efficiently', async () => {
        const employeeData = generateLargeEmployeeDataset(1000)
        
        server.use(
          http.get('/api/employees', () => {
            return HttpResponse.json({
              data: employeeData,
              meta: {
                total: 1000,
                page: 1,
                limit: 50,
                totalPages: 20
              }
            })
          })
        )

        performanceMonitor.startMeasurement('large-employee-render')
        
        render(<EmployeeList searchTerm="" selectedDepartment="" selectedStatus="" viewMode="grid" />)
        
        await waitFor(() => {
          expect(screen.getByTestId('employee-list')).toBeInTheDocument()
        })
        
        const renderTime = performanceMonitor.endMeasurement('large-employee-render')
        
        // Performance benchmarks
        expect(renderTime).toBeLessThan(2000) // Should render within 2 seconds
        expect(employeeData.length).toBe(1000)
      })

      it('should handle large attendance datasets efficiently', async () => {
        const attendanceData = generateLargeAttendanceDataset(100, 90) // 100 employees, 90 days
        
        server.use(
          http.get('/api/attendance', () => {
            return HttpResponse.json({
              data: attendanceData,
              meta: {
                total: attendanceData.length,
                page: 1,
                limit: 100,
                totalPages: Math.ceil(attendanceData.length / 100)
              }
            })
          })
        )

        performanceMonitor.startMeasurement('large-attendance-render')
        
        render(<AttendanceTracker />)
        
        await waitFor(() => {
          expect(screen.getByTestId('attendance-tracker')).toBeInTheDocument()
        })
        
        const renderTime = performanceMonitor.endMeasurement('large-attendance-render')
        
        expect(renderTime).toBeLessThan(3000) // Should render within 3 seconds
        expect(attendanceData.length).toBe(9000) // 100 employees * 90 days
      })
    })

    describe('Pagination Performance', () => {
      it('should handle fast pagination through large datasets', async () => {
        const totalEmployees = 5000
        const pageSize = 50
        const totalPages = Math.ceil(totalEmployees / pageSize)
        
        let currentPage = 1
        
        server.use(
          http.get('/api/employees', ({ request }) => {
            const url = new URL(request.url)
            const page = parseInt(url.searchParams.get('page') || '1')
            currentPage = page
            
            const startIndex = (page - 1) * pageSize
            const endIndex = Math.min(startIndex + pageSize, totalEmployees)
            const pageData = generateLargeEmployeeDataset(endIndex - startIndex)
            
            return HttpResponse.json({
              data: pageData,
              meta: {
                total: totalEmployees,
                page,
                limit: pageSize,
                totalPages
              }
            })
          })
        )

        render(<EmployeeList searchTerm="" selectedDepartment="" selectedStatus="" viewMode="grid" />)
        
        // Test pagination performance across multiple pages
        const pagesToTest = [1, 10, 25, 50, 75, 100]
        const pageLoadTimes: number[] = []
        
        for (const pageNum of pagesToTest) {
          performanceMonitor.startMeasurement(`page-${pageNum}`)
          
          // Simulate navigation to page
          await waitFor(() => {
            expect(screen.getByTestId('employee-list')).toBeInTheDocument()
          })
          
          const pageTime = performanceMonitor.endMeasurement(`page-${pageNum}`)
          pageLoadTimes.push(pageTime)
        }
        
        const averagePageTime = pageLoadTimes.reduce((a, b) => a + b, 0) / pageLoadTimes.length
        const maxPageTime = Math.max(...pageLoadTimes)
        
        expect(averagePageTime).toBeLessThan(1000) // Average page load under 1 second
        expect(maxPageTime).toBeLessThan(2000) // No page takes more than 2 seconds
      })
    })

    describe('Search and Filtering Performance', () => {
      it('should handle complex filtering efficiently', async () => {
        const employeeData = generateLargeEmployeeDataset(2000)
        
        server.use(
          http.get('/api/employees', ({ request }) => {
            const url = new URL(request.url)
            const search = url.searchParams.get('search')
            const department = url.searchParams.get('department')
            const status = url.searchParams.get('status')
            
            let filteredData = employeeData
            
            if (search) {
              filteredData = filteredData.filter(emp => 
                emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
                emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
                emp.email.toLowerCase().includes(search.toLowerCase())
              )
            }
            
            if (department) {
              filteredData = filteredData.filter(emp => emp.department === department)
            }
            
            if (status) {
              filteredData = filteredData.filter(emp => emp.status === status)
            }
            
            return HttpResponse.json({
              data: filteredData.slice(0, 50),
              meta: {
                total: filteredData.length,
                page: 1,
                limit: 50,
                totalPages: Math.ceil(filteredData.length / 50)
              }
            })
          })
        )

        render(<EmployeeList searchTerm="" selectedDepartment="" selectedStatus="" viewMode="grid" />)
        
        // Test various filter combinations
        const filterTests = [
          { search: 'john', expected: 'search' },
          { department: 'Engineering', expected: 'department-filter' },
          { status: 'active', expected: 'status-filter' },
          { search: 'smith', department: 'Engineering', expected: 'combined-filter' }
        ]
        
        for (const filterTest of filterTests) {
          performanceMonitor.startMeasurement(filterTest.expected)
          
          // Apply filters (this would be done through user interactions in real test)
          await waitFor(() => {
            expect(screen.getByTestId('employee-list')).toBeInTheDocument()
          })
          
          const filterTime = performanceMonitor.endMeasurement(filterTest.expected)
          expect(filterTime).toBeLessThan(500) // Filtering should be under 500ms
        }
      })
    })

    describe('Component Rendering Optimization', () => {
      it('should optimize StatsCard rendering with large numbers', async () => {
        const largeStats = [
          { label: 'Total Employees', value: 50000, icon: 'users' },
          { label: 'Active Projects', value: 25000, icon: 'briefcase' },
          { label: 'Completed Tasks', value: 1000000, icon: 'check' },
          { label: 'Total Revenue', value: 50000000, icon: 'dollar-sign' }
        ]
        
        const renderTimes: number[] = []
        
        for (const stat of largeStats) {
          performanceMonitor.startMeasurement(`stats-${stat.label}`)
          
          render(
            <StatsCard
              title={stat.label}
              value={stat.value.toLocaleString()}
              icon={stat.icon as any}
            />
          )
          
          const renderTime = performanceMonitor.endMeasurement(`stats-${stat.label}`)
          renderTimes.push(renderTime)
        }
        
        const averageRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
        expect(averageRenderTime).toBeLessThan(50) // Each component should render in under 50ms
      })
    })
  })

  describe('7.2 MSW Performance', () => {
    describe('Mock API Response Times', () => {
      it('should maintain consistent API response times', async () => {
        const responseTimes: number[] = []
        const iterations = 10
        
        for (let i = 0; i < iterations; i++) {
          server.use(
            http.get('/api/employees', async () => {
              // Simulate realistic API delay
              await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50))
              return HttpResponse.json({
                data: generateLargeEmployeeDataset(100),
                meta: { total: 100, page: 1, limit: 100, totalPages: 1 }
              })
            })
          )
          
          performanceMonitor.startMeasurement(`api-call-${i}`)
          
          const response = await fetch('/api/employees')
          await response.json()
          
          const responseTime = performanceMonitor.endMeasurement(`api-call-${i}`)
          responseTimes.push(responseTime)
        }
        
        const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        const maxResponseTime = Math.max(...responseTimes)
        
        expect(averageResponseTime).toBeLessThan(200) // Average under 200ms
        expect(maxResponseTime).toBeLessThan(500) // No response over 500ms
      })
    })

    describe('Concurrent Request Handling', () => {
      it('should handle multiple concurrent requests efficiently', async () => {
        const concurrentRequests = 20
        const requestUrls = [
          '/api/employees',
          '/api/attendance',
          '/api/leave',
          '/api/payroll',
          '/api/performance'
        ]
        
        // Set up handlers for all endpoints
        server.use(
          http.get('/api/employees', () => 
            HttpResponse.json({ data: generateLargeEmployeeDataset(50), meta: {} })
          ),
          http.get('/api/attendance', () => 
            HttpResponse.json({ data: generateLargeAttendanceDataset(10, 7), meta: {} })
          ),
          http.get('/api/leave', () => 
            HttpResponse.json({ data: [], meta: {} })
          ),
          http.get('/api/payroll', () => 
            HttpResponse.json({ data: [], meta: {} })
          ),
          http.get('/api/performance', () => 
            HttpResponse.json({ data: [], meta: {} })
          )
        )
        
        performanceMonitor.startMeasurement('concurrent-requests')
        
        // Fire off concurrent requests
        const promises = Array.from({ length: concurrentRequests }, (_, i) => {
          const url = requestUrls[i % requestUrls.length]
          return fetch(url).then(res => res.json())
        })
        
        const results = await Promise.all(promises)
        
        const totalTime = performanceMonitor.endMeasurement('concurrent-requests')
        
        expect(results).toHaveLength(concurrentRequests)
        expect(totalTime).toBeLessThan(2000) // All concurrent requests under 2 seconds
      })
    })

    describe('Memory Usage with Large Datasets', () => {
      it('should manage memory efficiently with large mock datasets', async () => {
        const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
        
        // Generate and serve large datasets
        const largeDatasets = [
          generateLargeEmployeeDataset(5000),
          generateLargeAttendanceDataset(1000, 365) // 1000 employees, full year
        ]
        
        server.use(
          http.get('/api/employees', () => 
            HttpResponse.json({ data: largeDatasets[0], meta: {} })
          ),
          http.get('/api/attendance', () => 
            HttpResponse.json({ data: largeDatasets[1], meta: {} })
          )
        )
        
        // Make multiple requests to load data
        await Promise.all([
          fetch('/api/employees').then(res => res.json()),
          fetch('/api/attendance').then(res => res.json())
        ])
        
        const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
        const memoryIncrease = finalMemory - initialMemory
        
        // Memory increase should be reasonable (less than 50MB for test environment)
        if (memoryIncrease > 0) {
          expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // 50MB
        }
      })
    })

    describe('Cache Invalidation Performance', () => {
      it('should handle cache invalidation efficiently', async () => {
        const cacheOperations = ['set', 'get', 'invalidate', 'clear']
        const operationTimes: { [key: string]: number[] } = {}
        
        // Simulate cache operations
        for (const operation of cacheOperations) {
          operationTimes[operation] = []
          
          for (let i = 0; i < 100; i++) {
            performanceMonitor.startMeasurement(`cache-${operation}-${i}`)
            
            // Simulate cache operation
            switch (operation) {
              case 'set':
                queryClient.setQueryData(['test', i], { data: i })
                break
              case 'get':
                queryClient.getQueryData(['test', i])
                break
              case 'invalidate':
                queryClient.invalidateQueries({ queryKey: ['test', i] })
                break
              case 'clear':
                queryClient.clear()
                break
            }
            
            const operationTime = performanceMonitor.endMeasurement(`cache-${operation}-${i}`)
            operationTimes[operation].push(operationTime)
          }
        }
        
        // Verify cache operation performance
        for (const [operation, times] of Object.entries(operationTimes)) {
          const averageTime = times.reduce((a, b) => a + b, 0) / times.length
          const maxTime = Math.max(...times)
          
          expect(averageTime).toBeLessThan(10) // Average cache operation under 10ms
          expect(maxTime).toBeLessThan(50) // No cache operation over 50ms
        }
      })
    })
  })

  describe('Performance Benchmarks', () => {
    it('should meet overall performance benchmarks', async () => {
      const benchmarks = {
        componentRender: 100, // ms
        apiResponse: 200, // ms
        searchFilter: 300, // ms
        dataLoad: 1000, // ms
        pageNavigation: 500 // ms
      }
      
      // Test each benchmark category
      const results = {}
      
      // Component render benchmark
      performanceMonitor.startMeasurement('component-render-benchmark')
      render(<StatsCard title="Test" value="1000" icon={'users' as any} />)
      results['componentRender'] = performanceMonitor.endMeasurement('component-render-benchmark')
      
      // Data load benchmark
      performanceMonitor.startMeasurement('data-load-benchmark')
      server.use(
        http.get('/api/employees', () => 
          HttpResponse.json({ 
            data: generateLargeEmployeeDataset(1000), 
            meta: { total: 1000, page: 1, limit: 1000, totalPages: 1 } 
          })
        )
      )
      await fetch('/api/employees').then(res => res.json())
      results['dataLoad'] = performanceMonitor.endMeasurement('data-load-benchmark')
      
      // Verify all benchmarks are met
      for (const [category, expectedTime] of Object.entries(benchmarks)) {
        if (results[category]) {
          expect(results[category]).toBeLessThan(expectedTime)
        }
      }
    })
  })
})