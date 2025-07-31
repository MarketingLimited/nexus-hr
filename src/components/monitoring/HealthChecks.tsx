import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHealthChecks, useRunHealthCheck, useUpdateHealthCheckConfig } from "@/hooks/useMonitoring"
import { Play, Settings, CheckCircle, AlertTriangle, Clock, RefreshCw, Heart, Zap, Database } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

export const HealthChecks = () => {
  const { data: healthChecks } = useHealthChecks()
  const runHealthCheck = useRunHealthCheck()
  const updateConfig = useUpdateHealthCheckConfig()
  
  const [selectedCheck, setSelectedCheck] = useState(null)
  const [isConfiguring, setIsConfiguring] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'default'
      case 'warning': return 'secondary'
      case 'fail': return 'destructive'
      case 'unknown': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return CheckCircle
      case 'warning': return AlertTriangle
      case 'fail': return AlertTriangle
      case 'unknown': return Clock
      default: return Clock
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database': return Database
      case 'api': return Zap
      case 'infrastructure': return Heart
      default: return CheckCircle
    }
  }

  const handleRunCheck = async (checkId: string) => {
    try {
      await runHealthCheck.mutateAsync(checkId)
    } catch (error) {
      console.error('Failed to run health check:', error)
    }
  }

  const handleRunAllChecks = async () => {
    try {
      const checkIds = healthChecks?.data?.map((check: any) => check.id) || []
      for (const checkId of checkIds) {
        await runHealthCheck.mutateAsync(checkId)
      }
    } catch (error) {
      console.error('Failed to run all health checks:', error)
    }
  }

  const healthCheckData = Array.isArray(healthChecks?.data) ? healthChecks.data : []
  const groupedChecks = healthCheckData.reduce((groups, check) => {
    const category = check.category || 'other'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(check)
    return groups
  }, {} as Record<string, any[]>) || {}

  const overallStatus = healthCheckData.every(check => check.status === 'pass') 
    ? 'pass' 
    : healthCheckData.some(check => check.status === 'fail')
    ? 'fail'
    : 'warning'

  const passingChecks = healthCheckData.filter(check => check.status === 'pass').length || 0
  const totalChecks = healthCheckData.length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Health Checks</h2>
          <p className="text-muted-foreground">Monitor system health with automated diagnostics</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={getStatusColor(overallStatus)}>
            <Heart className="h-3 w-3 mr-1" />
            {overallStatus.toUpperCase()}
          </Badge>
          <Button 
            onClick={handleRunAllChecks} 
            disabled={runHealthCheck.isPending}
            className="flex items-center space-x-2"
          >
            {runHealthCheck.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>Run All Checks</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((passingChecks / totalChecks) * 100) || 0}%
            </div>
            <div className="mt-2">
              <Progress value={(passingChecks / totalChecks) * 100} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {passingChecks} of {totalChecks} checks passing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passing</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{passingChecks}</div>
            <p className="text-xs text-muted-foreground">healthy services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {healthCheckData.filter(check => check.status === 'warning').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failing</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {healthCheckData.filter(check => check.status === 'fail').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">critical issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Checks by Category */}
      <div className="space-y-6">
        {Object.entries(groupedChecks).map(([category, checks]) => {
          const CategoryIcon = getCategoryIcon(category)
          const categoryStatus = checks.every(check => check.status === 'pass') 
            ? 'pass' 
            : checks.some(check => check.status === 'fail')
            ? 'fail'
            : 'warning'

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CategoryIcon className="h-5 w-5" />
                    <span className="capitalize">{category} Health Checks</span>
                  </div>
                  <Badge variant={getStatusColor(categoryStatus)}>
                    {categoryStatus.toUpperCase()}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Monitor {category} related system components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.isArray(checks) ? checks.map((check) => {
                    const StatusIcon = getStatusIcon(check.status)
                    return (
                      <div key={check.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium">{check.name}</div>
                          <Badge variant={getStatusColor(check.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {check.status}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground mb-3">
                          {check.description}
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Endpoint:</span>
                            <span className="font-mono">{check.endpoint}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Interval:</span>
                            <span>{check.interval}s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Timeout:</span>
                            <span>{check.timeout}s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Check:</span>
                            <span>
                              {check.lastRun 
                                ? formatDistanceToNow(new Date(check.lastRun)) + ' ago'
                                : 'Never'
                              }
                            </span>
                          </div>
                          {check.lastResponse && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Response Time:</span>
                              <span>{check.lastResponse.responseTime}ms</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">Enabled</span>
                            <Switch 
                              checked={check.enabled} 
                              onCheckedChange={(enabled) => {
                                updateConfig.mutate({ 
                                  checkId: check.id, 
                                  config: { ...check, enabled } 
                                })
                              }}
                            />
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRunCheck(check.id)}
                              disabled={runHealthCheck.isPending}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCheck(check)
                                setIsConfiguring(true)
                              }}
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {check.lastResponse?.error && (
                          <div className="mt-3 p-2 bg-destructive/10 rounded text-xs text-destructive">
                            {check.lastResponse.error}
                          </div>
                        )}
                      </div>
                    )
                  }) : null}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {Object.keys(groupedChecks).length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Health Checks Configured</h3>
              <p className="text-muted-foreground mb-4">
                Set up automated health checks to monitor your system components
              </p>
              <Button>Add Health Check</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Health Check Configuration Modal */}
      {isConfiguring && selectedCheck && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Configure Health Check</CardTitle>
              <CardDescription>Update settings for {selectedCheck.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Check Interval (seconds)</label>
                <Input
                  type="number"
                  defaultValue={selectedCheck.interval}
                  min="10"
                  max="3600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Timeout (seconds)</label>
                <Input
                  type="number"
                  defaultValue={selectedCheck.timeout}
                  min="1"
                  max="60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Retry Count</label>
                <Input
                  type="number"
                  defaultValue={selectedCheck.retryCount || 3}
                  min="0"
                  max="10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Alert Severity</label>
                <Select defaultValue={selectedCheck.alertSeverity || 'medium'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsConfiguring(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsConfiguring(false)}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}