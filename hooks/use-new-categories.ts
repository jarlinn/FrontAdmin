import { useState, useEffect, useCallback } from 'react'
import { 
  newCategoryService, 
  NewCategory,
  CreateNewCategoryRequest, 
  UpdateNewCategoryRequest 
} from '@/lib/new-categories'

export function useNewCategories() {
  const [newCategories, setNewCategories] = useState<NewCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNewCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await newCategoryService.getNewCategories()
      setNewCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías')
      console.error('Error fetching new categories:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createNewCategory = useCallback(async (categoryData: CreateNewCategoryRequest) => {
    try {
      setError(null)
      const newCategory = await newCategoryService.createNewCategory(categoryData)
      setNewCategories(prev => [...prev, newCategory])
      return { success: true, data: newCategory }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear categoría'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const updateNewCategory = useCallback(async (categoryId: string, categoryData: UpdateNewCategoryRequest) => {
    try {
      setError(null)
      const updatedCategory = await newCategoryService.updateNewCategory(categoryId, categoryData)
      setNewCategories(prev => prev.map(category =>
        category.id === categoryId ? updatedCategory : category
      ))
      return { success: true, data: updatedCategory }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar categoría'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const deleteNewCategory = useCallback(async (categoryId: string) => {
    try {
      setError(null)
      await newCategoryService.deleteNewCategory(categoryId)
      setNewCategories(prev => prev.filter(category => category.id !== categoryId))
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar categoría'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const refreshNewCategories = useCallback(() => {
    fetchNewCategories()
  }, [fetchNewCategories])

  useEffect(() => {
    fetchNewCategories()
  }, [fetchNewCategories])

  return {
    newCategories,
    loading,
    error,
    createNewCategory,
    updateNewCategory,
    deleteNewCategory,
    refreshNewCategories
  }
}

export function useNewCategory(categoryId: string | null) {
  const [newCategory, setNewCategory] = useState<NewCategory | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNewCategory = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await newCategoryService.getNewCategory(id)
      setNewCategory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categoría')
      console.error('Error fetching new category:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (categoryId) {
      fetchNewCategory(categoryId)
    } else {
      setNewCategory(null)
      setLoading(false)
      setError(null)
    }
  }, [categoryId, fetchNewCategory])

  const refreshNewCategory = useCallback(() => {
    if (categoryId) {
      fetchNewCategory(categoryId)
    }
  }, [categoryId, fetchNewCategory])

  return {
    newCategory,
    loading,
    error,
    refreshNewCategory
  }
}

export function useCategoriesBySubmodality(submodalityId: string | null) {
  const [categories, setCategories] = useState<NewCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategoriesBySubmodality = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await newCategoryService.getCategoriesBySubmodality(id)
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías')
      console.error('Error fetching categories by submodality:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (submodalityId) {
      fetchCategoriesBySubmodality(submodalityId)
    } else {
      setCategories([])
      setLoading(false)
      setError(null)
    }
  }, [submodalityId, fetchCategoriesBySubmodality])

  const refreshCategoriesBySubmodality = useCallback(() => {
    if (submodalityId) {
      fetchCategoriesBySubmodality(submodalityId)
    }
  }, [submodalityId, fetchCategoriesBySubmodality])

  return {
    categories,
    loading,
    error,
    refreshCategoriesBySubmodality
  }
}

export function useCategoriesByModality(modalityId: string | null) {
  const [categories, setCategories] = useState<NewCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategoriesByModality = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await newCategoryService.getCategoriesByModality(id)
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías')
      console.error('Error fetching categories by modality:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (modalityId) {
      fetchCategoriesByModality(modalityId)
    } else {
      setCategories([])
      setLoading(false)
      setError(null)
    }
  }, [modalityId, fetchCategoriesByModality])

  const refreshCategoriesByModality = useCallback(() => {
    if (modalityId) {
      fetchCategoriesByModality(modalityId)
    }
  }, [modalityId, fetchCategoriesByModality])

  return {
    categories,
    loading,
    error,
    refreshCategoriesByModality
  }
}

