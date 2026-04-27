import { useCallback, useEffect, useState } from 'react'

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
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [risks, setRisks] = useState<RiskResponse | null>(null)
  const [brief, setBrief] = useState<DailyBriefResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [commitmentsResponse, risksResponse, briefResponse] = await Promise.all([
        fetchCommitments(),
        fetchRisks(),
        fetchDailyBrief(),
      ])

      setCommitments(commitmentsResponse)
      setRisks(risksResponse)
      setBrief(briefResponse)
      setLastUpdated(new Date().toISOString())
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : 'Unable to load dashboard data.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()

    if (!autoRefresh) {
      return undefined
    }

    const timer = window.setInterval(() => {
      void refresh()
    }, 30000)

    return () => window.clearInterval(timer)
  }, [autoRefresh, refresh])

  return { commitments, risks, brief, loading, error, lastUpdated, refresh }
}