import { useMemo, useState } from 'react'

import { AppShell, ConnectionModal, IntegrationCard } from '../components'
import { useIntegrations } from '../hooks/useIntegrations'
import type { IntegrationType } from '../types/types'

export function IntegrationsPage() {
  const { integrations, integrationConfigs, isLoading, connectIntegration, disconnectIntegration } = useIntegrations()

  const [activeType, setActiveType] = useState<IntegrationType | null>(null)
  const [testingType, setTestingType] = useState<IntegrationType | null>(null)

  const activeConfig = activeType ? integrationConfigs[activeType] : null
  const activeIntegration = activeType ? integrations.find((item) => item.type === activeType) : undefined

  const sortedIntegrations = useMemo(
    () => [...integrations].sort((a, b) => Number(b.isConnected) - Number(a.isConnected)),
    [integrations],
  )
  const connectedCount = sortedIntegrations.filter((item) => item.isConnected).length

  async function handleConnect(credentials: Record<string, string>) {
    if (!activeType) return
    setTestingType(activeType)
    await connectIntegration(activeType, credentials)
    setTestingType(null)
    setActiveType(null)
  }

  async function handleDisconnect(type: IntegrationType) {
    setTestingType(type)
    await disconnectIntegration(type)
    setTestingType(null)
  }

  return (
    <AppShell>
      <section className="page-hero">
        <div className="hero-copy">
          <div className="eyebrow">Integration management</div>
          <h1 className="page-title">Connect every tool your orchestrator depends on.</h1>
          <p className="page-description">
            Test each credential before saving it, track last sync status, and control each integration from one page.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="metric-card">
            <div className="metric-label">Available tools</div>
            <div className="metric-value">{sortedIntegrations.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Connected</div>
            <div className="metric-value">{connectedCount}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Disconnected</div>
            <div className="metric-value">{sortedIntegrations.length - connectedCount}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Health</div>
            <div className="metric-value">{connectedCount === sortedIntegrations.length ? 'Good' : 'Needs setup'}</div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="card section-card">
          <div className="loading-state">Loading integration statuses...</div>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {sortedIntegrations.map((integration) => {
            const config = integrationConfigs[integration.type]
            return (
              <IntegrationCard
                key={integration.type}
                integration={integration}
                config={config}
                isLoading={testingType === integration.type}
                onConnect={() => setActiveType(integration.type)}
                onConfigure={() => setActiveType(integration.type)}
                onDisconnect={() => void handleDisconnect(integration.type)}
              />
            )
          })}
        </section>
      )}

      {activeConfig ? (
        <ConnectionModal
          key={activeType ?? 'inactive'}
          integration={activeConfig}
          isOpen={Boolean(activeType)}
          isLoading={testingType === activeType}
          onConnect={handleConnect}
          onCancel={() => {
            if (testingType) return
            setActiveType(null)
          }}
          initialCredentials={(activeIntegration?.credentials as Record<string, string>) ?? {}}
        />
      ) : null}
    </AppShell>
  )
}
