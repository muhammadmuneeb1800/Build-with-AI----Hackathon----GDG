// import type { CommitmentStatus } from '../api'

// interface StatusPillProps {
//   status: CommitmentStatus
// }

// export function StatusPill({ status }: StatusPillProps) {
//   return <span className={`status-pill ${status}`}>{status}</span>
// }



import type { CommitmentStatus } from '../api'

interface StatusPillProps {
  status: CommitmentStatus
}

const STATUS_STYLES: Record<CommitmentStatus, string> = {
  missed: 'bg-[var(--danger-soft)]  text-[var(--danger)]',
  pending: 'bg-[var(--accent-soft)]  text-[var(--accent)]',
  done:    'bg-[var(--success-soft)] text-[var(--success)]',
}

export function StatusPill({ status }: StatusPillProps) {
  return (
    <span
      className={[
        'inline-flex items-center',
        'px-2 py-0.5 rounded-full',
        'text-[10px] font-semibold tracking-[0.05em] uppercase',
        STATUS_STYLES[status] ?? 'bg-[var(--bg-subtle)] text-[var(--text-muted)]',
      ].join(' ')}
    >
      {status}
    </span>
  )
}