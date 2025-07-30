import { Star, Target, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerformanceReviews from "@/components/performance/PerformanceReviews";
import GoalTracking from "@/components/performance/GoalTracking";
import FeedbackSystem from "@/components/performance/FeedbackSystem";
import PerformanceAnalytics from "@/components/performance/PerformanceAnalytics";
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
          <Star className="h-4 w-4" />
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

      {/* Enhanced Performance Management */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Overview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Recent Performance Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Sarah Johnson", rating: 4.5, status: "Completed", date: "Dec 15, 2024" },
                  { name: "Michael Chen", rating: null, status: "In Progress", date: "Due Dec 20, 2024" },
                  { name: "Emily Rodriguez", rating: null, status: "Pending", date: "Due Dec 25, 2024" }
                ].map((review, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{review.name}</p>
                      <p className="text-sm text-muted-foreground">{review.date}</p>
                    </div>
                    <div className="text-right">
                      {review.rating && (
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{review.rating}</span>
                        </div>
                      )}
                      <Badge variant={review.status === "Completed" ? "default" : "secondary"}>
                        {review.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Goal Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Complete Project Alpha", employee: "Sarah Johnson", progress: 85, status: "On Track" },
                  { title: "Increase Brand Awareness", employee: "Michael Chen", progress: 60, status: "At Risk" },
                  { title: "Team Training Program", employee: "Emily Rodriguez", progress: 90, status: "Ahead" }
                ].map((goal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{goal.title}</p>
                        <p className="text-xs text-muted-foreground">{goal.employee}</p>
                      </div>
                      <Badge variant={
                        goal.status === "On Track" ? "default" :
                        goal.status === "Ahead" ? "default" : "secondary"
                      }>
                        {goal.status}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">{goal.progress}% Complete</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex-col gap-2">
                  <Star className="h-6 w-6" />
                  <span>Create Review</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Target className="h-6 w-6" />
                  <span>Set Goals</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span>360° Feedback</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <PerformanceReviews />
        </TabsContent>

        <TabsContent value="goals">
          <GoalTracking />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackSystem />
        </TabsContent>

        <TabsContent value="analytics">
          <PerformanceAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Performance;