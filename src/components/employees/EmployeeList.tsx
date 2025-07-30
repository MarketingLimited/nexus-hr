import { useState } from "react";
import { User, Mail, Phone, MapPin, Building, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEmployees } from "@/hooks/useDataManager";
import { Employee } from "@/types";

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

  const filteredEmployees = employees.filter((employee: Employee) => {
    const name = `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employmentInfo.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || employee.employmentInfo.department === selectedDepartment;
    const matchesStatus = selectedStatus === "all" || employee.employmentInfo.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee: Employee) => {
          const name = `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`;
          const initials = `${employee.personalInfo.firstName[0]}${employee.personalInfo.lastName[0]}`;
          
          return (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
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
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredEmployees.map((employee: Employee) => {
        const name = `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`;
        const initials = `${employee.personalInfo.firstName[0]}${employee.personalInfo.lastName[0]}`;
        
        return (
          <Card key={employee.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={employee.personalInfo.avatar} alt={name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <p className="font-medium">{name}</p>
                      <p className="text-sm text-muted-foreground">{employee.employmentInfo.position}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="w-4 h-4" />
                      {employee.employmentInfo.department}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {employee.personalInfo.email}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(employee.employmentInfo.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant={employee.employmentInfo.status === "active" ? "default" : "secondary"}>
                    {employee.employmentInfo.status}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/employees/${employee.id}`}>View</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link to={`/employees/${employee.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EmployeeList;