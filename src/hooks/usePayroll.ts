import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollService } from '../services/dataService';
import { toast } from 'sonner';
import type { Payslip, SalaryStructure, PayrollRun } from '../mocks/data/payroll';

interface PayrollFilters {
  startDate?: string
  endDate?: string
  status?: string
  employeeId?: string
  department?: string
}

// Query keys
export const payrollKeys = {
  all: ['payroll'] as const,
  salaryStructures: (params?: Record<string, string>) => [...payrollKeys.all, 'salary-structures', params] as const,
  salaryStructure: (id: string) => [...payrollKeys.all, 'salary-structure', id] as const,
  payslips: (params?: Record<string, string>) => [...payrollKeys.all, 'payslips', params] as const,
  payslip: (id: string) => [...payrollKeys.all, 'payslip', id] as const,
  runs: (params?: Record<string, string>) => [...payrollKeys.all, 'runs', params] as const,
  run: (id: string) => [...payrollKeys.all, 'run', id] as const,
  stats: (params?: Record<string, string>) => [...payrollKeys.all, 'stats', params] as const,
};

// Get salary structures
export const useSalaryStructures = (params?: { employeeId?: string }) => {
  return useQuery({
    queryKey: payrollKeys.salaryStructures(params),
    queryFn: () => payrollService.getSalaryStructures(params),
    select: (data) => data.data,
  });
};

// Get single salary structure
export const useSalaryStructure = (id: string) => {
  return useQuery({
    queryKey: payrollKeys.salaryStructure(id),
    queryFn: () => payrollService.getSalaryStructureById(id),
    enabled: !!id,
    select: (data) => data.data,
  });
};

// Get payslips
export const usePayslips = (params?: PayrollFilters) => {
  return useQuery({
    queryKey: payrollKeys.payslips(params),
    queryFn: () => payrollService.getPayslips(params),
    select: (data) => data.data,
  });
};

// Get single payslip
export const usePayslip = (id: string) => {
  return useQuery({
    queryKey: payrollKeys.payslip(id),
    queryFn: () => payrollService.getPayslipById(id),
    enabled: !!id,
    select: (data) => data.data,
  });
};

// Get payroll runs
export const usePayrollRuns = (params?: { month?: string; year?: string; status?: string }) => {
  return useQuery({
    queryKey: payrollKeys.runs(params),
    queryFn: () => payrollService.getPayrollRuns(params),
    select: (data) => data.data,
  });
};

// Get single payroll run
export const usePayrollRun = (id: string) => {
  return useQuery({
    queryKey: payrollKeys.run(id),
    queryFn: () => payrollService.getPayrollRunById(id),
    enabled: !!id,
    select: (data) => data.data,
  });
};

// Get payroll statistics
export const usePayrollStats = (params?: { month?: string; year?: string }) => {
  return useQuery({
    queryKey: payrollKeys.stats(params),
    queryFn: () => payrollService.getStats(params),
    select: (data) => data.data,
  });
};

// Alias for compatibility
export const usePayrollStatus = usePayrollRuns;
export const usePayrollHistory = usePayrollRuns;

// Create salary structure
export const useCreateSalaryStructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<SalaryStructure>) => payrollService.createSalaryStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      toast.success('Salary structure created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create salary structure');
    },
  });
};

// Update salary structure
export const useUpdateSalaryStructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SalaryStructure> }) =>
      payrollService.updateSalaryStructure(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      queryClient.invalidateQueries({ queryKey: payrollKeys.salaryStructure(variables.id) });
      toast.success('Salary structure updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update salary structure');
    },
  });
};

// Generate payslips
export const useGeneratePayslips = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { month: string; year: string; employeeIds?: string[] }) =>
      payrollService.generatePayslips(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      toast.success('Payslips generated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate payslips');
    },
  });
};

// Create payroll run
export const useCreatePayrollRun = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PayrollRun>) => payrollService.createPayrollRun(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      toast.success('Payroll run created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create payroll run');
    },
  });
};

// Process payroll run
export const useProcessPayrollRun = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollService.processPayrollRun(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      queryClient.invalidateQueries({ queryKey: payrollKeys.run(id) });
      toast.success('Payroll run processed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process payroll run');
    },
  });
};