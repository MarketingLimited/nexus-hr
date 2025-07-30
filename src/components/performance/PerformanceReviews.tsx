import { useState } from "react";
import { Plus, Edit, Eye, Calendar, User, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PerformanceReviews = () => {
  const [selectedReview, setSelectedReview] = useState(null);

  const reviewData = [
    {
      id: 1,
      employeeId: "EMP001",
      employeeName: "Sarah Johnson",
      department: "Engineering",
      position: "Senior Developer",
      reviewPeriod: "Q4 2024",
      reviewType: "Quarterly",
      status: "Completed",
      overallRating: 4.5,
      completedDate: "2024-12-15",
      reviewer: "John Smith",
      goals: [
        { title: "Complete Project Alpha", progress: 100, status: "Completed" },
        { title: "Mentor Junior Developers", progress: 85, status: "In Progress" },
        { title: "Learn New Framework", progress: 90, status: "In Progress" }
      ],
      ratings: {
        technical: 5,
        communication: 4,
        leadership: 4,
        teamwork: 5,
        innovation: 4
      }
    },
    {
      id: 2,
      employeeId: "EMP002",
      employeeName: "Michael Chen",
      department: "Marketing",
      position: "Marketing Manager", 
      reviewPeriod: "Q4 2024",
      reviewType: "Quarterly",
      status: "In Progress",
      overallRating: null,
      completedDate: null,
      reviewer: "Jane Doe",
      goals: [
        { title: "Increase Brand Awareness", progress: 75, status: "In Progress" },
        { title: "Launch Campaign", progress: 60, status: "In Progress" },
        { title: "Team Training", progress: 100, status: "Completed" }
      ],
      ratings: null
    },
    {
      id: 3,
      employeeId: "EMP003",
      employeeName: "Emily Rodriguez",
      department: "HR",
      position: "HR Specialist",
      reviewPeriod: "Q4 2024", 
      reviewType: "Quarterly",
      status: "Pending",
      overallRating: null,
      completedDate: null,
      reviewer: "David Wilson",
      goals: [
        { title: "Improve Recruitment Process", progress: 50, status: "In Progress" },
        { title: "Employee Satisfaction Survey", progress: 80, status: "In Progress" }
      ],
      ratings: null
    }
  ];

  const ReviewDetailsModal = ({ review }) => {
    if (!review) return null;

    return (
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Performance Review - {review.employeeName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Review Header */}
          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <h3 className="font-semibold mb-2">Review Information</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Employee:</span> {review.employeeName}</p>
                <p><span className="font-medium">Position:</span> {review.position}</p>
                <p><span className="font-medium">Department:</span> {review.department}</p>
                <p><span className="font-medium">Review Period:</span> {review.reviewPeriod}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Review Status</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Status:</span> 
                  <Badge className="ml-2" variant={review.status === "Completed" ? "default" : "secondary"}>
                    {review.status}
                  </Badge>
                </p>
                <p><span className="font-medium">Reviewer:</span> {review.reviewer}</p>
                {review.overallRating && (
                  <p><span className="font-medium">Overall Rating:</span> 
                    <span className="ml-2 font-bold text-yellow-600">{review.overallRating}/5 ⭐</span>
                  </p>
                )}
                {review.completedDate && (
                  <p><span className="font-medium">Completed:</span> {review.completedDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Goals Progress */}
          <div>
            <h3 className="font-semibold mb-3">Goals & Objectives</h3>
            <div className="space-y-3">
              {review.goals.map((goal, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{goal.title}</span>
                    <Badge variant={goal.status === "Completed" ? "default" : "secondary"}>
                      {goal.status}
                    </Badge>
                  </div>
                  <Progress value={goal.progress} className="mb-2" />
                  <p className="text-sm text-muted-foreground">{goal.progress}% Complete</p>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Ratings */}
          {review.ratings && (
            <div>
              <h3 className="font-semibold mb-3">Performance Ratings</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(review.ratings).map(([category, rating]) => (
                  <div key={category} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{category}</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold">{rating as number}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                    <Progress value={(rating as number) * 20} className="mt-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div>
            <h3 className="font-semibold mb-3">Review Comments</h3>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Manager Feedback</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {review.status === "Completed" 
                    ? "Excellent performance this quarter. Shows strong technical skills and leadership potential. Continue mentoring junior team members."
                    : "Review in progress..."
                  }
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Employee Self-Assessment</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {review.status === "Completed"
                    ? "Proud of the progress made on key projects. Looking forward to taking on more leadership responsibilities."
                    : "Self-assessment pending..."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div>
            <h3 className="font-semibold mb-3">Development Action Items</h3>
            <div className="space-y-2">
              {[
                "Attend advanced leadership training",
                "Lead cross-functional project initiative", 
                "Mentor 2 junior developers",
                "Complete technical certification"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Performance Reviews
          </CardTitle>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Review
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Review Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">12</div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">8</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">3</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">4.2</div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Review Period</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewData.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{review.employeeName}</p>
                      <p className="text-sm text-muted-foreground">{review.employeeId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{review.department}</TableCell>
                  <TableCell>{review.reviewPeriod}</TableCell>
                  <TableCell>{review.reviewType}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress 
                        value={review.status === "Completed" ? 100 : review.status === "In Progress" ? 60 : 0} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {review.status === "Completed" ? "100%" : review.status === "In Progress" ? "60%" : "0%"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {review.overallRating ? (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{review.overallRating}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Pending</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      review.status === "Completed" ? "default" : 
                      review.status === "In Progress" ? "secondary" : "outline"
                    }>
                      {review.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => setSelectedReview(review)}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        </DialogTrigger>
                        <ReviewDetailsModal review={selectedReview} />
                      </Dialog>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceReviews;