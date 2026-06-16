// Small formatting helpers shared across components.

/**
 * Formats an ISO date string (e.g. "2026-06-17" or a full timestamp) into a
 * readable form like "17 Jun 2026". Returns an em dash for empty/invalid input.
 */
export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Normalises an ISO date or timestamp down to the `yyyy-MM-dd` value an
 * `<input type="date">` expects. Returns '' for empty/invalid input.
 *
 * The backend sends no-offset datetimes (e.g. "2026-06-17T00:00:00"), which JS
 * parses as LOCAL time. We derive the calendar date from LOCAL components — not
 * `.toISOString()` (UTC) — so users east of UTC don't see the previous day, and
 * re-saving never silently shifts the date. This matches `formatDate`, which
 * also renders from the local Date.
 */
export function toDateInputValue(value?: string | null): string {
  if (!value) return ''
  // Already a date-only `yyyy-MM-dd` (optionally with a time portion): take the
  // calendar date verbatim, avoiding any timezone round-trip.
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
