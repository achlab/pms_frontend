import { MainLayout } from "@/components/main-layout"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function ReportsLoading() {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    </MainLayout>
  )
}
