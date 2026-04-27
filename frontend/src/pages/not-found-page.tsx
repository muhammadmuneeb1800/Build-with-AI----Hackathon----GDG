import { NavLink } from 'react-router-dom'

import { AppShell } from '../components'
import { appRoutes } from '../navigation/route'

export function NotFoundPage() {
  return (
    <AppShell
      rightPanel={
        <div className="empty-state">
          <h3 className="empty-state-title">404</h3>
          <p className="empty-state-body">The requested page is not available in this MVP.</p>
        </div>
      }
    >
      <section className="not-found-state">
        <h1 className="not-found-title">Page not found</h1>
        <p className="not-found-body">Return to the dashboard or open the input screen to continue.</p>
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <NavLink className="button button-primary" to={appRoutes.dashboard}>
            Go to dashboard
          </NavLink>
          <NavLink className="button button-ghost" to={appRoutes.add}>
            Add commitment
          </NavLink>
        </div>
      </section>
    </AppShell>
  )
}