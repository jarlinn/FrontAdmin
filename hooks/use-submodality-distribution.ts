"use client"

import { useState, useEffect, useCallback } from 'react'
import { SubmodalityDistributionMetric, metricsService } from '@/lib/metrics'

interface UseSubmodalityDistributionReturn {
  data: SubmodalityDistributionMetric[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook para obtener la distribución por submodalidad
 */
export function useSubmodalityDistribution(): UseSubmodalityDistributionReturn {
  const [data, setData] = useState<SubmodalityDistributionMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await metricsService.getSubmodalityDistribution()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error fetching submodality distribution:', err)
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