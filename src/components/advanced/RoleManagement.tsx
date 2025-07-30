import { useState } from "react";
import { Shield, Users, Settings, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RoleManagement = () => {
  const roles = [
    {
      id: 1,
      name: "Super Admin",
      description: "Full system access",
      users: 2,
      permissions: ["all"],
      color: "destructive"
    },
    {
      id: 2,
      name: "HR Manager",
      description: "HR module management",
      users: 3,
      permissions: ["employees", "leave", "performance", "onboarding"],
      color: "default"
    },
    {
      id: 3,
      name: "Department Manager",
      description: "Team and performance management",
      users: 8,
      permissions: ["team_view", "performance", "leave_approve"],
      color: "secondary"
    },
    {
      id: 4,
      name: "Employee",
      description: "Basic employee access",
      users: 45,
      permissions: ["self_view", "leave_request", "attendance"],
      color: "outline"
    }
  ];

  const permissions = [
    { id: "employees", name: "Employee Management", description: "Create, edit, and manage employee records" },
    { id: "payroll", name: "Payroll Management", description: "Process payroll and manage compensation" },
    { id: "leave", name: "Leave Management", description: "Manage leave requests and approvals" },
    { id: "performance", name: "Performance Management", description: "Conduct reviews and manage goals" },
    { id: "reports", name: "Reports & Analytics", description: "Access reports and analytics" },
    { id: "settings", name: "System Settings", description: "Configure system settings" }
  ];

  const userRoles = [
    { name: "John Smith", email: "john@company.com", role: "Super Admin", department: "IT", status: "Active" },
    { name: "Sarah Johnson", email: "sarah@company.com", role: "HR Manager", department: "HR", status: "Active" },
    { name: "Michael Chen", email: "michael@company.com", role: "Department Manager", department: "Marketing", status: "Active" },
    { name: "Emily Rodriguez", email: "emily@company.com", role: "Employee", department: "HR", status: "Active" }
  ];

  return (
    <div className="space-y-6">
      {/* Roles Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role) => (
              <Card key={role.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={role.color as any}>{role.name}</Badge>
                    <span className="text-sm text-muted-foreground">{role.users} users</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Permissions Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Permission</th>
                  <th className="text-center p-3 font-medium">Super Admin</th>
                  <th className="text-center p-3 font-medium">HR Manager</th>
                  <th className="text-center p-3 font-medium">Dept Manager</th>
                  <th className="text-center p-3 font-medium">Employee</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission) => (
                  <tr key={permission.id} className="border-b">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{permission.name}</p>
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                      </div>
                    </td>
                    <td className="text-center p-3">
                      <Switch defaultChecked disabled />
                    </td>
                    <td className="text-center p-3">
                      <Switch defaultChecked={["employees", "leave", "performance"].includes(permission.id)} />
                    </td>
                    <td className="text-center p-3">
                      <Switch defaultChecked={["performance", "leave"].includes(permission.id)} />
                    </td>
                    <td className="text-center p-3">
                      <Switch defaultChecked={permission.id === "leave"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Role Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Role Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRoles.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Select defaultValue={user.role}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                        <SelectItem value="HR Manager">HR Manager</SelectItem>
                        <SelectItem value="Department Manager">Department Manager</SelectItem>
                        <SelectItem value="Employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{user.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagement;