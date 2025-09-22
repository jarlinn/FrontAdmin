import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="backdrop-blur-sm bg-card/80 border-border/50">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-80" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Field skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Category Selection skeleton */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex items-center space-x-1">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-6" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Context Type Selection skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
              </div>

              {/* Context Field skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-24 w-full" />
              </div>

              {/* Generate Button skeleton */}
              <div className="flex justify-center">
                <Skeleton className="h-11 w-64" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          {/* Tips Card skeleton */}
          <Card className="backdrop-blur-sm bg-card/80 border-border/50">
            <CardHeader>
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Status Card skeleton */}
          <Card className="backdrop-blur-sm bg-card/80 border-border/50">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
