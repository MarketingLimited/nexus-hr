import { DollarSign, Play, Download, Calculator, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PayrollProcessing from "@/components/payroll/PayrollProcessing";
import SalaryStructure from "@/components/payroll/SalaryStructure";
import PayslipGenerator from "@/components/payroll/PayslipGenerator";
import TaxCalculator from "@/components/payroll/TaxCalculator";

const Payroll = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payroll Management</h1>
          <p className="text-muted-foreground">Process payroll and manage compensation</p>
        </div>
        <Button className="gap-2">
          <Play className="h-4 w-4" />
          Run Payroll
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$284,520</div>
            <p className="text-xs text-green-600">+2.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Salary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,850</div>
            <p className="text-xs text-muted-foreground">Per employee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Days remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tax Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$68,285</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Payroll Management */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="salary">Salary Structure</TabsTrigger>
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
          <TabsTrigger value="taxes">Tax Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Status & History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Current Payroll Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">December 2024 Payroll</p>
                    <p className="text-sm text-muted-foreground">Processing period: Dec 1-31, 2024</p>
                  </div>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Salary calculations</span>
                    <span className="text-green-600">✓ Complete</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax calculations</span>
                    <span className="text-green-600">✓ Complete</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Overtime processing</span>
                    <span className="text-orange-600">⏳ In Progress</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Final approval</span>
                    <span className="text-muted-foreground">⏸ Pending</span>
                  </div>
                </div>

                <Button className="w-full gap-2">
                  <Play className="h-4 w-4" />
                  Continue Processing
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Payroll History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { period: "November 2024", amount: "$278,420", status: "Completed", date: "Nov 30, 2024" },
                    { period: "October 2024", amount: "$275,680", status: "Completed", date: "Oct 31, 2024" },
                    { period: "September 2024", amount: "$272,150", status: "Completed", date: "Sep 30, 2024" },
                  ].map((payroll, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{payroll.period}</p>
                        <p className="text-sm text-muted-foreground">{payroll.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{payroll.amount}</p>
                        <Badge variant="outline" className="text-xs">
                          {payroll.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mt-4 gap-2">
                  <Download className="h-4 w-4" />
                  Export Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="processing">
          <PayrollProcessing />
        </TabsContent>

        <TabsContent value="salary">
          <SalaryStructure />
        </TabsContent>

        <TabsContent value="payslips">
          <PayslipGenerator />
        </TabsContent>

        <TabsContent value="taxes">
          <TaxCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payroll;