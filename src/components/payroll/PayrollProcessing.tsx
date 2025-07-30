import { useState } from "react";
import { Play, Pause, CheckCircle, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PayrollProcessing = () => {
  const [processingStatus, setProcessingStatus] = useState("ready"); // ready, processing, completed, error

  const payrollSteps = [
    { id: 1, name: "Validate Employee Data", status: "completed", duration: "2 min" },
    { id: 2, name: "Calculate Base Salaries", status: "completed", duration: "3 min" },
    { id: 3, name: "Process Overtime", status: "processing", duration: "5 min" },
    { id: 4, name: "Calculate Tax Deductions", status: "pending", duration: "4 min" },
    { id: 5, name: "Apply Benefits & Allowances", status: "pending", duration: "3 min" },
    { id: 6, name: "Generate Payslips", status: "pending", duration: "6 min" },
    { id: 7, name: "Final Review & Approval", status: "pending", duration: "2 min" },
  ];

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-orange-600 animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "processing":
        return "text-orange-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payroll Processing Workflow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Processing Overview */}
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">December 2024 Payroll</h3>
              <p className="text-sm text-muted-foreground">Pay Period: Dec 1-31, 2024 • 58 Employees</p>
            </div>
            <Badge variant={processingStatus === "processing" ? "default" : "secondary"}>
              {processingStatus === "processing" ? "Processing..." : "Ready to Process"}
            </Badge>
          </div>
          
          <Progress value={43} className="mb-3" />
          <p className="text-sm text-muted-foreground">Step 3 of 7 • Estimated completion: 15 minutes</p>
        </div>

        {/* Processing Steps */}
        <div className="space-y-3">
          {payrollSteps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
              {getStepIcon(step.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${getStepColor(step.status)}`}>
                    {step.name}
                  </span>
                  <span className="text-sm text-muted-foreground">{step.duration}</span>
                </div>
                {step.status === "processing" && (
                  <div className="mt-2">
                    <Progress value={65} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Processing overtime for Engineering department...</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Processing Controls */}
        <div className="flex gap-3">
          <Button className="flex-1 gap-2">
            <Play className="h-4 w-4" />
            Continue Processing
          </Button>
          <Button variant="outline" className="gap-2">
            <Pause className="h-4 w-4" />
            Pause
          </Button>
        </div>

        {/* Alerts */}
        <Alert>
          <AlertDescription>
            <strong>Note:</strong> Processing will automatically pause if any discrepancies are detected. 
            All calculations will be reviewed before final approval.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default PayrollProcessing;