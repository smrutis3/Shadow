import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRecommendations, getSkills } from './api/observatory'
import { WatchView } from './views/WatchView'
import { BuildView } from './views/BuildView'
import { ImpactView } from './views/ImpactView'

type StageId = 'watch' | 'build' | 'impact'

const STAGES: { id: StageId; label: string; title: string; lede: string }[] = [
  {
    id: 'watch',
    label: 'Watch',
    title: 'Watch the work',
    lede: 'Sources on the left, repeats on the right. Accept one to generate a skill.',
  },
  {
    id: 'build',
    label: 'Build',
    title: 'Build and run the skill',
    lede: 'Diagram, teach, and run in one studio. Memory stays on the side.',
  },
  {
    id: 'impact',
    label: 'Impact',
    title: 'Weekly impact',
    lede: 'Time freed, AI cost, and the org workflows a forward-deployed engineer would ship.',
  },
]

export default function App() {
  const [stage, setStage] = useState<StageId>('watch')

  const recommendations = useQuery({ queryKey: ['recommendations'], queryFn: getRecommendations })
  const skills = useQuery({ queryKey: ['skills'], queryFn: getSkills })

  const pending = recommendations.data?.filter(r => r.status !== 'accepted').length
  const skillCount = skills.data?.length

  return (
    <div className="fde-layout">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Understudy</span>
        </div>

        <nav className="stage-rail" aria-label="Product stages">
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`stage-step ${stage === s.id ? 'active' : ''}`}
              onClick={() => setStage(s.id)}
            >
              <span className="stage-index">{i + 1}</span>
              <span>{s.label}</span>
              {s.id === 'watch' && pending ? <span className="nav-badge">{pending}</span> : null}
              {s.id === 'build' && skillCount ? <span className="nav-badge">{skillCount}</span> : null}
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <span className="live-dot" />
          <span>Listening</span>
        </div>
      </header>

      <div className="stage-intro">
        <p className="content-kicker">
          {STAGES.findIndex(s => s.id === stage) + 1} / {STAGES.length}
        </p>
        <h2 className="content-title">{STAGES.find(s => s.id === stage)?.title}</h2>
        <p className="page-lede">{STAGES.find(s => s.id === stage)?.lede}</p>
      </div>

      <main className="workspace">
        {stage === 'watch' ? <WatchView onInstalled={() => setStage('build')} /> : null}
        {stage === 'build' ? <BuildView onGoWatch={() => setStage('watch')} /> : null}
        {stage === 'impact' ? <ImpactView /> : null}
      </main>
    </div>
  )
}
