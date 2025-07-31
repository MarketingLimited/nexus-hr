import { useState, useEffect } from "react";
import { Play, Pause, RefreshCw, CheckCircle, XCircle, AlertTriangle, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  useWorkflowTesting, 
  usePerformanceTesting, 
  useStateConsistencyTesting,
  useAccessibilityTesting,
  workflowTests 
} from "@/utils/testingUtilities";

const QualityAssuranceDashboard = () => {
  const [activeTab, setActiveTab] = useState("workflows");
  
  // Testing hooks
  const workflowTesting = useWorkflowTesting();
  const performanceTesting = usePerformanceTesting();
  const stateConsistency = useStateConsistencyTesting();
  const accessibility = useAccessibilityTesting();

  // Auto-run accessibility and consistency checks
  useEffect(() => {
    const interval = setInterval(() => {
      stateConsistency.checkCacheConsistency();
      accessibility.checkAccessibility();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [stateConsistency, accessibility]);

  const overallHealthScore = (() => {
    let score = 100;
    
    // Deduct for workflow failures
    const failedWorkflows = workflowTesting.testResults.filter(r => !r.passed).length;
    score -= failedWorkflows * 15;
    
    // Deduct for performance issues
    if (performanceTesting.metrics) {
      if (performanceTesting.metrics.errorRate > 5) score -= 20;
      if (performanceTesting.metrics.averageResponseTime > 1000) score -= 15;
    }
    
    // Deduct for consistency issues
    const highSeverityIssues = stateConsistency.inconsistencies.filter(i => i.severity === 'high').length;
    score -= highSeverityIssues * 10;
    
    // Deduct for accessibility errors
    const accessibilityErrors = accessibility.accessibilityIssues.filter(i => i.severity === 'error').length;
    score -= accessibilityErrors * 5;
    
    return Math.max(0, score);
  })();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quality Assurance Dashboard</h1>
          <p className="text-muted-foreground">System testing, performance monitoring, and quality metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold">{overallHealthScore}%</div>
            <div className="text-sm text-muted-foreground">Health Score</div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-muted flex items-center justify-center relative">
            <div 
              className="absolute inset-0 rounded-full border-4 border-primary"
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((overallHealthScore / 100) * 2 * Math.PI - Math.PI/2)}% ${50 + 50 * Math.sin((overallHealthScore / 100) * 2 * Math.PI - Math.PI/2)}%, 50% 50%)`
              }}
            />
            <Monitor className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflows">End-to-End Tests</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="consistency">State & Cache</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Workflow Testing</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={workflowTesting.clearResults}
                disabled={workflowTesting.testResults.length === 0}
              >
                Clear Results
              </Button>
              <Button 
                onClick={workflowTesting.runAllTests}
                disabled={workflowTesting.isRunning}
                className="gap-2"
              >
                {workflowTesting.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {workflowTesting.isRunning ? 'Running...' : 'Run All Tests'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workflowTests.map((test) => {
              const result = workflowTesting.testResults.find(r => r.testId === test.id);
              const isRunning = workflowTesting.currentTest === test.id;

              return (
                <Card key={test.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-sm font-medium">{test.name}</span>
                      {result && (
                        result.passed ? 
                          <CheckCircle className="h-5 w-5 text-emerald-600" /> :
                          <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                    
                    {isRunning && (
                      <div className="space-y-2">
                        <div className="text-sm">Running test...</div>
                        <Progress value={50} className="h-2" />
                      </div>
                    )}

                    {result && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Duration:</span>
                          <span>{result.duration}ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Steps:</span>
                          <span>{result.stepResults.filter(s => s.passed).length}/{result.stepResults.length}</span>
                        </div>
                        {result.errors.length > 0 && (
                          <div className="space-y-1">
                            {result.errors.slice(0, 2).map((error, index) => (
                              <Alert key={index} variant="destructive">
                                <AlertDescription className="text-xs">{error}</AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => workflowTesting.runWorkflowTest(test)}
                      disabled={isRunning}
                      className="w-full"
                    >
                      Run Test
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Performance Testing</h2>
            <Button 
              onClick={() => performanceTesting.runPerformanceTest('/api/employees', 10, 50, 'large')}
              disabled={performanceTesting.isRunning}
              className="gap-2"
            >
              {performanceTesting.isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run Performance Test
            </Button>
          </div>

          {performanceTesting.metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceTesting.metrics.averageResponseTime.toFixed(0)}ms</div>
                  <div className="text-xs text-muted-foreground">
                    {performanceTesting.metrics.minResponseTime.toFixed(0)}ms - {performanceTesting.metrics.maxResponseTime.toFixed(0)}ms
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Throughput</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceTesting.metrics.requestsPerSecond.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">requests/second</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {((performanceTesting.metrics.successfulRequests / performanceTesting.metrics.totalRequests) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {performanceTesting.metrics.successfulRequests}/{performanceTesting.metrics.totalRequests}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{performanceTesting.metrics.errorRate.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">{performanceTesting.metrics.failedRequests} failed</div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="consistency" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">State & Cache Consistency</h2>
            <Button 
              onClick={stateConsistency.checkCacheConsistency}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Check Now
            </Button>
          </div>

          <div className="space-y-4">
            {stateConsistency.inconsistencies.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-600" />
                    <p className="text-lg font-medium">All Systems Consistent</p>
                    <p className="text-muted-foreground">No cache or state inconsistencies detected</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              stateConsistency.inconsistencies.map((issue, index) => (
                <Alert key={index} variant={issue.severity === 'high' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>{issue.description}</span>
                      <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}>
                        {issue.severity}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Accessibility Compliance</h2>
            <Button 
              onClick={accessibility.checkAccessibility}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Scan Page
            </Button>
          </div>

          <div className="space-y-4">
            {accessibility.accessibilityIssues.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-600" />
                    <p className="text-lg font-medium">Accessibility Compliant</p>
                    <p className="text-muted-foreground">No accessibility issues detected on current page</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {accessibility.accessibilityIssues.map((issue, index) => (
                  <Alert key={index} variant={issue.severity === 'error' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span><strong>{issue.element}:</strong> {issue.issue}</span>
                        <Badge variant={issue.severity === 'error' ? 'destructive' : issue.severity === 'warning' ? 'default' : 'secondary'}>
                          {issue.severity}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QualityAssuranceDashboard;