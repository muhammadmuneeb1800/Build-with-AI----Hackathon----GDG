import type { Commitment } from '../api'
import { PRIORITY_COPY, STATUS_COPY } from '../constants'
import { PriorityBadge } from './priority-badge'
import { StatusPill } from './status-pill'

interface CommitmentCardProps {
  commitment: Commitment
  onToggleStatus: (commitmentId: string, currentStatus: Commitment['status']) => void
}

function formatDeadline(deadline: string | null) {
  if (!deadline) {
    return 'No deadline detected'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(deadline))
}

export function CommitmentCard({ commitment, onToggleStatus }: CommitmentCardProps) {
  return (
    <article className="commitment-card">
      <div className="commitment-topline">
        <div>
          <h3 className="commitment-title">{commitment.task}</h3>
          <div className="section-caption">{commitment.content}</div>
        </div>
        <PriorityBadge priority={commitment.priority} />
      </div>

      <div className="commitment-meta">
        <StatusPill status={commitment.status} />
        <span>{STATUS_COPY[commitment.status]}</span>
        <span>{PRIORITY_COPY[commitment.priority]}</span>
        <span>{formatDeadline(commitment.deadline)}</span>
        <button className="button button-ghost" type="button" onClick={() => onToggleStatus(commitment.id, commitment.status)}>
          {commitment.status === 'done' ? 'Reopen' : 'Mark done'}
        </button>
      </div>
    </article>
  )
}