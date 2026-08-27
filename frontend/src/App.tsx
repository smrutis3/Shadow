import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRecommendations, getSkills, getWorkflows } from './api/observatory'
import { OverviewView } from './views/OverviewView'
import { RecommendationsView } from './views/RecommendationsView'
import { SkillsView } from './views/SkillsView'
import { WorkflowsView } from './views/WorkflowsView'
import { ActivityView } from './views/ActivityView'
import { ConnectionsView } from './views/ConnectionsView'
import { MemoryView } from './views/MemoryView'
import { NavIcon } from './components/NavIcon'

type ViewId = 'connections' | 'activity' | 'recommendations' | 'skills' | 'memory' | 'workflows' | 'overview'

const NAV_GROUPS: { label: string; items: { id: ViewId; label: string }[] }[] = [
  {
    label: 'Observe',
    items: [
      { id: 'connections', label: 'Connections' },
      { id: 'activity', label: 'Activity' },
    ],
  },
  {
    label: 'Automate',
    items: [
      { id: 'recommendations', label: 'Recommendations' },
      { id: 'skills', label: 'Skills' },
      { id: 'memory', label: 'Memory' },
    ],
  },
  {
    label: 'Report',
    items: [
      { id: 'workflows', label: 'Workflows' },
      { id: 'overview', label: 'Overview' },
    ],
  },
]

const TITLES: Record<ViewId, string> = {
  connections: 'Connected sources',
  activity: 'Live activity',
  recommendations: 'Tasks to turn into skills',
  skills: 'Your skills',
  memory: 'Agent memory (HydraDB)',
  workflows: 'Org workflows to deploy',
  overview: 'Weekly FDE report',
}

const NOTES: Record<ViewId, string> = {
  connections: 'Tools we watch. Connecting them is onboarding — we observe, we don’t act.',
  activity: 'Raw signal across connected sources. This is what we mine into workflow recommendations.',
  recommendations: 'Accepting a workflow generates a skill and installs it locally. It still runs under human approval.',
  skills: 'Generated skills, guardrails, teaching, and live runs.',
  memory: 'Autonomous reads and writes against HydraDB — the agent’s long-term memory, live.',
  workflows: 'End-to-end processes composed from skills, with org-level impact.',
  overview: 'Weekly FDE report: time freed, throughput, and AI cost.',
}

const GROUP_FOR: Record<ViewId, string> = {
  connections: 'Observe',
  activity: 'Observe',
  recommendations: 'Automate',
  skills: 'Automate',
  memory: 'Automate',
  workflows: 'Report',
  overview: 'Report',
}

export default function App() {
  const [view, setView] = useState<ViewId>('connections')
  const activeGroup = GROUP_FOR[view]
  const group = NAV_GROUPS.find(g => g.label === activeGroup) ?? NAV_GROUPS[0]

  const recommendations = useQuery({ queryKey: ['recommendations'], queryFn: getRecommendations })
  const skills = useQuery({ queryKey: ['skills'], queryFn: getSkills })
  const workflows = useQuery({ queryKey: ['workflows'], queryFn: getWorkflows })

  const badges: Partial<Record<ViewId, number>> = {
    recommendations: recommendations.data?.filter(r => r.status !== 'accepted').length,
    skills: skills.data?.length,
    workflows: workflows.data?.length,
  }

  return (
    <div className="fde-layout">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Understudy</span>
        </div>

        <nav className="stage-rail" aria-label="Product stages">
          {NAV_GROUPS.map((g, i) => (
            <button
              key={g.label}
              type="button"
              className={`stage-step ${activeGroup === g.label ? 'active' : ''}`}
              onClick={() => {
                if (!g.items.some(item => item.id === view)) setView(g.items[0].id)
              }}
            >
              <span className="stage-index">{i + 1}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <span className="live-dot" />
          <span>Listening</span>
        </div>
      </header>

      <div className="subnav">
        <div className="subnav-tabs">
          {group.items.map(item => {
            const badge = badges[item.id]
            return (
              <button
                key={item.id}
                type="button"
                className={`subnav-tab ${view === item.id ? 'active' : ''}`}
                onClick={() => setView(item.id)}
              >
                <NavIcon name={item.id} />
                <span>{item.label}</span>
                {badge ? <span className="nav-badge">{badge}</span> : null}
              </button>
            )
          })}
        </div>
        <div className="page-intro">
          <h2 className="content-title">{TITLES[view]}</h2>
          <p className="page-lede">{NOTES[view]}</p>
        </div>
      </div>

      <main className="workspace">
        {view === 'connections' ? <ConnectionsView /> : null}
        {view === 'activity' ? <ActivityView /> : null}
        {view === 'recommendations' ? <RecommendationsView /> : null}
        {view === 'skills' ? <SkillsView /> : null}
        {view === 'memory' ? <MemoryView /> : null}
        {view === 'workflows' ? <WorkflowsView /> : null}
        {view === 'overview' ? <OverviewView /> : null}
      </main>
    </div>
  )
}
