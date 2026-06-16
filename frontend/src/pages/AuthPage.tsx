import { useState } from 'react'
import type { FormEvent } from 'react'
import { login, register, ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'

type Mode = 'login' | 'register'

export function AuthPage() {
  const { signIn } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isLogin = mode === 'login'

  const switchMode = () => {
    setMode(isLogin ? 'register' : 'login')
    setError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const fn = isLogin ? login : register
      const result = await fn(email.trim(), password)
      signIn(result.token, result.email)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth__panel">
        <div className="auth__brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="28" height="28">
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path
                d="M9 16.5l4.2 4.2L23 11"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="brand-name">JobTrackr</span>
        </div>

        <h1 className="auth__title">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
        <p className="auth__subtitle">
          {isLogin
            ? 'Sign in to keep track of every application.'
            : 'Start tracking your internship and job applications in one place.'}
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              required
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              required
              minLength={6}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? (
            <div className="alert alert--error" role="alert">
              {error}
            </div>
          ) : null}

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="auth__switch">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" className="link-btn" onClick={switchMode}>
            {isLogin ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>

      <aside className="auth__aside" aria-hidden="true">
        <div className="auth__aside-inner">
          <h2>Land your next role, organised.</h2>
          <p>
            Track applications from wishlist to offer, see your pipeline at a glance, and never
            lose a deadline again.
          </p>
          <ul className="auth__features">
            <li>Visual status pipeline</li>
            <li>Live stats and filters</li>
            <li>One place for every application</li>
          </ul>
        </div>
      </aside>
    </div>
  )
}
