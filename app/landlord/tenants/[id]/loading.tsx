import { MainLayout } from "@/components/main-layout"

export default function TenantProfileLoading() {
  return (
    <MainLayout>
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </MainLayout>
  )
}
