import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, AlertCircle } from "lucide-react";

type LeaveBalanceData = {
  leaveType: string;
  totalEntitlement: number;
  used: number;
  remaining: number;
  carryOver: number;
  expiringDays: number;
  expiryDate?: string;
};

const mockLeaveBalances: LeaveBalanceData[] = [
  {
    leaveType: "Annual Leave",
    totalEntitlement: 25,
    used: 10,
    remaining: 15,
    carryOver: 5,
    expiringDays: 3,
    expiryDate: "2024-12-31"
  },
  {
    leaveType: "Sick Leave",
    totalEntitlement: 12,
    used: 3,
    remaining: 9,
    carryOver: 0,
    expiringDays: 0
  },
  {
    leaveType: "Personal Leave",
    totalEntitlement: 7,
    used: 2,
    remaining: 5,
    carryOver: 0,
    expiringDays: 0
  },
  {
    leaveType: "Study Leave",
    totalEntitlement: 5,
    used: 0,
    remaining: 5,
    carryOver: 0,
    expiringDays: 0
  },
  {
    leaveType: "Maternity Leave",
    totalEntitlement: 90,
    used: 0,
    remaining: 90,
    carryOver: 0,
    expiringDays: 0
  }
];

const getUsageColor = (used: number, total: number) => {
  const percentage = (used / total) * 100;
  if (percentage >= 80) return "text-red-600";
  if (percentage >= 60) return "text-yellow-600";
  return "text-green-600";
};

const getProgressColor = (used: number, total: number) => {
  const percentage = (used / total) * 100;
  if (percentage >= 80) return "bg-red-500";
  if (percentage >= 60) return "bg-yellow-500";
  return "bg-green-500";
};

export const LeaveBalance = () => {
  const totalAnnualUsed = mockLeaveBalances.find(b => b.leaveType === "Annual Leave")?.used || 0;
  const totalAnnualEntitlement = mockLeaveBalances.find(b => b.leaveType === "Annual Leave")?.totalEntitlement || 0;
  const totalRemaining = mockLeaveBalances.reduce((sum, balance) => sum + balance.remaining, 0);
  const expiringDays = mockLeaveBalances.reduce((sum, balance) => sum + balance.expiringDays, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Total Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRemaining}</div>
            <p className="text-xs text-muted-foreground">Days available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Annual Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUsageColor(totalAnnualUsed, totalAnnualEntitlement)}`}>
              {totalAnnualUsed}/{totalAnnualEntitlement}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((totalAnnualUsed / totalAnnualEntitlement) * 100)}% utilized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Carry Over
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">5</div>
            <p className="text-xs text-muted-foreground">From previous year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{expiringDays}</div>
            <p className="text-xs text-muted-foreground">Days by Dec 31</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockLeaveBalances.map((balance, index) => {
          const usagePercentage = (balance.used / balance.totalEntitlement) * 100;
          
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{balance.leaveType}</CardTitle>
                  {balance.expiringDays > 0 && (
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {balance.expiringDays} expiring
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage</span>
                  <span className={`font-medium ${getUsageColor(balance.used, balance.totalEntitlement)}`}>
                    {balance.used}/{balance.totalEntitlement} days
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Progress 
                    value={usagePercentage} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round(usagePercentage)}% used</span>
                    <span>{balance.remaining} remaining</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Entitlement</p>
                    <p className="font-medium">{balance.totalEntitlement} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Used</p>
                    <p className="font-medium">{balance.used} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="font-medium text-green-600">{balance.remaining} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Carry Over</p>
                    <p className="font-medium text-blue-600">{balance.carryOver} days</p>
                  </div>
                </div>

                {balance.expiryDate && balance.expiringDays > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-600">
                        {balance.expiringDays} days expire on {balance.expiryDate}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leave Policy Information */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Policy Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Annual Leave</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 25 days per year</li>
                <li>• Maximum 5 days carry-over</li>
                <li>• Expires on December 31st</li>
                <li>• Requires 2 weeks advance notice</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Sick Leave</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 12 days per year</li>
                <li>• No carry-over allowed</li>
                <li>• Medical certificate required for 3+ days</li>
                <li>• Can be taken with short notice</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Personal Leave</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 7 days per year</li>
                <li>• No carry-over allowed</li>
                <li>• Requires manager approval</li>
                <li>• Subject to business needs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Study Leave</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 5 days per year</li>
                <li>• For approved courses only</li>
                <li>• Requires documentation</li>
                <li>• May require repayment if leaving</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};