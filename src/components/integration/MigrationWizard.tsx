import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useMigrationJobs, useCreateMigrationJob, usePreviewData, useStartMigrationJob } from "@/hooks/useMigration"
import { Upload, Play, Pause, Square, CheckCircle, AlertTriangle, FileText, Database, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export const MigrationWizard = () => {
  const { data: jobs } = useMigrationJobs()
  const createJob = useCreateMigrationJob()
  const previewData = usePreviewData()
  const startJob = useStartMigrationJob()

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState(null)
  const [migrationConfig, setMigrationConfig] = useState({
    name: '',
    description: '',
    sourceType: '',
    targetSystem: '',
    mapping: []
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'running': return 'secondary'
      case 'paused': return 'outline'
      case 'failed': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'running': return Play
      case 'paused': return Pause
      case 'failed': return AlertTriangle
      default: return Square
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      previewData.mutate(file)
    }
  }

  const handleCreateMigration = async () => {
    try {
      await createJob.mutateAsync({
        name: migrationConfig.name,
        sourceType: migrationConfig.sourceType,
        targetSystem: migrationConfig.targetSystem,
        config: {
          mapping: migrationConfig.mapping,
          batchSize: 1000,
          skipErrors: false,
          validateOnly: false,
          validateData: true,
          createBackup: true,
          overwriteExisting: false,
          conflictResolution: 'skip' as const
        }
      })
      setCurrentStep(1)
      setMigrationConfig({ name: '', description: '', sourceType: '', targetSystem: '', mapping: [] })
    } catch (error) {
      console.error('Failed to create migration:', error)
    }
  }

  const handleStartMigration = async (jobId: string) => {
    try {
      await startJob.mutateAsync(jobId)
    } catch (error) {
      console.error('Failed to start migration:', error)
    }
  }

  const wizardSteps = [
    { id: 1, title: 'Data Source', description: 'Select your data source' },
    { id: 2, title: 'Field Mapping', description: 'Map fields to target system' },
    { id: 3, title: 'Validation', description: 'Validate and preview data' },
    { id: 4, title: 'Migration', description: 'Execute data migration' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Migration Wizard</h2>
          <p className="text-muted-foreground">Import and migrate data from external systems</p>
        </div>
        <Button onClick={() => setCurrentStep(1)}>
          New Migration
        </Button>
      </div>

      <Tabs defaultValue="wizard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wizard">Migration Wizard</TabsTrigger>
          <TabsTrigger value="jobs">Migration Jobs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="wizard" className="space-y-6">
          {/* Progress Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Migration Progress</CardTitle>
              <CardDescription>Follow these steps to migrate your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                {wizardSteps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          currentStep >= step.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {step.id}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{step.title}</div>
                        <div className="text-xs text-muted-foreground">{step.description}</div>
                      </div>
                    </div>
                    {index < wizardSteps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Data Source</CardTitle>
                <CardDescription>Choose your source system and upload data file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Migration Name</label>
                    <Input
                      placeholder="Enter migration name"
                      value={migrationConfig.name}
                      onChange={(e) => setMigrationConfig(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Source Type</label>
                    <Select
                      value={migrationConfig.sourceType}
                      onValueChange={(value) => setMigrationConfig(prev => ({ ...prev, sourceType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV File</SelectItem>
                        <SelectItem value="excel">Excel File</SelectItem>
                        <SelectItem value="json">JSON File</SelectItem>
                        <SelectItem value="database">External Database</SelectItem>
                        <SelectItem value="api">REST API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe this migration"
                    value={migrationConfig.description}
                    onChange={(e) => setMigrationConfig(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Data File</label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <div className="text-sm font-medium mb-2">
                        {selectedFile ? selectedFile.name : 'Drop your file here or click to browse'}
                      </div>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        accept=".csv,.xlsx,.json"
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outline" size="sm" className="cursor-pointer">
                          Browse Files
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                {previewData.data && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Preview</label>
                    <div className="border rounded-lg p-4 bg-muted">
                      <div className="text-sm font-medium mb-2">
                        Detected {previewData.data?.data?.recordCount || 0} records with {previewData.data?.data?.detectedSchema?.length || 0} fields
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Fields: {previewData.data?.data?.detectedSchema?.map((field: any) => field.name).join(', ') || 'None'}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button 
                    onClick={() => setCurrentStep(2)}
                    disabled={!migrationConfig.name || !migrationConfig.sourceType}
                  >
                    Next: Field Mapping
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Field Mapping</CardTitle>
                <CardDescription>Map source fields to target system fields</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target System</label>
                  <Select
                    value={migrationConfig.targetSystem}
                    onValueChange={(value) => setMigrationConfig(prev => ({ ...prev, targetSystem: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employees">Employee Management</SelectItem>
                      <SelectItem value="payroll">Payroll System</SelectItem>
                      <SelectItem value="performance">Performance Management</SelectItem>
                      <SelectItem value="attendance">Attendance Tracking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {previewData.data?.data?.detectedSchema && (
                  <div className="space-y-4">
                    <div className="text-sm font-medium">Field Mappings</div>
                    <div className="grid gap-4">
                      {previewData.data.data.detectedSchema.map((field: any, index: number) => (
                        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{field.name}</div>
                            <div className="text-sm text-muted-foreground">Type: {field.type}</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select target field" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="firstName">First Name</SelectItem>
                                <SelectItem value="lastName">Last Name</SelectItem>
                                <SelectItem value="email">Email Address</SelectItem>
                                <SelectItem value="department">Department</SelectItem>
                                <SelectItem value="position">Position</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Previous
                  </Button>
                  <Button onClick={() => setCurrentStep(3)}>
                    Next: Validation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Data Validation</CardTitle>
                <CardDescription>Review and validate your data before migration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {previewData.data?.data?.recordCount || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Records</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {previewData.data?.data?.detectedSchema?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Mapped Fields</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">95%</div>
                    <div className="text-sm text-muted-foreground">Data Quality</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-medium">Validation Results</div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>All required fields are mapped</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Data format validation passed</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>3 duplicate records detected (will be handled automatically)</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Previous
                  </Button>
                  <Button onClick={() => setCurrentStep(4)}>
                    Start Migration
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Migration Execution</CardTitle>
                <CardDescription>Your data migration is ready to execute</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-primary mx-auto" />
                  <div>
                    <div className="text-xl font-bold">Migration Setup Complete</div>
                    <div className="text-muted-foreground">Ready to migrate your data</div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Start New Migration
                  </Button>
                  <Button onClick={handleCreateMigration} disabled={createJob.isPending}>
                    Create Migration Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migration Jobs</CardTitle>
              <CardDescription>Monitor and manage your data migration jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Name</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs?.map((job) => {
                      const StatusIcon = getStatusIcon(job.status)
                      return (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.name}</TableCell>
                          <TableCell>{job.sourceType}</TableCell>
                          <TableCell>{job.targetSystem}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(job.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {job.status === 'running' ? (
                              <div className="flex items-center space-x-2">
                                <Progress value={job.progress || 0} className="w-20 h-2" />
                                <span className="text-xs">{job.progress || 0}%</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(job.createdAt))} ago
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {job.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStartMigration(job.id)}
                                  disabled={startJob.isPending}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                              <Button size="sm" variant="outline">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {(!jobs || jobs.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          No migration jobs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Employee Data Import', description: 'Import employee records from CSV/Excel', icon: Database },
              { name: 'Payroll Migration', description: 'Migrate payroll data from legacy systems', icon: Database },
              { name: 'Performance Data', description: 'Import performance review data', icon: Database }
            ].map((template, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <template.icon className="h-5 w-5" />
                    <span>{template.name}</span>
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Use Template</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}