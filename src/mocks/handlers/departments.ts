import { http, HttpResponse } from 'msw';
import { departmentModel } from '../data/departments';

export const departmentHandlers = [
  // Get all departments
  http.get('/api/departments', () => {
    const departments = departmentModel.department.getAll();
    return HttpResponse.json({ departments });
  }),

  // Get department by ID
  http.get('/api/departments/:id', ({ params }) => {
    const department = departmentModel.department.findFirst({
      where: { id: { equals: params.id as string } }
    });

    if (!department) {
      return HttpResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return HttpResponse.json(department);
  }),

  // Create new department
  http.post('/api/departments', async ({ request }) => {
    const departmentData = await request.json() as any;
    const newDepartment = departmentModel.department.create(departmentData);
    return HttpResponse.json(newDepartment, { status: 201 });
  }),

  // Update department
  http.put('/api/departments/:id', async ({ params, request }) => {
    const updates = await request.json() as any;
    const updatedDepartment = departmentModel.department.update({
      where: { id: { equals: params.id as string } },
      data: updates
    });

    if (!updatedDepartment) {
      return HttpResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return HttpResponse.json(updatedDepartment);
  })
];