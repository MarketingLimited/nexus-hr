import { TrendingUp, Users, Target, Award, BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell } from "recharts";

const PerformanceAnalytics = () => {
  const performanceTrends = [
    { month: "Jan", avgRating: 3.8, completed: 12, inProgress: 8 },
    { month: "Feb", avgRating: 4.0, completed: 15, inProgress: 6 },
    { month: "Mar", avgRating: 4.1, completed: 18, inProgress: 7 },
    { month: "Apr", avgRating: 4.2, completed: 20, inProgress: 5 },
    { month: "May", avgRating: 4.0, completed: 17, inProgress: 9 },
    { month: "Jun", avgRating: 4.3, completed: 22, inProgress: 4 },
    { month: "Jul", avgRating: 4.4, completed: 25, inProgress: 3 },
    { month: "Aug", avgRating: 4.2, completed: 23, inProgress: 6 },
    { month: "Sep", avgRating: 4.5, completed: 28, inProgress: 2 },
    { month: "Oct", avgRating: 4.3, completed: 26, inProgress: 5 },
    { month: "Nov", avgRating: 4.4, completed: 24, inProgress: 4 },
    { month: "Dec", avgRating: 4.5, completed: 30, inProgress: 3 }
  ];

  const departmentPerformance = [
    { department: "Engineering", avgRating: 4.5, employees: 25, reviews: 45 },
    { department: "Marketing", avgRating: 4.2, employees: 12, reviews: 22 },
    { department: "Sales", avgRating: 4.3, employees: 18, reviews: 32 },
    { department: "HR", avgRating: 4.1, employees: 8, reviews: 15 },
    { department: "Finance", avgRating: 4.4, employees: 10, reviews: 18 }
  ];

  const goalCompletionData = [
    { name: "Completed", value: 65, color: "#22c55e" },
    { name: "In Progress", value: 25, color: "#f59e0b" },
    { name: "Overdue", value: 10, color: "#ef4444" }
  ];

  const topPerformers = [
    { name: "Sarah Johnson", department: "Engineering", rating: 4.8, goals: 12, completed: 11 },
    { name: "Michael Chen", department: "Marketing", rating: 4.6, goals: 8, completed: 7 },
    { name: "David Kim", department: "Finance", rating: 4.5, goals: 10, completed: 9 },
    { name: "Emily Rodriguez", department: "HR", rating: 4.4, goals: 6, completed: 6 },
    { name: "Lisa Wang", department: "Engineering", rating: 4.3, goals: 9, completed: 8 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Performance Analytics Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">4.3</div>
                  <p className="text-sm text-muted-foreground">Avg Performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-sm text-muted-foreground">Review Completion</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-sm text-muted-foreground">Goal Achievement</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-sm text-muted-foreground">Top Performers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[3.5, 5]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="avgRating" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Average Rating"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Goal Completion Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Goal Completion Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={goalCompletionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {goalCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Department Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={departmentPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgRating" fill="#8884d8" name="Average Rating" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{performer.name}</p>
                      <p className="text-sm text-muted-foreground">{performer.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-lg font-bold">{performer.rating}</div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{performer.completed}/{performer.goals}</div>
                      <p className="text-xs text-muted-foreground">Goals</p>
                    </div>
                    <div className="min-w-24">
                      <Progress value={(performer.completed / performer.goals) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        {Math.round((performer.completed / performer.goals) * 100)}%
                      </p>
                    </div>
                    <Badge variant="default">
                      Top {index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-green-50">
                <h4 className="font-semibold text-green-800 mb-2">Positive Trends</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Overall performance ratings increased by 8% this quarter</li>
                  <li>• Goal completion rate improved to 78%</li>
                  <li>• Engineering department leads with 4.5 average rating</li>
                  <li>• 360-degree feedback participation increased by 15%</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg bg-orange-50">
                <h4 className="font-semibold text-orange-800 mb-2">Areas for Improvement</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• 10% of goals are currently overdue</li>
                  <li>• Review completion rate could be improved in Sales</li>
                  <li>• Need to focus on leadership development programs</li>
                  <li>• Increase frequency of peer feedback sessions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default PerformanceAnalytics;