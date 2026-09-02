import { OverviewView } from './OverviewView'
import { WorkflowsView } from './WorkflowsView'

export function ImpactView() {
  return (
    <div className="view impact-view">
      <OverviewView />
      <h3 className="pane-title impact-heading">Org workflows to deploy</h3>
      <WorkflowsView />
    </div>
  )
}
