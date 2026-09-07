import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { acceptRecommendation, getConnections, getObservations, getRecommendations } from '../api/observatory'
import type { AcceptProgress, AcceptResult } from '../api/observatory'
import { SourceChip } from '../components/common'
import { timeAgo } from '../lib/format'
import { RecommendationCard } from '../components/RecommendationCard'

export function WatchView({ onInstalled }: { onInstalled?: () => void }) {
  const queryClient = useQueryClient()
  const [results, setResults] = useState<Record<string, AcceptResult>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState<Record<string, AcceptProgress>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const connections = useQuery({ queryKey: ['connections'], queryFn: getConnections, refetchInterval: 15_000 })
  const observations = useQuery({
    queryKey: ['observations'],
    queryFn: () => getObservations(50),
    refetchInterval: 15_000,
  })
  const recommendations = useQuery({ queryKey: ['recommendations'], queryFn: getRecommendations })

  const accept = useMutation({
    mutationFn: (id: string) =>
      acceptRecommendation(id, p => setProgress(prev => ({ ...prev, [id]: p }))),
    onMutate: (id: string) => {
      setErrors(prev => ({ ...prev, [id]: '' }))
      setProgress(prev => ({ ...prev, [id]: { stage: 'start', label: 'Preparing…', pct: 4 } }))
    },
    onSuccess: async (result, id) => {
      if (result.status === 'installed') {
        setResults(prev => ({ ...prev, [id]: result }))
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['recommendations'] }),
          queryClient.invalidateQueries({ queryKey: ['weekly-report'] }),
          queryClient.invalidateQueries({ queryKey: ['skills'] }),
        ])
        onInstalled?.()
      } else {
        setErrors(prev => ({ ...prev, [id]: 'The skill could not be generated. Check the API logs.' }))
      }
    },
    onError: (err, id) => {
      setErrors(prev => ({ ...prev, [id]: err instanceof Error ? err.message : 'Accept failed.' }))
    },
  })

  const recs = recommendations.data ?? []
  const active = recs.find(r => r.id === selectedId) ?? recs[0] ?? null
  const rows = observations.data ?? []

  return (
    <div className="view watch-view">
      <div className="watch-sources">
        {(connections.data ?? []).map(conn => (
          <div className="watch-source" key={conn.id}>
            <SourceChip source={conn.id} />
            <span className="conn-status">
              <span className="conn-dot" /> {conn.status}
            </span>
            <span className="conn-meta">
              {conn.event_count} events
              {conn.last_event_at ? ` · ${timeAgo(conn.last_event_at)}` : ''}
            </span>
          </div>
        ))}
      </div>

      <div className="watch-canvas">
        <section className="watch-feed">
          <h3 className="pane-title">Live activity</h3>
          <ol className="timeline">
            {observations.isLoading ? <li className="empty-state">Loading activity…</li> : null}
            {!observations.isLoading && rows.length === 0 ? (
              <li className="empty-state">No activity observed yet.</li>
            ) : null}
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
        </section>

        <section className="watch-queue">
          <h3 className="pane-title">Turn a repeat into a skill</h3>
          {recommendations.isLoading ? <div className="empty-state">Mining your activity…</div> : null}
          {!recommendations.isLoading && recs.length === 0 ? (
            <div className="empty-state">No repeated workflows detected yet.</div>
          ) : null}
          {recs.length ? (
            <div className="watch-queue-body">
              <div className="split-list">
                {recs.map(rec => {
                  const installed = rec.status === 'accepted' || results[rec.id]?.status === 'installed'
                  return (
                    <button
                      key={rec.id}
                      type="button"
                      className={`split-item ${active?.id === rec.id ? 'active' : ''}`}
                      onClick={() => setSelectedId(rec.id)}
                    >
                      <strong>{rec.title}</strong>
                      <span>
                        {Math.round(rec.confidence * 100)}% · {rec.source_apps.join(' + ')}
                        {installed ? ' · installed' : ''}
                      </span>
                    </button>
                  )
                })}
              </div>
              {active ? (
                <RecommendationCard
                  key={active.id}
                  rec={active}
                  onAccept={accept.mutate}
                  accepting={accept.isPending && accept.variables === active.id}
                  progress={progress[active.id]}
                  result={results[active.id]}
                  error={errors[active.id]}
                />
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
