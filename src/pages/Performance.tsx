import { Target, Plus, TrendingUp, Award, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Performance = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Performance Management</h1>
          <p className="text-muted-foreground">Track and manage employee performance</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Start Review
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reviews Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-green-600">+5.2% from last cycle</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2</div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Goals Achieved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76%</div>
            <p className="text-xs text-green-600">+8% from last quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Reviews pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Sarah Johnson", department: "Engineering", rating: 4.5, status: "completed" },
                { name: "Mike Chen", department: "Marketing", rating: 4.2, status: "completed" },
                { name: "Emma Davis", department: "Sales", rating: 0, status: "pending" },
                { name: "John Smith", department: "HR", rating: 4.8, status: "completed" },
              ].map((review, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{review.name}</p>
                    <p className="text-sm text-muted-foreground">{review.department}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {review.status === "completed" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{review.rating}/5.0</span>
                        <Badge variant="default">Completed</Badge>
                      </div>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goal Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Increase sales by 15%", progress: 85, deadline: "Q4 2024" },
                { title: "Complete certification", progress: 60, deadline: "Jan 2025" },
                { title: "Team leadership training", progress: 100, deadline: "Nov 2024" },
                { title: "Client satisfaction >90%", progress: 92, deadline: "Dec 2024" },
              ].map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <p className="font-medium text-sm">{goal.title}</p>
                    <span className="text-xs text-muted-foreground">{goal.deadline}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={goal.progress} className="flex-1" />
                    <span className="text-xs font-medium w-12">{goal.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-4 gap-2">
              <Calendar className="h-4 w-4" />
              View All Goals
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Performance;