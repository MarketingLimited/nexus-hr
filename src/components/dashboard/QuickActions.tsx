import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Calendar, 
  FileText, 
  Users, 
  Clock,
  DollarSign,
  Shield,
  Activity,
  RefreshCw
} from "lucide-react";

const quickActions = [
  {
    title: "Add New Employee",
    description: "Create employee profile",
    icon: Plus,
    action: "Add Employee",
    color: "employees",
    href: "/employees"
  },
  {
    title: "Submit Leave Request",
    description: "Request time off",
    icon: Calendar,
    action: "New Request", 
    color: "leaves",
    href: "/leave"
  },
  {
    title: "Security Dashboard",
    description: "Monitor threats",
    icon: Shield,
    action: "View Security",
    color: "security",
    href: "/security"
  },
  {
    title: "System Health",
    description: "Check system status",
    icon: Activity,
    action: "View Status",
    color: "monitoring",
    href: "/monitoring"
  },
  {
    title: "Run Payroll",
    description: "Process payments",
    icon: DollarSign,
    action: "Run Payroll",
    color: "payroll",
    href: "/payroll"
  },
  {
    title: "Sync Data",
    description: "Integration status",
    icon: RefreshCw,
    action: "View Sync",
    color: "integration",
    href: "/integration"
  }
];

export default function QuickActions() {
  return (
    <Card className="bg-gradient-card border-border/50 shadow-shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-muted/50 transition-colors"
              asChild
            >
              <Link to={action.href}>
                <div className="flex items-center space-x-2 w-full">
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{action.title}</span>
                </div>
                <p className="text-xs text-muted-foreground text-left">{action.description}</p>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}