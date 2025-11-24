"use client"

import { useState, useEffect, useCallback } from 'react'
import { ModalityDistributionMetric, metricsService } from '@/lib/metrics'

interface UseModalityDistributionReturn {
  data: ModalityDistributionMetric[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook para obtener la distribución por modalidad
 */
export function useModalityDistribution(): UseModalityDistributionReturn {
  const [data, setData] = useState<ModalityDistributionMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await metricsService.getModalityDistribution()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error fetching modality distribution:', err)
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