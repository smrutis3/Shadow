import { useQuery } from '@tanstack/react-query'
import { getWeeklyReport } from '../api/observatory'
import { SourceChip } from '../components/common'
import { TrendChart } from '../components/TrendChart'
import { cost, hours } from '../lib/format'

export function OverviewView() {
  const report = useQuery({ queryKey: ['weekly-report'], queryFn: getWeeklyReport })
  const totals = report.data?.totals
  const recs = [...(report.data?.recommendations ?? [])].sort(
    (a, b) => b.roi.time_saved_hours_per_week - a.roi.time_saved_hours_per_week,
  )
  const maxHours = Math.max(1, ...recs.map(r => r.roi.time_saved_hours_per_week))

  return (
    <div className="view briefing">
      <header className="briefing-hero">
        <p className="briefing-kicker">
          Weekly FDE memo{report.data?.period ? ` · ${report.data.period}` : ''}
        </p>
        {report.isLoading ? (
          <p className="briefing-hours-label">Generating this week’s advisory…</p>
        ) : totals ? (
          <>
            <div className="briefing-scoreboard">
              <div className="score">
                <strong>{hours(totals.time_saved_minutes_per_week)}</strong>
                <span>hours freed / week</span>
              </div>
              <div className="score">
                <strong>{totals.fte_equivalent}</strong>
                <span>FTE of capacity</span>
              </div>
              <div className="score">
                <strong>{totals.productivity_multiplier}x</strong>
                <span>throughput</span>
              </div>
              <div className="score score-cost">
                <strong>{cost(totals.added_ai_cost_usd_per_week)}</strong>
                <span>added AI / week</span>
              </div>
            </div>
            <ul className="briefing-chips">
              <li>{totals.workflows_found} workflow{totals.workflows_found === 1 ? '' : 's'} found</li>
              <li>{totals.workflows_accepted} installed · {totals.workflows_proposed} proposed</li>
              <li>Human approval on every run</li>
              <li>Adds spend, does not cut it</li>
            </ul>
          </>
        ) : null}
      </header>

      {totals ? (
        <ul className="briefing-stats">
          <li>
            <strong>{Math.round(totals.time_saved_hours_per_week * 52)}h</strong>
            <span>hours / year at this run rate</span>
          </li>
          <li>
            <strong>{cost(totals.added_ai_cost_usd_per_year)}</strong>
            <span>net new AI spend / year</span>
          </li>
          <li>
            <strong>{cost(totals.observation_cost_usd_per_week ?? 0)}</strong>
            <span>observation cost / week</span>
          </li>
          <li>
            <strong>{Math.round((report.data?.usage_trend ?? []).slice(-1)[0]?.value ?? 0)}</strong>
            <span>skill runs yesterday</span>
          </li>
        </ul>
      ) : null}

      <section className="briefing-trend">
        <h3 className="pane-title">How often skills ran</h3>
        <TrendChart data={report.data?.usage_trend ?? []} height={120} />
      </section>

      {recs.length ? (
        <section className="briefing-ranks">
          <h3 className="pane-title">Where the hours come from</h3>
          <ol className="rank-list">
            {recs.map((r, i) => (
              <li className="rank-row" key={r.id}>
                <span className="rank-index">{i + 1}</span>
                <div className="rank-body">
                  <div className="rank-head">
                    <strong>{r.title}</strong>
                    <span className={`rt-status ${r.status === 'accepted' ? 'done' : ''}`}>
                      {r.status === 'accepted' ? 'installed' : 'proposed'}
                    </span>
                  </div>
                  <div className="rank-meta">
                    <span className="rt-apps">
                      {r.source_apps.map(app => (
                        <SourceChip key={app} source={app} />
                      ))}
                    </span>
                    <span>{Math.round(r.confidence * 100)}% confidence</span>
                    <span>{r.roi.throughput_multiplier}x throughput</span>
                  </div>
                  <div className="rank-bar-track" aria-hidden="true">
                    <div
                      className="rank-bar-fill"
                      style={{ width: `${Math.round((r.roi.time_saved_hours_per_week / maxHours) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="rank-hours">
                  <strong>{r.roi.time_saved_hours_per_week}h</strong>
                  <span>/ week</span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  )
}
