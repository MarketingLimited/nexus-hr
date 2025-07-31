import { useState } from "react";
import { Plus, Settings, Download, Play, Save, X, GripVertical as Grip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CustomReportBuilder = () => {
  const [reportConfig, setReportConfig] = useState({
    name: "",
    description: "",
    dataSources: [],
    filters: {},
    visualizations: [],
    schedule: null
  });

  const [selectedDataSources, setSelectedDataSources] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [selectedVisualization, setSelectedVisualization] = useState("");

  // Available data sources
  const dataSources = [
    {
      id: "employees",
      name: "Employee Data",
      description: "Demographics, roles, departments",
      tables: ["employees", "departments", "positions"],
      fields: ["name", "department", "position", "hire_date", "salary", "status"]
    },
    {
      id: "attendance",
      name: "Attendance & Time",
      description: "Clock-in/out, leaves, overtime",
      tables: ["attendance", "leaves", "schedules"],
      fields: ["check_in", "check_out", "hours_worked", "leave_type", "overtime_hours"]
    },
    {
      id: "performance",
      name: "Performance Reviews",
      description: "Reviews, goals, feedback",
      tables: ["reviews", "goals", "feedback"],
      fields: ["overall_rating", "goal_completion", "feedback_score", "review_period"]
    },
    {
      id: "payroll",
      name: "Payroll & Compensation",
      description: "Salaries, bonuses, deductions",
      tables: ["payroll", "compensation", "benefits"],
      fields: ["base_salary", "bonus", "total_compensation", "tax_deductions"]
    }
  ];

  // Available metrics
  const metrics = [
    { id: "headcount", name: "Headcount", category: "employee", aggregation: "count" },
    { id: "avg_salary", name: "Average Salary", category: "payroll", aggregation: "average" },
    { id: "turnover_rate", name: "Turnover Rate", category: "employee", aggregation: "percentage" },
    { id: "attendance_rate", name: "Attendance Rate", category: "attendance", aggregation: "percentage" },
    { id: "performance_score", name: "Performance Score", category: "performance", aggregation: "average" },
    { id: "overtime_hours", name: "Overtime Hours", category: "attendance", aggregation: "sum" },
    { id: "training_completion", name: "Training Completion", category: "performance", aggregation: "percentage" }
  ];

  // Visualization types
  const visualizations = [
    { id: "bar", name: "Bar Chart", icon: "📊", suitable: ["count", "sum", "average"] },
    { id: "line", name: "Line Chart", icon: "📈", suitable: ["time-series", "trends"] },
    { id: "pie", name: "Pie Chart", icon: "🥧", suitable: ["distribution", "percentage"] },
    { id: "table", name: "Data Table", icon: "📋", suitable: ["detailed-data"] },
    { id: "kpi", name: "KPI Card", icon: "🎯", suitable: ["single-metric"] },
    { id: "heatmap", name: "Heatmap", icon: "🔥", suitable: ["correlation", "intensity"] }
  ];

  // Report components in the builder
  const [reportComponents, setReportComponents] = useState([]);

  const addComponent = (type) => {
    const newComponent = {
      id: Date.now(),
      type,
      title: `New ${type}`,
      dataSource: "",
      metrics: [],
      filters: {},
      visualization: type === "chart" ? "bar" : "table",
      position: reportComponents.length
    };
    setReportComponents([...reportComponents, newComponent]);
  };

  const removeComponent = (id) => {
    setReportComponents(reportComponents.filter(comp => comp.id !== id));
  };

  const updateComponent = (id, updates) => {
    setReportComponents(reportComponents.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Custom Report Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="design" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="data">Data Sources</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="space-y-6">
              {/* Report Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Report Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="report-name">Report Name</Label>
                      <Input 
                        id="report-name" 
                        placeholder="e.g., Monthly Performance Dashboard"
                        value={reportConfig.name}
                        onChange={(e) => setReportConfig({...reportConfig, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="report-description">Description</Label>
                      <Input 
                        id="report-description" 
                        placeholder="Brief description of the report"
                        value={reportConfig.description}
                        onChange={(e) => setReportConfig({...reportConfig, description: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Component Palette */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                      onClick={() => addComponent("chart")}
                    >
                      <span className="text-2xl">📊</span>
                      <span className="text-sm">Chart</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                      onClick={() => addComponent("table")}
                    >
                      <span className="text-2xl">📋</span>
                      <span className="text-sm">Table</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                      onClick={() => addComponent("kpi")}
                    >
                      <span className="text-2xl">🎯</span>
                      <span className="text-sm">KPI Card</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                      onClick={() => addComponent("text")}
                    >
                      <span className="text-2xl">📝</span>
                      <span className="text-sm">Text</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Report Canvas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Report Layout</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportComponents.length === 0 ? (
                    <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="text-muted-foreground">
                        Start building your report by adding components above
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reportComponents.map((component) => (
                        <div key={component.id} className="border rounded-lg p-4 bg-muted/50">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Grip className="h-4 w-4 text-muted-foreground cursor-move" />
                              <span className="font-medium">{component.title}</span>
                              <Badge variant="outline">{component.type}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {/* Open component settings */}}
                              >
                                <Settings className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => removeComponent(component.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Data Source</Label>
                              <Select onValueChange={(value) => updateComponent(component.id, { dataSource: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select data source" />
                                </SelectTrigger>
                                <SelectContent>
                                  {dataSources.map(source => (
                                    <SelectItem key={source.id} value={source.id}>
                                      {source.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Metrics</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select metrics" />
                                </SelectTrigger>
                                <SelectContent>
                                  {metrics.map(metric => (
                                    <SelectItem key={metric.id} value={metric.id}>
                                      {metric.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {component.type === "chart" && (
                              <div className="space-y-2">
                                <Label>Visualization</Label>
                                <Select onValueChange={(value) => updateComponent(component.id, { visualization: value })}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chart type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {visualizations.map(viz => (
                                      <SelectItem key={viz.id} value={viz.id}>
                                        {viz.icon} {viz.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Data Sources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dataSources.map((source) => (
                    <div key={source.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{source.name}</h4>
                          <p className="text-sm text-muted-foreground">{source.description}</p>
                        </div>
                        <Checkbox 
                          checked={selectedDataSources.includes(source.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDataSources([...selectedDataSources, source.id]);
                            } else {
                              setSelectedDataSources(selectedDataSources.filter(id => id !== source.id));
                            }
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Available Fields:</p>
                        <div className="flex flex-wrap gap-2">
                          {source.fields.map((field) => (
                            <Badge key={field} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last-month">Last Month</SelectItem>
                          <SelectItem value="last-quarter">Last Quarter</SelectItem>
                          <SelectItem value="last-year">Last Year</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Employee Status</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All employees" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Employees</SelectItem>
                          <SelectItem value="active">Active Only</SelectItem>
                          <SelectItem value="inactive">Inactive Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportComponents.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No components added yet. Go to the Design tab to start building your report.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Alert>
                        <AlertDescription>
                          This is a preview of your report with sample data. The actual report will use real data from your selected sources.
                        </AlertDescription>
                      </Alert>
                      
                      {/* Preview of report components */}
                      <div className="space-y-4">
                        {reportComponents.map((component) => (
                          <div key={component.id} className="border rounded-lg p-6">
                            <h4 className="font-semibold mb-4">{component.title}</h4>
                            <div className="h-40 bg-muted/50 rounded-lg flex items-center justify-center">
                              <span className="text-muted-foreground">
                                {component.type === "chart" && "📊 Chart Preview"}
                                {component.type === "table" && "📋 Table Preview"}
                                {component.type === "kpi" && "🎯 KPI Preview"}
                                {component.type === "text" && "📝 Text Preview"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Scheduling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Recipients</Label>
                      <Input placeholder="Enter email addresses" />
                    </div>

                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="08:00">8:00 AM</SelectItem>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="17:00">5:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Format</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <Separator />
          <div className="flex gap-3 pt-4">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Save Report
            </Button>
            <Button variant="outline" className="gap-2">
              <Play className="h-4 w-4" />
              Generate Preview
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomReportBuilder;