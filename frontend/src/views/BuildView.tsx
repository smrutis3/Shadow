import { SkillsView } from './SkillsView'
import { MemoryView } from './MemoryView'

export function BuildView({ onGoWatch }: { onGoWatch?: () => void }) {
  return (
    <div className="view build-view">
      <div className="build-studio">
        <div className="build-main">
          <SkillsView onGoWatch={onGoWatch} />
        </div>
        <aside className="build-memory">
          <h3 className="pane-title">Memory</h3>
          <MemoryView />
        </aside>
      </div>
    </div>
  )
}
