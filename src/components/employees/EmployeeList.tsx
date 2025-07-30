import { useState, useMemo } from "react";
import { User, Mail, Phone, MapPin, Building, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEmployees } from "@/hooks/useDataManager";
import { Employee } from "@/types";
import { VirtualList, VirtualTable } from "@/components/ui/virtual-list";
import { usePagination } from "@/hooks/usePagination";
import { LazyLoader } from "@/components/ui/lazy-loader";

interface EmployeeListProps {
  searchTerm: string;
  selectedDepartment: string;
  selectedStatus: string;
  viewMode: "grid" | "list";
}

const EmployeeList = ({ searchTerm, selectedDepartment, selectedStatus, viewMode }: EmployeeListProps) => {
  const { data: employeeData, loading, error } = useEmployees();

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading employees...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Error loading employees: {error}</div>;
  }

  if (!employeeData?.employees) {
    return <div className="text-center py-8 text-muted-foreground">No employee data available</div>;
  }

  const employees = employeeData.employees;

  // Memoized filtering for better performance
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee: Employee) => {
      const name = `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`;
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.employmentInfo.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === "all" || employee.employmentInfo.department === selectedDepartment;
      const matchesStatus = selectedStatus === "all" || employee.employmentInfo.status === selectedStatus;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, searchTerm, selectedDepartment, selectedStatus]);

  // Pagination for large datasets
  const pagination = usePagination(filteredEmployees, { pageSize: 20 });

  const renderEmployeeCard = (employee: Employee) => {
    const name = `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`;
    const initials = `${employee.personalInfo.firstName[0]}${employee.personalInfo.lastName[0]}`;
    
    return (
      <LazyLoader
        key={employee.id}
        fallback={<div className="h-80 bg-muted rounded-lg animate-pulse" />}
      >
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={employee.personalInfo.avatar} alt={name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-semibold text-lg">{name}</h3>
                <p className="text-sm text-muted-foreground">{employee.employmentInfo.position}</p>
                <p className="text-xs text-muted-foreground">{employee.employmentInfo.department}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {employee.employmentInfo.workLocation}
              </div>

              <Badge variant={employee.employmentInfo.status === "active" ? "default" : "secondary"}>
                {employee.employmentInfo.status}
              </Badge>

              <div className="flex gap-2 w-full">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link to={`/employees/${employee.id}`}>View</Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link to={`/employees/${employee.id}/edit`}>Edit</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </LazyLoader>
    );
  };

  if (viewMode === "grid") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pagination.paginatedData.map(renderEmployeeCard)}
        </div>
        
        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={pagination.previousPage}
              disabled={!pagination.hasPreviousPage}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={pagination.nextPage}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    );
  }

  // List view with virtual scrolling for better performance
  const tableColumns = [
    {
      key: 'name',
      header: 'Name',
      render: (employee: Employee) => {
        const name = `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`;
        const initials = `${employee.personalInfo.firstName[0]}${employee.personalInfo.lastName[0]}`;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={employee.personalInfo.avatar} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{name}</div>
              <div className="text-sm text-muted-foreground">{employee.employmentInfo.position}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'department',
      header: 'Department',
      render: (employee: Employee) => (
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4" />
          {employee.employmentInfo.department}
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (employee: Employee) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          {employee.personalInfo.email}
        </div>
      ),
    },
    {
      key: 'joinDate',
      header: 'Join Date',
      render: (employee: Employee) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {new Date(employee.employmentInfo.startDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (employee: Employee) => (
        <Badge variant={employee.employmentInfo.status === "active" ? "default" : "secondary"}>
          {employee.employmentInfo.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (employee: Employee) => (
        <div className="flex space-x-2">
          <Button asChild size="sm" variant="outline">
            <Link to={`/employees/${employee.id}`}>View</Link>
          </Button>
          <Button asChild size="sm">
            <Link to={`/employees/${employee.id}/edit`}>Edit</Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <VirtualTable
        items={pagination.paginatedData}
        columns={tableColumns}
        height={600}
        rowHeight={80}
        onRowClick={(employee) => console.log('Selected employee:', employee)}
      />
      
      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={pagination.previousPage}
            disabled={!pagination.hasPreviousPage}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages} 
            ({filteredEmployees.length} employees)
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={pagination.nextPage}
            disabled={!pagination.hasNextPage}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;