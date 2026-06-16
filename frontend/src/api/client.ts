// Typed fetch wrapper + endpoint functions. All requests use the relative
// `/api` base so the same build works in dev (Vite proxy) and prod (nginx).

import { getToken } from '../auth/storage'
import type {
  ApplicationCreateDto,
  ApplicationReadDto,
  AuthResponse,
  ApplicationStatus,
  StatsDto,
} from '../types'

const API_BASE = '/api'

/**
 * Error thrown for any non-OK response. Carries the HTTP status and the
 * server-provided message (parsed from a `{ error }` body when present) so the
 * UI can surface things like the illegal-transition 400 message.
 */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Registered by the auth layer so a 401 anywhere clears the session and bumps
// the app back to the login screen.
let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false } = options

  const headers: Record<string, string> = {}
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    // Network-level failure (server down, proxy unreachable, offline, ...).
    throw new ApiError(0, 'Network error — could not reach the server.')
  }

  if (response.status === 401 && auth) {
    // Expired or invalid token: clear and redirect to login.
    if (onUnauthorized) onUnauthorized()
    throw new ApiError(401, 'Your session has expired. Please sign in again.')
  }

  if (!response.ok) {
    throw new ApiError(response.status, await extractErrorMessage(response))
  }

  // 204 No Content (and other empty bodies) — nothing to parse.
  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const text = await response.text()
    if (!text) return defaultMessageForStatus(response.status)
    const data = JSON.parse(text) as { error?: unknown; message?: unknown }
    if (typeof data.error === 'string') return data.error
    if (typeof data.message === 'string') return data.message
    return defaultMessageForStatus(response.status)
  } catch {
    return defaultMessageForStatus(response.status)
  }
}

function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'The request was invalid.'
    case 401:
      return 'Invalid email or password.'
    case 403:
      return 'You are not allowed to do that.'
    case 404:
      return 'Not found.'
    case 409:
      return 'That email is already registered.'
    default:
      return `Request failed (HTTP ${status}).`
  }
}

// ----- Auth endpoints -----

export function register(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { email, password },
  })
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

// ----- Application endpoints (all require the Bearer token) -----

export function getApplications(status?: ApplicationStatus): Promise<ApplicationReadDto[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return request<ApplicationReadDto[]>(`/applications${query}`, { auth: true })
}

export function getStats(): Promise<StatsDto> {
  return request<StatsDto>('/applications/stats', { auth: true })
}

export function createApplication(dto: ApplicationCreateDto): Promise<ApplicationReadDto> {
  return request<ApplicationReadDto>('/applications', {
    method: 'POST',
    body: dto,
    auth: true,
  })
}

export function updateApplication(id: number, dto: ApplicationCreateDto): Promise<void> {
  return request<void>(`/applications/${id}`, {
    method: 'PUT',
    body: dto,
    auth: true,
  })
}

export function deleteApplication(id: number): Promise<void> {
  return request<void>(`/applications/${id}`, {
    method: 'DELETE',
    auth: true,
  })
}
