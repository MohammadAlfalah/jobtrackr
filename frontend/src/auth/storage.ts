// Token + email persistence in localStorage. Kept tiny and framework-free so it
// can be used both by the API client and the React auth context.

const TOKEN_KEY = 'jobtrackr.token'
const EMAIL_KEY = 'jobtrackr.email'

export interface StoredSession {
  token: string
  email: string
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY)
}

export function getSession(): StoredSession | null {
  const token = getToken()
  const email = getEmail()
  if (token && email) return { token, email }
  return null
}

export function saveSession(session: StoredSession): void {
  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(EMAIL_KEY, session.email)
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EMAIL_KEY)
}
