"use client"

import type React from "react"

import { Provider } from "react-redux"
import { store } from "./store"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { AuthSync } from "@/components/auth-sync"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AuthSync />
        {children}
        <Toaster />
      </AuthProvider>
    </Provider>
  )
}
