import { http, HttpResponse } from 'msw';
import { payrollModel } from '../data/payroll';

export const payrollHandlers = [
  // Get payslips
  http.get('/api/payroll/payslips', ({ request }) => {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');
    
    let payslips = payrollModel.payslip.getAll();
    
    if (employeeId) {
      payslips = payslips.filter(slip => slip.employeeId === employeeId);
    }

    return HttpResponse.json({ payslips });
  }),

  // Process payroll
  http.post('/api/payroll/process', async ({ request }) => {
    const processData = await request.json() as any;
    // Simulate payroll processing
    return HttpResponse.json({ 
      message: 'Payroll processed successfully',
      processedCount: processData.employeeIds?.length || 0,
      status: 'Completed'
    });
  }),

  // Get salary structures
  http.get('/api/payroll/structures', () => {
    const structures = payrollModel.salaryStructure.getAll();
    return HttpResponse.json({ salaryStructures: structures });
  }),

  // Create salary structure
  http.post('/api/payroll/structures', async ({ request }) => {
    const structureData = await request.json() as any;
    const newStructure = payrollModel.salaryStructure.create(structureData);
    return HttpResponse.json(newStructure, { status: 201 });
  })
];