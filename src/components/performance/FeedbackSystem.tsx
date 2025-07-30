import { useState } from "react";
import { Users, MessageSquare, Plus, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const FeedbackSystem = () => {
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const feedbackData = [
    {
      id: 1,
      type: "360-degree",
      employee: "Sarah Johnson",
      position: "Senior Developer",
      department: "Engineering",
      status: "Active",
      startDate: "2024-12-01",
      endDate: "2024-12-15",
      completionRate: 75,
      feedbackProviders: [
        { name: "John Smith", role: "Manager", status: "Completed", rating: 4.5 },
        { name: "Mike Wilson", role: "Peer", status: "Completed", rating: 4.2 },
        { name: "Lisa Chen", role: "Peer", status: "Pending", rating: null },
        { name: "Tom Brown", role: "Direct Report", status: "Completed", rating: 4.8 },
        { name: "Anna Davis", role: "Direct Report", status: "Pending", rating: null }
      ]
    },
    {
      id: 2,
      type: "peer-review",
      employee: "Michael Chen",
      position: "Marketing Manager",
      department: "Marketing",
      status: "Completed",
      startDate: "2024-11-15",
      endDate: "2024-11-30",
      completionRate: 100,
      feedbackProviders: [
        { name: "Jane Doe", role: "Manager", status: "Completed", rating: 4.3 },
        { name: "Sarah Johnson", role: "Peer", status: "Completed", rating: 4.1 },
        { name: "David Kim", role: "Peer", status: "Completed", rating: 4.4 }
      ]
    }
  ];

  const feedbackCategories = [
    { category: "Communication", score: 4.2, feedback: "Excellent verbal and written communication skills" },
    { category: "Technical Skills", score: 4.5, feedback: "Strong technical expertise and problem-solving abilities" },
    { category: "Leadership", score: 4.0, feedback: "Shows good leadership potential, could develop more" },
    { category: "Teamwork", score: 4.7, feedback: "Exceptional team player, always supportive" },
    { category: "Innovation", score: 4.1, feedback: "Brings creative solutions to challenges" }
  ];

  const FeedbackForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Provide Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="feedback-for">Feedback For</Label>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sarah">Sarah Johnson</SelectItem>
              <SelectItem value="michael">Michael Chen</SelectItem>
              <SelectItem value="emily">Emily Rodriguez</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback-type">Feedback Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select feedback type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="peer">Peer Feedback</SelectItem>
              <SelectItem value="manager">Manager Feedback</SelectItem>
              <SelectItem value="subordinate">Subordinate Feedback</SelectItem>
              <SelectItem value="self">Self Assessment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Rate Performance Areas</h4>
          {feedbackCategories.map((cat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <Label>{cat.category}</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 cursor-pointer hover:fill-yellow-400"
                      fill={star <= Math.floor(cat.score) ? "#fbbf24" : "none"}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="strengths">Key Strengths</Label>
          <Textarea 
            id="strengths" 
            placeholder="What are this person's key strengths?"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="improvements">Areas for Improvement</Label>
          <Textarea 
            id="improvements" 
            placeholder="What areas could this person improve on?"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional">Additional Comments</Label>
          <Textarea 
            id="additional" 
            placeholder="Any additional feedback or suggestions?"
            rows={3}
          />
        </div>

        <Button className="w-full gap-2">
          <Send className="h-4 w-4" />
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          360-Degree Feedback System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="provide">Provide Feedback</TabsTrigger>
            <TabsTrigger value="my-feedback">My Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Feedback Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-sm text-muted-foreground">Active Reviews</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">15</div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">4.3</div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </CardContent>
              </Card>
            </div>

            {/* Active Feedback Cycles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Active Feedback Cycles</h3>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Start New Cycle
                </Button>
              </div>

              {feedbackData.map((feedback) => (
                <Card key={feedback.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{feedback.employee}</h4>
                        <p className="text-muted-foreground">
                          {feedback.position} • {feedback.department}
                        </p>
                        <Badge 
                          variant={feedback.status === "Active" ? "default" : "secondary"}
                          className="mt-2"
                        >
                          {feedback.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {feedback.startDate} - {feedback.endDate}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {feedback.type}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Completion Progress</span>
                          <span className="text-sm">{feedback.completionRate}%</span>
                        </div>
                        <Progress value={feedback.completionRate} className="h-2" />
                      </div>

                      <div>
                        <h5 className="font-medium mb-3">Feedback Providers</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {feedback.feedbackProviders.map((provider, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {provider.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{provider.name}</p>
                                <p className="text-xs text-muted-foreground">{provider.role}</p>
                              </div>
                              <div className="text-right">
                                <Badge 
                                  variant={provider.status === "Completed" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {provider.status}
                                </Badge>
                                {provider.rating && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs">{provider.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="provide">
            <FeedbackForm />
          </TabsContent>

          <TabsContent value="my-feedback" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Received Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feedback Received</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {feedbackCategories.map((cat, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{cat.category}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{cat.score}</span>
                        </div>
                      </div>
                      <Progress value={cat.score * 20} className="h-2" />
                      <p className="text-sm text-muted-foreground">{cat.feedback}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Feedback to Provide */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Feedback Requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Sarah Johnson", role: "Peer Review", dueDate: "2024-12-20" },
                    { name: "Michael Chen", role: "Subordinate Review", dueDate: "2024-12-18" },
                    { name: "Emily Rodriguez", role: "360-degree Review", dueDate: "2024-12-25" }
                  ].map((request, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{request.name}</p>
                        <p className="text-sm text-muted-foreground">{request.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Due: {request.dueDate}</p>
                        <Button size="sm" className="mt-1">Provide Feedback</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FeedbackSystem;