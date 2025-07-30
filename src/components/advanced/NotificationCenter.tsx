import { useState } from "react";
import { Bell, X, Check, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "info",
      title: "New Employee Onboarding",
      message: "Alex Thompson starts Monday. Please prepare their workspace.",
      time: "2 minutes ago",
      read: false
    },
    {
      id: 2,
      type: "warning",
      title: "Leave Request Pending",
      message: "Sarah Johnson's leave request requires your approval.",
      time: "1 hour ago",
      read: false
    },
    {
      id: 3,
      type: "success",
      title: "Payroll Completed",
      message: "December payroll has been successfully processed.",
      time: "2 hours ago",
      read: true
    },
    {
      id: 4,
      type: "error",
      title: "Performance Review Overdue",
      message: "3 performance reviews are past their due date.",
      time: "1 day ago",
      read: false
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning": return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "error": return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}>
            Mark All Read
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Switch id="push-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="leave-requests">Leave Request Alerts</Label>
              <Switch id="leave-requests" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="payroll-updates">Payroll Updates</Label>
              <Switch id="payroll-updates" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{notification.title}</h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {notification.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;