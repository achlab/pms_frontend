"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { currentUser } = useAppSelector((state) => state.users)

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login")
    } else if (currentUser.role !== "tenant") {
      router.replace("/dashboard")
    }
  }, [currentUser, router])

  return children
}
