import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Mock service - replace with actual service when available
const leaveService = {
  getLeaveStats: async () => ({
    pendingRequests: 18,
    approvedToday: 5,
    onLeaveToday: 23,
    onLeavePercentage: 9.3,
    avgResponseTime: 1.2
  }),
  
  getLeaveRequests: async (filters: any) => ({
    data: [
      {
        id: '1',
        employeeName: 'Sarah Johnson',
        leaveType: 'Annual Leave',
        startDate: '2024-12-20',
        endDate: '2024-12-25',
        status: 'pending'
      },
      {
        id: '2',
        employeeName: 'Mike Chen',
        leaveType: 'Sick Leave',
        startDate: '2024-12-18',
        endDate: '2024-12-18',
        status: 'approved'
      },
      {
        id: '3',
        employeeName: 'Emma Davis',
        leaveType: 'Personal Leave',
        startDate: '2025-01-02',
        endDate: '2025-01-03',
        status: 'pending'
      },
      {
        id: '4',
        employeeName: 'John Smith',
        leaveType: 'Annual Leave',
        startDate: '2024-12-23',
        endDate: '2024-12-30',
        status: 'rejected'
      }
    ]
  }),
  
  updateLeaveRequest: async ({ id, status }: { id: string; status: string }) => ({
    id,
    status
  })
};

export const useLeaveStats = () => {
  return useQuery({
    queryKey: ['leave', 'stats'],
    queryFn: leaveService.getLeaveStats
  });
};

export const useLeaveRequests = (filters?: any) => {
  return useQuery({
    queryKey: ['leave', 'requests', filters],
    queryFn: () => leaveService.getLeaveRequests(filters)
  });
};

export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: leaveService.updateLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
    }
  });
};