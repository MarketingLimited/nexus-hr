import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  stats: Array<{
    label: string;
    value: string;
    trend?: "up" | "down" | "stable";
  }>;
  actions: Array<{
    label: string;
    href: string;
  }>;
  notifications?: number;
}

export default function ModuleCard({
  title,
  description,
  icon: Icon,
  color,
  stats,
  actions,
  notifications
}: ModuleCardProps) {
  return (
    <Card className="relative group bg-gradient-card border-border/50 shadow-shadow-md hover:shadow-shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              `bg-${color}/10 text-${color}`
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {notifications && notifications > 0 && (
            <Badge variant="destructive" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
              {notifications}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className="flex items-center space-x-2">
                <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                {stat.trend && (
                  <span className={cn(
                    "text-xs font-medium",
                    stat.trend === "up" && "text-success",
                    stat.trend === "down" && "text-destructive",
                    stat.trend === "stable" && "text-muted-foreground"
                  )}>
                    {stat.trend === "up" && "↗"}
                    {stat.trend === "down" && "↘"}
                    {stat.trend === "stable" && "→"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={index === 0 ? "default" : "outline"}
              size="sm"
              className="group/btn"
              asChild
            >
              <Link to={action.href}>
                {action.label}
                <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}