import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface LoadingStateProps {
  variant?: 'card' | 'list' | 'table' | 'form' | 'dashboard'
  count?: number
  className?: string
}

export function LoadingState({ variant = 'card', count = 1, className }: LoadingStateProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <Card className={className}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        )

      case 'list':
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        )

      case 'table':
        return (
          <div className={`space-y-4 ${className}`}>
            <div className="grid grid-cols-4 gap-4 p-4 border-b">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 p-4">
                {Array.from({ length: 4 }, (_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        )

      case 'form':
        return (
          <div className={`space-y-6 ${className}`}>
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        )

      case 'dashboard':
        return (
          <div className={`space-y-6 ${className}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }, (_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-6" />
                    </div>
                    <Skeleton className="h-8 w-20 mt-2" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 2 }, (_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Array.from({ length: 3 }, (_, j) => (
                      <div key={j} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      default:
        return <Skeleton className={`h-20 w-full ${className}`} />
    }
  }

  return <>{renderSkeleton()}</>
}