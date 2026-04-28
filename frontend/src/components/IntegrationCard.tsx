/**
 * IntegrationCard Component
 * Displays integration status, connection state, and action buttons
 */

import React, { useState } from 'react'
import type { IntegrationCardProps } from '../types/types'

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  config,
  onConnect,
  onConfigure,
  onDisconnect,
  isLoading = false,
}) => {
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false)

  const handleDisconnect = () => {
    onDisconnect()
    setShowConfirmDisconnect(false)
  }

  const formatLastSynced = (date?: string) => {
    if (!date) return 'Never synced'
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div
            className="text-3xl w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            style={{
              filter: integration.isConnected ? 'none' : 'grayscale(100%)',
              opacity: integration.isConnected ? 1 : 0.6,
            }}
          >
            {config.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base text-[var(--text-primary)]">{config.displayName}</h3>
            <p className="text-sm text-[var(--text-muted)]">{config.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              integration.isConnected
                ? 'bg-[var(--success)] animate-pulse'
                : 'bg-[var(--text-muted)]'
            }`}
          />
          <span
            className={`text-sm font-medium ${
              integration.isConnected ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'
            }`}
          >
            {integration.isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {integration.isConnected && (
        <div className="rounded-md p-3 space-y-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          {integration.credentials?.accountName && (
            <div className="text-sm">
              <span className="text-[var(--text-muted)]">Account:</span>{' '}
              <span className="font-medium">{integration.credentials.accountName}</span>
            </div>
          )}
          {integration.lastSynced && (
            <div className="text-sm">
              <span className="text-[var(--text-muted)]">Last synced:</span>{' '}
              <span className="font-medium">{formatLastSynced(integration.lastSynced)}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex space-x-2">
        {!integration.isConnected ? (
          <button
            onClick={onConnect}
            disabled={isLoading}
            className="button button-primary flex-1"
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
        ) : (
          <>
            <button
              onClick={onConfigure}
              disabled={isLoading}
              className="button button-ghost flex-1"
            >
              Configure
            </button>
            {showConfirmDisconnect ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  className="button bg-[var(--danger)] text-white border border-[var(--danger)]"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirmDisconnect(false)}
                  disabled={isLoading}
                  className="button button-ghost"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmDisconnect(true)}
                disabled={isLoading}
                className="button bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)]/40"
              >
                Disconnect
              </button>
            )}
          </>
        )}
      </div>

      {integration.isConnected && config.type !== 'calendar' && (
        <div className="pt-2 border-t border-[var(--border-subtle)]">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={integration.autoSync ?? false}
              onChange={() => {
                // Handle auto-sync toggle
              }}
              className="w-4 h-4 rounded border-[var(--border-strong)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">
              Auto-sync every {integration.syncFrequency ?? 'daily'}
            </span>
          </label>
        </div>
      )}
    </div>
  )
}

export default IntegrationCard
