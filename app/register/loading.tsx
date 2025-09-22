import { Card, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function RegisterLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-24 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>

            {/* Role Selection Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-4 w-16 mx-auto" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <Skeleton className="h-3 w-64 mx-auto" />
            </div>
          </CardHeader>
        </Card>

        <Skeleton className="h-3 w-56 mx-auto" />
      </div>
    </div>
  )
}
