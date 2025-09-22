import { useState, useEffect, useCallback, useRef } from 'react'
import { Category, CategoryTree, categoryService, CreateCategoryRequest, UpdateCategoryRequest } from '@/lib/categories'

// Cache global para categorías
let categoriesCache: Category[] | null = null
let categoriesCacheTime: number = 0
let categoriesTreeCache: CategoryTree[] | null = null
let categoriesTreeCacheTime: number = 0

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos en milisegundos

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

  const refreshCategories = useCallback(async (forceRefresh = false) => {
    try {
      // Verificar cache si no es un refresh forzado
      if (!forceRefresh && categoriesCache && Date.now() - categoriesCacheTime < CACHE_DURATION) {
        setCategories(categoriesCache)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      const fetchedCategories = await categoryService.getCategories()
      
      // Actualizar cache
      categoriesCache = fetchedCategories
      categoriesCacheTime = Date.now()
      
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
      
      // Invalidar cache
      categoriesCache = null
      categoriesTreeCache = null
      
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
      
      // Invalidar cache
      categoriesCache = null
      categoriesTreeCache = null
      
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
      
      // Invalidar cache
      categoriesCache = null
      categoriesTreeCache = null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Cargar categorías al montar el componente
  useEffect(() => {
    // Verificar cache primero
    if (categoriesCache && Date.now() - categoriesCacheTime < CACHE_DURATION) {
      setCategories(categoriesCache)
      setLoading(false)
    } else {
      refreshCategories()
    }
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
 * DESHABILITADO TEMPORALMENTE - Sistema anterior reemplazado por nuevo sistema jerárquico
 */
export function useCategoriesTree() {
  // Hook temporal que devuelve datos vacíos para mantener compatibilidad
  return {
    categoriesTree: [],
    loading: false,
    error: null,
    refreshCategoriesTree: () => {},
  }
}

