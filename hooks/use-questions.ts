import { useState, useEffect, useCallback, useRef } from 'react'
import { Question, QuestionFilters, UpdateQuestionRequest, questionService, PaginationInfo } from '@/lib/questions'

interface UseQuestionsReturn {
  questions: Question[]
  pagination: PaginationInfo | null
  loading: boolean
  error: string | null
  refreshQuestions: (filters?: QuestionFilters) => Promise<void>
  updateQuestionStatus: (questionId: string, status: "APPROVED" | "DISABLED") => Promise<Question>
  updateQuestion: (questionId: string, formData: FormData) => Promise<Question>
  recalculateQuestion: (questionId: string) => Promise<Question>
  deleteQuestion: (questionId: string) => Promise<Question>
  applyFilters: (filters: QuestionFilters) => Promise<void>
  goToPage: (page: number) => Promise<void>
}

/**
 * Hook para manejar preguntas con estado local
 */
export function useQuestions(): UseQuestionsReturn {
  const [questions, setQuestions] = useState<Question[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentFiltersRef = useRef<QuestionFilters>({ page: 1, page_size: 6 })

  const refreshQuestions = useCallback(async (filters?: QuestionFilters) => {
    try {
      setLoading(true)
      setError(null)
      const filtersToUse = filters !== undefined ? { ...currentFiltersRef.current, ...filters } : currentFiltersRef.current
      const response = await questionService.getQuestions(filtersToUse)
      setQuestions(response.items)
      setPagination(response.pagination)
      if (filters !== undefined) {
        currentFiltersRef.current = filtersToUse
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error fetching questions:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateQuestionStatus = useCallback(async (questionId: string, status: "APPROVED" | "DISABLED"): Promise<Question> => {
    try {
      setError(null)
      const updatedQuestion = await questionService.updateQuestionStatus(questionId, status)
      setQuestions(prev => prev.map(q => q.question_id === questionId ? updatedQuestion : q))
      return updatedQuestion
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    }
  }, [])

  const updateQuestion = useCallback(async (questionId: string, formData: FormData): Promise<Question> => {
    try {
      setError(null)
      const updatedQuestion = await questionService.updateQuestion(questionId, formData)
      // No actualizamos el estado local aquí - el componente hará refreshQuestions()
      return updatedQuestion
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    }
  }, [])

  const recalculateQuestion = useCallback(async (questionId: string): Promise<Question> => {
    try {
      setError(null)
      const updatedQuestion = await questionService.recalculateQuestion(questionId)
      setQuestions(prev => prev.map(q => q.question_id === questionId ? updatedQuestion : q))
      return updatedQuestion
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    }
  }, [])

  const deleteQuestion = useCallback(async (questionId: string): Promise<Question> => {
    try {
      setError(null)
      const updatedQuestion = await questionService.deleteQuestion(questionId)
      setQuestions(prev => prev.map(q => q.question_id === questionId ? updatedQuestion : q))
      return updatedQuestion
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    }
  }, [])

  const applyFilters = useCallback(async (filters: QuestionFilters) => {
    // Resetear a la página 1 cuando se aplican nuevos filtros
    await refreshQuestions({ ...filters, page: 1 })
  }, [refreshQuestions])

  const goToPage = useCallback(async (page: number) => {
    await refreshQuestions({ page })
  }, [refreshQuestions])

  // Cargar preguntas al montar el componente
  useEffect(() => {
    refreshQuestions()
  }, [refreshQuestions])

  return {
    questions,
    pagination,
    loading,
    error,
    refreshQuestions,
    updateQuestionStatus,
    updateQuestion,
    recalculateQuestion,
    deleteQuestion,
    applyFilters,
    goToPage,
  }
}
