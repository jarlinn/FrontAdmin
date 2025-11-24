"use client"

import { useState, useEffect, useCallback } from 'react'
import { FrequentQuestionMetric, metricsService } from '@/lib/metrics'

interface UseFrequentQuestionsReturn {
  data: FrequentQuestionMetric[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook para obtener las top 5 preguntas más frecuentes
 */
export function useFrequentQuestions(): UseFrequentQuestionsReturn {
  const [data, setData] = useState<FrequentQuestionMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await metricsService.getTopFrequentQuestions()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error fetching frequent questions:', err)
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