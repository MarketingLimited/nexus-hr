import { DollarSign, Play, Download, Calculator, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import PayrollProcessing from "@/components/payroll/PayrollProcessing";
import SalaryStructure from "@/components/payroll/SalaryStructure";
import PayslipGenerator from "@/components/payroll/PayslipGenerator";
import TaxCalculator from "@/components/payroll/TaxCalculator";
import { usePayrollStats, usePayrollHistory, usePayrollStatus } from "@/hooks/usePayroll";

const Payroll = () => {
  // API hooks
  const { data: stats, isLoading: statsLoading } = usePayrollStats();
  const { data: status, isLoading: statusLoading } = usePayrollStatus();
  const { data: history, isLoading: historyLoading } = usePayrollHistory({ limit: 3 });
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
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">${stats?.monthlyTotal?.toLocaleString() || 0}</div>
            )}
            <p className="text-xs text-green-600">+{stats?.monthlyGrowth || 0}% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Salary</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">${stats?.avgSalary?.toLocaleString() || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Per employee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats?.daysToNext || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Days remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tax Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">${stats?.taxDeductions?.toLocaleString() || 0}</div>
            )}
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
                {statusLoading ? (
                  <>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-4 w-56" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="space-y-3">
                      {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{status?.currentPeriod || 'December 2024 Payroll'}</p>
                        <p className="text-sm text-muted-foreground">Processing period: {status?.processingPeriod || 'Dec 1-31, 2024'}</p>
                      </div>
                      <Badge variant={status?.status === 'completed' ? 'default' : 'secondary'}>
                        {status?.status || 'In Progress'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {status?.steps?.map((step: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{step.name}</span>
                          <span className={
                            step.status === 'completed' ? 'text-green-600' :
                            step.status === 'in-progress' ? 'text-orange-600' :
                            'text-muted-foreground'
                          }>
                            {step.status === 'completed' ? '✓ Complete' :
                             step.status === 'in-progress' ? '⏳ In Progress' :
                             '⏸ Pending'}
                          </span>
                        </div>
                      )) || (
                        <>
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
                        </>
                      )}
                    </div>
                  </>
                )}

                <Button className="w-full gap-2" disabled={statusLoading}>
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
                  {historyLoading ? (
                    Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="text-right">
                          <Skeleton className="h-5 w-20 mb-1" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    ))
                  ) : (
                    history?.data?.map((payroll: any) => (
                      <div key={payroll.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{payroll.period}</p>
                          <p className="text-sm text-muted-foreground">{new Date(payroll.processedDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${payroll.totalAmount?.toLocaleString()}</p>
                          <Badge variant="outline" className="text-xs">
                            {payroll.status}
                          </Badge>
                        </div>
                      </div>
                    )) || []
                  )}
                </div>
                
                <Button variant="outline" className="w-full mt-4 gap-2" disabled={historyLoading}>
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