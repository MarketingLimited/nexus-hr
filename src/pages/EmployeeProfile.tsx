import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useEmployees } from "@/hooks/useEmployees";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, Building, User, Award, Star, Target, FileText, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePerformanceReviews, useGoals, useFeedback } from "@/hooks/usePerformance";
import { useDocuments } from "@/hooks/useDocuments";
import type { Employee, PerformanceReview, Goal, Feedback, Document } from "@/types";

const EmployeeProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { data: employeesData, isLoading, error } = useEmployees();

  // Fetch performance and document data
  const { data: reviewsData, isLoading: reviewsLoading } = usePerformanceReviews();
  const { data: goalsData, isLoading: goalsLoading } = useGoals();
  const { data: feedbackData, isLoading: feedbackLoading } = useFeedback();
  const { data: documentsData, isLoading: documentsLoading } = useDocuments({ createdBy: id });

  // Filter data for this specific employee
  const employeeReviews: PerformanceReview[] = reviewsData?.data?.filter(
    (review: PerformanceReview) => review.employeeId === id
  ) || [];
  const employeeGoals: Goal[] = goalsData?.data?.filter(
    (goal: Goal) => goal.employeeId === id
  ) || [];
  const employeeFeedback: Feedback[] = feedbackData?.data?.filter(
    (feedback: Feedback) => feedback.toEmployeeId === id
  ) || [];
  const employeeDocuments: Document[] = documentsData?.data || [];

  const employee: Employee = employeesData?.data?.find(
    (emp: Employee) => emp.id === id
  ) || {
    id: id || "1",
    employeeId: id || "EMP001",
    firstName: "Employee",
    lastName: "Not Found",
    email: "N/A",
    phone: "N/A",
    position: "N/A",
    department: "N/A",
    location: "N/A",
    hireDate: new Date().toISOString().split('T')[0],
    status: "INACTIVE" as const,
    avatar: "/api/placeholder/150/150",
    manager: "N/A",
    salary: 0,
    skills: [],
    notes: "Employee information not available.",
    userId: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading employee profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-destructive">Error loading employee profile</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/employees">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Profile</h1>
            <p className="text-muted-foreground">View and manage employee information</p>
          </div>
        </div>
        <Button className="gap-2" asChild>
          <Link to={`/employees/${id}/edit`}>
            <Edit className="h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
              <AvatarFallback className="text-2xl">
                {employee.firstName[0]}{employee.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h2>
                <p className="text-lg text-muted-foreground">{employee.position}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                    {employee.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">ID: {employee.employeeId}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.location}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                    <p className="text-sm">{employee.employeeId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                    <p className="text-sm">{new Date(employee.hireDate || employee.joinDate || new Date()).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Manager</label>
                    <p className="text-sm">{employee.manager}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge variant={employee.status === "active" ? "default" : "secondary"} className="text-xs">
                      {employee.status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bio</label>
                  <p className="text-sm mt-1">{employee.notes || employee.bio || 'No bio available'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Position</label>
                  <p className="text-sm">{employee.position}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-sm">{employee.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Salary</label>
                  <p className="text-sm">{employee.salary}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Employment Type</label>
                  <p className="text-sm">Full-time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {reviewsLoading || goalsLoading || feedbackLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              {/* Performance Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Performance Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {employeeReviews.length === 0 ? (
                    <p className="text-muted-foreground">No performance reviews yet</p>
                  ) : (
                    <div className="space-y-4">
                      {employeeReviews.slice(0, 5).map((review: PerformanceReview) => (
                        <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{review.type} Review</p>
                              <Badge variant={
                                review.status === 'completed' ? 'default' :
                                review.status === 'in_progress' ? 'secondary' : 'outline'
                              }>
                                {review.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Period: {review.period}</p>
                            {review.overallRating && (
                              <div className="flex items-center gap-2 mt-2">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">Rating: {review.overallRating}/5.0</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {new Date(review.reviewDate || review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Active Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {employeeGoals.length === 0 ? (
                    <p className="text-muted-foreground">No active goals</p>
                  ) : (
                    <div className="space-y-4">
                      {employeeGoals.slice(0, 5).map((goal: Goal) => (
                        <div key={goal.id} className="space-y-2 p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">{goal.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={
                                  goal.priority === 'critical' ? 'destructive' :
                                  goal.priority === 'high' ? 'default' : 'secondary'
                                }>
                                  {goal.priority}
                                </Badge>
                                <Badge variant="outline">{goal.category}</Badge>
                              </div>
                            </div>
                            <Badge variant={
                              goal.status === 'completed' ? 'default' :
                              goal.status === 'overdue' ? 'destructive' : 'secondary'
                            }>
                              {goal.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Target: {new Date(goal.targetDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  {employeeFeedback.length === 0 ? (
                    <p className="text-muted-foreground">No feedback received yet</p>
                  ) : (
                    <div className="space-y-4">
                      {employeeFeedback.slice(0, 5).map((feedback: Feedback) => (
                        <div key={feedback.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{feedback.type}</Badge>
                              <Badge variant="outline">{feedback.category}</Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{feedback.rating}/5</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{feedback.comments}</p>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>{feedback.anonymous ? 'Anonymous' : 'From colleague'}</span>
                            <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Employee Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : employeeDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No documents found for this employee</p>
                  <Button className="mt-4">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeDocuments.map((doc: Document) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{doc.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.type || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{doc.category || 'General'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeProfile;