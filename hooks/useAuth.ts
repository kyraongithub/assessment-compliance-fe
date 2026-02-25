'use client'

import { useSession } from '@/providers/session-provider'

export function useAuth() {
  const { user, isLoading, isAuthenticated, signOut } = useSession()

  return {
    user,
    isLoading,
    isAuthenticated,
    signOut,
  }
}
