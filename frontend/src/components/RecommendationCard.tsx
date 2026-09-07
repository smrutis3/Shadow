import type { AcceptProgress, AcceptResult, Recommendation } from '../api/observatory'
import { Metric, SourceChip } from './common'
import { GenProgress } from './GenProgress'
import { cost, hours } from '../lib/format'

export function RecommendationCard({
  rec,
  onAccept,
  accepting,
  progress,
  result,
  error,
}: {
  rec: Recommendation
  onAccept: (id: string) => void
  accepting: boolean
  progress?: AcceptProgress
  result?: AcceptResult
  error?: string
}) {
  const installed = rec.status === 'accepted' || result?.status === 'installed'
  return (
    <article className={`rec-card ${installed ? 'rec-installed' : ''}`}>
      <header className="rec-head">
        <div>
          <h3>{rec.title}</h3>
          <div className="rec-apps">
            {rec.source_apps.map(app => (
              <SourceChip key={app} source={app} />
            ))}
            <span className="rec-confidence">{Math.round(rec.confidence * 100)}% confidence</span>
          </div>
        </div>
        {installed ? <span className="rec-badge">Installed</span> : null}
      </header>

      <div className="rec-metrics">
        <Metric label="Time saved / wk" value={hours(rec.roi.time_saved_minutes_per_week)} />
        <Metric label="Productivity" value={`${rec.roi.throughput_multiplier}x`} sub="throughput on this task" />
        <Metric label="Added AI cost / wk" value={cost(rec.roi.added_ai_cost_usd_per_week)} sub={`${cost(rec.roi.added_ai_cost_usd_per_year)}/yr`} />
        <Metric label="Frequency" value={rec.roi.frequency.split(' ')[0]} sub={`${rec.roi.occurrences_observed} seen`} />
      </div>

      <p className="rec-trigger">
        <strong>Trigger:</strong> {rec.trigger || '—'}
        {rec.target_artifact ? (
          <>
            {' '}· updates <code>{rec.target_artifact}</code>
            {rec.target_sheet ? ` / ${rec.target_sheet}` : ''}
          </>
        ) : null}
      </p>

      {rec.actions.length ? (
        <details className="rec-actions">
          <summary>{rec.actions.length} steps in the proposed skill</summary>
          <ol>
            {rec.actions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ol>
        </details>
      ) : null}

      <footer className="rec-foot">
        {installed ? (
          <div className="installed-banner">
            <strong>Installed into Codex{result?.codex_invoke ? <> as <code>{result.codex_invoke}</code></> : '.'}</strong>
            <code>{result?.codex_workflow ?? result?.local_path ?? '~/.codex/prompts'}</code>
            {result?.skill_md_preview ? (
              <details className="skill-preview">
                <summary>Preview SKILL.md</summary>
                <pre>{result.skill_md_preview}…</pre>
              </details>
            ) : null}
          </div>
        ) : accepting ? (
          <GenProgress pct={progress?.pct ?? 4} label={progress?.label ?? 'Preparing…'} />
        ) : (
          <button className="accept-btn" type="button" onClick={() => onAccept(rec.id)}>
            Accept &amp; install skill
          </button>
        )}
        {error ? <p className="rec-error">{error}</p> : null}
      </footer>
    </article>
  )
}
