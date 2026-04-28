import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import type { Integration, IntegrationConfig, IntegrationStatus, IntegrationType, UseIntegrationsReturn } from '../types/types'
import integrationConfigs from '../config/integrations'
import { useNotification } from './useNotification'
import { axiosInstance } from '../utils/axiosInstance'

const INTEGRATIONS_QUERY_KEY = ['integrations']

const TOOL_ORDER: IntegrationType[] = ['whatsapp', 'email', 'notion', 'clickup', 'calendar']

function toUIModel(remoteIntegrations: Integration[]): Integration[] {
  const byType = new Map<IntegrationType, Integration>()
  for (const item of remoteIntegrations) {
    byType.set(item.type, item)
  }

  return TOOL_ORDER.map((type) => {
    const existing = byType.get(type)
    if (existing) {
      return existing
    }

    return {
      id: `virtual-${type}`,
      userId: '',
      type,
      displayName: integrationConfigs[type].displayName,
      isConnected: false,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    }
  })
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = error as { response?: { data?: { detail?: string; error?: string } } }
    return response.response?.data?.detail || response.response?.data?.error || fallback
  }

  return fallback
}

export const useIntegrations = (): UseIntegrationsReturn => {
  const queryClient = useQueryClient()
  const { showError, showInfo, showSuccess } = useNotification()

  const integrationsQuery = useQuery({
    queryKey: INTEGRATIONS_QUERY_KEY,
    queryFn: async () => {
      const response = await axiosInstance.get<Integration[]>('/integrations')
      return toUIModel(response.data)
    },
    staleTime: 5 * 60 * 1000,
  })

  const integrations = integrationsQuery.data ?? []

  const connectionStatuses = TOOL_ORDER.reduce(
    (acc, type) => {
      const item = integrations.find((integration) => integration.type === type)
      acc[type] = {
        type,
        isConnected: item?.isConnected ?? false,
        lastSynced: item?.lastSynced,
      }
      return acc
    },
    {} as Record<IntegrationType, IntegrationStatus>,
  )

  const refreshIntegrations = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEY })
  }, [queryClient])

  const testConnection = useCallback(
    async (type: IntegrationType, credentials: Record<string, string>) => {
      try {
        showInfo('Testing connection', `Validating ${integrationConfigs[type].displayName} credentials...`)
        const response = await axiosInstance.post('/integrations/test-connection', { type, credentials })
        return response.data?.success === true
      } catch (error: unknown) {
        const message = getErrorMessage(error, 'Connection test failed')
        showError('Connection failed', message)
        return false
      }
    },
    [showError, showInfo],
  )

  const connectIntegration = useCallback(
    async (type: IntegrationType, credentials: Record<string, string>) => {
      try {
        const connectionValid = await testConnection(type, credentials)
        if (!connectionValid) {
          return
        }

        await axiosInstance.post('/integrations/connect', { type, credentials })
        await refreshIntegrations()
        showSuccess('Connected', `${integrationConfigs[type].displayName} is now connected.`)
      } catch (error: unknown) {
        const message = getErrorMessage(error, 'Failed to connect integration')
        showError('Connection error', message)
      }
    },
    [refreshIntegrations, showError, showSuccess, testConnection],
  )

  const disconnectIntegration = useCallback(
    async (type: IntegrationType) => {
      try {
        await axiosInstance.post('/integrations/disconnect', { type })
        await refreshIntegrations()
        showSuccess('Disconnected', `${integrationConfigs[type].displayName} was disconnected.`)
      } catch (error: unknown) {
        const message = getErrorMessage(error, 'Failed to disconnect integration')
        showError('Disconnect error', message)
      }
    },
    [refreshIntegrations, showError, showSuccess],
  )

  const updateIntegration = useCallback(
    async (type: IntegrationType, config: Record<string, any>) => {
      try {
        await axiosInstance.patch(`/integrations/${type}`, { config })
        await refreshIntegrations()
        showSuccess('Saved', `${integrationConfigs[type].displayName} settings were updated.`)
      } catch (error: unknown) {
        const message = getErrorMessage(error, 'Failed to update integration')
        showError('Update error', message)
      }
    },
    [refreshIntegrations, showError, showSuccess],
  )

  const syncNow = useCallback(
    async (type: IntegrationType) => {
      try {
        await axiosInstance.post(`/integrations/${type}/sync`, {})
        await refreshIntegrations()
        showSuccess('Sync started', `${integrationConfigs[type].displayName} sync has started.`)
      } catch (error: unknown) {
        const message = getErrorMessage(error, 'Sync failed')
        showError('Sync error', message)
      }
    },
    [refreshIntegrations, showError, showSuccess],
  )

  return {
    integrations,
    integrationConfigs: integrationConfigs as Record<IntegrationType, IntegrationConfig>,
    connectionStatuses,
    isLoading: integrationsQuery.isLoading,
    error: integrationsQuery.error instanceof Error ? integrationsQuery.error.message : null,
    connectIntegration,
    disconnectIntegration,
    testConnection,
    updateIntegration,
    syncNow,
    fetchIntegrations: refreshIntegrations,
  }
}

export default useIntegrations
