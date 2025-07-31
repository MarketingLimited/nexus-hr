import { useState } from "react";
import { Download, Filter, Calendar, FileText, Settings, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useGenerateReport, useExportReport } from "@/hooks/useAnalytics";
import { ReportTemplate } from "@/services/analyticsService";

const AdvancedReporting = () => {
  const { toast } = useToast();
  const generateReport = useGenerateReport();
  const exportReport = useExportReport();

  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportFilters, setReportFilters] = useState({
    reportType: '',
    timePeriod: '',
    department: '',
    format: 'pdf' as 'pdf' | 'excel' | 'csv'
  });

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'employee-comprehensive',
      name: 'Comprehensive Employee Report',
      description: 'Complete employee analytics including demographics, performance, and retention',
      type: 'employee',
      filters: {},
      metrics: ['headcount', 'turnover', 'demographics', 'performance'],
      visualization: 'dashboard'
    },
    {
      id: 'leave-utilization',
      name: 'Leave Utilization Analysis',
      description: 'Detailed analysis of leave patterns, utilization rates, and trends',
      type: 'leave',
      filters: {},
      metrics: ['usage', 'patterns', 'predictions'],
      visualization: 'chart'
    },
    {
      id: 'payroll-cost-analysis',
      name: 'Payroll Cost Analysis',
      description: 'Comprehensive payroll costs, trends, and projections',
      type: 'payroll',
      filters: {},
      metrics: ['costs', 'distribution', 'trends'],
      visualization: 'chart'
    },
    {
      id: 'cross-module-insights',
      name: 'Cross-Module Insights',
      description: 'Advanced analytics combining data from all HR modules',
      type: 'cross-module',
      filters: {},
      metrics: ['correlations', 'predictions', 'recommendations'],
      visualization: 'dashboard'
    }
  ];

  const quickReports = [
    {
      id: 'monthly-summary',
      name: 'Monthly HR Summary',
      description: 'Key metrics for the current month',
      lastGenerated: '2 hours ago',
      status: 'ready'
    },
    {
      id: 'quarterly-review',
      name: 'Quarterly Performance Review',
      description: 'Performance trends and insights',
      lastGenerated: '1 week ago',
      status: 'ready'
    },
    {
      id: 'annual-compliance',
      name: 'Annual Compliance Report',
      description: 'Regulatory compliance metrics',
      lastGenerated: '1 month ago',
      status: 'generating'
    },
    {
      id: 'turnover-analysis',
      name: 'Turnover Risk Analysis',
      description: 'Employee retention insights',
      lastGenerated: '3 days ago',
      status: 'ready'
    }
  ];

  const handleGenerateReport = async (template: ReportTemplate) => {
    try {
      const result = await generateReport.mutateAsync({ 
        template, 
        filters: { 
          year: new Date().getFullYear(),
          ...reportFilters 
        } 
      });

      toast({
        title: "Report Generated",
        description: `${template.name} has been generated successfully.`,
      });

      // Auto-export if format is selected
      if (reportFilters.format) {
        handleExportReport(result, reportFilters.format);
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportReport = async (data: any, format: 'pdf' | 'excel' | 'csv') => {
    try {
      const blob = await exportReport.mutateAsync({ data, format });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hr-report-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Report exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Custom Report Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Select onValueChange={(value) => setReportFilters({ ...reportFilters, reportType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee Analytics</SelectItem>
                <SelectItem value="leave">Leave Management</SelectItem>
                <SelectItem value="payroll">Payroll Analysis</SelectItem>
                <SelectItem value="performance">Performance Metrics</SelectItem>
                <SelectItem value="cross-module">Cross-Module Insights</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => setReportFilters({ ...reportFilters, timePeriod: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => setReportFilters({ ...reportFilters, department: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => setReportFilters({ ...reportFilters, format: value as any })}>
              <SelectTrigger>
                <SelectValue placeholder="Export Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              className="gap-2" 
              disabled={!reportFilters.reportType || generateReport.isPending}
              onClick={() => {
                if (reportFilters.reportType) {
                  const template = reportTemplates.find(t => t.type === reportFilters.reportType);
                  if (template) handleGenerateReport(template);
                }
              }}
            >
              <Play className="h-4 w-4" />
              {generateReport.isPending ? 'Generating...' : 'Generate'}
            </Button>
          </div>

          {/* Preview area */}
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Configure your report parameters above and click "Generate" to create your custom report
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => (
              <div key={template.id} className="p-4 border rounded-lg space-y-4">
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {template.metrics.map((metric) => (
                    <Badge key={metric} variant="outline" className="text-xs">
                      {metric}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => handleGenerateReport(template)}
                    disabled={generateReport.isPending}
                  >
                    <Play className="h-3 w-3" />
                    Generate
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-2">
                    <Settings className="h-3 w-3" />
                    Customize
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickReports.map((report) => (
              <div key={report.id} className="p-4 border rounded-lg space-y-3">
                <div>
                  <h3 className="font-medium">{report.name}</h3>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={report.status === 'ready' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {report.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {report.lastGenerated}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-2">
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-2">
                    <Play className="h-3 w-3" />
                    Refresh
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set up automated report generation and delivery schedules.
            </p>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Create Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedReporting;