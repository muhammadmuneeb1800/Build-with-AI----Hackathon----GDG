import { NavLink } from 'react-router-dom'

import { type Commitment, type DailyBriefResponse, type RiskResponse, updateCommitmentStatus } from '../api'
import { AppShell, CommitmentCard, EmptyState, InsightPanel, MetricCard } from '../components'
import { APP_NAME } from '../constants'
import { useDashboardData } from '../hooks'
import { appRoutes } from '../navigation/route'

function formatCount(value: number) {
  return new Intl.NumberFormat('en').format(value)
}

function buildRiskItems(risks: RiskResponse | null) {
  if (!risks) {
    return ['No risk data available yet.']
  }

  return [...risks.overdue, ...risks.high_priority_pending].slice(0, 5).map((item) => item.action_text || item.task)
}

function buildBriefItems(brief: DailyBriefResponse | null) {
  return brief?.suggested_actions.length ? brief.suggested_actions : ['No insights yet.']
}

export function DashboardPage() {
  const { commitments, risks, brief, loading, error, lastUpdated, refresh } = useDashboardData()
  const overdueCount = risks?.overdue.length ?? 0
  const highPriorityCount = risks?.high_priority_pending.length ?? 0
  const pendingCount = commitments.filter((item) => item.status === 'pending').length
  const completedCount = commitments.filter((item) => item.status === 'done').length

  async function handleToggleStatus(commitmentId: string, currentStatus: Commitment['status']) {
    const nextStatus = currentStatus === 'done' ? 'pending' : 'done'
    await updateCommitmentStatus(commitmentId, { status: nextStatus })
    await refresh()
  }

  return (
    <AppShell
      rightPanel={
        <div className="section-stack">
          <InsightPanel
            title="AI brief"
            caption="What the engine wants the founder to focus on right now."
            items={buildBriefItems(brief)}
          />
          <section className="card section-card">
            <div className="section-header">
              <div>
                <h2 className="section-title">Risk watch</h2>
                <div className="section-caption">Deadlines and high priority follow-ups.</div>
              </div>
            </div>
            <div className="risk-list">
              {buildRiskItems(risks).map((item) => (
                <div className="risk-item" key={item}>
                  <div className="risk-item-title">Action</div>
                  <div className="risk-item-body">{item}</div>
                </div>
              ))}
              {!loading && overdueCount === 0 && highPriorityCount === 0 ? (
                <div className="risk-item">
                  <div className="risk-item-title">All clear</div>
                  <div className="risk-item-body">No immediate risks detected.</div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      }
    >
      <section className="page-hero">
        <div className="hero-copy">
          <div className="eyebrow">Decision engine</div>
          <h1 className="page-title">Founder control center for commitments, risk, and action.</h1>
          <p className="page-description">
            {APP_NAME} turns raw founder input into structured commitments, tracks deadlines, and surfaces the next
            best action before the backlog becomes noise.
          </p>
        </div>
        <div className="hero-actions">
          <NavLink className="button button-primary" to={appRoutes.add}>
            Add commitment
          </NavLink>
          <button className="button button-ghost" type="button" onClick={() => void refresh()}>
            Refresh now
          </button>
        </div>
      </section>

      <section className="stats-grid">
        <MetricCard label="Open commitments" value={formatCount(commitments.length)} note="All active inputs captured by the engine." />
        <MetricCard label="Pending" value={formatCount(pendingCount)} note="Items waiting for execution or review." />
        <MetricCard label="Overdue" value={formatCount(overdueCount)} note="Risks that need attention immediately." />
        <MetricCard label="Completed" value={formatCount(completedCount)} note="Closed commitments from the current backlog." />
      </section>

      <section className="dashboard-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title">Commitments</h2>
              <div className="section-caption">Structured items extracted from founder input.</div>
            </div>
            {lastUpdated ? <div className="section-caption">Updated {new Date(lastUpdated).toLocaleTimeString()}</div> : null}
          </div>

          {loading ? (
            <div className="loading-state">Loading commitments and insight panels...</div>
          ) : error ? (
            <div className="error-state">
              <h3 className="error-state-title">Unable to load dashboard</h3>
              <p className="error-state-body">{error}</p>
            </div>
          ) : commitments.length > 0 ? (
            <div className="section-stack">
              {commitments.map((commitment) => (
                <CommitmentCard key={commitment.id} commitment={commitment} onToggleStatus={handleToggleStatus} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No commitments yet"
              body="Capture a founder note to let the engine extract a task, deadline, priority, and suggested action."
              actionHref={appRoutes.add}
              actionLabel="Add the first commitment"
            />
          )}
        </section>

        <div className="section-stack">
          <InsightPanel
            title="Top priorities"
            caption="The engine ranks the most important pending items first."
            items={brief?.top_priorities ?? ['No priorities generated yet.']}
          />
          <InsightPanel
            title="Risk summary"
            caption="What could slip if the founder does nothing now."
            items={brief?.risks ?? ['No risks yet.']}
          />
        </div>
      </section>
    </AppShell>
  )
}