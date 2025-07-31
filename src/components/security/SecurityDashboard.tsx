import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSecurityAlerts, useSessionManagement, useDeviceManagement } from "@/hooks/useSecurity"
import { AlertTriangle, Shield, Users, Monitor, Activity, Clock, MapPin, Smartphone } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export const SecurityDashboard = () => {
  const { data: alerts } = useSecurityAlerts()
  const { sessions, metrics, terminateSession } = useSessionManagement()
  const { devices } = useDeviceManagement('current-user')

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      default: return 'outline'
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-destructive'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-500'
    return 'text-primary'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Dashboard</h2>
          <p className="text-muted-foreground">Monitor security events and manage access</p>
        </div>
        <Badge variant={metrics?.complianceStatus === 'compliant' ? 'default' : 'destructive'}>
          {metrics?.complianceStatus === 'compliant' ? 'Compliant' : 'Non-Compliant'}
        </Badge>
      </div>

      {/* Security Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskScoreColor(metrics?.riskScore || 0)}`}>
              {metrics?.riskScore || 0}
            </div>
            <p className="text-xs text-muted-foreground">out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeSessions || 0}</div>
            <p className="text-xs text-muted-foreground">currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins (24h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics?.failedLogins24h || 0}</div>
            <p className="text-xs text-muted-foreground">in last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.securityEvents24h || 0}</div>
            <p className="text-xs text-muted-foreground">last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Alerts</CardTitle>
              <CardDescription>High-severity security events requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts?.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div>
                        <div className="font-medium">{alert.type.replace('_', ' ').toUpperCase()}</div>
                        <div className="text-sm text-muted-foreground">{alert.userEmail}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.timestamp))} ago
                        </div>
                      </div>
                    </div>
                    <Badge variant={getAlertSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
                {(!alerts || alerts.length === 0) && (
                  <div className="text-center py-6 text-muted-foreground">
                    No security alerts at this time
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active User Sessions</CardTitle>
              <CardDescription>Manage active user sessions across all devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions?.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Monitor className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{session.userEmail}</div>
                        <div className="text-sm text-muted-foreground flex items-center space-x-2">
                          <MapPin className="h-3 w-3" />
                          <span>{session.location}</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>
                            Active {formatDistanceToNow(new Date(session.lastActivity))} ago
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{session.ip}</div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => terminateSession.mutate(session.id)}
                      disabled={terminateSession.isPending}
                    >
                      Terminate
                    </Button>
                  </div>
                ))}
                {(!sessions || sessions.length === 0) && (
                  <div className="text-center py-6 text-muted-foreground">
                    No active sessions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Devices</CardTitle>
              <CardDescription>Manage trusted devices and security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices?.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{device.deviceInfo.browser}</div>
                        <div className="text-sm text-muted-foreground">{device.deviceInfo.os}</div>
                        <div className="text-xs text-muted-foreground">
                          Last seen {formatDistanceToNow(new Date(device.lastSeen))} ago
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={device.trusted ? 'default' : 'secondary'}>
                        {device.trusted ? 'Trusted' : 'Untrusted'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {(!devices || devices.length === 0) && (
                  <div className="text-center py-6 text-muted-foreground">
                    No registered devices
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}