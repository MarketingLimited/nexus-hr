import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  color?: string;
  isLoading?: boolean;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  color = "primary",
  isLoading = false
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden bg-gradient-card border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-card border-border/50 shadow-shadow-md hover:shadow-shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change && (
              <div className="flex items-center space-x-1">
                <span 
                  className={cn(
                    "text-xs font-medium",
                    changeType === "positive" && "text-success",
                    changeType === "negative" && "text-destructive", 
                    changeType === "neutral" && "text-muted-foreground"
                  )}
                >
                  {change}
                </span>
                <span className="text-xs text-muted-foreground">from last month</span>
              </div>
            )}
          </div>
          <div className={cn(
            "h-12 w-12 rounded-lg flex items-center justify-center",
            color === "employees" && "bg-employees/10 text-employees",
            color === "leaves" && "bg-leaves/10 text-leaves", 
            color === "payroll" && "bg-payroll/10 text-payroll",
            color === "performance" && "bg-performance/10 text-performance",
            color === "primary" && "bg-primary/10 text-primary"
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}