import { User, Mail, Phone, MapPin, Building, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useEmployees } from "@/hooks/useEmployees";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface EmployeeListProps {
  searchTerm: string;
  selectedDepartment: string;
  selectedStatus: string;
  viewMode: "grid" | "list";
}

const EmployeeList = ({ searchTerm, selectedDepartment, selectedStatus, viewMode }: EmployeeListProps) => {
  const { data: response, isLoading, error } = useEmployees({
    search: searchTerm || undefined,
    department: selectedDepartment !== "all" ? selectedDepartment : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    page: 1,
    limit: 50
  });

  if (isLoading) {
    return (
      <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
                <div className="flex gap-2 w-full">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load employees: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const employees = response?.data || [];

  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No employees found matching your criteria.</p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
                  <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-semibold text-lg">{employee.firstName} {employee.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{employee.position}</p>
                  <p className="text-xs text-muted-foreground">{employee.department}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {employee.address?.city}, {employee.address?.state}
                </div>

                <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                  {employee.status}
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
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {employees.map((employee) => (
        <Card key={employee.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
                  <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                </Avatar>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                  <div>
                    <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="w-4 h-4" />
                    {employee.department}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {employee.email}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(employee.startDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                  {employee.status}
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
      ))}
    </div>
  );
};

export default EmployeeList;