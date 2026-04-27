import type { CommitmentStatus } from '../api'

interface StatusPillProps {
  status: CommitmentStatus
}

export function StatusPill({ status }: StatusPillProps) {
  return <span className={`status-pill ${status}`}>{status}</span>
}