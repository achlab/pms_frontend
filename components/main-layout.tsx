"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { MobileSidebar } from "./mobile-sidebar"
import { NotificationBell } from "./notifications/notification-bell"

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

      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Header Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-end items-center">
          <NotificationBell />
        </header>

        {/* Main Content */}
        <main className="flex-1 min-h-0 overflow-auto">
          <div className="min-h-0">{children}</div>
        </main>
      </div>
    </div>
  )
}
