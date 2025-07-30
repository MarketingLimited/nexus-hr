import { CheckCircle, Circle, Clock, User, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const OnboardingWorkflow = () => {
  const onboardingTasks = [
    {
      category: "Pre-boarding",
      tasks: [
        { id: 1, title: "Send welcome email", completed: true, assignee: "HR Team" },
        { id: 2, title: "Prepare workspace", completed: true, assignee: "Facilities" },
        { id: 3, title: "Create accounts", completed: false, assignee: "IT Team" },
        { id: 4, title: "Order equipment", completed: false, assignee: "IT Team" }
      ]
    },
    {
      category: "Day 1",
      tasks: [
        { id: 5, title: "Office tour", completed: false, assignee: "Buddy" },
        { id: 6, title: "Complete paperwork", completed: false, assignee: "New Hire" },
        { id: 7, title: "Meet team members", completed: false, assignee: "Manager" },
        { id: 8, title: "Review job responsibilities", completed: false, assignee: "Manager" }
      ]
    },
    {
      category: "Week 1",
      tasks: [
        { id: 9, title: "Complete mandatory training", completed: false, assignee: "New Hire" },
        { id: 10, title: "Set up development environment", completed: false, assignee: "New Hire" },
        { id: 11, title: "First project assignment", completed: false, assignee: "Manager" }
      ]
    }
  ];

  const newHires = [
    {
      name: "Alex Thompson",
      position: "Software Engineer",
      startDate: "2024-12-30",
      progress: 25,
      status: "Pre-boarding"
    },
    {
      name: "Maria Garcia",
      position: "Marketing Specialist", 
      startDate: "2025-01-05",
      progress: 10,
      status: "Pre-boarding"
    },
    {
      name: "James Wilson",
      position: "Product Manager",
      startDate: "2025-01-15", 
      progress: 0,
      status: "Pending"
    }
  ];

  return (
    <div className="space-y-6">
      {/* New Hires Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current New Hires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {newHires.map((hire, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{hire.name}</p>
                  <p className="text-sm text-muted-foreground">{hire.position}</p>
                  <p className="text-sm text-muted-foreground">Starts: {hire.startDate}</p>
                </div>
                <div className="text-right space-y-2">
                  <Badge variant={hire.progress > 0 ? "default" : "secondary"}>
                    {hire.status}
                  </Badge>
                  <div className="w-32">
                    <Progress value={hire.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{hire.progress}% Complete</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Checklist */}
      {onboardingTasks.map((category, categoryIndex) => (
        <Card key={categoryIndex}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {category.category} Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {category.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-muted-foreground">Assigned to: {task.assignee}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!task.completed && (
                      <Button variant="outline" size="sm">
                        Mark Complete
                      </Button>
                    )}
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OnboardingWorkflow;