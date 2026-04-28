import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchCommitments, fetchDailyBrief, fetchRisks, type Commitment, type DailyBriefResponse, type RiskResponse } from '../api'

interface DashboardDataState {
  commitments: Commitment[]
  risks: RiskResponse | null
  brief: DailyBriefResponse | null
  loading: boolean
  error: string | null
  lastUpdated: string | null
  refresh: () => Promise<void>
}

export function useDashboardData(autoRefresh = true): DashboardDataState {
  const queryClient = useQueryClient()

  const dashboardQuery = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const [commitmentsResponse, risksResponse, briefResponse] = await Promise.all([
        fetchCommitments(),
        fetchRisks(),
        fetchDailyBrief(),
      ])

      return {
        commitments: commitmentsResponse,
        risks: risksResponse,
        brief: briefResponse,
      }
    },
    refetchInterval: autoRefresh ? 30000 : false,
  })

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
    await dashboardQuery.refetch()
  }, [dashboardQuery, queryClient])

  return {
    commitments: dashboardQuery.data?.commitments ?? [],
    risks: dashboardQuery.data?.risks ?? null,
    brief: dashboardQuery.data?.brief ?? null,
    loading: dashboardQuery.isLoading || dashboardQuery.isFetching,
    error: dashboardQuery.error instanceof Error ? dashboardQuery.error.message : null,
    lastUpdated: dashboardQuery.dataUpdatedAt > 0 ? new Date(dashboardQuery.dataUpdatedAt).toISOString() : null,
    refresh,
  }
}