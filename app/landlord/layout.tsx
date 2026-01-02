/**
 * Landlord Layout
 * Persistent layout for all landlord routes
 * This ensures the sidebar stays mounted and doesn't reload between page navigations
 */

import { MainLayout } from "@/components/main-layout"

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}
