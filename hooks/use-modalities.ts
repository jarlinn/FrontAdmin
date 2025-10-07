import { useState, useEffect, useCallback } from 'react'
import { 
  modalityService, 
  Modality, 
  ModalityWithSubmodalities,
  CreateModalityRequest, 
  UpdateModalityRequest 
} from '@/lib/modalities'

export function useModalities() {
  const [modalities, setModalities] = useState<Modality[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchModalities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await modalityService.getModalities()
      setModalities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar modalidades')
      console.error('Error fetching modalities:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createModality = useCallback(async (modalityData: CreateModalityRequest) => {
    try {
      setError(null)
      const newModality = await modalityService.createModality(modalityData)
      setModalities(prev => [...prev, newModality])
      return { success: true, data: newModality }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear modalidad'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const updateModality = useCallback(async (modalityId: string, modalityData: UpdateModalityRequest) => {
    try {
      setError(null)
      const updatedModality = await modalityService.updateModality(modalityId, modalityData)
      setModalities(prev => prev.map(modality =>
        modality.id === modalityId ? updatedModality : modality
      ))
      return { success: true, data: updatedModality }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar modalidad'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const deleteModality = useCallback(async (modalityId: string) => {
    try {
      setError(null)
      await modalityService.deleteModality(modalityId)
      setModalities(prev => prev.filter(modality => modality.id !== modalityId))
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar modalidad, valida si hay preguntas o submodalidades asociadas.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const refreshModalities = useCallback(() => {
    fetchModalities()
  }, [fetchModalities])

  useEffect(() => {
    fetchModalities()
  }, [fetchModalities])

  return {
    modalities,
    loading,
    error,
    createModality,
    updateModality,
    deleteModality,
    refreshModalities
  }
}

export function useModality(modalityId: string | null) {
  const [modality, setModality] = useState<ModalityWithSubmodalities | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchModality = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await modalityService.getModality(id)
      setModality(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar modalidad')
      console.error('Error fetching modality:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (modalityId) {
      fetchModality(modalityId)
    } else {
      setModality(null)
      setLoading(false)
      setError(null)
    }
  }, [modalityId, fetchModality])

  const refreshModality = useCallback(() => {
    if (modalityId) {
      fetchModality(modalityId)
    }
  }, [modalityId, fetchModality])

  return {
    modality,
    loading,
    error,
    refreshModality
  }
}
