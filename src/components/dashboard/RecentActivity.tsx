import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const activities = [
  {
    id: 1,
    user: { name: "Sarah Johnson", email: "sarah.j@company.com", avatar: "/placeholder.svg" },
    action: "submitted leave request",
    type: "leave",
    status: "pending",
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: 2,
    user: { name: "Mike Chen", email: "mike.c@company.com", avatar: "/placeholder.svg" },
    action: "completed onboarding task",
    type: "onboarding", 
    status: "completed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: 3,
    user: { name: "Emily Davis", email: "emily.d@company.com", avatar: "/placeholder.svg" },
    action: "clocked in",
    type: "attendance",
    status: "active",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
  },
  {
    id: 4,
    user: { name: "David Wilson", email: "david.w@company.com", avatar: "/placeholder.svg" },
    action: "updated performance goal",
    type: "performance",
    status: "updated",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
  },
  {
    id: 5,
    user: { name: "Lisa Brown", email: "lisa.b@company.com", avatar: "/placeholder.svg" },
    action: "requested salary review",
    type: "payroll",
    status: "pending",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8 hours ago
  }
];

export default function RecentActivity() {
  return (
    <Card className="bg-gradient-card border-border/50 shadow-shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>
                  {activity.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity.user.name}
                  </p>
                  <span className="text-sm text-muted-foreground">{activity.action}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant={
                      activity.status === "pending" ? "secondary" :
                      activity.status === "completed" ? "default" :
                      activity.status === "active" ? "default" : 
                      "outline"
                    }
                    className="text-xs"
                  >
                    {activity.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}