import type { ApplicationReadDto } from '../types'
import { StatusBadge } from './StatusBadge'
import { formatDate } from '../lib/format'

interface ApplicationCardProps {
  application: ApplicationReadDto
  onEdit: (application: ApplicationReadDto) => void
  onDelete: (application: ApplicationReadDto) => void
}

/**
 * Returns the url only if it uses an http(s) scheme, otherwise null. This blocks
 * stored-XSS sinks like `javascript:` URLs from ever becoming a live href.
 */
function safeHref(url?: string | null): string | null {
  if (!url) return null
  const trimmed = url.trim()
  return /^https?:\/\//i.test(trimmed) ? trimmed : null
}

export function ApplicationCard({ application, onEdit, onDelete }: ApplicationCardProps) {
  const { company, position, location, status, appliedOn, url, notes } = application
  const href = safeHref(url)

  return (
    <article className="app-card">
      <div className="app-card__main">
        <div className="app-card__heading">
          <h3 className="app-card__position">{position}</h3>
          <StatusBadge status={status} />
        </div>
        <p className="app-card__company">{company}</p>

        <dl className="app-card__meta">
          {location ? (
            <div className="app-card__meta-item">
              <dt>Location</dt>
              <dd>{location}</dd>
            </div>
          ) : null}
          <div className="app-card__meta-item">
            <dt>Applied</dt>
            <dd>{formatDate(appliedOn)}</dd>
          </div>
          {href ? (
            <div className="app-card__meta-item">
              <dt>Posting</dt>
              <dd>
                <a href={href} target="_blank" rel="noopener noreferrer" className="link">
                  View ↗
                </a>
              </dd>
            </div>
          ) : null}
        </dl>

        {notes ? <p className="app-card__notes">{notes}</p> : null}
      </div>

      <div className="app-card__actions">
        <button type="button" className="btn btn--small" onClick={() => onEdit(application)}>
          Edit
        </button>
        <button
          type="button"
          className="btn btn--small btn--danger-ghost"
          onClick={() => onDelete(application)}
        >
          Delete
        </button>
      </div>
    </article>
  )
}
