import { useState } from 'react'

import { AppShell } from '../components'

export function ProfilePage() {
  const [notificationThreshold, setNotificationThreshold] = useState('high')
  const [riskLevel, setRiskLevel] = useState('medium')
  const [autoCreateCalendar, setAutoCreateCalendar] = useState(true)

  return (
    <AppShell>
      <section className="page-hero">
        <div className="hero-copy">
          <div className="eyebrow">Profile settings</div>
          <h1 className="page-title">Tune AI preferences and notification thresholds.</h1>
          <p className="page-description">
            Keep these user-scoped preferences here so they can be connected to backend profile endpoints in the next step.
          </p>
        </div>
      </section>

      <section className="card form-card space-y-6">
        <div>
          <label className="input-label" htmlFor="notification-threshold">
            Notification Threshold
          </label>
          <select
            id="notification-threshold"
            value={notificationThreshold}
            onChange={(event) => setNotificationThreshold(event.target.value)}
            className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2"
          >
            <option value="all">All notifications</option>
            <option value="high">High and critical only</option>
            <option value="critical">Critical only</option>
          </select>
        </div>

        <div>
          <label className="input-label" htmlFor="risk-level">
            AI Risk Detection Level
          </label>
          <select
            id="risk-level"
            value={riskLevel}
            onChange={(event) => setRiskLevel(event.target.value)}
            className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2"
          >
            <option value="low">Low sensitivity</option>
            <option value="medium">Balanced</option>
            <option value="high">High sensitivity</option>
          </select>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoCreateCalendar}
            onChange={(event) => setAutoCreateCalendar(event.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm">Auto-add extracted commitments to Google Calendar</span>
        </label>
      </section>
    </AppShell>
  )
}
