import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SyncDashboard } from '@/components/integration/SyncDashboard'
import { MigrationWizard } from '@/components/integration/MigrationWizard'
import { RefreshCw, Download, Upload, Settings, Database, Cloud } from 'lucide-react'

export const Integration = () => {
  const [activeTab, setActiveTab] = useState('sync')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integration Hub</h1>
          <p className="text-muted-foreground">
            Manage system integrations, data synchronization, and migrations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Integration Settings
          </Button>
          <Button size="sm">
            <Cloud className="h-4 w-4 mr-2" />
            New Connection
          </Button>
        </div>
      </div>

      {/* Integration Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Syncs</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Real-time synchronization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Transferred</CardTitle>
            <Database className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1GB</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Operations</CardTitle>
            <Upload className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Download className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
            <p className="text-xs text-muted-foreground">
              Integration reliability
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Systems</CardTitle>
          <CardDescription>Active integrations and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Workday', type: 'HRIS', status: 'connected', lastSync: '2 minutes ago' },
              { name: 'BambooHR', type: 'HR Platform', status: 'connected', lastSync: '5 minutes ago' },
              { name: 'ADP Payroll', type: 'Payroll', status: 'syncing', lastSync: 'In progress' },
              { name: 'Slack', type: 'Communication', status: 'connected', lastSync: '1 hour ago' },
              { name: 'Google Workspace', type: 'Productivity', status: 'error', lastSync: '2 hours ago' },
              { name: 'SAP SuccessFactors', type: 'ERP', status: 'paused', lastSync: '1 day ago' }
            ].map((system) => (
              <div key={system.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{system.name}</div>
                  <div className="text-sm text-muted-foreground">{system.type}</div>
                </div>
                <div className="text-right">
                  <Badge variant={
                    system.status === 'connected' ? 'default' :
                    system.status === 'syncing' ? 'secondary' :
                    system.status === 'error' ? 'destructive' : 'outline'
                  }>
                    {system.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">{system.lastSync}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sync" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Sync Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="migration" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Data Migration</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Sync Dashboard</CardTitle>
              <CardDescription>
                Monitor real-time data synchronization across all connected systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SyncDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="migration">
          <Card>
            <CardHeader>
              <CardTitle>Data Migration Wizard</CardTitle>
              <CardDescription>
                Import and export data between systems with validation and mapping
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MigrationWizard />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}