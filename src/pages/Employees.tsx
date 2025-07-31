import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EmployeeFilters from "@/components/employees/EmployeeFilters";
import EmployeeList from "@/components/employees/EmployeeList";
import { useEmployeeStats } from "@/hooks/useEmployees";
import { useDepartments } from "@/hooks/useDepartments";

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: employeeStats, isLoading: statsLoading } = useEmployeeStats();
  const { data: departments } = useDepartments();

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{employeeStats?.total || 0}</div>
                <p className="text-xs text-green-600">
                  +12 from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{employeeStats?.active || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {employeeStats?.total ? 
                    `${((employeeStats.active / employeeStats.total) * 100).toFixed(1)}% of total` : 
                    "0% of total"
                  }
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-green-600">
                  +3 from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{departments?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Across all locations</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employee Management */}
      <Card>
        <CardContent className="p-6">
          <EmployeeFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </CardContent>
      </Card>

      {/* Employee List */}
      <EmployeeList
        searchTerm={searchTerm}
        selectedDepartment={selectedDepartment}
        selectedStatus={selectedStatus}
        viewMode={viewMode}
      />
    </div>
  );
};

export default Employees;