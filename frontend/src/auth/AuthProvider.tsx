import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import type { AuthContextValue } from './AuthContext'
import { clearSession, getSession, saveSession } from './storage'
import { setUnauthorizedHandler } from '../api/client'

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialise from the full session (token AND email). `getSession()` returns
  // null unless both are present, so auth can never be gated on a stale email
  // with no usable token.
  const [session, setSession] = useState(() => getSession())

  const signIn = useCallback((token: string, userEmail: string) => {
    saveSession({ token, email: userEmail })
    setSession({ token, email: userEmail })
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  // Wire up the API client so any 401 forces a sign-out (which redirects to
  // the login screen because the dashboard is gated on `isAuthenticated`).
  useEffect(() => {
    setUnauthorizedHandler(signOut)
    return () => setUnauthorizedHandler(null)
  }, [signOut])

  const value = useMemo<AuthContextValue>(
    () => ({
      email: session?.email ?? null,
      isAuthenticated: session !== null,
      signIn,
      signOut,
    }),
    [session, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
