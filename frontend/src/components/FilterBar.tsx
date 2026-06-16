import type { ApplicationStatus } from '../types'
import { ALL_STATUSES } from '../types'

export type StatusFilter = ApplicationStatus | 'All'

interface FilterBarProps {
  active: StatusFilter
  onChange: (filter: StatusFilter) => void
  /** Per-status counts used to show a small number on each chip. */
  counts: Record<string, number>
  total: number
}

export function FilterBar({ active, onChange, counts, total }: FilterBarProps) {
  const filters: StatusFilter[] = ['All', ...ALL_STATUSES]

  return (
    <div className="filter-bar" role="group" aria-label="Filter applications by status">
      {filters.map((filter) => {
        const count = filter === 'All' ? total : counts[filter] ?? 0
        const isActive = active === filter
        return (
          <button
            key={filter}
            type="button"
            className="chip"
            data-status={filter === 'All' ? undefined : filter}
            aria-pressed={isActive}
            onClick={() => onChange(filter)}
          >
            {filter}
            <span className="chip__count">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
