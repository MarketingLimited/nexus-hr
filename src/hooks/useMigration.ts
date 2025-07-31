import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { migrationService, type MigrationJob, type MigrationTemplate, type FieldMapping, type DataPreview } from '../services/migrationService'
import { useToast } from './use-toast'

export function useMigrationJobs(filters?: { status?: string[]; type?: string[]; createdBy?: string }) {
  return useQuery({
    queryKey: ['migration-jobs', filters],
    queryFn: () => migrationService.getMigrationJobs(filters),
  })
}

export function useMigrationJob(id: string) {
  return useQuery({
    queryKey: ['migration-job', id],
    queryFn: () => migrationService.getMigrationJob(id),
    enabled: !!id,
  })
}

export function useMigrationTemplates(filters?: { sourceType?: string; targetType?: string; isPublic?: boolean }) {
  return useQuery({
    queryKey: ['migration-templates', filters],
    queryFn: () => migrationService.getMigrationTemplates(filters),
  })
}

export function useMigrationTemplate(id: string) {
  return useQuery({
    queryKey: ['migration-template', id],
    queryFn: () => migrationService.getMigrationTemplate(id),
    enabled: !!id,
  })
}

export function useMigrationAnalytics(period?: string) {
  return useQuery({
    queryKey: ['migration-analytics', period],
    queryFn: () => migrationService.getMigrationAnalytics(period),
  })
}

export function useValidationResults(jobId: string) {
  return useQuery({
    queryKey: ['validation-results', jobId],
    queryFn: () => migrationService.getValidationResults(jobId),
    enabled: !!jobId,
  })
}

export function useLegacyConnectors() {
  return useQuery({
    queryKey: ['legacy-connectors'],
    queryFn: () => migrationService.getLegacyConnectors(),
  })
}

export function useLegacyConnector(id: string) {
  return useQuery({
    queryKey: ['legacy-connector', id],
    queryFn: () => migrationService.getLegacyConnector(id),
    enabled: !!id,
  })
}

export function useSupportedFormats() {
  return useQuery({
    queryKey: ['supported-formats'],
    queryFn: () => migrationService.getSupportedFormats(),
  })
}

export function usePreviewData() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ file, options }: { file: File | string; options?: { sampleSize?: number; delimiter?: string; hasHeader?: boolean } }) =>
      migrationService.previewData(file, options),
    onError: () => {
      toast({ title: 'Failed to preview data', variant: 'destructive' })
    },
  })
}

export function useDetectSchema() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: any[]) => migrationService.detectSchema(data),
    onError: () => {
      toast({ title: 'Failed to detect schema', variant: 'destructive' })
    },
  })
}

export function useCreateMigrationJob() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: Omit<MigrationJob, 'id' | 'createdAt' | 'updatedAt'>) =>
      migrationService.createMigrationJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] })
      toast({ title: 'Migration job created successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to create migration job', variant: 'destructive' })
    },
  })
}

export function useUpdateMigrationJob() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MigrationJob> }) =>
      migrationService.updateMigrationJob(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['migration-job', id] })
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] })
      toast({ title: 'Migration job updated successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to update migration job', variant: 'destructive' })
    },
  })
}

export function useStartMigrationJob() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => migrationService.startMigrationJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['migration-job', id] })
      toast({ title: 'Migration job started successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to start migration job', variant: 'destructive' })
    },
  })
}

export function usePauseMigrationJob() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => migrationService.pauseMigrationJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['migration-job', id] })
      toast({ title: 'Migration job paused successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to pause migration job', variant: 'destructive' })
    },
  })
}

export function useResumeMigrationJob() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => migrationService.resumeMigrationJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['migration-job', id] })
      toast({ title: 'Migration job resumed successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to resume migration job', variant: 'destructive' })
    },
  })
}

export function useCancelMigrationJob() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => migrationService.cancelMigrationJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['migration-job', id] })
      toast({ title: 'Migration job cancelled successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to cancel migration job', variant: 'destructive' })
    },
  })
}

export function useDeleteMigrationJob() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => migrationService.deleteMigrationJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] })
      toast({ title: 'Migration job deleted successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to delete migration job', variant: 'destructive' })
    },
  })
}

export function useValidateData() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (jobId: string) => migrationService.validateData(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['validation-results', jobId] })
      toast({ title: 'Data validation completed' })
    },
    onError: () => {
      toast({ title: 'Data validation failed', variant: 'destructive' })
    },
  })
}

export function useGenerateMapping() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ source, targetSchema }: { source: DataPreview['detectedSchema']; targetSchema: string }) =>
      migrationService.generateMapping(source, targetSchema),
    onError: () => {
      toast({ title: 'Failed to generate mapping', variant: 'destructive' })
    },
  })
}

export function useValidateMapping() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ mapping, sourceSchema, targetSchema }: { mapping: FieldMapping[]; sourceSchema: any; targetSchema: any }) =>
      Promise.resolve({ isValid: true, errors: [] }), // Placeholder implementation
    onError: () => {
      toast({ title: 'Failed to validate mapping', variant: 'destructive' })
    },
  })
}

export function useValidateFile() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: (file: File) => migrationService.validateFile(file),
    onError: () => {
      toast({ title: 'File validation failed', variant: 'destructive' })
    },
  })
}

export function useExportData() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ format, entities, filters, options }: { 
      format: string
      entities: string[]
      filters?: Record<string, any>
      options?: Record<string, any>
    }) => Promise.resolve({ exportId: 'temp-id' }), // Placeholder implementation
    onSuccess: () => {
      toast({ title: 'Data export started successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to start data export', variant: 'destructive' })
    },
  })
}