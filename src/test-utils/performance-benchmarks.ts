import { performance } from 'perf_hooks'
import { vi } from 'vitest'

/**
 * Performance benchmarking utilities for tests
 */

interface PerformanceMetrics {
  renderTime: number
  interactionTime: number
  memoryUsage: number
  networkRequests: number
  bundleSize?: number
}

interface BenchmarkResult {
  name: string
  metrics: PerformanceMetrics
  timestamp: string
  passed: boolean
  thresholds: PerformanceThresholds
}

interface PerformanceThresholds {
  maxRenderTime: number
  maxInteractionTime: number
  maxMemoryUsage: number
  maxNetworkRequests: number
  maxBundleSize?: number
}

class PerformanceBenchmark {
  private startTime: number = 0
  private endTime: number = 0
  private memoryStart: number = 0
  private networkRequestCount: number = 0
  private name: string = ''

  constructor(name: string) {
    this.name = name
    this.setupNetworkMonitoring()
  }

  private setupNetworkMonitoring() {
    // Mock fetch to count network requests
    const originalFetch = global.fetch
    global.fetch = vi.fn((...args) => {
      this.networkRequestCount++
      return originalFetch?.(...args) || Promise.resolve(new Response())
    })
  }

  start() {
    this.startTime = performance.now()
    this.memoryStart = this.getMemoryUsage()
    this.networkRequestCount = 0
    return this
  }

  end() {
    this.endTime = performance.now()
    return this
  }

  private getMemoryUsage(): number {
    // In Node.js environment, use process.memoryUsage()
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed
    }
    
    // In browser environment, use performance.memory if available
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    
    // Fallback for environments without memory API
    return 0
  }

  getMetrics(): PerformanceMetrics {
    const renderTime = this.endTime - this.startTime
    const memoryUsage = this.getMemoryUsage() - this.memoryStart
    
    return {
      renderTime,
      interactionTime: 0, // Will be measured separately for interactions
      memoryUsage,
      networkRequests: this.networkRequestCount
    }
  }

  async measureInteraction(interactionFn: () => Promise<void>): Promise<number> {
    const start = performance.now()
    await interactionFn()
    const end = performance.now()
    return end - start
  }

  createResult(thresholds: PerformanceThresholds): BenchmarkResult {
    const metrics = this.getMetrics()
    const passed = this.evaluatePerformance(metrics, thresholds)
    
    return {
      name: this.name,
      metrics,
      timestamp: new Date().toISOString(),
      passed,
      thresholds
    }
  }

  private evaluatePerformance(metrics: PerformanceMetrics, thresholds: PerformanceThresholds): boolean {
    return (
      metrics.renderTime <= thresholds.maxRenderTime &&
      metrics.interactionTime <= thresholds.maxInteractionTime &&
      metrics.memoryUsage <= thresholds.maxMemoryUsage &&
      metrics.networkRequests <= thresholds.maxNetworkRequests &&
      (!thresholds.maxBundleSize || !metrics.bundleSize || metrics.bundleSize <= thresholds.maxBundleSize)
    )
  }
}

/**
 * Component performance testing
 */
export const measureComponentPerformance = async (
  componentName: string,
  renderFn: () => void,
  thresholds: PerformanceThresholds
): Promise<BenchmarkResult> => {
  const benchmark = new PerformanceBenchmark(componentName)
  
  benchmark.start()
  renderFn()
  benchmark.end()
  
  return benchmark.createResult(thresholds)
}

/**
 * User interaction performance testing
 */
export const measureInteractionPerformance = async (
  interactionName: string,
  interactionFn: () => Promise<void>,
  thresholds: PerformanceThresholds
): Promise<BenchmarkResult> => {
  const benchmark = new PerformanceBenchmark(interactionName)
  
  benchmark.start()
  const interactionTime = await benchmark.measureInteraction(interactionFn)
  benchmark.end()
  
  const metrics = benchmark.getMetrics()
  metrics.interactionTime = interactionTime
  
  return {
    name: interactionName,
    metrics,
    timestamp: new Date().toISOString(),
    passed: benchmark['evaluatePerformance'](metrics, thresholds),
    thresholds
  }
}

/**
 * Page load performance testing
 */
export const measurePageLoadPerformance = async (
  pageName: string,
  loadFn: () => Promise<void>,
  thresholds: PerformanceThresholds
): Promise<BenchmarkResult> => {
  const benchmark = new PerformanceBenchmark(pageName)
  
  benchmark.start()
  await loadFn()
  benchmark.end()
  
  return benchmark.createResult(thresholds)
}

/**
 * Batch performance testing
 */
export const runPerformanceSuite = async (
  tests: Array<{
    name: string
    testFn: () => void | Promise<void>
    thresholds: PerformanceThresholds
  }>
): Promise<BenchmarkResult[]> => {
  const results: BenchmarkResult[] = []
  
  for (const test of tests) {
    const benchmark = new PerformanceBenchmark(test.name)
    
    benchmark.start()
    await test.testFn()
    benchmark.end()
    
    results.push(benchmark.createResult(test.thresholds))
  }
  
  return results
}

/**
 * Performance regression testing
 */
interface PerformanceBaseline {
  name: string
  metrics: PerformanceMetrics
  timestamp: string
}

class PerformanceRegression {
  private baselines = new Map<string, PerformanceBaseline>()

  setBaseline(name: string, metrics: PerformanceMetrics) {
    this.baselines.set(name, {
      name,
      metrics,
      timestamp: new Date().toISOString()
    })
  }

  compareToBaseline(name: string, currentMetrics: PerformanceMetrics): {
    passed: boolean
    regressions: string[]
    improvements: string[]
    comparison: Record<keyof PerformanceMetrics, { current: number; baseline: number; change: number }>
  } {
    const baseline = this.baselines.get(name)
    if (!baseline) {
      throw new Error(`No baseline found for '${name}'`)
    }

    const comparison = {
      renderTime: {
        current: currentMetrics.renderTime,
        baseline: baseline.metrics.renderTime,
        change: ((currentMetrics.renderTime - baseline.metrics.renderTime) / baseline.metrics.renderTime) * 100
      },
      interactionTime: {
        current: currentMetrics.interactionTime,
        baseline: baseline.metrics.interactionTime,
        change: ((currentMetrics.interactionTime - baseline.metrics.interactionTime) / baseline.metrics.interactionTime) * 100
      },
      memoryUsage: {
        current: currentMetrics.memoryUsage,
        baseline: baseline.metrics.memoryUsage,
        change: ((currentMetrics.memoryUsage - baseline.metrics.memoryUsage) / baseline.metrics.memoryUsage) * 100
      },
      networkRequests: {
        current: currentMetrics.networkRequests,
        baseline: baseline.metrics.networkRequests,
        change: ((currentMetrics.networkRequests - baseline.metrics.networkRequests) / baseline.metrics.networkRequests) * 100
      }
    }

    const regressions: string[] = []
    const improvements: string[] = []
    const threshold = 10 // 10% change threshold

    Object.entries(comparison).forEach(([metric, data]) => {
      if (data.change > threshold) {
        regressions.push(`${metric}: ${data.change.toFixed(2)}% increase`)
      } else if (data.change < -threshold) {
        improvements.push(`${metric}: ${Math.abs(data.change).toFixed(2)}% decrease`)
      }
    })

    return {
      passed: regressions.length === 0,
      regressions,
      improvements,
      comparison
    }
  }

  getBaselines(): PerformanceBaseline[] {
    return Array.from(this.baselines.values())
  }
}

export const performanceRegression = new PerformanceRegression()

/**
 * Memory leak detection
 */
export const detectMemoryLeaks = async (
  testName: string,
  testFn: () => Promise<void>,
  iterations: number = 100
): Promise<{
  hasLeak: boolean
  memoryGrowth: number
  iterations: number
  samples: number[]
}> => {
  const samples: number[] = []
  
  // Force garbage collection if available
  const forceGC = () => {
    if (global.gc) {
      global.gc()
    }
  }

  // Initial measurement
  forceGC()
  const initialMemory = getMemoryUsage()
  samples.push(initialMemory)

  // Run test multiple times
  for (let i = 0; i < iterations; i++) {
    await testFn()
    
    // Measure memory every 10 iterations
    if (i % 10 === 9) {
      forceGC()
      await new Promise(resolve => setTimeout(resolve, 100)) // Allow GC to complete
      samples.push(getMemoryUsage())
    }
  }

  // Calculate memory growth
  const finalMemory = samples[samples.length - 1]
  const memoryGrowth = finalMemory - initialMemory
  const threshold = 1024 * 1024 * 10 // 10MB threshold

  return {
    hasLeak: memoryGrowth > threshold,
    memoryGrowth,
    iterations,
    samples
  }
}

function getMemoryUsage(): number {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage().heapUsed
  }
  
  if (typeof window !== 'undefined' && 'memory' in performance) {
    return (performance as any).memory.usedJSHeapSize
  }
  
  return 0
}

/**
 * Coverage analysis
 */
export const analyzeCoverage = (coverageData: any): {
  overall: number
  byFile: Record<string, number>
  uncoveredLines: Record<string, number[]>
  recommendations: string[]
} => {
  const overall = calculateOverallCoverage(coverageData)
  const byFile = calculateFilesCoverage(coverageData)
  const uncoveredLines = findUncoveredLines(coverageData)
  const recommendations = generateCoverageRecommendations(byFile)

  return {
    overall,
    byFile,
    uncoveredLines,
    recommendations
  }
}

function calculateOverallCoverage(coverageData: any): number {
  // Simplified coverage calculation
  if (!coverageData || !coverageData.total) return 0
  
  const { statements, branches, functions, lines } = coverageData.total
  const total = (statements.pct + branches.pct + functions.pct + lines.pct) / 4
  
  return Math.round(total * 100) / 100
}

function calculateFilesCoverage(coverageData: any): Record<string, number> {
  const filesCoverage: Record<string, number> = {}
  
  if (coverageData && coverageData.files) {
    Object.entries(coverageData.files).forEach(([filePath, data]: [string, any]) => {
      if (data.statements) {
        filesCoverage[filePath] = data.statements.pct
      }
    })
  }
  
  return filesCoverage
}

function findUncoveredLines(coverageData: any): Record<string, number[]> {
  const uncoveredLines: Record<string, number[]> = {}
  
  if (coverageData && coverageData.files) {
    Object.entries(coverageData.files).forEach(([filePath, data]: [string, any]) => {
      if (data.statementMap && data.s) {
        const uncovered: number[] = []
        Object.entries(data.s).forEach(([id, covered]: [string, any]) => {
          if (covered === 0) {
            const statement = data.statementMap[id]
            if (statement && statement.start) {
              uncovered.push(statement.start.line)
            }
          }
        })
        if (uncovered.length > 0) {
          uncoveredLines[filePath] = uncovered
        }
      }
    })
  }
  
  return uncoveredLines
}

function generateCoverageRecommendations(byFile: Record<string, number>): string[] {
  const recommendations: string[] = []
  
  Object.entries(byFile).forEach(([file, coverage]) => {
    if (coverage < 80) {
      recommendations.push(`Increase test coverage for ${file} (currently ${coverage}%)`)
    }
    if (coverage < 50) {
      recommendations.push(`CRITICAL: ${file} has very low coverage (${coverage}%) - add comprehensive tests`)
    }
  })
  
  return recommendations
}

/**
 * Default performance thresholds for different types of tests
 */
export const defaultThresholds = {
  component: {
    maxRenderTime: 100, // 100ms
    maxInteractionTime: 50, // 50ms
    maxMemoryUsage: 1024 * 1024, // 1MB
    maxNetworkRequests: 0
  },
  page: {
    maxRenderTime: 1000, // 1s
    maxInteractionTime: 200, // 200ms
    maxMemoryUsage: 1024 * 1024 * 5, // 5MB
    maxNetworkRequests: 10
  },
  interaction: {
    maxRenderTime: 50, // 50ms
    maxInteractionTime: 100, // 100ms
    maxMemoryUsage: 1024 * 512, // 512KB
    maxNetworkRequests: 1
  }
}

// Export all performance utilities (removing duplicates)
export {
  PerformanceBenchmark,
  defaultThresholds
}