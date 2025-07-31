import { useState } from "react";
import { TrendingUp, Users, AlertTriangle, Brain, Target, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const PredictiveAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("12-months");

  // Turnover prediction data
  const turnoverPredictions = [
    {
      employee: "Alex Chen",
      department: "Engineering",
      riskScore: 85,
      riskLevel: "High",
      factors: ["Salary below market", "Limited growth opportunities", "High workload"],
      probability: "78%",
      timeframe: "Next 3 months",
      retentionActions: ["Salary review", "Career planning", "Workload adjustment"]
    },
    {
      employee: "Maria Rodriguez",
      department: "Marketing",
      riskScore: 65,
      riskLevel: "Medium",
      factors: ["Low engagement scores", "Lack of recognition"],
      probability: "45%",
      timeframe: "Next 6 months",
      retentionActions: ["Recognition program", "Engagement initiatives"]
    },
    {
      employee: "David Kim",
      department: "Sales",
      riskScore: 45,
      riskLevel: "Low",
      factors: ["Remote work preference"],
      probability: "25%",
      timeframe: "Next 12 months",
      retentionActions: ["Flexible work arrangements"]
    }
  ];

  // Performance trend predictions
  const performanceTrends = [
    { month: "Jan", actual: 4.2, predicted: 4.3 },
    { month: "Feb", actual: 4.1, predicted: 4.2 },
    { month: "Mar", actual: 4.3, predicted: 4.4 },
    { month: "Apr", actual: 4.2, predicted: 4.3 },
    { month: "May", actual: 4.4, predicted: 4.5 },
    { month: "Jun", actual: 4.3, predicted: 4.4 },
    { month: "Jul", actual: null, predicted: 4.5 },
    { month: "Aug", actual: null, predicted: 4.6 },
    { month: "Sep", actual: null, predicted: 4.5 },
    { month: "Oct", actual: null, predicted: 4.7 },
    { month: "Nov", actual: null, predicted: 4.6 },
    { month: "Dec", actual: null, predicted: 4.8 }
  ];

  // Workforce planning predictions
  const workforcePredictions = [
    { department: "Engineering", current: 45, predicted: 52, growth: "+15.6%", timeline: "Q2 2025" },
    { department: "Sales", current: 28, predicted: 35, growth: "+25.0%", timeline: "Q3 2025" },
    { department: "Marketing", current: 18, predicted: 22, growth: "+22.2%", timeline: "Q2 2025" },
    { department: "HR", current: 12, predicted: 14, growth: "+16.7%", timeline: "Q4 2025" },
    { department: "Finance", current: 15, predicted: 17, growth: "+13.3%", timeline: "Q3 2025" }
  ];

  // Skill gap predictions
  const skillGapPredictions = [
    { skill: "AI/Machine Learning", currentGap: 65, projectedGap: 78, demand: "High", urgency: "Critical" },
    { skill: "Cloud Architecture", currentGap: 45, projectedGap: 52, demand: "High", urgency: "High" },
    { skill: "Data Analytics", currentGap: 38, projectedGap: 41, demand: "Medium", urgency: "Medium" },
    { skill: "Cybersecurity", currentGap: 42, projectedGap: 58, demand: "High", urgency: "Critical" },
    { skill: "Digital Marketing", currentGap: 28, projectedGap: 35, demand: "Medium", urgency: "Low" }
  ];

  // Executive KPI predictions
  const executiveKPIs = [
    { metric: "Employee Satisfaction", current: 4.2, target: 4.5, predicted: 4.3, trend: "stable" },
    { metric: "Turnover Rate", current: 12.5, target: 10.0, predicted: 11.8, trend: "improving" },
    { metric: "Time to Hire", current: 28, target: 21, predicted: 25, trend: "improving" },
    { metric: "Training ROI", current: 285, target: 320, predicted: 310, trend: "improving" },
    { metric: "Engagement Score", current: 78, target: 85, predicted: 82, trend: "improving" }
  ];

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "default";
      default: return "outline";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declining":
        return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Predictive Analytics & Executive Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="turnover-prediction" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="turnover-prediction">Turnover Prediction</TabsTrigger>
              <TabsTrigger value="performance-trends">Performance Trends</TabsTrigger>
              <TabsTrigger value="workforce-planning">Workforce Planning</TabsTrigger>
              <TabsTrigger value="executive-dashboard">Executive Dashboard</TabsTrigger>
            </TabsList>

            <TabsContent value="turnover-prediction" className="space-y-6">
              {/* Turnover Risk Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">24</div>
                    <p className="text-sm text-muted-foreground">High Risk Employees</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">18</div>
                    <p className="text-sm text-muted-foreground">Medium Risk</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">$890K</div>
                    <p className="text-sm text-muted-foreground">Predicted Cost Impact</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">87%</div>
                    <p className="text-sm text-muted-foreground">Prediction Accuracy</p>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Alert */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>High Priority Alert:</strong> 3 senior engineers are at high risk of leaving in the next quarter. 
                  Immediate retention actions recommended.
                </AlertDescription>
              </Alert>

              {/* Turnover Risk Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Employee Turnover Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Probability</TableHead>
                        <TableHead>Timeframe</TableHead>
                        <TableHead>Key Factors</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {turnoverPredictions.map((prediction, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{prediction.employee}</TableCell>
                          <TableCell>{prediction.department}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={prediction.riskScore} className="w-16 h-2" />
                              <Badge variant={getRiskBadgeVariant(prediction.riskLevel)}>
                                {prediction.riskLevel}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{prediction.probability}</TableCell>
                          <TableCell>{prediction.timeframe}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {prediction.factors.slice(0, 2).map((factor, idx) => (
                                <div key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                                  {factor}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">View Plan</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance-trends" className="space-y-6">
              {/* Performance Prediction Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trend Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[3.8, 5.0]} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#2563eb" 
                          strokeWidth={2}
                          name="Actual Performance"
                          connectNulls={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="predicted" 
                          stroke="#dc2626" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Predicted Performance"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Skill Gap Predictions */}
              <Card>
                <CardHeader>
                  <CardTitle>Future Skill Gap Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Skill Area</TableHead>
                        <TableHead>Current Gap</TableHead>
                        <TableHead>Projected Gap (2025)</TableHead>
                        <TableHead>Market Demand</TableHead>
                        <TableHead>Urgency</TableHead>
                        <TableHead>Action Required</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {skillGapPredictions.map((skill, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{skill.skill}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={skill.currentGap} className="w-16 h-2" />
                              <span className="text-sm">{skill.currentGap}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={skill.projectedGap} className="w-16 h-2" />
                              <span className="text-sm">{skill.projectedGap}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={skill.demand === "High" ? "destructive" : skill.demand === "Medium" ? "secondary" : "default"}>
                              {skill.demand}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={skill.urgency === "Critical" ? "destructive" : skill.urgency === "High" ? "secondary" : "default"}>
                              {skill.urgency}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">Plan Training</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workforce-planning" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workforce Growth Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Department Growth Forecast</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Department</TableHead>
                            <TableHead>Current</TableHead>
                            <TableHead>Predicted</TableHead>
                            <TableHead>Growth</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workforcePredictions.map((dept, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{dept.department}</TableCell>
                              <TableCell>{dept.current}</TableCell>
                              <TableCell>{dept.predicted}</TableCell>
                              <TableCell>
                                <Badge variant="default">{dept.growth}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Hiring Timeline Recommendations</h4>
                      <div className="space-y-3">
                        {workforcePredictions.map((dept, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{dept.department}</span>
                              <Badge variant="outline">{dept.timeline}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Hire {dept.predicted - dept.current} additional team members
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="executive-dashboard" className="space-y-6">
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {executiveKPIs.map((kpi, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{kpi.metric}</h4>
                        {getTrendIcon(kpi.trend)}
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold">{kpi.current}</div>
                        <div className="text-xs text-muted-foreground">
                          Target: {kpi.target} | Predicted: {kpi.predicted}
                        </div>
                        <Progress 
                          value={(kpi.current / kpi.target) * 100} 
                          className="h-2" 
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Real-time Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Real-time Executive Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Critical Actions Required</h4>
                      <div className="space-y-3">
                        <div className="p-3 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20">
                          <h5 className="font-medium text-red-700">High Turnover Risk</h5>
                          <p className="text-sm text-red-600">3 senior engineers may leave Q1 2025</p>
                        </div>
                        <div className="p-3 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                          <h5 className="font-medium text-orange-700">Skill Gap Alert</h5>
                          <p className="text-sm text-orange-600">AI/ML skills shortage critical by Q2</p>
                        </div>
                        <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                          <h5 className="font-medium text-blue-700">Hiring Opportunity</h5>
                          <p className="text-sm text-blue-600">Market conditions favor Q1 hiring</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Performance Recommendations</h4>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium">Investment Priority</h5>
                          <p className="text-sm text-muted-foreground">
                            Focus training budget on AI/ML and cloud skills
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium">Retention Strategy</h5>
                          <p className="text-sm text-muted-foreground">
                            Implement flexible work arrangements in Engineering
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium">Growth Planning</h5>
                          <p className="text-sm text-muted-foreground">
                            Accelerate Sales team expansion by one quarter
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button className="gap-2">
                      <Download className="h-4 w-4" />
                      Export Executive Report
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Detailed Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveAnalytics;