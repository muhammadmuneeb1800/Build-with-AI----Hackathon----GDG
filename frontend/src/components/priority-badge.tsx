import type { Priority } from '../api'

interface PriorityBadgeProps {
  priority: Priority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return <span className={`badge badge-${priority}`}>{priority}</span>
}