import { useState } from "react";
import { CheckCircle, XCircle, Clock, MessageSquare, Eye, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LeaveRequest = {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  emergencyContact?: string;
  avatar?: string;
};

const mockRequests: LeaveRequest[] = [
  {
    id: "1",
    employeeName: "Sarah Johnson",
    employeeId: "EMP001",
    department: "Engineering",
    leaveType: "Annual Leave",
    startDate: "2024-12-20",
    endDate: "2024-12-25",
    days: 6,
    reason: "Family vacation during Christmas holidays. Planning to visit family in another state.",
    status: "pending",
    submittedDate: "2024-12-01",
    emergencyContact: "+1 234-567-8900",
  },
  {
    id: "2",
    employeeName: "Mike Chen",
    employeeId: "EMP002", 
    department: "Marketing",
    leaveType: "Sick Leave",
    startDate: "2024-12-18",
    endDate: "2024-12-18",
    days: 1,
    reason: "Doctor's appointment for regular check-up.",
    status: "pending",
    submittedDate: "2024-12-17",
  },
  {
    id: "3",
    employeeName: "Emma Davis",
    employeeId: "EMP003",
    department: "HR",
    leaveType: "Personal Leave", 
    startDate: "2025-01-02",
    endDate: "2025-01-03",
    days: 2,
    reason: "Personal matters that require attention.",
    status: "pending",
    submittedDate: "2024-11-28",
  },
];

export const LeaveApprovalWorkflow = () => {
  const [requests, setRequests] = useState(mockRequests);
  const [selectedTab, setSelectedTab] = useState("pending");
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const handleApproval = (requestId: string, status: "approved" | "rejected", comment?: string) => {
    setRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status }
          : request
      )
    );

    toast({
      title: `Leave Request ${status === "approved" ? "Approved" : "Rejected"}`,
      description: `The leave request has been ${status}.`,
    });

    setComment("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredRequests = requests.filter(request => 
    selectedTab === "all" ? true : request.status === selectedTab
  );

  const RequestCard = ({ request }: { request: LeaveRequest }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={request.avatar} />
              <AvatarFallback>
                {request.employeeName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{request.employeeName}</h3>
              <p className="text-sm text-muted-foreground">
                {request.employeeId} • {request.department}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(request.status)}>
            {getStatusIcon(request.status)}
            {request.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Leave Type</p>
            <p className="font-medium">{request.leaveType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Duration</p>
            <p className="font-medium">
              {request.startDate} to {request.endDate} ({request.days} days)
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Submitted</p>
            <p className="font-medium">{request.submittedDate}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Reason</p>
          <p className="text-sm bg-muted p-3 rounded-lg">{request.reason}</p>
        </div>

        {request.emergencyContact && (
          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Emergency Contact</p>
            <p className="text-sm">{request.emergencyContact}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Leave Request Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Employee</p>
                    <p className="text-muted-foreground">{request.employeeName}</p>
                  </div>
                  <div>
                    <p className="font-medium">Department</p>
                    <p className="text-muted-foreground">{request.department}</p>
                  </div>
                  <div>
                    <p className="font-medium">Leave Type</p>
                    <p className="text-muted-foreground">{request.leaveType}</p>
                  </div>
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-muted-foreground">{request.days} days</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-2">Reason</p>
                  <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                    {request.reason}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {request.status === "pending" && (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Approve Leave Request</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p>Are you sure you want to approve this leave request?</p>
                    <Textarea
                      placeholder="Add approval comments (optional)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleApproval(request.id, "approved", comment)}
                        className="flex-1"
                      >
                        Approve Request
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-red-600">
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Leave Request</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p>Please provide a reason for rejecting this leave request:</p>
                    <Textarea
                      placeholder="Rejection reason (required)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />
                    <Button 
                      onClick={() => handleApproval(request.id, "rejected", comment)}
                      variant="destructive"
                      className="w-full"
                      disabled={!comment.trim()}
                    >
                      Reject Request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leave Approval Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending ({requests.filter(r => r.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Approved ({requests.filter(r => r.status === "approved").length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                <XCircle className="h-4 w-4" />
                Rejected ({requests.filter(r => r.status === "rejected").length})
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <User className="h-4 w-4" />
                All ({requests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No requests found</h3>
                  <p className="text-muted-foreground">
                    No leave requests match the current filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};