import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWorkflows, useWorkflowTemplates, useCreateWorkflow, useStartWorkflow } from "@/hooks/useWorkflow"
import { Plus, Play, Pause, Square, Clock, User, CheckCircle, AlertCircle, Settings } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export const WorkflowBuilder = () => {
  const { data: workflows } = useWorkflows()
  const { data: templates } = useWorkflowTemplates()
  const createWorkflow = useCreateWorkflow()
  const startWorkflow = useStartWorkflow()

  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    type: '',
    assignedTo: '',
    steps: []
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'in_progress': return 'secondary'
      case 'paused': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'in_progress': return Play
      case 'paused': return Pause
      case 'cancelled': return Square
      default: return Clock
    }
  }

  const handleCreateWorkflow = async () => {
    try {
      await createWorkflow.mutateAsync({
        ...newWorkflow,
        status: 'draft',
        initiatedBy: 'current-user'
      })
      setNewWorkflow({ name: '', description: '', type: '', assignedTo: '', steps: [] })
    } catch (error) {
      console.error('Failed to create workflow:', error)
    }
  }

  const handleStartWorkflow = async (workflowId: string) => {
    try {
      await startWorkflow.mutateAsync({
        workflowId: workflowId,
        targetId: 'current-user',
        assigneeId: 'current-user'
      })
    } catch (error) {
      console.error('Failed to start workflow:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workflow Builder</h2>
          <p className="text-muted-foreground">Create and manage automated business processes</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Workflow</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>Design a custom workflow for your business process</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Workflow Name</label>
                  <Input
                    placeholder="Enter workflow name"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={newWorkflow.type}
                    onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onboarding">Employee Onboarding</SelectItem>
                      <SelectItem value="leave_approval">Leave Approval</SelectItem>
                      <SelectItem value="performance_review">Performance Review</SelectItem>
                      <SelectItem value="offboarding">Employee Offboarding</SelectItem>
                      <SelectItem value="procurement">Procurement Process</SelectItem>
                      <SelectItem value="custom">Custom Workflow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe the workflow purpose and process"
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned To</label>
                <Input
                  placeholder="User ID or email"
                  value={newWorkflow.assignedTo}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, assignedTo: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button 
                  onClick={handleCreateWorkflow}
                  disabled={createWorkflow.isPending || !newWorkflow.name}
                >
                  Create Workflow
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(Array.isArray(workflows) ? workflows : workflows?.data || [])
              .filter((w: any) => w.status === 'in_progress' || w.status === 'paused')
              .map((workflow: any) => {
                const StatusIcon = getStatusIcon(workflow.status)
                const currentStep = workflow.steps.find(s => s.status === 'in_progress')
                const completedSteps = workflow.steps.filter(s => s.status === 'completed').length
                const totalSteps = workflow.steps.length

                return (
                  <Card key={workflow.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <Badge variant={getStatusColor(workflow.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {workflow.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <CardDescription>{workflow.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{completedSteps}/{totalSteps} steps</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                          />
                        </div>
                      </div>

                      {currentStep && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Current Step:</div>
                          <div className="text-sm text-muted-foreground">{currentStep.name}</div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{workflow.assignedTo}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Started {formatDistanceToNow(new Date(workflow.createdAt))} ago</span>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        {workflow.status === 'paused' ? (
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleStartWorkflow(workflow.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="flex-1">
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

            {(Array.isArray(workflows) ? workflows : workflows?.data || []).filter((w: any) => w.status === 'in_progress' || w.status === 'paused').length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No active workflows</h3>
                  <p className="text-muted-foreground">Start by creating a new workflow or using a template</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(Array.isArray(templates) ? templates : templates?.data || []).map((template: any) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Steps:</span>
                    <Badge variant="outline">{template.steps.length}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Type:</span>
                    <Badge variant="secondary">{template.type}</Badge>
                  </div>

                  <Button className="w-full" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}

            {(Array.isArray(templates) ? templates : templates?.data || []).length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No templates available</h3>
                  <p className="text-muted-foreground">Create custom workflows to build your template library</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(Array.isArray(workflows) ? workflows : workflows?.data || [])
              .filter((w: any) => w.status === 'completed' || w.status === 'cancelled')
              .map((workflow: any) => {
                const StatusIcon = getStatusIcon(workflow.status)
                const completedSteps = workflow.steps.filter(s => s.status === 'completed').length
                const totalSteps = workflow.steps.length

                return (
                  <Card key={workflow.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <Badge variant={getStatusColor(workflow.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {workflow.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <CardDescription>{workflow.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completion</span>
                          <span>{completedSteps}/{totalSteps} steps</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              workflow.status === 'completed' ? 'bg-primary' : 'bg-destructive'
                            }`}
                            style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{workflow.assignedTo}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {workflow.status === 'completed' ? 'Completed' : 'Cancelled'} {' '}
                          {formatDistanceToNow(new Date(workflow.updatedAt))} ago
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

            {(Array.isArray(workflows) ? workflows : workflows?.data || []).filter((w: any) => w.status === 'completed' || w.status === 'cancelled').length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No completed workflows</h3>
                  <p className="text-muted-foreground">Completed workflows will appear here</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}