import { BarChart3, Download, Filter, Calendar, TrendingUp, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Reports = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive HR insights and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-employees" />
              Employee Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Headcount, turnover, demographics, and workforce analytics
            </p>
            <ul className="text-sm space-y-1">
              <li>• Headcount by department</li>
              <li>• Employee turnover rate</li>
              <li>• Demographics breakdown</li>
              <li>• New hire reports</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-leaves" />
              Leave & Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Leave usage, attendance patterns, and time-off analytics
            </p>
            <ul className="text-sm space-y-1">
              <li>• Leave utilization rates</li>
              <li>• Attendance patterns</li>
              <li>• Overtime analysis</li>
              <li>• Absenteeism trends</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-payroll" />
              Payroll & Compensation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Salary analysis, cost centers, and compensation insights
            </p>
            <ul className="text-sm space-y-1">
              <li>• Payroll summaries</li>
              <li>• Salary benchmarking</li>
              <li>• Cost center analysis</li>
              <li>• Benefits utilization</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quick Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Monthly Headcount",
                description: "Employee count by month",
                lastGenerated: "2 hours ago",
                type: "employee"
              },
              {
                title: "Leave Summary",
                description: "Leave requests and balances",
                lastGenerated: "1 day ago",
                type: "leave"
              },
              {
                title: "Payroll Report",
                description: "Monthly payroll breakdown",
                lastGenerated: "3 days ago",
                type: "payroll"
              },
              {
                title: "Performance Metrics",
                description: "Review completion rates",
                lastGenerated: "1 week ago",
                type: "performance"
              },
              {
                title: "Attendance Report",
                description: "Daily attendance summary",
                lastGenerated: "5 hours ago",
                type: "attendance"
              },
              {
                title: "Turnover Analysis",
                description: "Employee retention metrics",
                lastGenerated: "2 weeks ago",
                type: "turnover"
              }
            ].map((report, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div>
                  <h3 className="font-medium">{report.title}</h3>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Last: {report.lastGenerated}
                  </span>
                  <Button size="sm" variant="outline">
                    Generate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Report Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Custom Report Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
                <SelectItem value="payroll">Payroll</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
              </SelectContent>
            </Select>

            <Button className="w-full">
              Generate Report
            </Button>
          </div>

          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Configure your report parameters above and click "Generate Report" to create custom analytics
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;