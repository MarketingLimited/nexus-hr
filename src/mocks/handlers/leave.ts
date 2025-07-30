import { http, HttpResponse } from 'msw';
import { leaveModel } from '../data/leave';

export const leaveHandlers = [
  // Get leave requests
  http.get('/api/leave/requests', ({ request }) => {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');
    
    let requests = leaveModel.leaveRequest.getAll();
    
    if (employeeId) {
      requests = requests.filter(req => req.employeeId === employeeId);
    }

    return HttpResponse.json({ leaveRequests: requests });
  }),

  // Submit leave request
  http.post('/api/leave/requests', async ({ request }) => {
    const requestData = await request.json() as any;
    const newRequest = leaveModel.leaveRequest.create({
      ...requestData,
      status: 'Pending',
      appliedDate: new Date().toISOString()
    });
    return HttpResponse.json(newRequest, { status: 201 });
  }),

  // Update leave request (approve/reject)
  http.put('/api/leave/requests/:id', async ({ params, request }) => {
    const updates = await request.json() as any;
    const updatedRequest = leaveModel.leaveRequest.update({
      where: { id: { equals: params.id as string } },
      data: updates
    });

    if (!updatedRequest) {
      return HttpResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    return HttpResponse.json(updatedRequest);
  }),

  // Get leave balances
  http.get('/api/leave/balances', ({ request }) => {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');
    
    let balances = leaveModel.leaveBalance.getAll();
    
    if (employeeId) {
      balances = balances.filter(balance => balance.employeeId === employeeId);
    }

    return HttpResponse.json({ leaveBalances: balances });
  })
];