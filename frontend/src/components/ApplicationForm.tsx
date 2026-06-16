import { useState } from 'react'
import type { FormEvent } from 'react'
import type {
  ApplicationCreateDto,
  ApplicationReadDto,
  ApplicationStatus,
} from '../types'
import { selectableStatuses } from '../types'
import { toDateInputValue } from '../lib/format'

interface ApplicationFormProps {
  /** When provided, the form is in edit mode and is pre-filled. */
  initial?: ApplicationReadDto
  submitting: boolean
  onSubmit: (dto: ApplicationCreateDto) => void
  onCancel: () => void
}

const DEFAULT_STATUS: ApplicationStatus = 'Wishlist'

export function ApplicationForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  const [company, setCompany] = useState(initial?.company ?? '')
  const [position, setPosition] = useState(initial?.position ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [status, setStatus] = useState<ApplicationStatus>(initial?.status ?? DEFAULT_STATUS)
  const [appliedOn, setAppliedOn] = useState(toDateInputValue(initial?.appliedOn))
  const [url, setUrl] = useState(initial?.url ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  // In edit mode only the current status + its allowed transitions are offered.
  // For a new application every status is available.
  const statusOptions = selectableStatuses(initial?.status)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const dto: ApplicationCreateDto = {
      company: company.trim(),
      position: position.trim(),
      location: location.trim() || undefined,
      status,
      appliedOn: appliedOn ? appliedOn : null,
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
    }
    onSubmit(dto)
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form__row">
        <div className="field">
          <label htmlFor="company">
            Company <span className="field__required">*</span>
          </label>
          <input
            id="company"
            type="text"
            value={company}
            required
            maxLength={200}
            placeholder="e.g. SAP"
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="position">
            Position <span className="field__required">*</span>
          </label>
          <input
            id="position"
            type="text"
            value={position}
            required
            maxLength={200}
            placeholder="e.g. Software Engineering Intern"
            onChange={(e) => setPosition(e.target.value)}
          />
        </div>
      </div>

      <div className="form__row">
        <div className="field">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={location}
            maxLength={200}
            placeholder="e.g. Berlin, Germany"
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form__row">
        <div className="field">
          <label htmlFor="appliedOn">Applied on</label>
          <input
            id="appliedOn"
            type="date"
            value={appliedOn}
            onChange={(e) => setAppliedOn(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="url">Posting URL</label>
          <input
            id="url"
            type="url"
            value={url}
            placeholder="https://…"
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={notes}
          rows={3}
          placeholder="Anything worth remembering — referral, recruiter name, deadlines…"
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add application'}
        </button>
      </div>
    </form>
  )
}
