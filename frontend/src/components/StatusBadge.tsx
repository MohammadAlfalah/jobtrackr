import type { ApplicationStatus } from '../types'

/**
 * Colored pill for an application status. Colors are driven by a
 * `data-status` attribute so the palette lives in one place in styles.css and
 * stays consistent everywhere a badge appears.
 */
export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className="badge" data-status={status}>
      <span className="badge__dot" aria-hidden="true" />
      {status}
    </span>
  )
}
