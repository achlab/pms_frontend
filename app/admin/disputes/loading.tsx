import { MainLayout } from "@/components/main-layout"
import { CardContent, CardHeader } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"

export default function AdminDisputesLoading() {
  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <AnimatedCard key={i} delay={100 + i * 100} className="bg-white dark:bg-gray-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                </div>
              </CardContent>
            </AnimatedCard>
          ))}
        </div>

        {/* Filters Skeleton */}
        <AnimatedCard delay={500} className="bg-white dark:bg-gray-700">
          <CardHeader>
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/4 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Disputes List Skeleton */}
        <AnimatedCard delay={600} className="bg-white dark:bg-gray-700">
          <CardHeader>
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3 animate-pulse"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-600 rounded-lg animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-500 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-500 rounded w-3/4 mb-3"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-3 bg-gray-200 dark:bg-gray-500 rounded w-full"></div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </AnimatedCard>
      </div>
    </MainLayout>
  )
}
