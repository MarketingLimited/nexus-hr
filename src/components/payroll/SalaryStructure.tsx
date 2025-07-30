import { useState } from "react";
import { Search, Filter, Edit, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SalaryStructure = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const salaryData = [
    {
      id: 1,
      employeeId: "EMP001",
      name: "Sarah Johnson",
      department: "Engineering",
      position: "Senior Developer",
      baseSalary: 8500,
      allowances: 1200,
      overtime: 450,
      deductions: 850,
      netSalary: 9300,
      lastReview: "2024-01-15",
      status: "Active"
    },
    {
      id: 2,
      employeeId: "EMP002", 
      name: "Michael Chen",
      department: "Marketing",
      position: "Marketing Manager",
      baseSalary: 7200,
      allowances: 800,
      overtime: 0,
      deductions: 720,
      netSalary: 7280,
      lastReview: "2024-02-20",
      status: "Active"
    },
    {
      id: 3,
      employeeId: "EMP003",
      name: "Emily Rodriguez",
      department: "HR",
      position: "HR Specialist",
      baseSalary: 5800,
      allowances: 600,
      overtime: 200,
      deductions: 580,
      netSalary: 6020,
      lastReview: "2024-01-10",
      status: "Active"
    },
    {
      id: 4,
      employeeId: "EMP004",
      name: "David Kim",
      department: "Finance",
      position: "Financial Analyst",
      baseSalary: 6500,
      allowances: 500,
      overtime: 120,
      deductions: 650,
      netSalary: 6470,
      lastReview: "2024-03-05",
      status: "Under Review"
    },
    {
      id: 5,
      employeeId: "EMP005",
      name: "Lisa Wang",
      department: "Engineering",
      position: "Lead Designer",
      baseSalary: 7800,
      allowances: 900,
      overtime: 300,
      deductions: 780,
      netSalary: 8220,
      lastReview: "2024-02-28",
      status: "Active"
    }
  ];

  const filteredData = salaryData.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Salary Structure Management</CardTitle>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Employee Salary
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>

        {/* Salary Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Overtime</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.employeeId}</p>
                      <p className="text-sm text-muted-foreground">{employee.position}</p>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell className="font-medium">${employee.baseSalary.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">+${employee.allowances.toLocaleString()}</TableCell>
                  <TableCell className="text-blue-600">+${employee.overtime.toLocaleString()}</TableCell>
                  <TableCell className="text-red-600">-${employee.deductions.toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">${employee.netSalary.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === "Active" ? "default" : "secondary"}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">${filteredData.reduce((sum, emp) => sum + emp.baseSalary, 0).toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Base Salaries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">${filteredData.reduce((sum, emp) => sum + emp.allowances, 0).toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Allowances</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">${filteredData.reduce((sum, emp) => sum + emp.deductions, 0).toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Deductions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">${filteredData.reduce((sum, emp) => sum + emp.netSalary, 0).toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Net Payroll</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalaryStructure;