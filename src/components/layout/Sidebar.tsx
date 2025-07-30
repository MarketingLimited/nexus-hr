import { 
  Users, 
  Calendar, 
  DollarSign, 
  Target, 
  UserPlus, 
  Clock, 
  BarChart3,
  Settings,
  Building2,
  Home,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "#", icon: Home, current: true },
  { name: "Employees", href: "#employees", icon: Users, color: "employees" },
  { name: "Leave Management", href: "#leaves", icon: Calendar, color: "leaves" },
  { name: "Payroll", href: "#payroll", icon: DollarSign, color: "payroll" },
  { name: "Performance", href: "#performance", icon: Target, color: "performance" },
  { name: "Onboarding", href: "#onboarding", icon: UserPlus, color: "onboarding" },
  { name: "Attendance", href: "#attendance", icon: Clock, color: "attendance" },
  { name: "Reports", href: "#reports", icon: BarChart3, color: "reports" },
  { name: "Assets", href: "#assets", icon: Building2 },
];

const bottomNavigation = [
  { name: "Documents", href: "#documents", icon: FileText },
  { name: "Settings", href: "#settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">HRM System</h1>
            <p className="text-xs text-muted-foreground">Enterprise Edition</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={cn(
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors",
                      item.current
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        item.current ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </li>
          
          <li className="mt-auto">
            <ul role="list" className="-mx-2 space-y-1">
              {bottomNavigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors"
                  >
                    <item.icon
                      className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-foreground"
                      aria-hidden="true"
                    />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}