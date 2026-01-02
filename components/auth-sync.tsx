"use client"

import { useEffect, useRef, useMemo } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { syncAuthState } from "@/lib/slices/usersSlice"
import { useAuth } from "@/contexts/auth-context"

export function AuthSync() {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, isLoading } = useAuth()
  
  // Use ref to track previous values to prevent unnecessary syncs
  const prevStateRef = useRef<{
    userId: string | number | null
    isAuthenticated: boolean
    isLoading: boolean
  }>({
    userId: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Memoize user ID to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id || null, [user?.id])

  useEffect(() => {
    // Only sync if state actually changed
    const hasChanged = 
      prevStateRef.current.userId !== userId ||
      prevStateRef.current.isAuthenticated !== isAuthenticated ||
      prevStateRef.current.isLoading !== isLoading

    if (hasChanged) {
      console.log("AuthSync - Syncing auth state to Redux...", { 
        userId, 
        isAuthenticated, 
        isLoading 
      })
      
      dispatch(syncAuthState({ user, isAuthenticated, isLoading }))
      
      // Update ref with current values
      prevStateRef.current = {
        userId,
        isAuthenticated,
        isLoading,
      }
    }
  }, [dispatch, userId, isAuthenticated, isLoading, user])

  return null
}
