import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveService } from '../services/dataService';
import { toast } from 'sonner';
import type { LeaveRequest } from '../mocks/data/leave';

// Query keys
export const leaveKeys = {
  all: ['leave'] as const,
  stats: (params?: Record<string, string>) => [...leaveKeys.all, 'stats', params] as const,
  requests: (params?: Record<string, string>) => [...leaveKeys.all, 'requests', params] as const,
  request: (id: string) => [...leaveKeys.all, 'request', id] as const,
  types: () => [...leaveKeys.all, 'types'] as const,
  balances: (params?: Record<string, string>) => [...leaveKeys.all, 'balances', params] as const,
};

// Get leave statistics
export const useLeaveStats = (params?: { year?: string }) => {
  return useQuery({
    queryKey: leaveKeys.stats(params),
    queryFn: () => leaveService.getStats(params),
    select: (data) => data.data,
  });
};

// Get leave requests with filters
export const useLeaveRequests = (params?: {
  employeeId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: leaveKeys.requests(params),
    queryFn: () => leaveService.getRequests(params),
    select: (data) => data.data,
  });
};

// Get single leave request
export const useLeaveRequest = (id: string) => {
  return useQuery({
    queryKey: leaveKeys.request(id),
    queryFn: () => leaveService.getRequestById(id),
    enabled: !!id,
    select: (data) => data.data,
  });
};

// Get leave types
export const useLeaveTypes = () => {
  return useQuery({
    queryKey: leaveKeys.types(),
    queryFn: () => leaveService.getTypes(),
    select: (data) => data.data,
  });
};

// Get leave balances
export const useLeaveBalances = (params?: { employeeId?: string; year?: string }) => {
  return useQuery({
    queryKey: leaveKeys.balances(params),
    queryFn: () => leaveService.getBalances(params),
    select: (data) => data.data,
  });
};

// Create leave request
export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<LeaveRequest>) => leaveService.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      toast.success('Leave request created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create leave request');
    },
  });
};

// Update leave request
export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeaveRequest> }) =>
      leaveService.updateRequest(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      queryClient.invalidateQueries({ queryKey: leaveKeys.request(variables.id) });
      toast.success('Leave request updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update leave request');
    },
  });
};

// Approve leave request
export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, approvedBy, comments }: { id: string; approvedBy: string; comments?: string }) =>
      leaveService.approveRequest(id, { approvedBy, comments }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      queryClient.invalidateQueries({ queryKey: leaveKeys.request(variables.id) });
      toast.success('Leave request approved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve leave request');
    },
  });
};

// Reject leave request
export const useRejectLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejectedBy, comments }: { id: string; rejectedBy: string; comments: string }) =>
      leaveService.rejectRequest(id, { rejectedBy, comments }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
      queryClient.invalidateQueries({ queryKey: leaveKeys.request(variables.id) });
      toast.success('Leave request rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject leave request');
    },
  });
};