import type { ReactNode } from 'react'

import { APP_NAME, APP_TAGLINE } from '../constants'
import { SidebarNav } from './sidebar-nav'

interface AppShellProps {
  children: ReactNode
  rightPanel?: ReactNode
}

export function AppShell({ children, rightPanel }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true" />
          <div>
            <div className="brand-title">{APP_NAME}</div>
            <div className="brand-subtitle">{APP_TAGLINE}</div>
          </div>
        </div>

        <div className="sidebar-section">
          <SidebarNav />
        </div>

        <div className="sidebar-footer">
          <div className="eyebrow">Signal over noise</div>
          <div className="section-caption">
            The engine extracts commitments, flags risk, and keeps the founder focused on the next action.
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-shell">{children}</div>
      </main>

      <aside className="main-content insights-column">{rightPanel}</aside>
    </div>
  )
}