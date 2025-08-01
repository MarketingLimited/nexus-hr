import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useEmployees } from "@/hooks/useEmployees";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, Building, User, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EmployeeProfile = () => {
  const { id } = useParams();
  const { data: employeesData, isLoading, error } = useEmployees();
  
  const employee = employeesData?.data?.find((emp: any) => emp.id === id) || {
    id: id || "1",
    firstName: "Employee",
    lastName: "Not Found",
    email: "N/A", 
    phone: "N/A",
    position: "N/A",
    department: "N/A",
    location: "N/A",
    hireDate: new Date().toISOString().split('T')[0],
    status: "inactive",
    avatar: "/api/placeholder/150/150",
    employeeId: id || "EMP001",
    manager: "N/A",
    salary: "N/A",
    skills: [],
    notes: "Employee information not available."
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading employee profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-destructive">Error loading employee profile</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/employees">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Profile</h1>
            <p className="text-muted-foreground">View and manage employee information</p>
          </div>
        </div>
        <Button className="gap-2" asChild>
          <Link to={`/employees/${id}/edit`}>
            <Edit className="h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
              <AvatarFallback className="text-2xl">
                {employee.firstName[0]}{employee.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h2>
                <p className="text-lg text-muted-foreground">{employee.position}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                    {employee.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">ID: {employee.employeeId}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.location}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                    <p className="text-sm">{employee.employeeId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                    <p className="text-sm">{new Date((employee as any).hireDate || (employee as any).joinDate || new Date()).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Manager</label>
                    <p className="text-sm">{employee.manager}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge variant={employee.status === "active" ? "default" : "secondary"} className="text-xs">
                      {employee.status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bio</label>
                  <p className="text-sm mt-1">{(employee as any).notes || (employee as any).bio || 'No bio available'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Position</label>
                  <p className="text-sm">{employee.position}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-sm">{employee.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Salary</label>
                  <p className="text-sm">{employee.salary}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Employment Type</label>
                  <p className="text-sm">Full-time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Performance data will be implemented in Phase 5</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Document management will be implemented in Phase 7</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeProfile;