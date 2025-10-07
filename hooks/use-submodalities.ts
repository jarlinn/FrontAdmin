import { useState, useEffect, useCallback } from 'react'
import { 
  submodalityService, 
  CreateSubmodalityRequest, 
  UpdateSubmodalityRequest 
} from '@/lib/submodalities'
import { Submodality, SubmodalityWithCategories } from '@/lib/modalities'

export function useSubmodalities() {
  const [submodalities, setSubmodalities] = useState<Submodality[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubmodalities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await submodalityService.getSubmodalities()
      setSubmodalities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar submodalidades')
      console.error('Error fetching submodalities:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createSubmodality = useCallback(async (submodalityData: CreateSubmodalityRequest) => {
    try {
      setError(null)
      const newSubmodality = await submodalityService.createSubmodality(submodalityData)
      setSubmodalities(prev => [...prev, newSubmodality])
      return { success: true, data: newSubmodality }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear submodalidad'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const updateSubmodality = useCallback(async (submodalityId: string, submodalityData: UpdateSubmodalityRequest) => {
    try {
      setError(null)
      const updatedSubmodality = await submodalityService.updateSubmodality(submodalityId, submodalityData)
      setSubmodalities(prev => prev.map(submodality =>
        submodality.id === submodalityId ? updatedSubmodality : submodality
      ))
      return { success: true, data: updatedSubmodality }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar submodalidad'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const deleteSubmodality = useCallback(async (submodalityId: string) => {
    try {
      setError(null)
      await submodalityService.deleteSubmodality(submodalityId)
      setSubmodalities(prev => prev.filter(submodality => submodality.id !== submodalityId))
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar submodalidad'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const refreshSubmodalities = useCallback(() => {
    fetchSubmodalities()
  }, [fetchSubmodalities])

  useEffect(() => {
    fetchSubmodalities()
  }, [fetchSubmodalities])

  return {
    submodalities,
    loading,
    error,
    createSubmodality,
    updateSubmodality,
    deleteSubmodality,
    refreshSubmodalities
  }
}

export function useSubmodality(submodalityId: string | null) {
  const [submodality, setSubmodality] = useState<SubmodalityWithCategories | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSubmodality = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await submodalityService.getSubmodality(id)
      setSubmodality(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar submodalidad')
      console.error('Error fetching submodality:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (submodalityId) {
      fetchSubmodality(submodalityId)
    } else {
      setSubmodality(null)
      setLoading(false)
      setError(null)
    }
  }, [submodalityId, fetchSubmodality])

  const refreshSubmodality = useCallback(() => {
    if (submodalityId) {
      fetchSubmodality(submodalityId)
    }
  }, [submodalityId, fetchSubmodality])

  return {
    submodality,
    loading,
    error,
    refreshSubmodality
  }
}

export function useSubmodalitiesByModality(modalityId: string | null) {
  const [submodalities, setSubmodalities] = useState<Submodality[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSubmodalitiesByModality = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await submodalityService.getSubmodalitiesByModality(id)
      setSubmodalities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar submodalidades')
      console.error('Error fetching submodalities by modality:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (modalityId) {
      fetchSubmodalitiesByModality(modalityId)
    } else {
      setSubmodalities([])
      setLoading(false)
      setError(null)
    }
  }, [modalityId, fetchSubmodalitiesByModality])

  const refreshSubmodalitiesByModality = useCallback(() => {
    if (modalityId) {
      fetchSubmodalitiesByModality(modalityId)
    }
  }, [modalityId, fetchSubmodalitiesByModality])

  return {
    submodalities,
    loading,
    error,
    refreshSubmodalitiesByModality
  }
}
