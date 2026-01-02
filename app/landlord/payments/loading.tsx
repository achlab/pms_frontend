import { LoadingSpinner } from "@/components/loading-spinner"

export default function PaymentsLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  )
}
