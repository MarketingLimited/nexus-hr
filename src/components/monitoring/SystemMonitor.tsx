import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSystemHealth, usePerformanceMetrics, useSystemAlerts } from "@/hooks/useMonitoring"
import { Activity, Cpu, Database, Globe, AlertTriangle, CheckCircle, Clock, TrendingUp, Server, Zap } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export const SystemMonitor = () => {
  const { data: health } = useSystemHealth()
  const { data: metrics } = usePerformanceMetrics('1h')
  const { data: alerts } = useSystemAlerts({ status: ['high', 'critical'] })

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'default'
      case 'warning': return 'secondary'
      case 'critical': return 'destructive'
      default: return 'outline'
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle
      case 'warning': return AlertTriangle
      case 'critical': return AlertTriangle
      default: return Activity
    }
  }

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      default: return 'outline'
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Monitor</h2>
          <p className="text-muted-foreground">Real-time system performance and health monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getHealthStatusColor(health?.data?.status || 'unknown')}>
            <Activity className="h-3 w-3 mr-1" />
            {health?.data?.status || 'Unknown'}
          </Badge>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.data?.cpu?.usage || 0}%</div>
            <div className="mt-2">
              <Progress value={metrics?.data?.cpu?.usage || 0} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Load: {metrics?.data?.cpu?.usage || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.data?.memory?.percentage || 0}%</div>
            <div className="mt-2">
              <Progress value={metrics?.data?.memory?.percentage || 0} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(metrics?.data?.memory?.used || 0)} / {formatBytes(metrics?.data?.memory?.total || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.data?.storage?.database?.connections || 0}</div>
            <p className="text-xs text-muted-foreground">Active connections</p>
            <div className="mt-2 space-y-1">
              <div className="text-xs">
                <span className="text-muted-foreground">Response: </span>
                <span className="font-medium">{metrics?.data?.storage?.database?.queryTime || 0}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.data?.network?.throughput || 0}</div>
            <p className="text-xs text-muted-foreground">Bandwidth</p>
            <div className="mt-2 space-y-1">
              <div className="text-xs">
                <span className="text-muted-foreground">Latency: </span>
                <span className="font-medium">{metrics?.data?.network?.latency || 0}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current status of system components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(health?.data?.checks || []).map((component: any) => {
                  const StatusIcon = getHealthStatusIcon(component.status)
                  return (
                    <div key={component.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`h-5 w-5 ${
                          component.status === 'healthy' ? 'text-primary' : 
                          component.status === 'warning' ? 'text-yellow-500' : 'text-destructive'
                        }`} />
                        <div>
                          <div className="font-medium">{component.name}</div>
                          <div className="text-sm text-muted-foreground">{component.description}</div>
                        </div>
                      </div>
                      <Badge variant={getHealthStatusColor(component.status)}>
                        {component.status}
                      </Badge>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Server and runtime information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <span className="text-sm font-medium">
                      {formatUptime(86400)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Version</span>
                    <span className="text-sm font-medium">v1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Environment</span>
                    <Badge variant="outline">Production</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Check</span>
                    <span className="text-sm font-medium">
                      {health?.data?.lastUpdated ? formatDistanceToNow(new Date(health.data.lastUpdated)) + ' ago' : 'Never'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Detailed system performance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">CPU Usage</span>
                        <span className="text-sm">{metrics?.data?.cpu?.usage || 0}%</span>
                      </div>
                      <Progress value={metrics?.data?.cpu?.usage || 0} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Memory Usage</span>
                        <span className="text-sm">{metrics?.data?.memory?.percentage || 0}%</span>
                      </div>
                      <Progress value={metrics?.data?.memory?.percentage || 0} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Disk Usage</span>
                        <span className="text-sm">{metrics?.data?.storage?.localStorage?.percentage || 0}%</span>
                      </div>
                      <Progress value={metrics?.data?.storage?.localStorage?.percentage || 0} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <div className="text-sm font-medium">Network Traffic</div>
                      <div className="grid gap-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Incoming:</span>
                          <span>{formatBytes(metrics?.data?.network?.throughput || 0)}/s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Outgoing:</span>
                          <span>{formatBytes(metrics?.data?.network?.activeConnections || 0)}/s</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="text-sm font-medium">Database Performance</div>
                      <div className="grid gap-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Connections:</span>
                          <span>{metrics?.data?.storage?.database?.connections || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Response:</span>
                          <span>{metrics?.data?.storage?.database?.queryTime || 0}ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Critical system notifications and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(Array.isArray(alerts) ? alerts : alerts?.data || []).map((alert: any) => (
                  <div key={alert.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alert.severity === 'critical' ? 'text-destructive' :
                      alert.severity === 'high' ? 'text-destructive' :
                      alert.severity === 'medium' ? 'text-yellow-500' : 'text-muted-foreground'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{alert.title}</div>
                        <Badge variant={getAlertSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{alert.description}</div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(alert.timestamp))} ago</span>
                        </div>
                        <div>Component: {alert.component}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Acknowledge
                    </Button>
                  </div>
                ))}

                {(Array.isArray(alerts) ? alerts : alerts?.data || []).length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Alerts</h3>
                    <p className="text-muted-foreground">All systems are operating normally</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Status of individual system services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(health?.data?.checks || []).map((service: any) => {
                  const StatusIcon = getHealthStatusIcon(service.status)
                  return (
                    <div key={service.name} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{service.name}</div>
                        <Badge variant={getHealthStatusColor(service.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {service.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">{service.description}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Response Time:</span>
                          <span>{service.responseTime || 0}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Check:</span>
                          <span>{formatDistanceToNow(new Date(service.lastCheck))} ago</span>
                        </div>
                      </div>
                    </div>
                  )
                }) || [
                  { name: 'API Server', status: 'healthy', description: 'Main application server', responseTime: 45, lastCheck: Date.now() },
                  { name: 'Database', status: 'healthy', description: 'Primary database connection', responseTime: 12, lastCheck: Date.now() },
                  { name: 'Auth Service', status: 'healthy', description: 'Authentication service', responseTime: 28, lastCheck: Date.now() },
                  { name: 'File Storage', status: 'warning', description: 'Document storage service', responseTime: 156, lastCheck: Date.now() },
                  { name: 'Email Service', status: 'healthy', description: 'Email notification service', responseTime: 89, lastCheck: Date.now() },
                  { name: 'Cache Layer', status: 'healthy', description: 'Redis cache service', responseTime: 8, lastCheck: Date.now() }
                ].map((service) => {
                  const StatusIcon = getHealthStatusIcon(service.status)
                  return (
                    <div key={service.name} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{service.name}</div>
                        <Badge variant={getHealthStatusColor(service.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {service.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">{service.description}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Response Time:</span>
                          <span>{service.responseTime || 0}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Check:</span>
                          <span>{formatDistanceToNow(new Date(service.lastCheck))} ago</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}