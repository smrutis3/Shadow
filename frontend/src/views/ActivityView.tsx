import { useQuery } from '@tanstack/react-query'
import { getObservations } from '../api/observatory'
import { SourceChip } from '../components/common'
import { timeAgo } from '../lib/format'

export function ActivityView() {
  const observations = useQuery({
    queryKey: ['observations'],
    queryFn: () => getObservations(50),
    refetchInterval: 15_000,
  })

  const rows = observations.data ?? []

  return (
    <div className="view">
      <ol className="timeline">
        {observations.isLoading ? <li className="empty-state">Loading activity…</li> : null}
        {!observations.isLoading && rows.length === 0 ? <li className="empty-state">No activity observed yet.</li> : null}
        {rows.map(obs => (
          <li className="timeline-item" key={`${obs.id}-${obs.ts}`}>
            <span className="timeline-mark" aria-hidden="true" />
            <div className="timeline-body">
              <div className="timeline-meta">
                <SourceChip source={obs.source} />
                <span className="feed-time">{timeAgo(obs.ts)}</span>
              </div>
              <p className="feed-summary">{obs.summary}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
