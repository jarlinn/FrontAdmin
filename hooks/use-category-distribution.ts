"use client"

import { useState, useEffect, useCallback } from 'react'
import { CategoryDistributionMetric, metricsService } from '@/lib/metrics'

interface UseCategoryDistributionReturn {
  data: CategoryDistributionMetric[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook para obtener la distribución por categoría
 */
export function useCategoryDistribution(): UseCategoryDistributionReturn {
  const [data, setData] = useState<CategoryDistributionMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await metricsService.getCategoryDistribution()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error fetching category distribution:', err)
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