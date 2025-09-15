import { useState, useEffect, useCallback } from 'react'
import { Category, CategoryTree, categoryService, CreateCategoryRequest, UpdateCategoryRequest } from '@/lib/categories'

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  refreshCategories: () => Promise<void>
  createCategory: (categoryData: CreateCategoryRequest) => Promise<Category>
  updateCategory: (id: string, categoryData: UpdateCategoryRequest) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>
}

/**
 * Hook para manejar categorías con estado local
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedCategories = await categoryService.getCategories()
      setCategories(fetchedCategories)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createCategory = useCallback(async (categoryData: CreateCategoryRequest): Promise<Category> => {
    try {
      setError(null)
      const newCategory = await categoryService.createCategory(categoryData)
      setCategories(prev => [...prev, newCategory])
      return newCategory
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    }
  }, [])

  const updateCategory = useCallback(async (id: string, categoryData: UpdateCategoryRequest): Promise<Category> => {
    try {
      setError(null)
      const updatedCategory = await categoryService.updateCategory(id, categoryData)
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat))
      return updatedCategory
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    }
  }, [])

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      await categoryService.deleteCategory(id)
      setCategories(prev => prev.filter(cat => cat.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Cargar categorías al montar el componente
  useEffect(() => {
    refreshCategories()
  }, [refreshCategories])

  return {
    categories,
    loading,
    error,
    refreshCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}

/**
 * Hook para manejar el árbol de categorías
 */
export function useCategoriesTree() {
  const [categoriesTree, setCategoriesTree] = useState<CategoryTree[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshCategoriesTree = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedCategoriesTree = await categoryService.getCategoriesTree()
      setCategoriesTree(fetchedCategoriesTree)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error fetching categories tree:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar árbol de categorías al montar el componente
  useEffect(() => {
    refreshCategoriesTree()
  }, [refreshCategoriesTree])

  return {
    categoriesTree,
    loading,
    error,
    refreshCategoriesTree,
  }
}

