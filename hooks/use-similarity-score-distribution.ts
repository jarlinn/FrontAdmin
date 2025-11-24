"use client"

import { useState, useEffect, useCallback } from 'react'
import { SimilarityScoreDistributionMetric, metricsService } from '@/lib/metrics'

interface UseSimilarityScoreDistributionReturn {
  data: SimilarityScoreDistributionMetric[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook para obtener la distribución por similarity_score
 */
export function useSimilarityScoreDistribution(): UseSimilarityScoreDistributionReturn {
  const [data, setData] = useState<SimilarityScoreDistributionMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await metricsService.getSimilarityScoreDistribution()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error fetching similarity score distribution:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refresh,
  }
}