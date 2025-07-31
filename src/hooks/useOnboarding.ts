import { useQuery } from '@tanstack/react-query';

const mockOnboardingService = {
  getOnboardingStats: async () => ({
    activeProcesses: 8,
    weeklyGrowth: 2,
    completionRate: 92,
    completionImprovement: 3,
    avgDuration: 5.2,
    pendingTasks: 23
  }),
  getOnboardingProcesses: async (filters: any) => ({
    data: [
      { id: '1', employeeName: 'Alex Thompson', role: 'Software Engineer', progress: 75, startDate: '2024-12-16', daysLeft: 2 },
      { id: '2', employeeName: 'Maria Rodriguez', role: 'Product Manager', progress: 45, startDate: '2024-12-18', daysLeft: 4 }
    ]
  }),
  getOnboardingTemplate: async () => ({
    tasks: [
      { task: "Send welcome email", completed: true, category: "Pre-boarding" },
      { task: "Office tour and introductions", completed: false, category: "Day 1" }
    ]
  })
};

export const useOnboardingStats = () => {
  return useQuery({
    queryKey: ['onboarding', 'stats'],
    queryFn: mockOnboardingService.getOnboardingStats
  });
};

export const useOnboardingProcesses = (filters?: any) => {
  return useQuery({
    queryKey: ['onboarding', 'processes', filters],
    queryFn: () => mockOnboardingService.getOnboardingProcesses(filters)
  });
};

export const useOnboardingTemplate = () => {
  return useQuery({
    queryKey: ['onboarding', 'template'],
    queryFn: mockOnboardingService.getOnboardingTemplate
  });
};