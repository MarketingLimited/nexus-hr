import { TrendingUp, TrendingDown, AlertTriangle, Target, Users, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCrossModuleInsights } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

interface CrossModuleInsightsProps {
  filters?: any;
}

const CrossModuleInsights: React.FC<CrossModuleInsightsProps> = ({ filters }) => {
  const { data: insights, isLoading, error } = useCrossModuleInsights(filters);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load cross-module insights. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const { correlations, predictions, recommendations } = insights;

  return (
    <div className="space-y-6">
      {/* Correlation Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-employees" />
              Attendance vs Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Correlation</span>
                <Badge variant={correlations.attendancePerformance.trend === 'positive' ? 'default' : 'secondary'}>
                  {(correlations.attendancePerformance.correlation * 100).toFixed(1)}%
                </Badge>
              </div>
              <Progress value={Math.abs(correlations.attendancePerformance.correlation) * 100} />
              <p className="text-sm text-muted-foreground">
                {correlations.attendancePerformance.insight}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-leaves" />
              Leave vs Productivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Impact</span>
                <Badge variant="outline">
                  {(correlations.leaveProductivity.correlation * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className="space-y-2">
                {correlations.leaveProductivity.departments.slice(0, 3).map((dept) => (
                  <div key={dept.name} className="flex justify-between text-sm">
                    <span>{dept.name}</span>
                    <span className="text-muted-foreground">{dept.impact.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {correlations.leaveProductivity.insight}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-payroll" />
              Compensation vs Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Correlation</span>
                <Badge variant="default">
                  {(correlations.payrollRetention.correlation * 100).toFixed(1)}%
                </Badge>
              </div>
              <Progress value={correlations.payrollRetention.correlation * 100} />
              <div className="space-y-1">
                {correlations.payrollRetention.riskFactors.slice(0, 2).map((factor, index) => (
                  <p key={index} className="text-xs text-muted-foreground">
                    • {factor}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Predictive Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Turnover Risk */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                High Turnover Risk
              </h4>
              <div className="space-y-2">
                {predictions.turnoverRisk.slice(0, 3).map((risk) => (
                  <div key={risk.employeeId} className="p-3 border rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Employee #{risk.employeeId.slice(-4)}</span>
                      <Badge variant="destructive">{(risk.risk * 100).toFixed(0)}%</Badge>
                    </div>
                    <div className="space-y-1">
                      {risk.factors.slice(0, 2).map((factor, index) => (
                        <p key={index} className="text-xs text-muted-foreground">• {factor}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Patterns */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-leaves" />
                Leave Predictions
              </h4>
              <div className="space-y-2">
                {predictions.leavePatterns.slice(0, 3).map((pattern) => (
                  <div key={pattern.period} className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">{pattern.period}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">{pattern.expectedRequests} requests</div>
                      <div className="text-xs text-muted-foreground">
                        {(pattern.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Projections */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-payroll" />
                Cost Projections
              </h4>
              <div className="space-y-2">
                {predictions.costProjections.slice(0, 3).map((projection) => (
                  <div key={projection.month} className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">{projection.month}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ${(projection.projectedCost / 1000).toFixed(0)}k
                      </div>
                      <div className={`text-xs ${projection.variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {projection.variance >= 0 ? '+' : ''}{(projection.variance * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-red-600">Immediate Actions</h4>
              <ul className="space-y-2">
                {recommendations.immediate.map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-orange-600">Short-term (1-3 months)</h4>
              <ul className="space-y-2">
                {recommendations.shortTerm.map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-emerald-600">Long-term (3+ months)</h4>
              <ul className="space-y-2">
                {recommendations.longTerm.map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrossModuleInsights;