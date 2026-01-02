/**
 * Admin Layout
 * Persistent layout for all admin (super_admin) routes
 * This ensures the sidebar stays mounted and doesn't reload between page navigations
 */

import { MainLayout } from "@/components/main-layout"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}

