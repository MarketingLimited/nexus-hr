import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";

export default function RecentActivity() {
  const { recentActivities, loading } = useDashboardAnalytics();

  return (
    <Card className="bg-gradient-card border-border/50 shadow-shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading activities...</div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
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
        )}
      </CardContent>
    </Card>
  );
}