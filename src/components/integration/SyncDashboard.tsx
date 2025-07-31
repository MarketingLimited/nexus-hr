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
  const { isAutoSyncEnabled, enableAutoSync, disableAutoSync } = useAutoSync()
  const resolveConflict = useResolveConflict()

  const [selectedConflict, setSelectedConflict] = useState(null)

  const getOperationStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'syncing': return 'secondary'
      case 'failed': return 'destructive'
      case 'pending': return 'outline'
      default: return 'outline'
    }
  }

  const getOperationStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'syncing': return RefreshCw
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
      await resolveConflict.mutateAsync({ 
        conflictId, 
        resolution: resolution as 'merge' | 'local_wins' | 'remote_wins' | 'auto' 
      })
      setSelectedConflict(null)
    } catch (error) {
      console.error('Failed to resolve conflict:', error)
    }
  }

  const statsData = stats || { inProgress: false, pending: 0, conflicts: 0, lastSync: null }
  const operationsData = Array.isArray(operations) ? operations : []
  const conflictsData = Array.isArray(conflicts) ? conflicts : []

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
            disabled={startSync.isPending || Boolean(statsData.inProgress)}
            className="flex items-center space-x-2"
          >
            {Boolean(statsData.inProgress) ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{Boolean(statsData.inProgress) ? 'Syncing...' : 'Start Sync'}</span>
          </Button>
        </div>
      </div>

      {/* Sync Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
            {Boolean(statsData.inProgress) ? (
              <RefreshCw className="h-4 w-4 text-primary animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 text-primary" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Boolean(statsData.inProgress) ? 'In Progress' : 'Idle'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Operations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.pending || 0}</div>
            <p className="text-xs text-muted-foreground">awaiting sync</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{statsData.conflicts || 0}</div>
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
              {statsData.lastSync ? formatDistanceToNow(new Date(statsData.lastSync)) : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">ago</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="operations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="conflicts">
            Conflicts {conflictsData.length ? `(${conflictsData.length})` : ''}
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
                      <TableHead>Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operationsData.map((operation) => {
                      const StatusIcon = getOperationStatusIcon(operation.status)
                      return (
                        <TableRow key={operation.id}>
                          <TableCell className="font-medium">{operation.operation || operation.type}</TableCell>
                          <TableCell>{operation.entityType}</TableCell>
                          <TableCell>
                            <Badge variant={getOperationStatusColor(operation.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {operation.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(operation.createdAt || operation.timestamp))} ago
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {operationsData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
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
                {conflictsData.map((conflict) => (
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

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveConflict(conflict.id, 'local_wins')}
                        disabled={resolveConflict.isPending}
                      >
                        Use Local
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveConflict(conflict.id, 'remote_wins')}
                        disabled={resolveConflict.isPending}
                      >
                        Use Remote
                      </Button>
                    </div>
                  </div>
                ))}

                {conflictsData.length === 0 && (
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}