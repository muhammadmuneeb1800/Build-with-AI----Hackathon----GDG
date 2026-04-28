// import type { Priority } from '../api'

// interface PriorityBadgeProps {
//   priority: Priority
// }

// export function PriorityBadge({ priority }: PriorityBadgeProps) {
//   return <span className={`badge badge-${priority}`}>{priority}</span>
// }


import type { Priority } from '../api'

interface PriorityBadgeProps {
  priority: Priority
}

const PRIORITY_STYLES: Record<Priority, string> = {
  high:   'bg-[var(--danger-soft)]   text-[var(--danger)]',
  medium: 'bg-[rgba(245,158,11,0.12)] text-[var(--warning)]',
  low:    'bg-[var(--success-soft)]  text-[var(--success)]',
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center shrink-0',
        'px-2 py-0.5 rounded-full',
        'text-[10px] font-semibold tracking-[0.05em] uppercase',
        PRIORITY_STYLES[priority] ?? 'bg-[var(--bg-subtle)] text-[var(--text-muted)]',
      ].join(' ')}
    >
      {priority}
    </span>
  )
}