import { useState, useEffect, useCallback, useRef } from 'react'
import { Question, QuestionFilters, UpdateQuestionRequest, questionService, PaginationInfo } from '@/lib/questions'

// Cache global para preguntas
interface QuestionsCache {
  items: Question[]
  pagination: PaginationInfo
  filters: QuestionFilters
  timestamp: number
}

let questionsCache: QuestionsCache | null = null
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutos en milisegundos (más corto para datos dinámicos)

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

  const refreshQuestions = useCallback(async (filters?: QuestionFilters, forceRefresh = false) => {
    try {
      const filtersToUse = filters !== undefined ? { ...currentFiltersRef.current, ...filters } : currentFiltersRef.current
      
      // Verificar cache si no es un refresh forzado
      if (!forceRefresh && questionsCache && 
          Date.now() - questionsCache.timestamp < CACHE_DURATION &&
          JSON.stringify(questionsCache.filters) === JSON.stringify(filtersToUse)) {
        setQuestions(questionsCache.items)
        setPagination(questionsCache.pagination)
        setLoading(false)
        if (filters !== undefined) {
          currentFiltersRef.current = filtersToUse
        }
        return
      }

      setLoading(true)
      setError(null)
      const response = await questionService.getQuestions(filtersToUse)
      
      // Actualizar cache
      questionsCache = {
        items: response.items,
        pagination: response.pagination,
        filters: filtersToUse,
        timestamp: Date.now()
      }
      
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
      
      // Invalidar cache
      questionsCache = null
      
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
      
      // Invalidar cache
      questionsCache = null
      
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
      
      // Invalidar cache
      questionsCache = null
      
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
      
      // Invalidar cache
      questionsCache = null
      
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
