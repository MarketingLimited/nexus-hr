import { http, HttpResponse } from 'msw'
import { DataValidator, DataSeeder } from '../../utils/dataValidation'
import { ErrorSimulator } from '../../utils/advancedFeatures'

// Enhanced API handlers with validation and error simulation
export const enhancedHandlers = [
  // Data validation endpoint
  http.post('/api/validate', async ({ request }) => {
    const errorCheck = ErrorSimulator.checkForError('/api/validate', 'POST')
    if (errorCheck) {
      return HttpResponse.json({ error: errorCheck.error }, { status: errorCheck.status })
    }

    try {
      const { entityType, data } = await request.json() as { entityType: string; data: any }
      let errors: string[] = []

      switch (entityType) {
        case 'leave_request':
          errors = DataValidator.validateLeaveRequest(data)
          break
        case 'attendance_record':
          errors = DataValidator.validateAttendanceRecord(data)
          break
        case 'payslip':
          errors = DataValidator.validatePayslip(data)
          break
        default:
          errors = ['Unknown entity type']
      }

      return HttpResponse.json({
        valid: errors.length === 0,
        errors
      })
    } catch (error) {
      return HttpResponse.json({ error: 'Validation failed' }, { status: 400 })
    }
  }),

  // Bulk operations endpoint
  http.post('/api/bulk/:operation', async ({ params, request }) => {
    const errorCheck = ErrorSimulator.checkForError('/api/bulk', 'POST')
    if (errorCheck) {
      return HttpResponse.json({ error: errorCheck.error }, { status: errorCheck.status })
    }

    try {
      const { operation } = params
      const { entityType, ids, data } = await request.json() as {
        entityType: string
        ids: string[]
        data?: any
      }

      if (ids.length > 1000) {
        return HttpResponse.json({ error: 'Bulk operation limit exceeded' }, { status: 400 })
      }

      let success = 0
      let failure = 0
      const results: Array<{ id: string; status: 'success' | 'failed' }> = []

      for (const id of ids) {
        if (Math.random() > 0.1) {
          success++
          results.push({ id, status: 'success' })
        } else {
          failure++
          results.push({ id, status: 'failed' })
        }
      }

      return HttpResponse.json({
        processedCount: ids.length,
        successCount: success,
        failureCount: failure,
        results
      })
    } catch (error) {
      return HttpResponse.json({ error: 'Bulk operation failed' }, { status: 500 })
    }
  }),

  // Advanced search endpoint
  http.post('/api/search', async ({ request }) => {
    const errorCheck = ErrorSimulator.checkForError('/api/search', 'POST')
    if (errorCheck) {
      return HttpResponse.json({ error: errorCheck.error }, { status: errorCheck.status })
    }

    try {
      const { 
        entityType, 
        query, 
        filters, 
        pagination,
        sorting 
      } = await request.json() as {
        entityType: string
        query?: string
        filters?: Record<string, any>
        pagination?: { page: number; limit: number }
        sorting?: { field: string; order: 'asc' | 'desc' }
      }

      // Simulate advanced search with realistic results
      const mockResults = Array.from({ length: 20 }, (_, i) => ({
        id: `${entityType}-${i + 1}`,
        relevanceScore: Math.random(),
        highlights: query ? [`Match for "${query}" found`] : [],
        data: {
          name: `Sample ${entityType} ${i + 1}`,
          status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
        }
      }))

      const page = pagination?.page || 1
      const limit = pagination?.limit || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit

      return HttpResponse.json({
        data: mockResults.slice(startIndex, endIndex),
        pagination: {
          page,
          limit,
          total: mockResults.length,
          totalPages: Math.ceil(mockResults.length / limit)
        },
        searchMeta: {
          query,
          processingTime: Math.random() * 100,
          totalResults: mockResults.length
        }
      })
    } catch (error) {
      return HttpResponse.json({ error: 'Search failed' }, { status: 500 })
    }
  }),

  // Data import endpoint
  http.post('/api/import', async ({ request }) => {
    const errorCheck = ErrorSimulator.checkForError('/api/import', 'POST')
    if (errorCheck) {
      return HttpResponse.json({ error: errorCheck.error }, { status: errorCheck.status })
    }

    try {
      const { entityType, data, options } = await request.json() as {
        entityType: string
        data: any[]
        options?: { validate?: boolean; skipDuplicates?: boolean }
      }

      let importResults = {
        imported: 0,
        skipped: 0,
        failed: 0,
        errors: [] as Array<{ row: number; error: string }>,
        duplicates: [] as Array<{ row: number; id: string }>
      }

      // Simulate import processing
      data.forEach((item, index) => {
        try {
          // Simulate validation if requested
          if (options?.validate) {
            let errors: string[] = []
            
            switch (entityType) {
              case 'employees':
                if (!item.email || !item.firstName || !item.lastName) {
                  errors.push('Missing required fields')
                }
                break
              case 'leave_requests':
                errors = DataValidator.validateLeaveRequest(item)
                break
            }

            if (errors.length > 0) {
              throw new Error(errors.join(', '))
            }
          }

          // Simulate duplicate check
          if (options?.skipDuplicates && Math.random() < 0.1) {
            importResults.skipped++
            importResults.duplicates.push({ row: index + 1, id: item.id || `${entityType}-${index}` })
          } else {
            importResults.imported++
          }
        } catch (error) {
          importResults.failed++
          importResults.errors.push({
            row: index + 1,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      })

      return HttpResponse.json(importResults)
    } catch (error) {
      return HttpResponse.json({ error: 'Import failed' }, { status: 500 })
    }
  }),

  // Data export endpoint
  http.get('/api/export/:entityType', async ({ params, request }) => {
    const errorCheck = ErrorSimulator.checkForError('/api/export', 'GET')
    if (errorCheck) {
      return HttpResponse.json({ error: errorCheck.error }, { status: errorCheck.status })
    }

    try {
      const { entityType } = params
      const url = new URL(request.url)
      const format = url.searchParams.get('format') || 'json'
      const filters = url.searchParams.get('filters')

      // Simulate export data generation
      const mockData = Array.from({ length: 100 }, (_, i) => ({
        id: `${entityType}-${i + 1}`,
        name: `Sample ${entityType} ${i + 1}`,
        status: 'active',
        createdAt: new Date().toISOString()
      }))

      if (format === 'csv') {
        const csvContent = [
          'id,name,status,createdAt',
          ...mockData.map(item => `${item.id},${item.name},${item.status},${item.createdAt}`)
        ].join('\n')

        return new HttpResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${entityType}-export.csv"`
          }
        })
      }

      return HttpResponse.json({
        data: mockData,
        meta: {
          exportedAt: new Date().toISOString(),
          format,
          count: mockData.length
        }
      })
    } catch (error) {
      return HttpResponse.json({ error: 'Export failed' }, { status: 500 })
    }
  }),

  // Database seeding endpoint
  http.post('/api/seed', async ({ request }) => {
    try {
      const { reset } = await request.json() as { reset?: boolean }

      if (reset) {
        await DataSeeder.resetDatabase()
      } else {
        await DataSeeder.seedDatabase()
      }

      return HttpResponse.json({
        message: reset ? 'Database reset and seeded successfully' : 'Database seeded successfully',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      return HttpResponse.json({ error: 'Seeding failed' }, { status: 500 })
    }
  }),

  // System health check with performance metrics
  http.get('/api/health', async () => {
    const errorCheck = ErrorSimulator.checkForError('/api/health', 'GET')
    if (errorCheck) {
      return HttpResponse.json({ error: errorCheck.error }, { status: errorCheck.status })
    }

    // Simulate system metrics
    const metrics = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(Math.random() * 86400000), // Random uptime in ms
      performance: {
        averageResponseTime: Math.random() * 100 + 50, // 50-150ms
        requestsPerSecond: Math.random() * 1000 + 500, // 500-1500 rps
        errorRate: Math.random() * 0.05, // 0-5% error rate
        cacheHitRate: Math.random() * 0.3 + 0.7 // 70-100% cache hit rate
      },
      resources: {
        memoryUsage: Math.random() * 0.5 + 0.3, // 30-80% memory usage
        cpuUsage: Math.random() * 0.4 + 0.2, // 20-60% CPU usage
        diskUsage: Math.random() * 0.3 + 0.4 // 40-70% disk usage
      },
      database: {
        connectionPool: Math.floor(Math.random() * 50) + 10, // 10-60 connections
        queryTime: Math.random() * 50 + 10, // 10-60ms query time
        size: Math.random() * 1000 + 500 // 500-1500 MB
      }
    }

    return HttpResponse.json(metrics)
  }),

  // Advanced analytics endpoint
  http.get('/api/analytics/advanced', async ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'monthly'
    const year = Number(url.searchParams.get('year') || new Date().getFullYear())
    const department = url.searchParams.get('department') || null

    const overview = {
      totalEmployees: 500,
      revenue: 1_000_000,
      departmentSize: department ? 50 : undefined
    }

    const trends = { employeeGrowth: Math.random() }
    const predictions = { nextQuarter: { revenue: 1_200_000 } }
    const insights = ['Keep investing in training']

    return HttpResponse.json({
      overview,
      trends,
      predictions,
      insights,
      period,
      year: Number.isNaN(year) ? undefined : year,
      department: department || undefined
    })
  }),

  // Real-time metrics
  http.get('/api/metrics/realtime', async () => {
    return HttpResponse.json({
      activeUsers: Math.floor(Math.random() * 100),
      systemLoad: Math.random(),
      responseTime: Math.random() * 100,
      timestamp: new Date().toISOString()
    })
  }),

  http.get('/api/metrics/health', async () => {
    return HttpResponse.json({
      status: 'healthy',
      services: ['database', 'cache', 'queue'].map(name => ({
        name,
        status: 'ok'
      })),
      uptime: Math.floor(Math.random() * 100000)
    })
  }),

  // Advanced search endpoints
  http.post('/api/search/advanced', async ({ request }) => {
    try {
      const body = await request.json()
      return HttpResponse.json({
        results: [],
        totalCount: 0,
        facets: {},
        suggestions: []
      })
    } catch {
      return HttpResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
  }),

  http.get('/api/search/suggestions', async ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    const suggestions = ['engineer', 'engineering', 'engagement'].filter(s => s.startsWith(q))
    return HttpResponse.json(suggestions.map(text => ({ text, type: 'keyword', score: Math.random() })))
  }),

  // Workflow endpoints with caching
  http.get('/api/workflows', async ({ request }) => {
    const workflows = [
      { id: 'onboarding', name: 'Onboarding', steps: [], status: 'active' }
    ]

    const etag = 'W/"workflow-etag"'
    if (request.headers.get('if-none-match') === etag) {
      return new HttpResponse(null, { status: 304 })
    }

    return new HttpResponse(JSON.stringify(workflows), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=60',
        etag
      }
    })
  }),

  http.post('/api/workflows/:id/execute', async ({ params }) => {
    if (params.id === 'sensitive') {
      return new HttpResponse(null, { status: 401 })
    }
    return HttpResponse.json({
      executionId: 'exec-1',
      status: 'running',
      currentStep: 1,
      startedAt: new Date().toISOString()
    })
  }),

  // Integration endpoints
  http.get('/api/integrations/status', async () => {
    return HttpResponse.json({
      services: [
        { name: 'payroll', status: 'active', lastChecked: new Date().toISOString() }
      ]
    })
  }),

  http.post('/api/integrations/sync', async () => {
    return new HttpResponse(JSON.stringify({
      syncId: 'sync-1',
      status: 'started',
      estimatedDuration: 60
    }), { status: 202, headers: { 'content-type': 'application/json' } })
  })
]