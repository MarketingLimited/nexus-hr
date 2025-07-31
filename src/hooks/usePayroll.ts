import { useQuery } from '@tanstack/react-query';

// Mock service - replace with actual service when available
const payrollService = {
  getPayrollStats: async () => ({
    monthlyTotal: 284520,
    monthlyGrowth: 2.1,
    avgSalary: 4850,
    daysToNext: 5,
    taxDeductions: 68285
  }),
  
  getPayrollStatus: async () => ({
    currentPeriod: 'December 2024 Payroll',
    processingPeriod: 'Dec 1-31, 2024',
    status: 'in-progress',
    steps: [
      { name: 'Salary calculations', status: 'completed' },
      { name: 'Tax calculations', status: 'completed' },
      { name: 'Overtime processing', status: 'in-progress' },
      { name: 'Final approval', status: 'pending' }
    ]
  }),
  
  getPayrollHistory: async (filters: any) => ({
    data: [
      {
        id: '1',
        period: 'November 2024',
        totalAmount: 278420,
        status: 'Completed',
        processedDate: '2024-11-30'
      },
      {
        id: '2',
        period: 'October 2024',
        totalAmount: 275680,
        status: 'Completed',
        processedDate: '2024-10-31'
      },
      {
        id: '3',
        period: 'September 2024',
        totalAmount: 272150,
        status: 'Completed',
        processedDate: '2024-09-30'
      }
    ]
  })
};

export const usePayrollStats = () => {
  return useQuery({
    queryKey: ['payroll', 'stats'],
    queryFn: payrollService.getPayrollStats
  });
};

export const usePayrollStatus = () => {
  return useQuery({
    queryKey: ['payroll', 'status'],
    queryFn: payrollService.getPayrollStatus
  });
};

export const usePayrollHistory = (filters?: any) => {
  return useQuery({
    queryKey: ['payroll', 'history', filters],
    queryFn: () => payrollService.getPayrollHistory(filters)
  });
};