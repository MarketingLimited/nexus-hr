import { useState, useMemo } from "react";
import { Search, Filter, Download, Upload, RefreshCw, Database, Settings } from "lucide-react";
import { useDepartments } from "@/hooks/useDepartments";

const DepartmentDropdown = () => {
  const { data: departments } = useDepartments();
  
  return (
    <SelectContent>
      <SelectItem value="all">All Departments</SelectItem>
      {departments?.data?.map((dept: any) => (
        <SelectItem key={dept.id} value={dept.name}>
          {dept.name}
        </SelectItem>
      ))}
    </SelectContent>
  );
};
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  useAdvancedSearch, 
  useBulkOperations, 
  DataImportExport 
} from "@/utils/advancedFeatures";
import { useOptimizedQueries } from "@/hooks/usePerformanceOptimizations";
import { DataSeeder } from "@/utils/dataValidation";

// Mock data for demonstration
const mockEmployees = Array.from({ length: 100 }, (_, i) => ({
  id: `emp-${i + 1}`,
  firstName: `First${i + 1}`,
  lastName: `Last${i + 1}`,
  email: `employee${i + 1}@company.com`,
  department: ['Engineering', 'Marketing', 'Sales', 'HR'][i % 4],
  status: ['active', 'inactive'][i % 2],
  salary: 50000 + (i * 1000),
  createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
}));

const SystemManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("search");
  const [selectedEntity, setSelectedEntity] = useState("employees");
  
  // Advanced search
  const search = useAdvancedSearch(mockEmployees, {
    pageSize: 10,
    debounceMs: 300
  });

  // Bulk operations
  const bulkOps = useBulkOperations();

  // Query optimization
  const { stats, optimizeQueries, clearCache } = useOptimizedQueries();

  // System stats
  const systemStats = useMemo(() => ({
    cacheEfficiency: Math.round((stats.cachedQueries / Math.max(stats.totalQueries, 1)) * 100),
    errorRate: Math.round((stats.failedQueries / Math.max(stats.totalQueries, 1)) * 100),
    totalSize: Math.round(JSON.stringify(mockEmployees).length / 1024), // KB
    lastOptimized: new Date().toLocaleTimeString()
  }), [stats]);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      if (format === 'csv') {
        await DataImportExport.exportToCSV(
          search.result.data,
          `${selectedEntity}-export`,
          [
            { key: 'firstName', label: 'First Name' },
            { key: 'lastName', label: 'Last Name' },
            { key: 'email', label: 'Email' },
            { key: 'department', label: 'Department' },
            { key: 'status', label: 'Status' }
          ]
        );
      } else {
        await DataImportExport.exportToJSON(search.result.data, `${selectedEntity}-export`);
      }
      
      toast({
        title: "Export Complete",
        description: `Data exported successfully as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      const result = await bulkOps.executeBulkOperation(
        async (item) => {
          // Simulate delete operation
          await new Promise(resolve => setTimeout(resolve, 100));
          if (Math.random() < 0.1) throw new Error('Simulated delete error');
        },
        search.result.data
      );

      toast({
        title: "Bulk Delete Complete",
        description: `${result.success} items deleted, ${result.failed} failed.`,
      });
    } catch (error) {
      toast({
        title: "Bulk Delete Failed",
        description: "Operation failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDatabaseSeed = async (reset = false) => {
    try {
      if (reset) {
        await DataSeeder.resetDatabase();
        toast({
          title: "Database Reset",
          description: "Database has been reset and reseeded with fresh data.",
        });
      } else {
        await DataSeeder.seedDatabase();
        toast({
          title: "Database Seeded",
          description: "Database has been populated with sample data.",
        });
      }
    } catch (error) {
      toast({
        title: "Operation Failed",
        description: "Database operation failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Management</h1>
          <p className="text-muted-foreground">Advanced data operations and system optimization</p>
        </div>
        <Button variant="outline" onClick={optimizeQueries} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Optimize System
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cache Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.cacheEfficiency}%</div>
            <Progress value={systemStats.cacheEfficiency} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.errorRate}%</div>
            <Progress value={systemStats.errorRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Data Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalSize} KB</div>
            <p className="text-xs text-muted-foreground mt-1">Total cache size</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQueries}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.cachedQueries} cached</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search" className="gap-2">
            <Search className="h-4 w-4" />
            Advanced Search
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-2">
            <Settings className="h-4 w-4" />
            Bulk Operations
          </TabsTrigger>
          <TabsTrigger value="import-export" className="gap-2">
            <Download className="h-4 w-4" />
            Import/Export
          </TabsTrigger>
          <TabsTrigger value="database" className="gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Search & Filtering</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search across all fields..."
                    value={search.filters.query || ''}
                    onChange={(e) => search.updateFilters({ query: e.target.value })}
                    className="max-w-sm"
                  />
                </div>
                <Select value={search.filters.department || 'all'} onValueChange={(value) => search.updateFilters({ department: value })}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <DepartmentDropdown />
                </Select>
                <Select value={search.filters.status || 'all'} onValueChange={(value) => search.updateFilters({ status: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {search.isFiltered && (
                  <Button variant="outline" onClick={search.clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Showing {search.result.data.length} of {search.result.total} results
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={search.previousPage}
                      disabled={!search.result.hasPreviousPage}
                    >
                      Previous
                    </Button>
                    <span className="text-sm flex items-center px-2">
                      Page {search.result.page} of {search.result.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={search.nextPage}
                      disabled={!search.result.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg">
                  {search.result.data.map((item) => (
                    <div key={item.id} className="p-4 border-b last:border-b-0 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.firstName} {item.lastName}</div>
                        <div className="text-sm text-muted-foreground">{item.email} • {item.department}</div>
                      </div>
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{bulkOps.selectedCount} items selected</p>
                  <p className="text-sm text-muted-foreground">
                    Select items from the search results to perform bulk operations
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => bulkOps.selectAll(search.result.data)}
                    disabled={search.result.data.length === 0}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={bulkOps.clearSelection}
                    disabled={bulkOps.selectedCount === 0}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg">
                {search.result.data.map((item) => (
                  <div key={item.id} className="p-4 border-b last:border-b-0 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={bulkOps.selectedItems.has(item.id)}
                      onChange={() => bulkOps.toggleSelection(item.id)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.firstName} {item.lastName}</div>
                      <div className="text-sm text-muted-foreground">{item.email}</div>
                    </div>
                    <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="destructive" 
                  onClick={handleBulkDelete}
                  disabled={bulkOps.selectedCount === 0 || bulkOps.isProcessing}
                >
                  {bulkOps.isProcessing ? 'Processing...' : `Delete Selected (${bulkOps.selectedCount})`}
                </Button>
                <Button 
                  variant="outline"
                  disabled={bulkOps.selectedCount === 0 || bulkOps.isProcessing}
                >
                  Export Selected
                </Button>
                <Button 
                  variant="outline"
                  disabled={bulkOps.selectedCount === 0 || bulkOps.isProcessing}
                >
                  Update Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employees">Employees</SelectItem>
                    <SelectItem value="departments">Departments</SelectItem>
                    <SelectItem value="leave-requests">Leave Requests</SelectItem>
                    <SelectItem value="payslips">Payslips</SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Export Format</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleExport('csv')} className="flex-1">
                      CSV
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('json')} className="flex-1">
                      JSON
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Export {search.result.total} filtered records
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop CSV files or click to browse
                  </p>
                  <Button variant="outline" className="mt-2">
                    Choose File
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Validate data before import</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Skip duplicate records</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Operations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleDatabaseSeed(false)}
                    className="w-full justify-start gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Seed Database
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleDatabaseSeed(true)}
                    className="w-full justify-start gap-2"
                  >
                    <Database className="h-4 w-4" />
                    Reset & Reseed
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={clearCache}
                    className="w-full justify-start gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Clear Cache
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Seed: Add sample data to empty database</p>
                  <p>• Reset: Clear all data and add fresh samples</p>
                  <p>• Cache: Clear query cache and optimize performance</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Last Optimized:</span>
                  <span className="text-sm font-mono">{systemStats.lastOptimized}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Cache Hit Rate:</span>
                  <span className="text-sm font-mono">{systemStats.cacheEfficiency}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Active Queries:</span>
                  <span className="text-sm font-mono">{stats.totalQueries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Failed Queries:</span>
                  <span className="text-sm font-mono">{stats.failedQueries}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemManagement;