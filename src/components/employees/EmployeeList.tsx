import { useState } from "react";
import { User, Mail, Phone, MapPin, Building, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

// Mock employee data
const employees = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 123-4567",
    position: "Senior Software Engineer",
    department: "Engineering",
    location: "New York, NY",
    joinDate: "2022-03-15",
    status: "active",
    avatar: "/api/placeholder/150/150"
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike.chen@company.com",
    phone: "+1 (555) 234-5678",
    position: "Product Manager",
    department: "Product",
    location: "San Francisco, CA",
    joinDate: "2021-08-20",
    status: "active",
    avatar: "/api/placeholder/150/150"
  },
  {
    id: 3,
    name: "Emma Davis",
    email: "emma.davis@company.com",
    phone: "+1 (555) 345-6789",
    position: "UX Designer",
    department: "Design",
    location: "Austin, TX",
    joinDate: "2023-01-10",
    status: "active",
    avatar: "/api/placeholder/150/150"
  },
  {
    id: 4,
    name: "John Smith",
    email: "john.smith@company.com",
    phone: "+1 (555) 456-7890",
    position: "HR Manager",
    department: "Human Resources",
    location: "Chicago, IL",
    joinDate: "2020-05-12",
    status: "active",
    avatar: "/api/placeholder/150/150"
  },
  {
    id: 5,
    name: "Lisa Wang",
    email: "lisa.wang@company.com",
    phone: "+1 (555) 567-8901",
    position: "Data Analyst",
    department: "Analytics",
    location: "Seattle, WA",
    joinDate: "2022-11-08",
    status: "active",
    avatar: "/api/placeholder/150/150"
  },
  {
    id: 6,
    name: "Alex Thompson",
    email: "alex.thompson@company.com",
    phone: "+1 (555) 678-9012",
    position: "Sales Director",
    department: "Sales",
    location: "Boston, MA",
    joinDate: "2019-09-25",
    status: "inactive",
    avatar: "/api/placeholder/150/150"
  }
];

interface EmployeeListProps {
  searchTerm: string;
  selectedDepartment: string;
  selectedStatus: string;
  viewMode: "grid" | "list";
}

const EmployeeList = ({ searchTerm, selectedDepartment, selectedStatus, viewMode }: EmployeeListProps) => {
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment;
    const matchesStatus = selectedStatus === "all" || employee.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={employee.avatar} alt={employee.name} />
                  <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-semibold text-lg">{employee.name}</h3>
                  <p className="text-sm text-muted-foreground">{employee.position}</p>
                  <p className="text-xs text-muted-foreground">{employee.department}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {employee.location}
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
      {filteredEmployees.map((employee) => (
        <Card key={employee.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={employee.avatar} alt={employee.name} />
                  <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                  <div>
                    <p className="font-medium">{employee.name}</p>
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
                    Joined {new Date(employee.joinDate).toLocaleDateString()}
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