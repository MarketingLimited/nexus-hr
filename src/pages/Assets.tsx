import { Building2, Plus, Search, Filter, Package, Laptop, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActions } from "@/components/common/BulkActions";
import { useAssetStats, useAssetCategories, useAssets } from "@/hooks/useAssets";
import { useState } from "react";

const Assets = () => {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  
  // API hooks
  const { data: stats, isLoading: statsLoading } = useAssetStats();
  const { data: categories, isLoading: categoriesLoading } = useAssetCategories();
  const { data: assets, isLoading: assetsLoading } = useAssets({ limit: 5 });

  const assetList = [
    {
      id: '1',
      name: "MacBook Pro 16\"",
      serialNumber: "FVFXK2L5Q6LR",
      assignedTo: "Sarah Johnson",
      category: "IT Equipment",
      status: "assigned",
      location: "Office Floor 2"
    },
    {
      id: '2',
      name: "Dell Monitor 27\"",
      serialNumber: "DLL2023-001",
      assignedTo: "Mike Chen",
      category: "IT Equipment", 
      status: "assigned",
      location: "Office Floor 1"
    },
    {
      id: '3',
      name: "Ergonomic Office Chair",
      serialNumber: "CHAIR-2024-089",
      assignedTo: "Emma Davis",
      category: "Office Equipment",
      status: "assigned",
      location: "Office Floor 3"
    },
    {
      id: '4',
      name: "iPhone 15 Pro",
      serialNumber: "IPHONE-2024-234",
      assignedTo: "Unassigned",
      category: "Mobile Device",
      status: "available",
      location: "Storage Room A"
    },
    {
      id: '5',
      name: "HP Printer LaserJet",
      serialNumber: "HP-LJ-2024-012",
      assignedTo: "Office Common Area",
      category: "Office Equipment",
      status: "maintenance",
      location: "Office Floor 1"
    }
  ];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssets(assetList.map(asset => asset.id));
    } else {
      setSelectedAssets([]);
    }
  };

  const handleSelectAsset = (assetId: string, checked: boolean) => {
    if (checked) {
      setSelectedAssets(prev => [...prev, assetId]);
    } else {
      setSelectedAssets(prev => prev.filter(id => id !== assetId));
    }
  };

  const bulkActions = [
    {
      label: 'Assign Assets',
      action: async (selectedIds: string[]) => {
        console.log('Assigning assets:', selectedIds);
      }
    },
    {
      label: 'Update Status',
      action: async (selectedIds: string[]) => {
        console.log('Updating asset status:', selectedIds);
      }
    }
  ];
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asset Management</h1>
          <p className="text-muted-foreground">Track and manage company assets</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.data?.total || 0}</div>
            )}
            <p className="text-xs text-green-600">+5 this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.data?.assigned || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">{stats?.data?.utilizationRate || 0}% utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.data?.available || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Ready for assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Under Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.data?.maintenance || 0}</div>
            )}
            <p className="text-xs text-orange-600">3 due this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Asset Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Laptop className="h-5 w-5" />
              IT Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Laptops</span>
                <span className="text-sm font-medium">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Monitors</span>
                <span className="text-sm font-medium">89</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Keyboards</span>
                <span className="text-sm font-medium">67</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Mice</span>
                <span className="text-sm font-medium">78</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Office Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Desks</span>
                <span className="text-sm font-medium">45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Chairs</span>
                <span className="text-sm font-medium">52</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Printers</span>
                <span className="text-sm font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Phones</span>
                <span className="text-sm font-medium">38</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Other Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Vehicles</span>
                <span className="text-sm font-medium">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Software Licenses</span>
                <span className="text-sm font-medium">124</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Mobile Devices</span>
                <span className="text-sm font-medium">67</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Accessories</span>
                <span className="text-sm font-medium">89</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Recent Assets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Search assets..." 
                className="w-full"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          <BulkActions
            selectedItems={selectedAssets}
            onSelectAll={handleSelectAll}
            onSelectItem={handleSelectAsset}
            totalItems={assetList.length}
            actions={bulkActions}
          />
          
          <div className="space-y-3">
            {assetList.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedAssets.includes(asset.id)}
                    onCheckedChange={(checked) => 
                      handleSelectAsset(asset.id, checked as boolean)
                    }
                  />
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    {asset.category === "IT Equipment" ? (
                      <Laptop className="h-5 w-5" />
                    ) : asset.category === "Mobile Device" ? (
                      <Monitor className="h-5 w-5" />
                    ) : (
                      <Package className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{asset.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {asset.serialNumber} • {asset.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{asset.assignedTo}</p>
                    <p className="text-xs text-muted-foreground">{asset.category}</p>
                  </div>
                  <Badge 
                    variant={
                      asset.status === "assigned" ? "default" : 
                      asset.status === "available" ? "secondary" : 
                      "destructive"
                    }
                  >
                    {asset.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Assets;