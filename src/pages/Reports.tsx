import { useState } from "react";
import { BarChart3, Download, Filter, Calendar, TrendingUp, Users, DollarSign, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CrossModuleInsights from "@/components/analytics/CrossModuleInsights";
import AdvancedReporting from "@/components/analytics/AdvancedReporting";
import { useComprehensiveAnalytics, usePredictiveAnalytics } from "@/hooks/useAnalytics";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const analytics = useComprehensiveAnalytics();
  const { data: predictions } = usePredictiveAnalytics();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Advanced HR insights and cross-module analytics</p>
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

      {/* Enhanced Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Zap className="h-4 w-4" />
            Cross-Module Insights
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Advanced Reports
          </TabsTrigger>
          <TabsTrigger value="predictions" className="gap-2">
            <Target className="h-4 w-4" />
            Predictions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Report Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                  <li>• Performance correlations</li>
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
                  Leave patterns, productivity impact, and predictive insights
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Leave utilization rates</li>
                  <li>• Productivity correlations</li>
                  <li>• Seasonal trend analysis</li>
                  <li>• Future demand forecasts</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-payroll" />
                  Payroll & Retention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Compensation analysis, retention correlation, and cost projections
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Salary benchmarking</li>
                  <li>• Retention correlation</li>
                  <li>• Cost trend analysis</li>
                  <li>• Turnover risk factors</li>
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
                    title: "Monthly Dashboard",
                    description: "Complete monthly overview",
                    lastGenerated: "2 hours ago",
                    type: "comprehensive"
                  },
                  {
                    title: "Turnover Risk Analysis",
                    description: "AI-powered risk assessment",
                    lastGenerated: "1 day ago",
                    type: "predictive"
                  },
                  {
                    title: "Cross-Module Insights",
                    description: "Correlation analysis",
                    lastGenerated: "3 hours ago",
                    type: "insights"
                  },
                  {
                    title: "Performance Metrics",
                    description: "Review completion rates",
                    lastGenerated: "1 week ago",
                    type: "performance"
                  },
                  {
                    title: "Cost Projections",
                    description: "12-month forecasts",
                    lastGenerated: "5 hours ago",
                    type: "financial"
                  },
                  {
                    title: "Compliance Summary",
                    description: "Regulatory compliance status",
                    lastGenerated: "2 days ago",
                    type: "compliance"
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
        </TabsContent>

        <TabsContent value="insights">
          <CrossModuleInsights />
        </TabsContent>

        <TabsContent value="reports">
          <AdvancedReporting />
        </TabsContent>

        <TabsContent value="predictions">
          {predictions && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Turnover Risk */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-destructive" />
                    Turnover Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictions.turnoverRisk.slice(0, 5).map((risk, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Employee #{risk.employeeId.slice(-4)}</span>
                          <span className="text-sm font-bold text-destructive">
                            {(risk.risk * 100).toFixed(0)}% Risk
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {risk.factors.join(' • ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Leave Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-leaves" />
                    Leave Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictions.leavePatterns.slice(0, 6).map((pattern, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm">{pattern.period}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">{pattern.expectedRequests} requests</div>
                          <div className="text-xs text-muted-foreground">
                            {(pattern.confidence * 100).toFixed(0)}% confidence
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cost Projections */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-payroll" />
                    Cost Projections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictions.costProjections.slice(0, 6).map((projection, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm">{projection.month}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            ${(projection.projectedCost / 1000).toFixed(0)}k
                          </div>
                          <div className={`text-xs ${projection.variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {projection.variance >= 0 ? '+' : ''}{(projection.variance * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;