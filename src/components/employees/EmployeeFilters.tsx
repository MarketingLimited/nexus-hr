import { Search, Filter, Grid, List, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useDepartments } from "@/hooks/useDataManager";
import { useDataExport } from "@/hooks/useDataExport";
import { useToast } from "@/hooks/use-toast";

interface EmployeeFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

const EmployeeFilters = ({
  searchTerm,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedStatus,
  onStatusChange,
  viewMode,
  onViewModeChange
}: EmployeeFiltersProps) => {
  const { data: departmentData } = useDepartments();
  const { exportEmployees, loading: exportLoading } = useDataExport();
  const { toast } = useToast();

  const handleExport = async (format: 'csv' | 'json' | 'xlsx') => {
    try {
      const filters = {
        query: searchTerm || undefined,
        departments: selectedDepartment !== 'all' ? [selectedDepartment] : undefined,
        status: selectedStatus !== 'all' ? [selectedStatus] : undefined,
      };
      
      await exportEmployees(format, filters);
      toast({
        title: "Export Successful",
        description: `Employee data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export employee data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Employee Directory</h2>
          <p className="text-sm text-muted-foreground">Manage your team members</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/employees/new">
            <Plus className="h-4 w-4" />
            Add Employee
          </Link>
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search employees by name, email, or position..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Department Filter */}
        <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departmentData?.departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.name}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full lg:w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="rounded-r-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Export Button */}
        <Select onValueChange={(value) => handleExport(value as 'csv' | 'json' | 'xlsx')}>
          <SelectTrigger asChild>
            <Button variant="outline" className="gap-2" disabled={exportLoading}>
              <Download className="h-4 w-4" />
              {exportLoading ? 'Exporting...' : 'Export'}
            </Button>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="csv">Export as CSV</SelectItem>
            <SelectItem value="json">Export as JSON</SelectItem>
            <SelectItem value="xlsx">Export as Excel</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default EmployeeFilters;