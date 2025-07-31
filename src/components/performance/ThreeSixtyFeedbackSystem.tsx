import { useState } from "react";
import { Users, Target, TrendingUp, Award, MessageSquare, Plus, Star, ArrowRight, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ThreeSixtyFeedbackSystem = () => {
  const [selectedEmployee, setSelectedEmployee] = useState("");

  // 360-degree feedback cycles
  const feedbackCycles = [
    {
      id: 1,
      employee: "Sarah Johnson",
      position: "Senior Developer",
      department: "Engineering",
      status: "active",
      startDate: "2024-12-01",
      endDate: "2024-12-20",
      completionRate: 85,
      overallRating: 4.3,
      feedbackSources: {
        manager: { completed: 1, total: 1, avgRating: 4.5 },
        peers: { completed: 4, total: 5, avgRating: 4.2 },
        directReports: { completed: 3, total: 4, avgRating: 4.4 },
        self: { completed: 1, total: 1, avgRating: 4.0 },
        customers: { completed: 2, total: 3, avgRating: 4.1 }
      },
      competencies: {
        technical: 4.4,
        communication: 4.2,
        leadership: 4.0,
        collaboration: 4.6,
        innovation: 4.3
      }
    }
  ];

  // Career progression planning
  const careerPath = {
    currentRole: "Senior Developer",
    nextRole: "Tech Lead",
    targetDate: "Q3 2025",
    progress: 72,
    requirements: [
      { skill: "Team Leadership", current: 4.0, required: 4.5, gap: 0.5 },
      { skill: "Architecture Design", current: 4.3, required: 4.5, gap: 0.2 },
      { skill: "Mentoring", current: 3.8, required: 4.0, gap: 0.2 },
      { skill: "Strategic Thinking", current: 3.5, required: 4.0, gap: 0.5 },
      { skill: "Project Management", current: 3.9, required: 4.5, gap: 0.6 }
    ]
  };

  // Mentoring system
  const mentoringMatches = [
    {
      id: 1,
      mentee: "Alex Chen",
      mentor: "Sarah Johnson",
      program: "Technical Leadership",
      startDate: "2024-10-01",
      status: "active",
      progress: 65,
      nextSession: "2024-12-18",
      goals: ["Leadership skills", "Technical architecture", "Team management"]
    },
    {
      id: 2,
      mentee: "Maria Rodriguez",
      mentor: "Michael Kim",
      program: "Career Development",
      startDate: "2024-11-15",
      status: "active",
      progress: 40,
      nextSession: "2024-12-20",
      goals: ["Communication", "Project leadership", "Strategic thinking"]
    }
  ];

  // Competency matrix
  const competencyMatrix = [
    {
      category: "Technical Skills",
      competencies: [
        { name: "Software Development", level: 4.2, target: 4.5, trend: "up" },
        { name: "System Design", level: 4.0, target: 4.5, trend: "up" },
        { name: "Code Review", level: 4.4, target: 4.5, trend: "stable" },
        { name: "Testing & QA", level: 3.8, target: 4.0, trend: "up" }
      ]
    },
    {
      category: "Leadership",
      competencies: [
        { name: "Team Management", level: 3.9, target: 4.5, trend: "up" },
        { name: "Decision Making", level: 4.1, target: 4.5, trend: "up" },
        { name: "Conflict Resolution", level: 3.7, target: 4.0, trend: "stable" },
        { name: "Strategic Planning", level: 3.5, target: 4.0, trend: "up" }
      ]
    },
    {
      category: "Communication",
      competencies: [
        { name: "Written Communication", level: 4.3, target: 4.5, trend: "stable" },
        { name: "Presentation Skills", level: 4.0, target: 4.5, trend: "up" },
        { name: "Active Listening", level: 4.4, target: 4.5, trend: "stable" },
        { name: "Cross-functional Collaboration", level: 4.2, target: 4.5, trend: "up" }
      ]
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
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
            <Users className="h-5 w-5" />
            360-Degree Performance & Development System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="feedback-overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="feedback-overview">360° Feedback</TabsTrigger>
              <TabsTrigger value="career-planning">Career Planning</TabsTrigger>
              <TabsTrigger value="mentoring">Mentoring</TabsTrigger>
              <TabsTrigger value="competency">Competency Matrix</TabsTrigger>
            </TabsList>

            <TabsContent value="feedback-overview" className="space-y-6">
              {/* 360 Feedback Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-sm text-muted-foreground">Active 360° Reviews</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">4.3</div>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">156</div>
                    <p className="text-sm text-muted-foreground">Total Participants</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed 360 Feedback Cycle */}
              <Card>
                <CardHeader>
                  <CardTitle>Sarah Johnson - 360° Feedback Cycle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Feedback Sources */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Feedback Sources</h4>
                      <div className="space-y-3">
                        {Object.entries(feedbackCycles[0].feedbackSources).map(([source, data]) => (
                          <div key={source} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium capitalize">{source.replace(/([A-Z])/g, ' $1')}</p>
                              <p className="text-sm text-muted-foreground">
                                {data.completed}/{data.total} completed
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{data.avgRating}</span>
                              </div>
                              <Progress value={(data.completed / data.total) * 100} className="w-16 h-2 mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Competency Ratings */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Competency Ratings</h4>
                      <div className="space-y-3">
                        {Object.entries(feedbackCycles[0].competencies).map(([competency, rating]) => (
                          <div key={competency} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium capitalize">{competency}</span>
                              <span className="font-semibold">{rating}</span>
                            </div>
                            <Progress value={rating * 20} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Items */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Development Action Items</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <h5 className="font-medium text-green-700">Strengths to Leverage</h5>
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                            <li>• Exceptional collaboration skills</li>
                            <li>• Strong technical problem-solving</li>
                            <li>• Consistent high-quality deliverables</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h5 className="font-medium text-orange-700">Areas for Development</h5>
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                            <li>• Enhance leadership presence</li>
                            <li>• Improve strategic communication</li>
                            <li>• Develop conflict resolution skills</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="career-planning" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Career Progression Planning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Career Path Overview */}
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                        Current
                      </div>
                      <p className="text-sm mt-2">{careerPath.currentRole}</p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                        Target
                      </div>
                      <p className="text-sm mt-2">{careerPath.nextRole}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-2xl font-bold">{careerPath.progress}%</div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-sm font-medium">Target: {careerPath.targetDate}</p>
                    </div>
                  </div>

                  {/* Skill Gap Analysis */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Skill Gap Analysis</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Skill Area</TableHead>
                          <TableHead>Current Level</TableHead>
                          <TableHead>Required Level</TableHead>
                          <TableHead>Gap</TableHead>
                          <TableHead>Action Plan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {careerPath.requirements.map((req, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{req.skill}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{req.current}</span>
                                <Progress value={req.current * 20} className="w-16 h-2" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{req.required}</span>
                                <Progress value={req.required * 20} className="w-16 h-2" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={req.gap <= 0.2 ? "default" : req.gap <= 0.5 ? "secondary" : "destructive"}>
                                {req.gap.toFixed(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">View Plan</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mentoring" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Internal Mentoring System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-sm text-muted-foreground">Active Mentorships</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">89%</div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">4.6</div>
                        <p className="text-sm text-muted-foreground">Avg Satisfaction</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">Current Mentoring Relationships</h4>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create New Match
                      </Button>
                    </div>

                    {mentoringMatches.map((match) => (
                      <Card key={match.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>{match.mentee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h5 className="font-semibold">{match.mentee}</h5>
                                <p className="text-sm text-muted-foreground">Mentee</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>{match.mentor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h5 className="font-semibold">{match.mentor}</h5>
                                <p className="text-sm text-muted-foreground">Mentor</p>
                              </div>
                            </div>
                            <Badge variant="default">{match.status}</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium">Program</p>
                              <p className="text-sm text-muted-foreground">{match.program}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Progress</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={match.progress} className="flex-1 h-2" />
                                <span className="text-sm">{match.progress}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Next Session</p>
                              <p className="text-sm text-muted-foreground">{match.nextSession}</p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Goals</p>
                            <div className="flex flex-wrap gap-2">
                              {match.goals.map((goal, index) => (
                                <Badge key={index} variant="outline">{goal}</Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competency" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Competency Matrix & Skill Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {competencyMatrix.map((category, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{category.category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {category.competencies.map((comp, compIndex) => (
                            <div key={compIndex} className="flex items-center gap-4 p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">{comp.name}</span>
                                  <div className="flex items-center gap-2">
                                    {getTrendIcon(comp.trend)}
                                    <span className="text-sm font-semibold">
                                      {comp.level} / {comp.target}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Progress value={comp.level * 20} className="h-2" />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Current: {comp.level}</span>
                                    <span>Target: {comp.target}</span>
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                Develop
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThreeSixtyFeedbackSystem;