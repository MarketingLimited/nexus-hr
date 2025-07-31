import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSyncStats, useSyncOperations, useSyncConflicts, useStartSync, useAutoSync, useResolveConflict } from "@/hooks/useSync"
import { RefreshCw, Play, Pause, AlertTriangle, CheckCircle, Clock, Zap, Settings, Eye } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

export const SyncDashboard = () => {
  const { data: stats } = useSyncStats()
  const { data: operations } = useSyncOperations()
  const { data: conflicts } = useSyncConflicts()
  const startSync = useStartSync()
  const { isAutoSyncEnabled, startAutoSync, stopAutoSync } = useAutoSync()
  const resolveConflict = useResolveConflict()

  const [selectedConflict, setSelectedConflict] = useState(null)

  const getOperationStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'in_progress': return 'secondary'
      case 'failed': return 'destructive'
      case 'pending': return 'outline'
      default: return 'outline'
    }
  }

  const getOperationStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'in_progress': return RefreshCw
      case 'failed': return AlertTriangle
      case 'pending': return Clock
      default: return Clock
    }
  }

  const handleStartSync = async () => {
    try {
      await startSync.mutateAsync()
    } catch (error) {
      console.error('Failed to start sync:', error)
    }
  }

  const handleResolveConflict = async (conflictId: string, resolution: string) => {
    try {
      await resolveConflict.mutateAsync({ conflictId, resolution })
      setSelectedConflict(null)
    } catch (error) {
      console.error('Failed to resolve conflict:', error)
    }
  }

  const activeSyncProgress = stats?.inProgress ? (stats.completed / (stats.completed + stats.pending)) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sync Dashboard</h2>
          <p className="text-muted-foreground">Monitor data synchronization and resolve conflicts</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Auto Sync</span>
            <Switch
              checked={isAutoSyncEnabled}
              onCheckedChange={(checked) => checked ? enableAutoSync() : disableAutoSync()}
            />
          </div>
          <Button
            onClick={handleStartSync}
            disabled={startSync.isPending || stats?.inProgress}
            className="flex items-center space-x-2"
          >
            {stats?.inProgress ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{stats?.inProgress ? 'Syncing...' : 'Start Sync'}</span>
          </Button>
        </div>
      </div>

      {/* Sync Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
            {stats?.inProgress ? (
              <RefreshCw className="h-4 w-4 text-primary animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 text-primary" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.inProgress ? 'In Progress' : 'Idle'}
            </div>
            {stats?.inProgress && (
              <div className="mt-2">
                <Progress value={activeSyncProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(activeSyncProgress)}% complete
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Operations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">awaiting sync</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats?.conflicts || 0}</div>
            <p className="text-xs text-muted-foreground">requiring resolution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.lastSync ? formatDistanceToNow(new Date(stats.lastSync)) : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">ago</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="operations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="conflicts">
            Conflicts {conflicts?.length ? `(${conflicts.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Operations</CardTitle>
              <CardDescription>Recent synchronization activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operation</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operations?.map((operation) => {
                      const StatusIcon = getOperationStatusIcon(operation.status)
                      return (
                        <TableRow key={operation.id}>
                          <TableCell className="font-medium">{operation.operation}</TableCell>
                          <TableCell>{operation.entityType}</TableCell>
                          <TableCell>
                            <Badge variant={getOperationStatusColor(operation.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {operation.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {operation.status === 'in_progress' ? (
                              <div className="flex items-center space-x-2">
                                <Progress value={operation.progress || 0} className="w-20 h-2" />
                                <span className="text-xs">{operation.progress || 0}%</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(operation.createdAt))} ago
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {operation.completedAt
                              ? `${Math.round((new Date(operation.completedAt).getTime() - new Date(operation.createdAt).getTime()) / 1000)}s`
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {(!operations || operations.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No sync operations found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Conflicts</CardTitle>
              <CardDescription>Resolve data synchronization conflicts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conflicts?.map((conflict) => (
                  <div key={conflict.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <div>
                          <div className="font-medium">{conflict.entityType} Conflict</div>
                          <div className="text-sm text-muted-foreground">Entity ID: {conflict.entityId}</div>
                        </div>
                      </div>
                      <Badge variant="destructive">{conflict.conflictType}</Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Local Version</h4>
                        <div className="bg-muted p-3 rounded text-xs">
                          <pre>{JSON.stringify(conflict.localData, null, 2)}</pre>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Remote Version</h4>
                        <div className="bg-muted p-3 rounded text-xs">
                          <pre>{JSON.stringify(conflict.remoteData, null, 2)}</pre>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveConflict(conflict.id, 'use_local')}
                        disabled={resolveConflict.isPending}
                      >
                        Use Local
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveConflict(conflict.id, 'use_remote')}
                        disabled={resolveConflict.isPending}
                      >
                        Use Remote
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Conflict Details</DialogTitle>
                            <DialogDescription>
                              Detailed view of the data conflict for {conflict.entityType}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <h4 className="font-medium mb-2">Conflict Information</h4>
                                <div className="space-y-1 text-sm">
                                  <div><strong>Type:</strong> {conflict.conflictType}</div>
                                  <div><strong>Entity:</strong> {conflict.entityType}</div>
                                  <div><strong>ID:</strong> {conflict.entityId}</div>
                                  <div><strong>Detected:</strong> {format(new Date(conflict.detectedAt), 'PPpp')}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}

                {(!conflicts || conflicts.length === 0) && (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No conflicts</h3>
                    <p className="text-muted-foreground">All data is synchronized successfully</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Configuration</CardTitle>
              <CardDescription>Configure synchronization behavior and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Automatic Synchronization</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically sync data in the background
                    </div>
                  </div>
                  <Switch
                    checked={isAutoSyncEnabled}
                    onCheckedChange={(checked) => checked ? enableAutoSync() : disableAutoSync()}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Real-time Sync</div>
                    <div className="text-sm text-muted-foreground">
                      Sync changes immediately when they occur
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Conflict Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Get notified when data conflicts occur
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Background Sync</div>
                    <div className="text-sm text-muted-foreground">
                      Continue syncing when app is in background
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Sync Statistics</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Total Operations</div>
                    <div className="text-2xl font-bold">{stats?.completed + stats?.failed || 0}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                    <div className="text-2xl font-bold">
                      {stats?.completed && stats?.failed 
                        ? Math.round((stats.completed / (stats.completed + stats.failed)) * 100)
                        : 100
                      }%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}