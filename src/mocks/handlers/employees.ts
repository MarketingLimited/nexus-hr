import { http, HttpResponse } from 'msw';
import { employeeModel } from '../data/employees';

export const employeeHandlers = [
  // Get all employees with pagination and filtering
  http.get('/api/employees', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const department = url.searchParams.get('department') || '';
    const status = url.searchParams.get('status') || '';

    let employees = employeeModel.employee.getAll();

    // Apply filters
    if (search) {
      employees = employees.filter(emp => 
        emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (department) {
      employees = employees.filter(emp => emp.department === department);
    }

    if (status) {
      employees = employees.filter(emp => emp.status === status);
    }

    // Pagination
    const total = employees.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEmployees = employees.slice(startIndex, endIndex);

    return HttpResponse.json({
      employees: paginatedEmployees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }),

  // Get employee by ID
  http.get('/api/employees/:id', ({ params }) => {
    const employee = employeeModel.employee.findFirst({
      where: { id: { equals: params.id as string } }
    });

    if (!employee) {
      return HttpResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return HttpResponse.json(employee);
  }),

  // Create new employee
  http.post('/api/employees', async ({ request }) => {
    const employeeData = await request.json() as any;
    const newEmployee = employeeModel.employee.create(employeeData);
    return HttpResponse.json(newEmployee, { status: 201 });
  }),

  // Update employee
  http.put('/api/employees/:id', async ({ params, request }) => {
    const updates = await request.json() as any;
    const updatedEmployee = employeeModel.employee.update({
      where: { id: { equals: params.id as string } },
      data: updates
    });

    if (!updatedEmployee) {
      return HttpResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return HttpResponse.json(updatedEmployee);
  }),

  // Delete employee
  http.delete('/api/employees/:id', ({ params }) => {
    const deletedEmployee = employeeModel.employee.delete({
      where: { id: { equals: params.id as string } }
    });

    if (!deletedEmployee) {
      return HttpResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return HttpResponse.json({ message: 'Employee deleted successfully' });
  }),

  // Search employees
  http.get('/api/employees/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    
    const employees = employeeModel.employee.getAll().filter(emp =>
      emp.firstName.toLowerCase().includes(query.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(query.toLowerCase()) ||
      emp.email.toLowerCase().includes(query.toLowerCase()) ||
      emp.position.toLowerCase().includes(query.toLowerCase())
    );

    return HttpResponse.json(employees);
  })
];