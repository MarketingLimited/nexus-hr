import { useState } from "react";
import { Target, Plus, Edit, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GoalTracking = () => {
  const [isCreating, setIsCreating] = useState(false);

  const goalData = [
    {
      id: 1,
      employeeId: "EMP001",
      employeeName: "Sarah Johnson",
      title: "Complete Project Alpha Migration",
      description: "Migrate legacy system to new cloud infrastructure",
      category: "Technical",
      priority: "High",
      startDate: "2024-10-01",
      dueDate: "2024-12-31",
      progress: 85,
      status: "In Progress",
      keyResults: [
        { description: "Database migration", completed: true },
        { description: "API endpoints update", completed: true },
        { description: "Frontend integration", completed: false },
        { description: "Testing & deployment", completed: false }
      ],
      updates: [
        { date: "2024-12-01", note: "Database migration completed successfully" },
        { date: "2024-11-15", note: "API endpoints 90% complete" }
      ]
    },
    {
      id: 2,
      employeeId: "EMP001",
      employeeName: "Sarah Johnson",
      title: "Mentor Junior Developers",
      description: "Provide guidance and training to 3 junior team members",
      category: "Leadership",
      priority: "Medium",
      startDate: "2024-09-01",
      dueDate: "2024-12-31",
      progress: 70,
      status: "In Progress",
      keyResults: [
        { description: "Weekly 1-on-1 meetings", completed: true },
        { description: "Code review sessions", completed: true },
        { description: "Technical training sessions", completed: false },
        { description: "Career development planning", completed: false }
      ],
      updates: [
        { date: "2024-11-30", note: "Conducting regular code reviews with team" },
        { date: "2024-11-01", note: "Started weekly mentoring sessions" }
      ]
    },
    {
      id: 3,
      employeeId: "EMP002",
      employeeName: "Michael Chen",
      title: "Increase Brand Awareness",
      description: "Improve brand recognition by 25% through marketing campaigns",
      category: "Marketing",
      priority: "High",
      startDate: "2024-10-01",
      dueDate: "2024-12-31",
      progress: 60,
      status: "In Progress",
      keyResults: [
        { description: "Social media campaign launch", completed: true },
        { description: "Partnership collaborations", completed: false },
        { description: "Content marketing strategy", completed: true },
        { description: "Brand awareness survey", completed: false }
      ],
      updates: [
        { date: "2024-12-01", note: "Social media engagement increased by 40%" },
        { date: "2024-11-15", note: "Content calendar implemented" }
      ]
    }
  ];

  const GoalDetailsModal = ({ goal, isEdit = false }) => {
    if (!goal && !isEdit) return null;

    return (
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Create New Goal" : `Goal Details - ${goal?.title}`}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {isEdit ? (
            // Create/Edit Goal Form
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emp001">Sarah Johnson</SelectItem>
                      <SelectItem value="emp002">Michael Chen</SelectItem>
                      <SelectItem value="emp003">Emily Rodriguez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input id="title" placeholder="Enter goal title" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe the goal in detail" />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input id="start-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input id="due-date" type="date" />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Key Results</Label>
                {[1, 2, 3].map((index) => (
                  <Input key={index} placeholder={`Key result ${index}`} />
                ))}
                <Button variant="outline" size="sm">Add Key Result</Button>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1">Create Goal</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            // Goal Details View
            <>
              {/* Goal Header */}
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{goal.title}</h3>
                  <Badge variant={
                    goal.priority === "High" ? "destructive" :
                    goal.priority === "Medium" ? "default" : "secondary"
                  }>
                    {goal.priority} Priority
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">{goal.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Employee:</span> {goal.employeeName}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span> {goal.category}
                  </div>
                  <div>
                    <span className="font-medium">Start Date:</span> {goal.startDate}
                  </div>
                  <div>
                    <span className="font-medium">Due Date:</span> {goal.dueDate}
                  </div>
                </div>
              </div>

              {/* Progress Overview */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Overall Progress</h4>
                  <span className="text-lg font-bold">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="mb-2" />
                <Badge variant={goal.status === "Completed" ? "default" : "secondary"}>
                  {goal.status}
                </Badge>
              </div>

              {/* Key Results */}
              <div>
                <h4 className="font-semibold mb-3">Key Results</h4>
                <div className="space-y-2">
                  {goal.keyResults.map((result, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      {result.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-orange-600" />
                      )}
                      <span className={result.completed ? "line-through text-muted-foreground" : ""}>
                        {result.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Updates */}
              <div>
                <h4 className="font-semibold mb-3">Recent Updates</h4>
                <div className="space-y-3">
                  {goal.updates.map((update, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium">{update.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{update.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "In Progress":
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goal Tracking & Management
          </CardTitle>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Goal
              </Button>
            </DialogTrigger>
            <GoalDetailsModal goal={null} isEdit={true} />
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Goal Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">24</div>
              <p className="text-sm text-muted-foreground">Total Goals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">18</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">5</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">72%</div>
              <p className="text-sm text-muted-foreground">Avg Progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Goals Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Goal</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goalData.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-48">
                        {goal.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{goal.employeeName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{goal.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      goal.priority === "High" ? "destructive" :
                      goal.priority === "Medium" ? "default" : "secondary"
                    }>
                      {goal.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={goal.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">{goal.progress}%</p>
                    </div>
                  </TableCell>
                  <TableCell>{goal.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(goal.status)}
                      <span className="text-sm">{goal.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Target className="h-3 w-3" />
                            View
                          </Button>
                        </DialogTrigger>
                        <GoalDetailsModal goal={goal} />
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

export default GoalTracking;