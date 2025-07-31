import { useState } from "react";
import { Play, Pause, CheckCircle, Clock, DollarSign, AlertCircle, Download, Users, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const EnhancedPayrollProcessing = () => {
  const [processingStatus, setProcessingStatus] = useState("ready");
  const [selectedBatch, setSelectedBatch] = useState("december-2024");

  // Enhanced payroll steps with variable pay components
  const payrollSteps = [
    { id: 1, name: "Validate Employee Data", status: "completed", duration: "2 min", details: "Verified 158 employees" },
    { id: 2, name: "Calculate Base Salaries", status: "completed", duration: "3 min", details: "Processed fixed salaries" },
    { id: 3, name: "Process Variable Pay", status: "processing", duration: "8 min", details: "Calculating commissions & bonuses" },
    { id: 4, name: "Multi-Jurisdiction Tax Calculations", status: "pending", duration: "6 min", details: "Federal, State, Local taxes" },
    { id: 5, name: "Apply Benefits & Deductions", status: "pending", duration: "4 min", details: "Health, 401k, etc." },
    { id: 6, name: "Cost Center Allocation", status: "pending", duration: "3 min", details: "Department-wise distribution" },
    { id: 7, name: "Generate Payslips", status: "pending", duration: "5 min", details: "Individual payslip creation" },
    { id: 8, name: "Approval Workflow", status: "pending", duration: "2 min", details: "Multi-tier approval process" },
  ];

  // Batch processing data
  const payrollBatches = [
    {
      id: "december-2024",
      name: "December 2024 Payroll",
      period: "Dec 1-31, 2024",
      employees: 158,
      status: "processing",
      totalAmount: 1247500,
      variablePay: 187200,
      taxes: 312375,
      netPay: 935125,
      progress: 35
    },
    {
      id: "november-2024",
      name: "November 2024 Payroll",
      period: "Nov 1-30, 2024",
      employees: 156,
      status: "completed",
      totalAmount: 1198750,
      variablePay: 156400,
      taxes: 299625,
      netPay: 899125,
      progress: 100
    }
  ];

  // Variable pay components
  const variablePayComponents = [
    {
      department: "Sales",
      employees: 24,
      baseCommission: 45600,
      bonuses: 23400,
      incentives: 12800,
      total: 81800,
      avgPerEmployee: 3408
    },
    {
      department: "Engineering",
      employees: 45,
      baseCommission: 0,
      bonuses: 67500,
      incentives: 18900,
      total: 86400,
      avgPerEmployee: 1920
    },
    {
      department: "Marketing",
      employees: 18,
      baseCommission: 12600,
      bonuses: 15300,
      incentives: 5400,
      total: 33300,
      avgPerEmployee: 1850
    }
  ];

  // Multi-jurisdiction tax breakdown
  const taxJurisdictions = [
    { jurisdiction: "Federal", rate: 22, amount: 187200, employees: 158 },
    { jurisdiction: "California State", rate: 8.5, amount: 68250, employees: 89 },
    { jurisdiction: "New York State", rate: 6.8, amount: 34680, employees: 42 },
    { jurisdiction: "Texas", rate: 0, amount: 0, employees: 27 },
    { jurisdiction: "Local (SF)", rate: 1.5, amount: 9180, employees: 34 },
    { jurisdiction: "Local (NYC)", rate: 3.8, amount: 12065, employees: 25 }
  ];

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-orange-600 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Enhanced Payroll Processing System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="processing" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="processing">Batch Processing</TabsTrigger>
              <TabsTrigger value="variable-pay">Variable Pay</TabsTrigger>
              <TabsTrigger value="tax-calc">Tax Calculations</TabsTrigger>
              <TabsTrigger value="approval">Approval Workflow</TabsTrigger>
            </TabsList>

            <TabsContent value="processing" className="space-y-6">
              {/* Batch Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">$935,125</div>
                    <p className="text-sm text-muted-foreground">Net Payroll</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">158</div>
                    <p className="text-sm text-muted-foreground">Employees</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">35%</div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                  </CardContent>
                </Card>
              </div>

              {/* Processing Overview */}
              <div className="p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">December 2024 Payroll</h3>
                    <p className="text-muted-foreground">Pay Period: Dec 1-31, 2024 • 158 Employees</p>
                  </div>
                  <Badge variant={processingStatus === "processing" ? "default" : "secondary"}>
                    {processingStatus === "processing" ? "Processing..." : "Ready to Process"}
                  </Badge>
                </div>
                
                <Progress value={35} className="mb-3 h-3" />
                <p className="text-sm text-muted-foreground">Step 3 of 8 • Estimated completion: 22 minutes</p>
              </div>

              {/* Enhanced Processing Steps */}
              <div className="space-y-3">
                {payrollSteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    {getStepIcon(step.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${step.status === 'completed' ? 'text-green-600' : step.status === 'processing' ? 'text-orange-600' : 'text-muted-foreground'}`}>
                          {step.name}
                        </span>
                        <span className="text-sm text-muted-foreground">{step.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{step.details}</p>
                      {step.status === "processing" && (
                        <div className="mt-3">
                          <Progress value={65} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">Processing variable pay calculations...</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Processing Controls */}
              <div className="flex gap-3">
                <Button className="flex-1 gap-2" size="lg">
                  <Play className="h-4 w-4" />
                  Continue Processing
                </Button>
                <Button variant="outline" className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="variable-pay" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Variable Pay Components</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">$187,200</div>
                      <p className="text-sm text-muted-foreground">Total Variable Pay</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">87</div>
                      <p className="text-sm text-muted-foreground">Eligible Employees</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">15%</div>
                      <p className="text-sm text-muted-foreground">of Total Payroll</p>
                    </CardContent>
                  </Card>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Commissions</TableHead>
                      <TableHead>Bonuses</TableHead>
                      <TableHead>Incentives</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Avg per Employee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variablePayComponents.map((dept, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{dept.department}</TableCell>
                        <TableCell>{dept.employees}</TableCell>
                        <TableCell>${dept.baseCommission.toLocaleString()}</TableCell>
                        <TableCell>${dept.bonuses.toLocaleString()}</TableCell>
                        <TableCell>${dept.incentives.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold">${dept.total.toLocaleString()}</TableCell>
                        <TableCell>${dept.avgPerEmployee.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="tax-calc" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Multi-Jurisdiction Tax Calculations</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-red-600">$312,375</div>
                      <p className="text-sm text-muted-foreground">Total Tax Deductions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">6</div>
                      <p className="text-sm text-muted-foreground">Tax Jurisdictions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">25.0%</div>
                      <p className="text-sm text-muted-foreground">Effective Tax Rate</p>
                    </CardContent>
                  </Card>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jurisdiction</TableHead>
                      <TableHead>Tax Rate</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Tax Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxJurisdictions.map((tax, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{tax.jurisdiction}</TableCell>
                        <TableCell>{tax.rate}%</TableCell>
                        <TableCell>{tax.employees}</TableCell>
                        <TableCell>${tax.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={tax.amount > 0 ? "default" : "secondary"}>
                            {tax.amount > 0 ? "Calculated" : "Exempt"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="approval" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Multi-Tier Approval Workflow</h3>
                
                <div className="space-y-4">
                  {[
                    { level: 1, title: "HR Review", approver: "Sarah Johnson", status: "pending", amount: "$1,247,500" },
                    { level: 2, title: "Finance Review", approver: "Michael Chen", status: "waiting", amount: "$1,247,500" },
                    { level: 3, title: "Executive Approval", approver: "Emily Rodriguez", status: "waiting", amount: "$1,247,500" },
                    { level: 4, title: "Final Authorization", approver: "David Kim", status: "waiting", amount: "$1,247,500" }
                  ].map((approval, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
                        {approval.level}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{approval.title}</h4>
                        <p className="text-sm text-muted-foreground">Approver: {approval.approver}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{approval.amount}</p>
                        <Badge variant={approval.status === "pending" ? "default" : "secondary"}>
                          {approval.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Approval Required:</strong> HR review is pending for December 2024 payroll processing.
                    All calculations must be verified before proceeding to finance review.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Approve & Forward
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Request Changes
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPayrollProcessing;