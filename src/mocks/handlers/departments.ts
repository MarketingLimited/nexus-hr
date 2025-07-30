import { http, HttpResponse } from 'msw'
import { mockDepartments, generateDepartments, Department } from '../data/departments'

let departments = [...mockDepartments]

export const departmentHandlers = [
  // Get all departments
  http.get('/api/departments', ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const location = url.searchParams.get('location')

    let filteredDepartments = departments

    if (search) {
      filteredDepartments = filteredDepartments.filter(dept => 
        dept.name.toLowerCase().includes(search.toLowerCase()) ||
        dept.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (location) {
      filteredDepartments = filteredDepartments.filter(dept => dept.location === location)
    }

    return HttpResponse.json({ data: filteredDepartments })
  }),

  // Get department by ID
  http.get('/api/departments/:id', ({ params }) => {
    const department = departments.find(dept => dept.id === params.id)
    if (!department) {
      return HttpResponse.json({ error: 'Department not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: department })
  }),

  // Create new department
  http.post('/api/departments', async ({ request }) => {
    const newDepartmentData = await request.json() as Partial<Department>
    const newDepartment: Department = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newDepartmentData
    } as Department

    departments.push(newDepartment)
    return HttpResponse.json({ data: newDepartment }, { status: 201 })
  }),

  // Update department
  http.put('/api/departments/:id', async ({ params, request }) => {
    const departmentIndex = departments.findIndex(dept => dept.id === params.id)
    if (departmentIndex === -1) {
      return HttpResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    const updates = await request.json() as Partial<Department>
    departments[departmentIndex] = {
      ...departments[departmentIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: departments[departmentIndex] })
  }),

  // Delete department
  http.delete('/api/departments/:id', ({ params }) => {
    const departmentIndex = departments.findIndex(dept => dept.id === params.id)
    if (departmentIndex === -1) {
      return HttpResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    departments.splice(departmentIndex, 1)
    return HttpResponse.json({ message: 'Department deleted successfully' })
  }),

  // Get department hierarchy
  http.get('/api/departments/hierarchy', () => {
    const hierarchy = departments.filter(dept => !dept.parentDepartment)
      .map(parent => ({
        department: parent,
        children: departments.filter(dept => dept.parentDepartment === parent.id)
          .map(child => ({ department: child, children: [] }))
      }))

    return HttpResponse.json({ data: hierarchy })
  })
]