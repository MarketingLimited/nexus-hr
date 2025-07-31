import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workflowService, type Workflow, type WorkflowStep, type WorkflowTemplate, type WorkflowFilters } from '../services/workflowService'
import { useToast } from './use-toast'

export function useWorkflows(filters?: WorkflowFilters) {
  return useQuery({
    queryKey: ['workflows', filters],
    queryFn: () => workflowService.getWorkflows(filters),
  })
}

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: ['workflow', id],
    queryFn: () => workflowService.getWorkflow(id),
    enabled: !!id,
  })
}

export function useWorkflowTemplates() {
  return useQuery({
    queryKey: ['workflow-templates'],
    queryFn: () => workflowService.getWorkflowTemplates(),
  })
}

export function useWorkflowTemplate(id: string) {
  return useQuery({
    queryKey: ['workflow-template', id],
    queryFn: () => workflowService.getWorkflowTemplate(id),
    enabled: !!id,
  })
}

export function useWorkflowAnalytics(options?: { dateRange?: { start: string; end: string }; type?: string[] }) {
  return useQuery({
    queryKey: ['workflow-analytics', options],
    queryFn: () => workflowService.getWorkflowAnalytics(options),
  })
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) =>
      workflowService.createWorkflow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      toast({ title: 'Workflow created successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to create workflow', variant: 'destructive' })
    },
  })
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Workflow> }) =>
      workflowService.updateWorkflow(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', id] })
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      toast({ title: 'Workflow updated successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to update workflow', variant: 'destructive' })
    },
  })
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => workflowService.deleteWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      toast({ title: 'Workflow deleted successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to delete workflow', variant: 'destructive' })
    },
  })
}

export function useStartWorkflow() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ workflowId, targetId, assigneeId }: { workflowId: string; targetId: string; assigneeId?: string }) =>
      workflowService.startWorkflow(workflowId, targetId, assigneeId),
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] })
      toast({ title: 'Workflow started successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to start workflow', variant: 'destructive' })
    },
  })
}

export function useCompleteWorkflowStep() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ stepId, notes, attachments }: { stepId: string; notes?: string; attachments?: string[] }) =>
      workflowService.completeStep(stepId, notes, attachments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      toast({ title: 'Step completed successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to complete step', variant: 'destructive' })
    },
  })
}

export function useSkipWorkflowStep() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ workflowId, stepId, reason }: { workflowId: string; stepId: string; reason: string }) =>
      workflowService.skipStep(workflowId, stepId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      toast({ title: 'Step skipped successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to skip step', variant: 'destructive' })
    },
  })
}

export function usePauseWorkflow() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ workflowId, reason }: { workflowId: string; reason?: string }) =>
      workflowService.pauseWorkflow(workflowId, reason),
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] })
      toast({ title: 'Workflow paused successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to pause workflow', variant: 'destructive' })
    },
  })
}

export function useResumeWorkflow() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (workflowId: string) => workflowService.resumeWorkflow(workflowId),
    onSuccess: (_, workflowId) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] })
      toast({ title: 'Workflow resumed successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to resume workflow', variant: 'destructive' })
    },
  })
}

export function useCancelWorkflow() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ workflowId, reason }: { workflowId: string; reason?: string }) =>
      workflowService.cancelWorkflow(workflowId, reason),
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] })
      toast({ title: 'Workflow cancelled successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to cancel workflow', variant: 'destructive' })
    },
  })
}