import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// End-to-end workflow testing utilities
export interface WorkflowTest {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  expectedDuration: number; // in milliseconds
}

export interface WorkflowStep {
  id: string;
  action: string;
  target: string;
  expectedResult: string;
  timeout?: number;
}

export interface TestResult {
  testId: string;
  passed: boolean;
  duration: number;
  errors: string[];
  stepResults: Array<{
    stepId: string;
    passed: boolean;
    duration: number;
    error?: string;
  }>;
}

// Pre-defined workflow tests
export const workflowTests: WorkflowTest[] = [
  {
    id: 'employee-lifecycle',
    name: 'Complete Employee Lifecycle',
    description: 'Test employee creation, onboarding, performance review, and termination',
    expectedDuration: 30000,
    steps: [
      { id: 'create-employee', action: 'POST', target: '/employees', expectedResult: 'Employee created successfully' },
      { id: 'start-onboarding', action: 'POST', target: '/onboarding/start', expectedResult: 'Onboarding workflow initiated' },
      { id: 'complete-tasks', action: 'PUT', target: '/onboarding/tasks', expectedResult: 'Tasks completed' },
      { id: 'submit-review', action: 'POST', target: '/performance/reviews', expectedResult: 'Review submitted' },
      { id: 'update-status', action: 'PUT', target: '/employees/:id/status', expectedResult: 'Status updated' }
    ]
  },
  {
    id: 'leave-management-flow',
    name: 'Leave Request Flow',
    description: 'Test leave request creation, approval workflow, and balance updates',
    expectedDuration: 20000,
    steps: [
      { id: 'check-balance', action: 'GET', target: '/leave/balances', expectedResult: 'Balance retrieved' },
      { id: 'create-request', action: 'POST', target: '/leave/requests', expectedResult: 'Request created' },
      { id: 'manager-approval', action: 'PUT', target: '/leave/requests/:id/approve', expectedResult: 'Request approved' },
      { id: 'balance-updated', action: 'GET', target: '/leave/balances', expectedResult: 'Balance reflects changes' }
    ]
  },
  {
    id: 'payroll-processing',
    name: 'Payroll Processing Workflow',
    description: 'Test payroll generation, approval, and distribution',
    expectedDuration: 25000,
    steps: [
      { id: 'generate-payslips', action: 'POST', target: '/payroll/generate', expectedResult: 'Payslips generated' },
      { id: 'review-payroll', action: 'GET', target: '/payroll/runs/:id', expectedResult: 'Payroll data retrieved' },
      { id: 'approve-payroll', action: 'PUT', target: '/payroll/runs/:id/approve', expectedResult: 'Payroll approved' },
      { id: 'process-payments', action: 'POST', target: '/payroll/process', expectedResult: 'Payments processed' }
    ]
  }
];

// Workflow testing hook
export function useWorkflowTesting() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const runWorkflowTest = useCallback(async (test: WorkflowTest): Promise<TestResult> => {
    const startTime = Date.now();
    const result: TestResult = {
      testId: test.id,
      passed: true,
      duration: 0,
      errors: [],
      stepResults: []
    };

    setCurrentTest(test.id);

    try {
      for (const step of test.steps) {
        const stepStartTime = Date.now();
        
        try {
          // Simulate API call
          await simulateApiCall(step.target, step.action);
          
          result.stepResults.push({
            stepId: step.id,
            passed: true,
            duration: Date.now() - stepStartTime
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.stepResults.push({
            stepId: step.id,
            passed: false,
            duration: Date.now() - stepStartTime,
            error: errorMessage
          });
          result.passed = false;
          result.errors.push(`Step ${step.id}: ${errorMessage}`);
        }
      }
    } catch (error) {
      result.passed = false;
      result.errors.push(error instanceof Error ? error.message : 'Test execution failed');
    }

    result.duration = Date.now() - startTime;
    setCurrentTest(null);
    return result;
  }, []);

  const runAllTests = useCallback(async (): Promise<TestResult[]> => {
    setIsRunning(true);
    const results: TestResult[] = [];

    for (const test of workflowTests) {
      const result = await runWorkflowTest(test);
      results.push(result);
      setTestResults(prev => [...prev, result]);
    }

    setIsRunning(false);
    return results;
  }, [runWorkflowTest]);

  const clearResults = useCallback(() => {
    setTestResults([]);
  }, []);

  return {
    testResults,
    isRunning,
    currentTest,
    runWorkflowTest,
    runAllTests,
    clearResults
  };
}

// Performance testing utilities
export interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
}

export function usePerformanceTesting() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runPerformanceTest = useCallback(async (
    endpoint: string,
    concurrentUsers: number = 10,
    requestsPerUser: number = 100,
    dataSize: 'small' | 'medium' | 'large' = 'medium'
  ): Promise<PerformanceMetrics> => {
    setIsRunning(true);
    
    const startTime = Date.now();
    const results: number[] = [];
    let successful = 0;
    let failed = 0;

    // Generate test data based on size
    const testDataSize = dataSize === 'small' ? 100 : dataSize === 'medium' ? 1000 : 10000;
    
    // Simulate concurrent requests
    const promises = Array.from({ length: concurrentUsers }, async () => {
      for (let i = 0; i < requestsPerUser; i++) {
        const requestStart = Date.now();
        try {
          await simulateApiCall(endpoint, 'GET', { size: testDataSize });
          const duration = Date.now() - requestStart;
          results.push(duration);
          successful++;
        } catch (error) {
          failed++;
        }
      }
    });

    await Promise.all(promises);
    
    const totalTime = Date.now() - startTime;
    const totalRequests = concurrentUsers * requestsPerUser;
    
    const performanceMetrics: PerformanceMetrics = {
      totalRequests,
      successfulRequests: successful,
      failedRequests: failed,
      averageResponseTime: results.reduce((a, b) => a + b, 0) / results.length || 0,
      minResponseTime: Math.min(...results) || 0,
      maxResponseTime: Math.max(...results) || 0,
      requestsPerSecond: (totalRequests / totalTime) * 1000,
      errorRate: (failed / totalRequests) * 100
    };

    setMetrics(performanceMetrics);
    setIsRunning(false);
    
    return performanceMetrics;
  }, []);

  return {
    metrics,
    isRunning,
    runPerformanceTest
  };
}

// Cache and state management testing
export function useStateConsistencyTesting() {
  const queryClient = useQueryClient();
  const [inconsistencies, setInconsistencies] = useState<Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>>([]);

  const checkCacheConsistency = useCallback(() => {
    const issues: Array<{ type: string; description: string; severity: 'low' | 'medium' | 'high' }> = [];
    const queries = queryClient.getQueryCache().getAll();

    // Check for stale data
    queries.forEach(query => {
      const staleTime = Date.now() - query.state.dataUpdatedAt;
      if (staleTime > 10 * 60 * 1000) { // 10 minutes
        issues.push({
          type: 'stale-data',
          description: `Query ${JSON.stringify(query.queryKey)} has stale data (${Math.round(staleTime / 1000)}s old)`,
          severity: 'medium'
        });
      }
    });

    // Check for cache size
    if (queries.length > 100) {
      issues.push({
        type: 'cache-size',
        description: `Large cache size: ${queries.length} queries cached`,
        severity: 'low'
      });
    }

    // Check for error states
    const errorQueries = queries.filter(q => q.state.error);
    if (errorQueries.length > 0) {
      issues.push({
        type: 'error-states',
        description: `${errorQueries.length} queries in error state`,
        severity: 'high'
      });
    }

    setInconsistencies(issues);
    return issues;
  }, [queryClient]);

  return {
    inconsistencies,
    checkCacheConsistency
  };
}

// Accessibility testing utilities
export function useAccessibilityTesting() {
  const [accessibilityIssues, setAccessibilityIssues] = useState<Array<{
    element: string;
    issue: string;
    severity: 'error' | 'warning' | 'info';
  }>>([]);

  const checkAccessibility = useCallback(() => {
    const issues: Array<{ element: string; issue: string; severity: 'error' | 'warning' | 'info' }> = [];

    // Check for missing alt text
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt) {
        issues.push({
          element: `img[${index}]`,
          issue: 'Missing alt text',
          severity: 'error'
        });
      }
    });

    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        issues.push({
          element: `${heading.tagName.toLowerCase()}[${index}]`,
          issue: 'Heading level skipped',
          severity: 'warning'
        });
      }
      previousLevel = level;
    });

    // Check for proper form labels
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input, index) => {
      const hasLabel = input.getAttribute('aria-label') || 
                     input.getAttribute('aria-labelledby') ||
                     document.querySelector(`label[for="${input.id}"]`);
      
      if (!hasLabel) {
        issues.push({
          element: `${input.tagName.toLowerCase()}[${index}]`,
          issue: 'Missing label or aria-label',
          severity: 'error'
        });
      }
    });

    setAccessibilityIssues(issues);
    return issues;
  }, []);

  return {
    accessibilityIssues,
    checkAccessibility
  };
}

// Utility function to simulate API calls
async function simulateApiCall(
  endpoint: string, 
  method: string = 'GET', 
  options: { size?: number } = {}
): Promise<any> {
  const { size = 100 } = options;
  
  // Simulate network delay based on data size
  const delay = Math.random() * 200 + (size / 100);
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Simulate occasional failures
  if (Math.random() < 0.05) { // 5% failure rate
    throw new Error(`API call to ${endpoint} failed`);
  }
  
  // Return mock data
  return {
    success: true,
    data: Array.from({ length: Math.min(size, 1000) }, (_, i) => ({
      id: i + 1,
      timestamp: new Date().toISOString()
    }))
  };
}