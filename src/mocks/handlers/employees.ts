import { http, HttpResponse } from 'msw'
import { mockEmployees, generateEmployees, Employee } from '../data/employees'

let employees = [...mockEmployees]

export const employeeHandlers = [
  // Get all employees
  http.get('/api/employees', ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const department = url.searchParams.get('department')
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filteredEmployees = employees

    if (search) {
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (department) {
      filteredEmployees = filteredEmployees.filter(emp => emp.department === department)
    }

    if (status) {
      filteredEmployees = filteredEmployees.filter(emp => emp.status === status)
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex)

    return HttpResponse.json({
      data: paginatedEmployees,
      meta: {
        total: filteredEmployees.length,
        page,
        limit,
        totalPages: Math.ceil(filteredEmployees.length / limit)
      }
    })
  }),

  // Get employee by ID
  http.get('/api/employees/:id', ({ params }) => {
    const employee = employees.find(emp => emp.id === params.id)
    if (!employee) {
      return HttpResponse.json({ error: 'Employee not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: employee })
  }),

  // Create new employee
  http.post('/api/employees', async ({ request }) => {
    const newEmployeeData = await request.json() as Partial<Employee>
    const newEmployee: Employee = {
      id: crypto.randomUUID(),
      employeeId: `EMP${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newEmployeeData
    } as Employee

    employees.push(newEmployee)
    return HttpResponse.json({ data: newEmployee }, { status: 201 })
  }),

  // Update employee
  http.put('/api/employees/:id', async ({ params, request }) => {
    const employeeIndex = employees.findIndex(emp => emp.id === params.id)
    if (employeeIndex === -1) {
      return HttpResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    const updates = await request.json() as Partial<Employee>
    employees[employeeIndex] = {
      ...employees[employeeIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: employees[employeeIndex] })
  }),

  // Delete employee
  http.delete('/api/employees/:id', ({ params }) => {
    const employeeIndex = employees.findIndex(emp => emp.id === params.id)
    if (employeeIndex === -1) {
      return HttpResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    employees.splice(employeeIndex, 1)
    return HttpResponse.json({ message: 'Employee deleted successfully' })
  }),

  // Get employee statistics
  http.get('/api/employees/stats', () => {
    const stats = {
      total: employees.length,
      active: employees.filter(emp => emp.status === 'active').length,
      inactive: employees.filter(emp => emp.status === 'inactive').length,
      terminated: employees.filter(emp => emp.status === 'terminated').length,
      byDepartment: employees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byLocation: employees.reduce((acc, emp) => {
        acc[emp.location] = (acc[emp.location] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return HttpResponse.json({ data: stats })
  })
]