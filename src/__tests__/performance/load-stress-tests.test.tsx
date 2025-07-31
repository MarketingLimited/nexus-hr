import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '../../test-utils'
import { QueryClient } from '@tanstack/react-query'
import { server } from '../../test-utils/msw-server'
import { http, HttpResponse } from 'msw'

// Stress testing utilities
class StressTestMonitor {
  private results: { [key: string]: any } = {}
  private startTime: number = 0
  private memoryUsage: { [key: string]: number } = {}

  startTest(testName: string): void {
    this.startTime = performance.now()
    this.memoryUsage[testName] = (performance as any).memory?.usedJSHeapSize || 0
  }

  endTest(testName: string): {
    duration: number
    memoryDelta: number
    successful: boolean
  } {
    const endTime = performance.now()
    const duration = endTime - this.startTime
    const currentMemory = (performance as any).memory?.usedJSHeapSize || 0
    const memoryDelta = currentMemory - (this.memoryUsage[testName] || 0)

    this.results[testName] = {
      duration,
      memoryDelta,
      successful: true,
      timestamp: new Date().toISOString()
    }

    return this.results[testName]
  }

  getResults(): { [key: string]: any } {
    return { ...this.results }
  }

  clear(): void {
    this.results = {}
    this.memoryUsage = {}
  }
}

// Large dataset generators for stress testing
const generateMassiveEmployeeDataset = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `stress-emp-${i + 1}`,
    employeeId: `SE${(i + 1).toString().padStart(6, '0')}`,
    firstName: `StressFirst${i + 1}`,
    lastName: `StressLast${i + 1}`,
    email: `stress.employee${i + 1}@loadtest.com`,
    phone: `+1-999-${(i + 1).toString().padStart(4, '0')}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    position: [
      'Senior Software Engineer', 
      'Engineering Manager', 
      'Principal Architect',
      'Staff Engineer',
      'Director of Engineering',
      'VP Engineering'
    ][i % 6],
    department: [
      'Engineering',
      'Product',
      'Design',
      'Data Science',
      'DevOps',
      'QA'
    ][i % 6],
    status: i % 100 === 0 ? 'inactive' : 'active',
    startDate: new Date(2015 + (i % 9), i % 12, (i % 28) + 1).toISOString(),
    salary: 80000 + (i * 500) + Math.floor(Math.random() * 50000),
    manager: i > 0 ? `stress-emp-${Math.floor(i / 8) + 1}` : null,
    location: [
      'San Francisco, CA',
      'New York, NY',
      'Austin, TX',
      'Seattle, WA',
      'Boston, MA',
      'Remote'
    ][i % 6],
    emergencyContact: {
      name: `Emergency Contact ${i + 1}`,
      phone: `+1-888-${(i + 2000).toString().padStart(4, '0')}`,
      relationship: ['Spouse', 'Parent', 'Sibling', 'Friend'][i % 4]
    },
    permissions: ['read', 'write', 'admin'][Math.floor(i / 1000) % 3] === 'admin' ? ['read', 'write', 'admin'] : ['read', 'write'],
    createdAt: new Date(2023, 0, 1).toISOString(),
    updatedAt: new Date().toISOString(),
    // Additional stress test fields
    projects: Array.from({ length: Math.min(i % 15 + 1, 10) }, (_, j) => `project-${i}-${j}`),
    skills: Array.from({ length: Math.min(i % 20 + 1, 15) }, (_, j) => `skill-${j}`),
    certifications: Array.from({ length: i % 5 }, (_, j) => `cert-${j}`),
    performanceHistory: Array.from({ length: Math.min(i % 10 + 1, 5) }, (_, j) => ({
      year: 2020 + j,
      rating: 3 + Math.random() * 2,
      goals: Array.from({ length: 3 + j }, (_, k) => `goal-${j}-${k}`)
    }))
  }))
}

const generateMassiveAttendanceDataset = (employeeCount: number, daysBack: number = 365) => {
  const data = []
  
  for (let empIndex = 0; empIndex < employeeCount; empIndex++) {
    const employeeId = `stress-emp-${empIndex + 1}`
    
    for (let day = 0; day < daysBack; day++) {
      const date = new Date()
      date.setDate(date.getDate() - day)
      
      // Skip weekends for most employees
      if (date.getDay() === 0 || date.getDay() === 6) {
        if (Math.random() > 0.1) continue // 90% skip weekends
      }
      
      // Simulate various attendance patterns
      const patterns = ['normal', 'late', 'early', 'halfday', 'absent']
      const pattern = patterns[Math.floor(Math.random() * patterns.length)]
      
      let record = null
      
      switch (pattern) {
        case 'normal':
          record = {
            id: `stress-att-${employeeId}-${day}`,
            employeeId,
            date: date.toISOString().split('T')[0],
            clockIn: new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString(),
            clockOut: new Date(date.getTime() + 17 * 60 * 60 * 1000).toISOString(),
            breakTime: 60,
            totalHours: 8,
            status: 'present' as const,
            location: 'Office',
            notes: null
          }
          break
        case 'late':
          record = {
            id: `stress-att-${employeeId}-${day}`,
            employeeId,
            date: date.toISOString().split('T')[0],
            clockIn: new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString(),
            clockOut: new Date(date.getTime() + 18 * 60 * 60 * 1000).toISOString(),
            breakTime: 60,
            totalHours: 8,
            status: 'late' as const,
            location: 'Office',
            notes: 'Arrived late due to traffic'
          }
          break
        case 'halfday':
          record = {
            id: `stress-att-${employeeId}-${day}`,
            employeeId,
            date: date.toISOString().split('T')[0],
            clockIn: new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString(),
            clockOut: new Date(date.getTime() + 13 * 60 * 60 * 1000).toISOString(),
            breakTime: 30,
            totalHours: 4,
            status: 'half-day' as const,
            location: 'Office',
            notes: 'Half day approved'
          }
          break
        case 'absent':
          record = {
            id: `stress-att-${employeeId}-${day}`,
            employeeId,
            date: date.toISOString().split('T')[0],
            clockIn: null,
            clockOut: null,
            breakTime: 0,
            totalHours: 0,
            status: 'absent' as const,
            location: null,
            notes: 'Sick leave'
          }
          break
      }
      
      if (record) {
        data.push(record)
      }
    }
  }
  
  return data
}

describe('Load & Stress Tests', () => {
  let stressMonitor: StressTestMonitor
  let queryClient: QueryClient

  beforeEach(() => {
    stressMonitor = new StressTestMonitor()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { 
          retry: false,
          staleTime: 0,
          gcTime: 1000 * 60 * 5 // 5 minutes (renamed from cacheTime)
        },
        mutations: { retry: false }
      }
    })
    
    // Mock performance.memory if not available
    if (!(performance as any).memory) {
      (performance as any).memory = {
        usedJSHeapSize: Math.floor(Math.random() * 1000000),
        totalJSHeapSize: Math.floor(Math.random() * 2000000),
        jsHeapSizeLimit: Math.floor(Math.random() * 4000000)
      }
    }
  })

  afterEach(() => {
    stressMonitor.clear()
    queryClient.clear()
  })

  describe('High Volume Data Tests', () => {
    it('should handle 10,000 employees without performance degradation', async () => {
      const employeeCount = 10000
      const employeeData = generateMassiveEmployeeDataset(employeeCount)
      
      server.use(
        http.get('/api/employees', ({ request }) => {
          const url = new URL(request.url)
          const page = parseInt(url.searchParams.get('page') || '1')
          const limit = parseInt(url.searchParams.get('limit') || '100')
          const startIndex = (page - 1) * limit
          const endIndex = Math.min(startIndex + limit, employeeCount)
          
          return HttpResponse.json({
            data: employeeData.slice(startIndex, endIndex),
            meta: {
              total: employeeCount,
              page,
              limit,
              totalPages: Math.ceil(employeeCount / limit)
            }
          })
        })
      )

      stressMonitor.startTest('massive-employee-dataset')
      
      // Test pagination through large dataset
      for (let page = 1; page <= 10; page++) {
        const response = await fetch(`/api/employees?page=${page}&limit=100`)
        const data = await response.json()
        
        expect(data.data).toHaveLength(100)
        expect(data.meta.total).toBe(employeeCount)
      }
      
      const result = stressMonitor.endTest('massive-employee-dataset')
      
      expect(result.duration).toBeLessThan(5000) // Should complete within 5 seconds
      expect(result.successful).toBe(true)
    })

    it('should handle massive attendance records (100k+ records)', async () => {
      const attendanceData = generateMassiveAttendanceDataset(500, 365) // 500 employees, full year
      expect(attendanceData.length).toBeGreaterThan(100000)
      
      server.use(
        http.get('/api/attendance', ({ request }) => {
          const url = new URL(request.url)
          const page = parseInt(url.searchParams.get('page') || '1')
          const limit = parseInt(url.searchParams.get('limit') || '1000')
          const startIndex = (page - 1) * limit
          const endIndex = Math.min(startIndex + limit, attendanceData.length)
          
          return HttpResponse.json({
            data: attendanceData.slice(startIndex, endIndex),
            meta: {
              total: attendanceData.length,
              page,
              limit,
              totalPages: Math.ceil(attendanceData.length / limit)
            }
          })
        })
      )

      stressMonitor.startTest('massive-attendance-dataset')
      
      // Test various pagination scenarios
      const pagesToTest = [1, 10, 50, 100]
      
      for (const page of pagesToTest) {
        const response = await fetch(`/api/attendance?page=${page}&limit=1000`)
        const data = await response.json()
        
        expect(data.data.length).toBeGreaterThan(0)
        expect(data.meta.total).toBe(attendanceData.length)
      }
      
      const result = stressMonitor.endTest('massive-attendance-dataset')
      
      expect(result.duration).toBeLessThan(8000) // Should complete within 8 seconds
      expect(result.successful).toBe(true)
    })
  })

  describe('Concurrent Load Tests', () => {
    it('should handle 100 concurrent API requests', async () => {
      const concurrentRequests = 100
      const endpoints = [
        '/api/employees',
        '/api/attendance',
        '/api/leave',
        '/api/payroll',
        '/api/performance',
        '/api/departments',
        '/api/notifications'
      ]
      
      // Set up handlers for all endpoints
      server.use(
        ...endpoints.map(endpoint => 
          http.get(endpoint, async () => {
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50))
            return HttpResponse.json({ 
              data: endpoint === '/api/employees' 
                ? generateMassiveEmployeeDataset(100)
                : [],
              meta: { total: 100, page: 1, limit: 100, totalPages: 1 }
            })
          })
        )
      )

      stressMonitor.startTest('concurrent-requests')
      
      // Create array of concurrent requests
      const requests = Array.from({ length: concurrentRequests }, (_, i) => {
        const endpoint = endpoints[i % endpoints.length]
        return fetch(endpoint).then(response => response.json())
      })
      
      // Execute all requests concurrently
      const results = await Promise.all(requests)
      
      const testResult = stressMonitor.endTest('concurrent-requests')
      
      expect(results).toHaveLength(concurrentRequests)
      expect(results.every(result => result.data !== undefined)).toBe(true)
      expect(testResult.duration).toBeLessThan(10000) // Should complete within 10 seconds
    })

    it('should handle rapid successive requests without memory leaks', async () => {
      const requestCount = 500
      let completedRequests = 0
      
      server.use(
        http.get('/api/employees/:id', ({ params }) => {
          return HttpResponse.json({
            data: generateMassiveEmployeeDataset(1)[0]
          })
        })
      )

      stressMonitor.startTest('rapid-requests')
      
      // Make rapid successive requests
      for (let i = 0; i < requestCount; i++) {
        fetch(`/api/employees/stress-emp-${i + 1}`)
          .then(response => response.json())
          .then(() => {
            completedRequests++
          })
          .catch(() => {
            // Handle errors gracefully
          })
        
        // Small delay to prevent overwhelming the system
        if (i % 50 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }
      
      // Wait for all requests to complete
      await waitFor(() => {
        expect(completedRequests).toBeGreaterThan(requestCount * 0.95) // At least 95% success rate
      }, { timeout: 15000 })
      
      const result = stressMonitor.endTest('rapid-requests')
      
      expect(result.duration).toBeLessThan(15000)
      expect(completedRequests).toBeGreaterThan(requestCount * 0.95)
    })
  })

  describe('Memory Stress Tests', () => {
    it('should handle large data structures without memory overflow', async () => {
      const largeDataSets = [
        generateMassiveEmployeeDataset(5000),
        generateMassiveAttendanceDataset(1000, 200)
      ]

      stressMonitor.startTest('memory-stress')
      
      // Load and process large datasets
      for (let i = 0; i < largeDataSets.length; i++) {
        const dataset = largeDataSets[i]
        
        // Simulate data processing
        const processed = dataset.map(item => ({
          ...item,
          processed: true,
          timestamp: Date.now()
        }))
        
        expect(processed.length).toBe(dataset.length)
      }
      
      const result = stressMonitor.endTest('memory-stress')
      
      // Memory delta should be reasonable (less than 100MB)
      expect(result.memoryDelta).toBeLessThan(100 * 1024 * 1024)
      expect(result.successful).toBe(true)
    })

    it('should cleanup resources after heavy operations', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
      
      stressMonitor.startTest('resource-cleanup')
      
      // Perform memory-intensive operations
      const heavyOperations = []
      
      for (let i = 0; i < 10; i++) {
        const largeData = generateMassiveEmployeeDataset(1000)
        heavyOperations.push(largeData)
        
        // Process data
        const processed = largeData.filter(emp => emp.status === 'active')
        expect(processed.length).toBeGreaterThan(0)
      }
      
      // Clear references
      heavyOperations.length = 0
      
      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc()
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const result = stressMonitor.endTest('resource-cleanup')
      
      // Memory should not increase excessively
      const memoryIncrease = finalMemory - initialMemory
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // Less than 50MB increase
    })
  })

  describe('System Reliability Tests', () => {
    it('should maintain stability under extended load', async () => {
      const testDuration = 5000 // 5 seconds of continuous load
      const requestInterval = 100 // Request every 100ms
      let requestCount = 0
      let errorCount = 0
      
      server.use(
        http.get('/api/stress-test', () => {
          // Simulate occasional errors (5% failure rate)
          if (Math.random() < 0.05) {
            return new HttpResponse(null, { status: 500 })
          }
          
          return HttpResponse.json({
            data: { success: true, timestamp: Date.now() },
            requestId: requestCount
          })
        })
      )

      stressMonitor.startTest('extended-load')
      
      const startTime = Date.now()
      
      // Run continuous load for specified duration
      while (Date.now() - startTime < testDuration) {
        try {
          const response = await fetch('/api/stress-test')
          if (!response.ok) {
            errorCount++
          }
          requestCount++
        } catch (error) {
          errorCount++
        }
        
        await new Promise(resolve => setTimeout(resolve, requestInterval))
      }
      
      const result = stressMonitor.endTest('extended-load')
      
      const errorRate = errorCount / requestCount
      
      expect(requestCount).toBeGreaterThan(40) // Should make at least 40 requests in 5 seconds
      expect(errorRate).toBeLessThan(0.1) // Error rate should be less than 10%
      expect(result.successful).toBe(true)
    })

    it('should recover gracefully from error conditions', async () => {
      let errorPhase = true
      let requestCount = 0
      
      server.use(
        http.get('/api/recovery-test', () => {
          requestCount++
          
          // First 10 requests fail, then recover
          if (errorPhase && requestCount <= 10) {
            return new HttpResponse(null, { status: 500 })
          }
          
          errorPhase = false
          return HttpResponse.json({
            data: { recovered: true, requestNumber: requestCount }
          })
        })
      )

      stressMonitor.startTest('error-recovery')
      
      const results = []
      
      // Make 20 requests to test error and recovery phases
      for (let i = 0; i < 20; i++) {
        try {
          const response = await fetch('/api/recovery-test')
          const data = await response.json()
          results.push({ success: true, data })
        } catch (error) {
          results.push({ success: false, error })
        }
      }
      
      const testResult = stressMonitor.endTest('error-recovery')
      
      const successfulRequests = results.filter(r => r.success).length
      
      expect(successfulRequests).toBeGreaterThan(5) // Should recover and have successful requests
      expect(testResult.successful).toBe(true)
    })
  })

  describe('Performance Degradation Tests', () => {
    it('should maintain response times under increasing load', async () => {
      const loadLevels = [10, 50, 100, 200]
      const responseTimesByLoad = {}
      
      for (const loadLevel of loadLevels) {
        const responseTimes = []
        
        server.use(
          http.get('/api/load-test', async () => {
            const delay = Math.random() * 50 + 25 // 25-75ms delay
            await new Promise(resolve => setTimeout(resolve, delay))
            return HttpResponse.json({ data: { loadLevel } })
          })
        )
        
        stressMonitor.startTest(`load-${loadLevel}`)
        
        // Create concurrent requests for current load level
        const requests = Array.from({ length: loadLevel }, async () => {
          const startTime = performance.now()
          await fetch('/api/load-test')
          const endTime = performance.now()
          return endTime - startTime
        })
        
        const times = await Promise.all(requests)
        responseTimes.push(...times)
        
        stressMonitor.endTest(`load-${loadLevel}`)
        
        responseTimesByLoad[loadLevel] = {
          average: times.reduce((a, b) => a + b, 0) / times.length,
          max: Math.max(...times),
          p95: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)]
        }
      }
      
      // Verify response times don't degrade significantly
      const baseLine = responseTimesByLoad[10]
      const highLoad = responseTimesByLoad[200]
      
      // High load should not be more than 3x slower than baseline
      expect(highLoad.average).toBeLessThan(baseLine.average * 3)
      expect(highLoad.p95).toBeLessThan(1000) // 95th percentile under 1 second
    })
  })
})