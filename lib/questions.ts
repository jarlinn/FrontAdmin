// Servicio para manejar preguntas del chatbot
import { API_CONFIG } from './api-config'
import { authService } from './auth'

export interface Question {
  question_id: string
  status: "PENDING" | "APPROVED" | "DISABLED"
  question_text: string
  response?: string | null // Respuesta generada por la IA (campo legacy)
  model_response?: string | null // Nueva respuesta generada por el modelo
  context_type: "text" | "pdf"
  context_text?: string | null
  context_file?: string | null
  category_id: string
  category_name: string
  full_name?: string // Full hierarchical path of the category
  modality_id?: string
  submodality_id?: string
  created_at: string
}

export interface QuestionFilters {
  status?: "PENDING" | "APPROVED" | "DISABLED" | "all"
  modality_id?: string
  submodality_id?: string
  category_id?: string
  search?: string
  page?: number
  page_size?: number
}

export interface PaginationInfo {
  page: number
  page_size: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

export interface PaginatedQuestionsResponse {
  items: Question[]
  pagination: PaginationInfo
}

export interface UpdateQuestionRequest {
  question_text?: string
  model_response?: string
  context_text?: string
  context_type?: "text" | "pdf"
  category_id?: string
  modality_id?: string
  submodality_id?: string
}

class QuestionService {
  /**
   * Obtener preguntas con filtros opcionales y paginación
   */
  async getQuestions(filters?: QuestionFilters): Promise<PaginatedQuestionsResponse> {
    try {
      // Construir query parameters
      const queryParams = new URLSearchParams()
      
      if (filters?.status) {
        queryParams.append('status', filters.status)
      }
      
      if (filters?.modality_id) {
        queryParams.append('modality_id', filters.modality_id)
      }

      if (filters?.submodality_id) {
        queryParams.append('submodality_id', filters.submodality_id)
      }

      if (filters?.category_id) {
        queryParams.append('category_id', filters.category_id)
      }

      if (filters?.search) {
        queryParams.append('search', filters.search)
      }

      if (filters?.page) {
        queryParams.append('page', filters.page.toString())
      }

      if (filters?.page_size) {
        queryParams.append('page_size', filters.page_size.toString())
      }

      const queryString = queryParams.toString()
      const url = `${API_CONFIG.BASE_URL}/chat/questions${queryString ? `?${queryString}` : ''}`
      
      const response = await authService.authenticatedFetch(url)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al obtener preguntas')
      }

      const paginatedResponse: PaginatedQuestionsResponse = await response.json()
      return paginatedResponse
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Actualizar el estado de una pregunta usando el endpoint de approval
   */
  async updateQuestionStatus(questionId: string, status: "APPROVED" | "DISABLED"): Promise<Question> {
    try {
      // Mapear los estados a las acciones del API
      const action = status === "APPROVED" ? "approve" : "disable"
      
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/questions/${questionId}/approval`,
        {
          method: 'PATCH',
          body: JSON.stringify({ action }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al actualizar estado de pregunta')
      }

      const question: Question = await response.json()
      return question
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Actualizar una pregunta (usa FormData según el nuevo formato del backend)
   */
  async updateQuestion(questionId: string, formData: FormData): Promise<Question> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/questions/${questionId}`,
        {
          method: 'PATCH',
          body: formData,
          // No agregar Content-Type para FormData, el browser lo maneja automáticamente
        },
        API_CONFIG.EXTENDED_TIMEOUT // Usar timeout extendido para regeneración
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al actualizar pregunta')
      }

      const question: Question = await response.json()
      return question
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Reprocesar una pregunta (regenerar respuesta del modelo)
   */
  async recalculateQuestion(questionId: string): Promise<Question> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/questions/${questionId}/recalculate`,
        {
          method: 'POST',
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al reprocesar pregunta')
      }

      const question: Question = await response.json()
      return question
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }

  /**
   * Eliminar una pregunta (cambia el estado a DISABLED)
   */
  async deleteQuestion(questionId: string): Promise<Question> {
    try {
      const response = await authService.authenticatedFetch(
        `${API_CONFIG.BASE_URL}/chat/questions/${questionId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al eliminar pregunta')
      }

      const question: Question = await response.json()
      return question
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión al servidor')
    }
  }
}

// Exportar instancia singleton
export const questionService = new QuestionService()
