import type { StatsDto, ApplicationStatus } from '../types'

interface StatsCardsProps {
  stats: StatsDto | null
  loading: boolean
}

// Key statuses to surface as cards (in addition to Total and Active).
const FEATURED: ApplicationStatus[] = ['Applied', 'Interviewing', 'Offer']

interface Card {
  label: string
  value: number
  accent: string
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading && !stats) {
    return (
      <div className="stats-row">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="stat-card stat-card--skeleton" aria-hidden="true" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  const cards: Card[] = [
    { label: 'Total', value: stats.total, accent: 'var(--c-brand)' },
    { label: 'Active', value: stats.activeCount, accent: 'var(--c-status-interviewing)' },
    ...FEATURED.map((status) => ({
      label: status,
      value: stats.byStatus[status] ?? 0,
      accent: `var(--c-status-${status.toLowerCase()})`,
    })),
  ]

  return (
    <div className="stats-row">
      {cards.map((card) => (
        <div key={card.label} className="stat-card" style={{ ['--accent' as string]: card.accent }}>
          <span className="stat-card__value">{card.value}</span>
          <span className="stat-card__label">{card.label}</span>
        </div>
      ))}
    </div>
  )
}
