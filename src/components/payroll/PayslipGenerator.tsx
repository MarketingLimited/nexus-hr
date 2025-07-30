import { useState } from "react";
import { Download, Eye, Mail, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const PayslipGenerator = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2024-12");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const payslipData = [
    {
      id: 1,
      employeeId: "EMP001",
      name: "Sarah Johnson",
      department: "Engineering",
      position: "Senior Developer",
      period: "December 2024",
      baseSalary: 8500,
      allowances: 1200,
      overtime: 450,
      grossPay: 10150,
      taxDeduction: 1523,
      socialSecurity: 305,
      healthInsurance: 150,
      totalDeductions: 1978,
      netPay: 8172,
      status: "Generated",
      generatedDate: "2024-12-28"
    },
    {
      id: 2,
      employeeId: "EMP002",
      name: "Michael Chen", 
      department: "Marketing",
      position: "Marketing Manager",
      period: "December 2024",
      baseSalary: 7200,
      allowances: 800,
      overtime: 0,
      grossPay: 8000,
      taxDeduction: 1200,
      socialSecurity: 240,
      healthInsurance: 150,
      totalDeductions: 1590,
      netPay: 6410,
      status: "Generated",
      generatedDate: "2024-12-28"
    },
    {
      id: 3,
      employeeId: "EMP003",
      name: "Emily Rodriguez",
      department: "HR",
      position: "HR Specialist", 
      period: "December 2024",
      baseSalary: 5800,
      allowances: 600,
      overtime: 200,
      grossPay: 6600,
      taxDeduction: 990,
      socialSecurity: 198,
      healthInsurance: 150,
      totalDeductions: 1338,
      netPay: 5262,
      status: "Pending",
      generatedDate: null
    }
  ];

  const PayslipModal = ({ employee }) => {
    if (!employee) return null;

    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payslip - {employee.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">TechCorp Inc.</h2>
                <p className="text-sm text-muted-foreground">123 Business St, City, State 12345</p>
              </div>
              <div className="text-right">
                <p className="font-medium">Pay Period: {employee.period}</p>
                <p className="text-sm text-muted-foreground">Generated: {employee.generatedDate}</p>
              </div>
            </div>
          </div>

          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Employee Information</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {employee.name}</p>
                <p><span className="font-medium">Employee ID:</span> {employee.employeeId}</p>
                <p><span className="font-medium">Position:</span> {employee.position}</p>
                <p><span className="font-medium">Department:</span> {employee.department}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Payment Summary</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Gross Pay:</span> ${employee.grossPay?.toLocaleString()}</p>
                <p><span className="font-medium">Total Deductions:</span> ${employee.totalDeductions?.toLocaleString()}</p>
                <p><span className="font-medium text-green-600">Net Pay:</span> ${employee.netPay?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-green-600">Earnings</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Salary</span>
                  <span>${employee.baseSalary?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Allowances</span>
                  <span>${employee.allowances?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Overtime</span>
                  <span>${employee.overtime?.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Gross Pay</span>
                  <span>${employee.grossPay?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-red-600">Deductions</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tax Deduction</span>
                  <span>${employee.taxDeduction?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Social Security</span>
                  <span>${employee.socialSecurity?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Health Insurance</span>
                  <span>${employee.healthInsurance?.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total Deductions</span>
                  <span>${employee.totalDeductions?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="border-t pt-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Net Pay</span>
                <span className="text-2xl font-bold text-green-600">${employee.netPay?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Email to Employee
            </Button>
          </div>
        </div>
      </DialogContent>
    );
  };

  const filteredData = payslipData.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payslip Generator</CardTitle>
          <Button className="gap-2">
            <Calendar className="h-4 w-4" />
            Generate Payslips
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-12">December 2024</SelectItem>
              <SelectItem value="2024-11">November 2024</SelectItem>
              <SelectItem value="2024-10">October 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payslip Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Pay</TableHead>
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
                    </div>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.period}</TableCell>
                  <TableCell className="font-medium">${employee.grossPay?.toLocaleString()}</TableCell>
                  <TableCell className="text-red-600">${employee.totalDeductions?.toLocaleString()}</TableCell>
                  <TableCell className="font-semibold text-green-600">${employee.netPay?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === "Generated" ? "default" : "secondary"}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSelectedEmployee(employee)}>
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        </DialogTrigger>
                        <PayslipModal employee={selectedEmployee} />
                      </Dialog>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayslipGenerator;