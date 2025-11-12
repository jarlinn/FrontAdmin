"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuthFetch } from "./use-auth-fetch"
import { buildApiUrl, API_CONFIG } from "@/lib/api-config"
import { Document, DocumentFilters, DocumentsResponse, UpdateDocumentStatusRequest } from "@/lib/documents"
import { authService } from "@/lib/auth"

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [pagination, setPagination] = useState<DocumentsResponse['pagination'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { fetchData } = useAuthFetch()

  const fetchDocuments = useCallback(async (filters: DocumentFilters = {}, page: number = 1) => {
    setLoading(true)
    setError(null)

    const queryParams = new URLSearchParams()

    // Agregar filtros a los parámetros de consulta
    if (filters.status && filters.status !== "all") {
      queryParams.append("status", filters.status)
    }
    if (filters.modality_id) {
      queryParams.append("modality_id", filters.modality_id)
    }
    if (filters.submodality_id) {
      queryParams.append("submodality_id", filters.submodality_id)
    }
    if (filters.category_id) {
      queryParams.append("category_id", filters.category_id)
    }
    if (filters.search) {
      queryParams.append("search", filters.search)
    }

    queryParams.append("page", page.toString())
    queryParams.append("page_size", "10")

    const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.DOCUMENTS)}?${queryParams.toString()}`

    try {
      const response = await authService.authenticatedFetch(url)

      if (!response.ok) {
        if (response.status === 404) {
          setDocuments([])
          setPagination(null)
        } else {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.detail || errorData.message || `Error ${response.status}: ${response.statusText}`
          setError(errorMessage)
        }
      } else {
        const responseData = await response.json()
        setDocuments(responseData.items || [])
        setPagination(responseData.pagination || null)
      }
    } catch (err) {
      console.error("Error fetching documents:", err)
      setError(err instanceof Error ? err.message : "Error al cargar documentos")
    } finally {
      setLoading(false)
    }
  }, [])

  const updateDocumentStatus = useCallback(async (documentId: string, action: "approve" | "disable"): Promise<any> => {
    try {
      const status = action === "approve" ? "APPROVED" : "DISABLED"

      const response = await fetchData(
        buildApiUrl(`${API_CONFIG.ENDPOINTS.DOCUMENTS}/${documentId}/approval`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        }
      )

      if (response) {
        // Actualizar el documento en el estado local
        setDocuments(prev =>
          prev.map(doc =>
            doc.document_id === documentId
              ? { ...doc, status }
              : doc
          )
        )
      }

      return response
    } catch (err) {
      console.error("Error updating document status:", err)
      throw err
    }
  }, [fetchData])

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      const response = await fetchData(
        buildApiUrl(`${API_CONFIG.ENDPOINTS.DOCUMENTS}/${documentId}`),
        {
          method: "DELETE",
        }
      )

      if (response) {
        // Remover el documento del estado local
        setDocuments(prev => prev.filter(doc => doc.document_id !== documentId))
      }

      return response
    } catch (err) {
      console.error("Error deleting document:", err)
      throw err
    }
  }, [fetchData])

  const applyFilters = useCallback((filters: DocumentFilters) => {
    fetchDocuments(filters, 1)
  }, [fetchDocuments])

  const goToPage = useCallback((page: number, currentFilters?: DocumentFilters) => {
    // Usar los filtros actuales para mantener el estado de filtrado
    fetchDocuments(currentFilters || {}, page)
  }, [fetchDocuments])

  const refreshDocuments = useCallback(() => {
    fetchDocuments({}, pagination?.page || 1)
  }, [fetchDocuments, pagination?.page])

  // Cargar documentos iniciales
  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return {
    documents,
    pagination,
    loading,
    error,
    fetchDocuments,
    updateDocumentStatus,
    deleteDocument,
    applyFilters,
    goToPage,
    refreshDocuments,
  }
}