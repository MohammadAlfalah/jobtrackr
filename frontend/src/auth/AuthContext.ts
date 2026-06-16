import { createContext } from 'react'

export interface AuthContextValue {
  /** The logged-in user's email, or null when signed out. */
  email: string | null
  /** True while a session token is present. */
  isAuthenticated: boolean
  /** Persist a freshly issued session (after login/register). */
  signIn: (token: string, email: string) => void
  /** Clear the session and return to the login screen. */
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
