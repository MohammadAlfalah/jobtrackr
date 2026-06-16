// Shared domain types for JobTrackr. These mirror the backend DTOs and the
// allowed status transitions enforced by the API.

export type ApplicationStatus =
  | 'Wishlist'
  | 'Applied'
  | 'Interviewing'
  | 'Offer'
  | 'Accepted'
  | 'Rejected'
  | 'Withdrawn'

export const ALL_STATUSES: ApplicationStatus[] = [
  'Wishlist',
  'Applied',
  'Interviewing',
  'Offer',
  'Accepted',
  'Rejected',
  'Withdrawn',
]

export interface ApplicationReadDto {
  id: number
  company: string
  position: string
  location?: string | null
  status: ApplicationStatus
  appliedOn?: string | null
  url?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface ApplicationCreateDto {
  company: string
  position: string
  location?: string
  status: ApplicationStatus
  appliedOn?: string | null
  url?: string
  notes?: string
}

export interface StatsDto {
  total: number
  byStatus: Record<string, number>
  activeCount: number
}

export interface AuthResponse {
  token: string
  email: string
}

/**
 * Allowed status transitions, mirroring the backend rules. The key is the
 * current status and the value is the list of statuses it may move to (not
 * including itself — staying on the same status is always allowed).
 */
export const STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  Wishlist: ['Applied', 'Withdrawn'],
  Applied: ['Interviewing', 'Offer', 'Rejected', 'Withdrawn'],
  Interviewing: ['Offer', 'Rejected', 'Withdrawn'],
  Offer: ['Accepted', 'Rejected', 'Withdrawn'],
  Accepted: [],
  Rejected: [],
  Withdrawn: [],
}

/**
 * Returns the list of statuses that are selectable when editing an application
 * that is currently in `current` — that is, the current status itself plus any
 * allowed next states. For a brand new application (no current status) every
 * status is offered.
 */
export function selectableStatuses(current?: ApplicationStatus): ApplicationStatus[] {
  if (!current) return [...ALL_STATUSES]
  return [current, ...STATUS_TRANSITIONS[current]]
}
