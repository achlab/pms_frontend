"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { MobileSidebar } from "./mobile-sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:hidden">
        <MobileSidebar />
      </div>

      <main className="flex-1 min-h-0 overflow-auto lg:ml-0">
        <div className="min-h-0">{children}</div>
      </main>
    </div>
  )
}
