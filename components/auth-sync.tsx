"use client"

import { useEffect } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { syncAuthState } from "@/lib/slices/usersSlice"

export function AuthSync() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    console.log("AuthSync - Initializing auth state...")
    dispatch(syncAuthState())
  }, [dispatch])

  return null
}
