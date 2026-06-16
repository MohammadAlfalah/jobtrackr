import { useCallback, useEffect, useState } from 'react'
import {
  ApiError,
  createApplication,
  deleteApplication,
  getApplications,
  getStats,
  updateApplication,
} from '../api/client'
import type { ApplicationCreateDto, ApplicationReadDto, StatsDto } from '../types'
import { useAuth } from '../auth/useAuth'
import { useToast } from '../components/toast/useToast'
import { StatsCards } from '../components/StatsCards'
import { FilterBar } from '../components/FilterBar'
import type { StatusFilter } from '../components/FilterBar'
import { ApplicationCard } from '../components/ApplicationCard'
import { Modal } from '../components/Modal'
import { ApplicationForm } from '../components/ApplicationForm'
import { ConfirmDialog } from '../components/ConfirmDialog'

type FormState =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; application: ApplicationReadDto }

export function DashboardPage() {
  const { email, signOut } = useAuth()
  const { notify } = useToast()

  const [stats, setStats] = useState<StatsDto | null>(null)
  const [applications, setApplications] = useState<ApplicationReadDto[]>([])
  const [filter, setFilter] = useState<StatusFilter>('All')

  const [listLoading, setListLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({ kind: 'closed' })
  const [submitting, setSubmitting] = useState(false)

  const [toDelete, setToDelete] = useState<ApplicationReadDto | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadStats = useCallback(async (isActive: () => boolean = () => true) => {
    setStatsLoading(true)
    try {
      const result = await getStats()
      if (!isActive()) return
      setStats(result)
    } catch (err) {
      // Stats are secondary; a 401 is already handled globally. Surface other
      // failures quietly via a toast rather than blocking the dashboard.
      if (isActive() && err instanceof ApiError && err.status !== 401) {
        notify(err.message, 'error')
      }
    } finally {
      if (isActive()) setStatsLoading(false)
    }
  }, [notify])

  const loadApplications = useCallback(
    async (currentFilter: StatusFilter, isActive: () => boolean = () => true) => {
      setListLoading(true)
      setListError(null)
      try {
        const result = await getApplications(currentFilter === 'All' ? undefined : currentFilter)
        if (!isActive()) return
        setApplications(result)
      } catch (err) {
        if (!isActive()) return
        if (err instanceof ApiError) {
          if (err.status !== 401) setListError(err.message)
        } else {
          setListError('Could not load applications.')
        }
      } finally {
        if (isActive()) setListLoading(false)
      }
    },
    [],
  )

  // Initial load + whenever the filter changes. The `active` guard discards
  // stale responses so an older in-flight request can't overwrite newer state.
  // The loaders set state only asynchronously (the effect callback itself
  // doesn't call setState synchronously), keeping renders from cascading.
  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => {
      if (active) void loadApplications(filter, () => active)
    })
    return () => {
      active = false
    }
  }, [filter, loadApplications])

  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => {
      if (active) void loadStats(() => active)
    })
    return () => {
      active = false
    }
  }, [loadStats])

  const refresh = useCallback(async () => {
    await Promise.all([loadApplications(filter), loadStats()])
  }, [filter, loadApplications, loadStats])

  const handleCreate = async (dto: ApplicationCreateDto) => {
    setSubmitting(true)
    try {
      await createApplication(dto)
      setForm({ kind: 'closed' })
      notify('Application added.', 'success')
      await refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        notify(err.message, 'error')
      } else {
        notify('Could not add the application.', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (id: number, dto: ApplicationCreateDto) => {
    setSubmitting(true)
    try {
      await updateApplication(id, dto)
      setForm({ kind: 'closed' })
      notify('Application updated.', 'success')
      await refresh()
    } catch (err) {
      // The illegal-transition 400 message arrives here — surface it and keep
      // the form open so the user can pick a valid status.
      if (err instanceof ApiError) {
        notify(err.message, 'error')
      } else {
        notify('Could not update the application.', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteApplication(toDelete.id)
      notify('Application deleted.', 'success')
      setToDelete(null)
      await refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        notify(err.message, 'error')
      } else {
        notify('Could not delete the application.', 'error')
      }
    } finally {
      setDeleting(false)
    }
  }

  const counts = stats?.byStatus ?? {}
  const total = stats?.total ?? 0

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="topbar__brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="24" height="24">
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
          <div className="topbar__user">
            {email ? <span className="topbar__email">{email}</span> : null}
            <button type="button" className="btn btn--ghost btn--small" onClick={signOut}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="dashboard__intro">
          <div>
            <h1 className="page-title">Your applications</h1>
            <p className="page-subtitle">Keep every opportunity moving forward.</p>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setForm({ kind: 'create' })}
          >
            + Add application
          </button>
        </section>

        <StatsCards stats={stats} loading={statsLoading} />

        <FilterBar active={filter} onChange={setFilter} counts={counts} total={total} />

        <section className="applications">
          {listLoading ? (
            <div className="applications__grid">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="app-card app-card--skeleton" aria-hidden="true" />
              ))}
            </div>
          ) : listError ? (
            <div className="state state--error" role="alert">
              <p className="state__title">Couldn&apos;t load your applications</p>
              <p className="state__detail">{listError}</p>
              <button
                type="button"
                className="btn btn--primary btn--small"
                onClick={() => void loadApplications(filter)}
              >
                Try again
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="state state--empty">
              <div className="state__icon" aria-hidden="true">
                ✦
              </div>
              <p className="state__title">
                {filter === 'All'
                  ? 'No applications yet'
                  : `Nothing in “${filter}” right now`}
              </p>
              <p className="state__detail">
                {filter === 'All'
                  ? 'Add your first one to start tracking your job search.'
                  : 'Try a different filter, or add a new application.'}
              </p>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setForm({ kind: 'create' })}
              >
                + Add your first application
              </button>
            </div>
          ) : (
            <div className="applications__grid">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onEdit={(app) => setForm({ kind: 'edit', application: app })}
                  onDelete={(app) => setToDelete(app)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {form.kind !== 'closed' ? (
        <Modal
          title={form.kind === 'create' ? 'Add application' : 'Edit application'}
          onClose={() => setForm({ kind: 'closed' })}
        >
          <ApplicationForm
            initial={form.kind === 'edit' ? form.application : undefined}
            submitting={submitting}
            onCancel={() => setForm({ kind: 'closed' })}
            onSubmit={(dto) =>
              form.kind === 'edit'
                ? void handleUpdate(form.application.id, dto)
                : void handleCreate(dto)
            }
          />
        </Modal>
      ) : null}

      {toDelete ? (
        <ConfirmDialog
          title="Delete application"
          message={`Delete the ${toDelete.position} application at ${toDelete.company}? This cannot be undone.`}
          confirmLabel="Delete"
          busy={deleting}
          onConfirm={() => void handleDelete()}
          onCancel={() => setToDelete(null)}
        />
      ) : null}
    </div>
  )
}
