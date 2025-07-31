import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRecentActivity } from "@/hooks/useDashboard";

export default function RecentActivity() {
  const { data: activities, isLoading, error } = useRecentActivity();

  if (isLoading) {
    return (
      <Card className="bg-gradient-card border-border/50 shadow-shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-card border-border/50 shadow-shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load recent activity: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50 shadow-shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt={activity.user} />
                <AvatarFallback>
                  {activity.user.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity.user}
                  </p>
                  <span className="text-sm text-muted-foreground">{activity.title}</span>
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
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">No recent activity found.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}