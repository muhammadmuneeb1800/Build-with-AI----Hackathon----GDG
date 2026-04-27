import { NavLink } from 'react-router-dom'

import type { AppRoute } from '../navigation/route'

interface EmptyStateProps {
  title: string
  body: string
  actionLabel?: string
  actionHref?: AppRoute
}

export function EmptyState({ title, body, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-body">{body}</p>
      {actionLabel && actionHref ? (
        <div style={{ marginTop: '16px' }}>
          <NavLink className="button button-primary" to={actionHref}>
            {actionLabel}
          </NavLink>
        </div>
      ) : null}
    </div>
  )
}