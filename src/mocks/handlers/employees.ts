import { http } from 'msw'
import { Employee } from '../data/employees'
import { mswDataPersistence } from '../../services/mswDataPersistence'
import { mswDataRelationships } from '../../services/mswDataRelationships'
import { 
  createSuccessResponse, 
  createPaginatedResponse, 
  commonErrors,
  parseQueryParams,
  getPaginationParams,
  applyPagination,
  applyFilters,
  applySorting,
  fullTextSearch,
  validateRequiredFields,
  validateFieldFormats,
  networkDelay
} from '../../utils/mswHelpers'

export const employeeHandlers = [
  // Get all employees
  http.get('/api/employees', async ({ request }) => {
    await networkDelay()
    
    const url = new URL(request.url)
    const { page, limit } = getPaginationParams(url)
    const params = parseQueryParams(url)
    
    let employees = mswDataPersistence.getData('employees')
    
    // Apply full-text search
    if (params.search) {
      employees = fullTextSearch(employees, params.search, [
        'firstName', 'lastName', 'email', 'employeeId', 'position'
      ])
    }
    
    // Apply filters
    const filters = {
      department: params.department,
      status: params.status,
      location: params.location,
      manager: params.manager
    }
    employees = applyFilters(employees, filters)
    
    // Apply sorting
    employees = applySorting(employees, params.sortBy, params.sortOrder || 'asc')
    
    // Apply pagination
    const total = employees.length
    const paginatedEmployees = applyPagination(employees, page, limit)
    
    return createPaginatedResponse(paginatedEmployees, page, limit, total)
  }),

  // Get employee by ID
  http.get('/api/employees/:id', async ({ params }) => {
    await networkDelay()
    
    const employee = mswDataPersistence.getItemById('employees', params.id as string)
    if (!employee) {
      return commonErrors.notFound('Employee', params.id as string)
    }
    
    // Add computed fields
    const computed = mswDataRelationships.getComputedFields('employees', params.id as string)
    const enrichedEmployee = { ...employee, ...computed }
    
    return createSuccessResponse(enrichedEmployee)
  }),

  // Create new employee
  http.post('/api/employees', async ({ request }) => {
    await networkDelay()
    
    const employeeData = await request.json() as Partial<Employee>
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'department', 'position']
    const validation = validateRequiredFields(employeeData, requiredFields)
    
    if (!validation.valid) {
      return commonErrors.validationError(validation.errors)
    }
    
    // Validate field formats
    const formatValidation = validateFieldFormats(employeeData, {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^\+?[\d\s\-\(\)]+$/
    })
    
    if (!formatValidation.valid) {
      return commonErrors.validationError(formatValidation.errors)
    }
    
    // Validate references
    const refValidation = mswDataRelationships.validateReferences('employees', employeeData)
    if (!refValidation.valid) {
      return commonErrors.validationError(refValidation.errors)
    }
    
    // Generate employee ID
    const existingEmployees = mswDataPersistence.getData('employees')
    const maxEmpNumber = existingEmployees.reduce((max, emp: any) => {
      const match = emp.employeeId?.match(/EMP(\d+)/)
      return match ? Math.max(max, parseInt(match[1], 10)) : max
    }, 0)
    
    const newEmployee = {
      ...employeeData,
      employeeId: `EMP${(maxEmpNumber + 1).toString().padStart(4, '0')}`,
      status: employeeData.status || 'active'
    }
    
    const createdEmployee = mswDataPersistence.addItem('employees', newEmployee)
    return createSuccessResponse(createdEmployee)
  }),

  // Update employee
  http.put('/api/employees/:id', async ({ params, request }) => {
    await networkDelay()
    
    const updates = await request.json() as Partial<Employee>
    
    // Validate references if any relationship fields are being updated
    if (updates.department || updates.manager) {
      const refValidation = mswDataRelationships.validateReferences('employees', updates)
      if (!refValidation.valid) {
        return commonErrors.validationError(refValidation.errors)
      }
    }
    
    const updatedEmployee = mswDataPersistence.updateItem('employees', params.id as string, updates)
    if (!updatedEmployee) {
      return commonErrors.notFound('Employee', params.id as string)
    }
    
    return createSuccessResponse(updatedEmployee)
  }),

  // Delete employee
  http.delete('/api/employees/:id', async ({ params }) => {
    await networkDelay()
    
    const deleteResult = mswDataRelationships.executeDelete('employees', params.id as string)
    
    if (!deleteResult.success) {
      return commonErrors.conflict(deleteResult.error!)
    }
    
    return createSuccessResponse({
      message: 'Employee deleted successfully',
      deletedCount: deleteResult.deletedCount,
      affectedEntities: deleteResult.affectedEntities
    })
  }),

  // Get employee statistics
  http.get('/api/employees/stats', async ({ request }) => {
    await networkDelay()
    
    const url = new URL(request.url)
    const params = parseQueryParams(url)
    
    let employees = mswDataPersistence.getData('employees')
    
    // Apply filters if provided
    if (params.department) {
      employees = employees.filter((emp: any) => emp.department === params.department)
    }
    if (params.location) {
      employees = employees.filter((emp: any) => emp.location === params.location)
    }
    
    const stats = {
      total: employees.length,
      active: employees.filter((emp: any) => emp.status === 'active').length,
      inactive: employees.filter((emp: any) => emp.status === 'inactive').length,
      terminated: employees.filter((emp: any) => emp.status === 'terminated').length,
      pending: employees.filter((emp: any) => emp.status === 'pending').length,
      byDepartment: employees.reduce((acc: Record<string, number>, emp: any) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1
        return acc
      }, {}),
      byLocation: employees.reduce((acc: Record<string, number>, emp: any) => {
        acc[emp.location] = (acc[emp.location] || 0) + 1
        return acc
      }, {}),
      byPosition: employees.reduce((acc: Record<string, number>, emp: any) => {
        acc[emp.position] = (acc[emp.position] || 0) + 1
        return acc
      }, {}),
      averageSalary: employees.reduce((sum: number, emp: any) => sum + (emp.salary || 0), 0) / employees.length || 0,
      salaryRange: {
        min: Math.min(...employees.map((emp: any) => emp.salary || 0)),
        max: Math.max(...employees.map((emp: any) => emp.salary || 0))
      }
    }

    return createSuccessResponse(stats)
  }),

  // Bulk operations
  http.post('/api/employees/bulk-delete', async ({ request }) => {
    await networkDelay()
    
    const { ids } = await request.json() as { ids: string[] }
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return commonErrors.badRequest('ids array is required')
    }
    
    const deletedCount = mswDataPersistence.bulkDelete('employees', ids)
    
    return createSuccessResponse({
      message: `${deletedCount} employees deleted successfully`,
      deletedCount
    })
  }),

  http.post('/api/employees/bulk-update', async ({ request }) => {
    await networkDelay()
    
    const { updates } = await request.json() as { updates: Array<{ id: string; data: Partial<Employee> }> }
    
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return commonErrors.badRequest('updates array is required')
    }
    
    const updatedEmployees = mswDataPersistence.bulkUpdate('employees', updates)
    
    return createSuccessResponse({
      message: `${updatedEmployees.length} employees updated successfully`,
      updatedCount: updatedEmployees.length,
      updatedEmployees
    })
  })
]