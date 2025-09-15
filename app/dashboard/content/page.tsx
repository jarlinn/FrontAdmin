"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Upload, FileText, X, Brain, Save, Eye, Loader2, CheckCircle, Plus, ChevronDown, ChevronRight, Edit, Trash2, MoreHorizontal } from "lucide-react"
import AdminLayout from "@/components/admin-layout"
import { useDropzone } from "react-dropzone"
import { buildApiUrl, API_CONFIG, handleApiError } from "@/lib/api-config"
import { useAuthFetch } from "@/hooks/use-auth-fetch"
import { useCategories, useCategoriesTree } from "@/hooks/use-categories"
import { useQuestions } from "@/hooks/use-questions"
import { Category, CategoryTree } from "@/lib/categories"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface UploadedFile {
  file: File
  preview: string
  id: string
}



export default function ContentPage() {
  const router = useRouter()
  const [question, setQuestion] = useState("")
  const [context, setContext] = useState("")
  const [contextType, setContextType] = useState<"text" | "pdf">("text")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedResponse, setGeneratedResponse] = useState("")
  const [editableModelResponse, setEditableModelResponse] = useState("")
  const [isEditingResponse, setIsEditingResponse] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null)
  
  // Estados para crear categoría
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryDescription, setNewCategoryDescription] = useState("")
  const [newCategoryParentId, setNewCategoryParentId] = useState<string>("none")
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  
  // Estados para selector de árbol en diálogo de crear categoría
  const [createDialogExpandedCategories, setCreateDialogExpandedCategories] = useState<Set<string>>(new Set())
  const [createDialogSelectedPath, setCreateDialogSelectedPath] = useState<CategoryTree[]>([])
  const [isCreateDialogTreeSelectorOpen, setIsCreateDialogTreeSelectorOpen] = useState(false)
  const createDialogTreeSelectorRef = useRef<HTMLDivElement>(null)
  
  // Estados para editar/eliminar categorías
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryTree | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [editCategoryDescription, setEditCategoryDescription] = useState("")
  const [editCategoryParentId, setEditCategoryParentId] = useState<string>("none")
  const [editCategoryIsActive, setEditCategoryIsActive] = useState(true)
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false)
  
  // Estados para selector de árbol en diálogo de editar categoría
  const [editDialogExpandedCategories, setEditDialogExpandedCategories] = useState<Set<string>>(new Set())
  const [editDialogSelectedPath, setEditDialogSelectedPath] = useState<CategoryTree[]>([])
  const [isEditDialogTreeSelectorOpen, setIsEditDialogTreeSelectorOpen] = useState(false)
  const editDialogTreeSelectorRef = useRef<HTMLDivElement>(null)
  
  // Estados para seleccionar categoría a editar/eliminar
  const [selectedCategoryToManage, setSelectedCategoryToManage] = useState<CategoryTree | null>(null)
  const [isManageCategorySelectorOpen, setIsManageCategorySelectorOpen] = useState(false)
  const manageCategorySelectorRef = useRef<HTMLDivElement>(null)
  
  // Estados para selector de árbol
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [selectedPath, setSelectedPath] = useState<CategoryTree[]>([])
  const [isTreeSelectorOpen, setIsTreeSelectorOpen] = useState(false)
  const treeSelectorRef = useRef<HTMLDivElement>(null)

  // Hook para requests autenticados
  const { fetchData, loading, error } = useAuthFetch({
    onError: (errorMessage) => {
      setGeneratedResponse(`❌ ${errorMessage}\n\nPor favor, verifica tu conexión a internet y que la API esté funcionando correctamente.`)
      setShowPreview(true)
    }
  })

  // Hook para manejar preguntas
  const { updateQuestion } = useQuestions()

  // Hook para categorías
  const { categories, loading: categoriesLoading, error: categoriesError, createCategory, updateCategory, deleteCategory, refreshCategories } = useCategories()
  
  // Hook para árbol de categorías
  const { categoriesTree, loading: treeLoading, error: treeError } = useCategoriesTree()

  // Cerrar selector de árbol cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (treeSelectorRef.current && !treeSelectorRef.current.contains(event.target as Node)) {
        setIsTreeSelectorOpen(false)
      }
    }

    if (isTreeSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isTreeSelectorOpen])

  // Cerrar selector de árbol del diálogo cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createDialogTreeSelectorRef.current && !createDialogTreeSelectorRef.current.contains(event.target as Node)) {
        setIsCreateDialogTreeSelectorOpen(false)
      }
    }

    if (isCreateDialogTreeSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCreateDialogTreeSelectorOpen])

  // Cerrar selector de árbol del diálogo de editar cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editDialogTreeSelectorRef.current && !editDialogTreeSelectorRef.current.contains(event.target as Node)) {
        setIsEditDialogTreeSelectorOpen(false)
      }
    }

    if (isEditDialogTreeSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditDialogTreeSelectorOpen])

  // Cerrar selector de categoría para gestionar cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (manageCategorySelectorRef.current && !manageCategorySelectorRef.current.contains(event.target as Node)) {
        setIsManageCategorySelectorOpen(false)
      }
    }

    if (isManageCategorySelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isManageCategorySelectorOpen])

  // Función helper para organizar categorías en jerarquía
  const getCategoryDisplayName = (category: Category) => {
    const displayName = category.display_name || category.name
    // Si tiene parent_id, agregar indentación visual
    if (category.parent_id) {
      return `└─ ${displayName}`
    }
    return displayName
  }

  // Organizar categorías por jerarquía (padres primero, luego hijos)
  const organizedCategories = [...categories].sort((a, b) => {
    // Categorías principales primero
    if (!a.parent_id && b.parent_id) return -1
    if (a.parent_id && !b.parent_id) return 1
    // Dentro del mismo nivel, ordenar alfabéticamente
    const nameA = a.display_name || a.name
    const nameB = b.display_name || b.name
    return nameA.localeCompare(nameB)
  })

  // Funciones para el selector de árbol
  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const selectCategory = (category: CategoryTree, path: CategoryTree[]) => {
    setSelectedCategoryId(category.id)
    setSelectedPath([...path, category])
    setIsTreeSelectorOpen(false)
  }

  const getSelectedCategoryDisplay = () => {
    if (selectedPath.length === 0) return "Selecciona una categoría"
    return selectedPath.map(cat => cat.name).join(" > ")
  }

  // Funciones para el selector de árbol del diálogo de crear categoría
  const toggleCreateDialogCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(createDialogExpandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setCreateDialogExpandedCategories(newExpanded)
  }

  const selectCreateDialogCategory = (category: CategoryTree, path: CategoryTree[]) => {
    setNewCategoryParentId(category.id)
    setCreateDialogSelectedPath([...path, category])
    setIsCreateDialogTreeSelectorOpen(false)
  }

  const getCreateDialogSelectedCategoryDisplay = () => {
    if (newCategoryParentId === "none") return "Sin categoría padre (Categoría principal)"
    if (createDialogSelectedPath.length === 0) return "Selecciona una categoría padre (opcional)"
    return createDialogSelectedPath.map(cat => cat.name).join(" > ")
  }

  // Función helper para generar indicadores de nivel
  const getLevelIndicator = (level: number) => {
    if (level === 0) return ""
    if (level === 1) return "└─ "
    // Para niveles más profundos, usar espacios y líneas para mostrar jerarquía
    return "└─ "
  }

  // Funciones para gestionar categorías (editar/eliminar)
  const selectCategoryToManage = (category: CategoryTree, path: CategoryTree[]) => {
    setSelectedCategoryToManage(category)
    setIsManageCategorySelectorOpen(false)
  }

  const openEditCategory = () => {
    if (!selectedCategoryToManage) return
    
    setEditingCategory(selectedCategoryToManage)
    setEditCategoryName(selectedCategoryToManage.name)
    setEditCategoryDescription(selectedCategoryToManage.description || "")
    setEditCategoryIsActive(selectedCategoryToManage.is_active)
    
    // Encontrar la categoría padre en el árbol para establecer el path
    const findParentPath = (categories: CategoryTree[], targetId: string): CategoryTree[] => {
      for (const category of categories) {
        if (category.id === targetId) {
          return [category]
        }
        if (category.children.length > 0) {
          const childPath = findParentPath(category.children, targetId)
          if (childPath.length > 0) {
            return [category, ...childPath]
          }
        }
      }
      return []
    }

    // Si tiene parent_id, encontrar el path del padre
    if (selectedCategoryToManage.full_path && selectedCategoryToManage.full_path.includes('/')) {
      // Buscar la categoría padre por el full_path
      const pathParts = selectedCategoryToManage.full_path.split('/')
      pathParts.pop() // Remover la categoría actual
      const parentPath = pathParts.join('/')
      
      const findCategoryByPath = (categories: CategoryTree[], path: string): CategoryTree | null => {
        for (const category of categories) {
          if (category.full_path === path) {
            return category
          }
          if (category.children.length > 0) {
            const found = findCategoryByPath(category.children, path)
            if (found) return found
          }
        }
        return null
      }
      
      const parentCategory = findCategoryByPath(categoriesTree, parentPath)
      if (parentCategory) {
        setEditCategoryParentId(parentCategory.id)
        setEditDialogSelectedPath(findParentPath(categoriesTree, parentCategory.id))
      } else {
        setEditCategoryParentId("none")
        setEditDialogSelectedPath([])
      }
    } else {
      setEditCategoryParentId("none")
      setEditDialogSelectedPath([])
    }
    
    setIsEditCategoryOpen(true)
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) return

    setIsUpdatingCategory(true)
    try {
      await updateCategory(editingCategory.id, {
        name: editCategoryName.trim(),
        description: editCategoryDescription.trim() || undefined,
        parent_id: editCategoryParentId === "none" ? null : editCategoryParentId,
        is_active: editCategoryIsActive
      })
      
      // Limpiar formulario y cerrar diálogo
      setEditCategoryName("")
      setEditCategoryDescription("")
      setEditCategoryParentId("none")
      setEditCategoryIsActive(true)
      setEditDialogSelectedPath([])
      setEditDialogExpandedCategories(new Set())
      setEditingCategory(null)
      setIsEditCategoryOpen(false)
      setSelectedCategoryToManage(null)
      
      // Refrescar las listas
      refreshCategories()
      
      console.log("Categoría actualizada exitosamente")
    } catch (error) {
      console.error("Error al actualizar categoría:", error)
    } finally {
      setIsUpdatingCategory(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategoryToManage) return

    try {
      await deleteCategory(selectedCategoryToManage.id)
      setSelectedCategoryToManage(null)
      
      // Refrescar las listas
      refreshCategories()
      
      console.log("Categoría eliminada exitosamente")
    } catch (error) {
      console.error("Error al eliminar categoría:", error)
    }
  }

  // Funciones para el selector de árbol del diálogo de editar categoría
  const toggleEditDialogCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(editDialogExpandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setEditDialogExpandedCategories(newExpanded)
  }

  const selectEditDialogCategory = (category: CategoryTree, path: CategoryTree[]) => {
    setEditCategoryParentId(category.id)
    setEditDialogSelectedPath([...path, category])
    setIsEditDialogTreeSelectorOpen(false)
  }

  const getEditDialogSelectedCategoryDisplay = () => {
    if (editCategoryParentId === "none") return "Sin categoría padre (Categoría principal)"
    if (editDialogSelectedPath.length === 0) return "Selecciona una categoría padre (opcional)"
    return editDialogSelectedPath.map(cat => cat.name).join(" > ")
  }

  // Componente para renderizar el árbol de categorías (selector principal)
  const renderCategoryTree = (categories: CategoryTree[], path: CategoryTree[] = [], level: number = 0) => {
    return categories.map((category) => (
      <div key={category.id} style={{ marginLeft: `${level * 16}px` }}>
        <div className="flex items-center space-x-2 py-2 px-2 hover:bg-muted/50 rounded-md cursor-pointer">
          {category.children.length > 0 ? (
            <button
              onClick={() => toggleCategoryExpansion(category.id)}
              className="flex items-center justify-center w-4 h-4"
            >
              {expandedCategories.has(category.id) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4" />
          )}
          <button
            onClick={() => selectCategory(category, path)}
            className="flex-1 text-left text-sm hover:text-primary"
          >
            {/* Agregar indicador visual del nivel */}
            {level > 0 && <span className="text-muted-foreground mr-1">{getLevelIndicator(level)}</span>}
            {category.name}
            {category.questions_count > 0 && (
              <Badge variant="outline" className="ml-2 text-xs">
                {category.questions_count}
              </Badge>
            )}
          </button>
        </div>
        {expandedCategories.has(category.id) && category.children.length > 0 && (
          <div>
            {renderCategoryTree(category.children, [...path, category], level + 1)}
          </div>
        )}
      </div>
    ))
  }

  // Componente para renderizar el árbol de categorías (diálogo de crear categoría)
  const renderCreateDialogCategoryTree = (categories: CategoryTree[], path: CategoryTree[] = [], level: number = 0) => {
    return categories.map((category) => (
      <div key={category.id} style={{ marginLeft: `${level * 16}px` }}>
        <div className="flex items-center space-x-2 py-2 px-2 hover:bg-muted/50 rounded-md cursor-pointer">
          {category.children.length > 0 ? (
            <button
              onClick={() => toggleCreateDialogCategoryExpansion(category.id)}
              className="flex items-center justify-center w-4 h-4"
            >
              {createDialogExpandedCategories.has(category.id) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4" />
          )}
          <button
            onClick={() => selectCreateDialogCategory(category, path)}
            className="flex-1 text-left text-sm hover:text-primary"
          >
            {/* Agregar indicador visual del nivel */}
            {level > 0 && <span className="text-muted-foreground mr-1">{getLevelIndicator(level)}</span>}
            {category.name}
            {category.questions_count > 0 && (
              <Badge variant="outline" className="ml-2 text-xs">
                {category.questions_count}
              </Badge>
            )}
          </button>
        </div>
        {createDialogExpandedCategories.has(category.id) && category.children.length > 0 && (
          <div>
            {renderCreateDialogCategoryTree(category.children, [...path, category], level + 1)}
          </div>
        )}
      </div>
    ))
  }

  // Componente para renderizar el árbol de categorías (diálogo de editar categoría)
  const renderEditDialogCategoryTree = (categories: CategoryTree[], path: CategoryTree[] = [], level: number = 0) => {
    return categories.map((category) => (
      <div key={category.id} style={{ marginLeft: `${level * 16}px` }}>
        <div className="flex items-center space-x-2 py-2 px-2 hover:bg-muted/50 rounded-md cursor-pointer">
          {category.children.length > 0 ? (
            <button
              onClick={() => toggleEditDialogCategoryExpansion(category.id)}
              className="flex items-center justify-center w-4 h-4"
            >
              {editDialogExpandedCategories.has(category.id) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4" />
          )}
          <button
            onClick={() => selectEditDialogCategory(category, path)}
            className="flex-1 text-left text-sm hover:text-primary"
          >
            {/* Agregar indicador visual del nivel */}
            {level > 0 && <span className="text-muted-foreground mr-1">{getLevelIndicator(level)}</span>}
            {category.name}
            {category.questions_count > 0 && (
              <Badge variant="outline" className="ml-2 text-xs">
                {category.questions_count}
              </Badge>
            )}
          </button>
        </div>
        {editDialogExpandedCategories.has(category.id) && category.children.length > 0 && (
          <div>
            {renderEditDialogCategoryTree(category.children, [...path, category], level + 1)}
          </div>
        )}
      </div>
    ))
  }

  // Componente para renderizar el árbol de categorías (selector para gestionar)
  const renderManageCategoryTree = (categories: CategoryTree[], path: CategoryTree[] = [], level: number = 0) => {
    return categories.map((category) => (
      <div key={category.id} style={{ marginLeft: `${level * 16}px` }}>
        <div className="flex items-center space-x-2 py-2 px-2 hover:bg-muted/50 rounded-md cursor-pointer">
          {category.children.length > 0 ? (
            <button
              onClick={() => toggleCategoryExpansion(category.id)}
              className="flex items-center justify-center w-4 h-4"
            >
              {expandedCategories.has(category.id) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4" />
          )}
          <button
            onClick={() => selectCategoryToManage(category, path)}
            className="flex-1 text-left text-sm hover:text-primary"
          >
            {/* Agregar indicador visual del nivel */}
            {level > 0 && <span className="text-muted-foreground mr-1">{getLevelIndicator(level)}</span>}
            {category.name}
            {category.questions_count > 0 && (
              <Badge variant="outline" className="ml-2 text-xs">
                {category.questions_count}
              </Badge>
            )}
          </button>
        </div>
        {expandedCategories.has(category.id) && category.children.length > 0 && (
          <div>
            {renderManageCategoryTree(category.children, [...path, category], level + 1)}
          </div>
        )}
      </div>
    ))
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (contextType !== "pdf") return
    
    // Limpiar archivos anteriores ya que la API solo acepta un tipo de contexto
    setUploadedFiles([])
    
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }))
    setUploadedFiles(newFiles)
  }, [contextType])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  })

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const handleContextTypeChange = (type: "text" | "pdf") => {
    setContextType(type)
    // Limpiar campos del otro tipo
    if (type === "text") {
      setUploadedFiles([])
    } else {
      setContext("")
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    setIsCreatingCategory(true)
    try {
      const newCategory = await createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
        parent_id: newCategoryParentId === "none" ? null : newCategoryParentId
      })
      
      // Seleccionar automáticamente la nueva categoría
      setSelectedCategoryId(newCategory.id)
      
      // Limpiar formulario y cerrar diálogo
      setNewCategoryName("")
      setNewCategoryDescription("")
      setNewCategoryParentId("none")
      setCreateDialogSelectedPath([])
      setCreateDialogExpandedCategories(new Set())
      setIsCreateCategoryOpen(false)
      
      // Mostrar mensaje de éxito (opcional)
      console.log("Categoría creada exitosamente:", newCategory.display_name || newCategory.name)
    } catch (error) {
      console.error("Error al crear categoría:", error)
      // El error ya se maneja en el hook
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const generateResponse = async () => {
    if (!question.trim()) return
    
    // Validar que se tenga el contexto necesario según el tipo
    if (contextType === 'text' && !context.trim()) {
      alert('Debes agregar contexto de texto')
      return
    }
    if (contextType === 'pdf' && uploadedFiles.length === 0) {
      alert('Debes subir un archivo PDF')
      return
    }
    if (!selectedCategoryId) {
      alert('Debes seleccionar una categoría')
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    setGeneratedResponse("")
    setCurrentQuestionId(null)

    try {
      // Crear FormData para enviar a la API
      const formData = new FormData()
      formData.append('question_text', question)
      formData.append('context_type', contextType)
      formData.append('category_id', selectedCategoryId)
      
      // Agregar el contexto según el tipo seleccionado
      if (contextType === 'text') {
        formData.append('context_text', context)
      } else if (contextType === 'pdf' && uploadedFiles.length > 0) {
        formData.append('context_file', uploadedFiles[0].file)
      }

      // Simular progreso mientras se procesa
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 20
        })
      }, 500)

      // Determinar qué endpoint usar basado en el tipo de contexto
      const endpoint = contextType === 'pdf' 
        ? API_CONFIG.ENDPOINTS.QUESTIONS_NO_SLASH  // Sin slash para PDF
        : API_CONFIG.ENDPOINTS.QUESTIONS           // Con slash para texto

      // Usar el hook de autenticación para hacer la request
      const data = await fetchData(buildApiUrl(endpoint), {
        method: 'POST',
        body: formData,
        // No agregar Content-Type header para FormData, el browser lo maneja automáticamente
        headers: {
          // Remover Content-Type para que el browser agregue el boundary correcto
        }
      })

      clearInterval(progressInterval)
      setGenerationProgress(100)
      
      // Guardar toda la respuesta para referencia
      setGeneratedResponse(JSON.stringify(data))
      
      // Extraer el question_id si está disponible
      if (data && typeof data === 'object' && data.question_id) {
        setCurrentQuestionId(data.question_id)
      }
      
      // Extraer solo el model_response para mostrar y editar
      let modelResponse = ""
      try {
        if (data && typeof data === 'object' && data.model_response) {
          modelResponse = data.model_response
        } else if (typeof data === 'string') {
          const parsed = JSON.parse(data)
          modelResponse = parsed.model_response || data
        } else {
          modelResponse = JSON.stringify(data)
        }
      } catch (error) {
        console.error("Error parsing model_response:", error)
        modelResponse = data.response || data.answer || data.message || JSON.stringify(data)
      }
      
      setEditableModelResponse(modelResponse)
      setShowPreview(true)

    } catch (error) {
      console.error('Error al generar respuesta:', error)
      // El error ya se maneja en el hook useAuthFetch
    } finally {
      setIsGenerating(false)
    }
  }

  const saveContent = async () => {
    if (!editableModelResponse.trim()) {
      alert('No hay respuesta para guardar')
      return
    }

    if (!currentQuestionId) {
      alert('No hay pregunta generada para actualizar')
      return
    }

    try {
      // Crear FormData con la respuesta editada
      const formData = new FormData()
      formData.append('model_response', editableModelResponse)

      // Usar el hook para actualizar la pregunta
      await updateQuestion(currentQuestionId, formData)

      // Reset form
      setQuestion("")
      setContext("")
      setUploadedFiles([])
      setGeneratedResponse("")
      setEditableModelResponse("")
      setIsEditingResponse(false)
      setShowPreview(false)
      setSelectedCategoryId("")
      setSelectedPath([])
      setCurrentQuestionId(null)

      // Mostrar mensaje de éxito y redirigir
      alert("Respuesta actualizada exitosamente!")
      router.push("/dashboard/validation")
      
    } catch (error) {
      console.error('Error al actualizar pregunta:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      alert(`Error al actualizar la respuesta: ${errorMessage}`)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Gestión de Contenido</h1>
          <p className="text-muted-foreground">Agrega nuevo conocimiento al chatbot universitario</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="backdrop-blur-sm bg-card/80 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Nuevo Contenido</span>
                </CardTitle>
                <CardDescription>Completa la información para agregar nuevo conocimiento al chatbot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question Field */}
                <div className="space-y-2">
                  <Label htmlFor="question">Pregunta / Palabra Clave *</Label>
                  <Input
                    id="question"
                    placeholder="Ej: ¿Cuáles son los requisitos para inscripción?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="bg-background/50"
                    required
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="category">Categoría *</Label>
                    <div className="flex items-center space-x-1">
                      <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            <Plus className="h-3 w-3 mr-1" />
                            Nueva
                          </Button>
                        </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Crear Nueva Categoría</DialogTitle>
                          <DialogDescription>
                            Agrega una nueva categoría para organizar mejor el contenido.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-category-name">Nombre *</Label>
                            <Input
                              id="new-category-name"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="Nombre de la categoría"
                              className="bg-background/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-category-description">Descripción</Label>
                            <Textarea
                              id="new-category-description"
                              value={newCategoryDescription}
                              onChange={(e) => setNewCategoryDescription(e.target.value)}
                              placeholder="Descripción opcional"
                              className="bg-background/50"
                              rows={2}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-category-parent">Categoría Padre (Opcional)</Label>
                            
                            {/* Nuevo selector de árbol para el diálogo */}
                            <div className="relative" ref={createDialogTreeSelectorRef}>
                              <Button
                                variant="outline"
                                onClick={() => setIsCreateDialogTreeSelectorOpen(!isCreateDialogTreeSelectorOpen)}
                                className="w-full justify-between bg-background/50 h-10"
                                disabled={treeLoading}
                              >
                                <span className="truncate text-left">
                                  {treeLoading ? "Cargando categorías..." : getCreateDialogSelectedCategoryDisplay()}
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              </Button>
                              
                              {isCreateDialogTreeSelectorOpen && (
                                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
                                  <div className="p-2">
                                    {/* Opción para sin categoría padre */}
                                    <div className="py-2 px-2 hover:bg-muted/50 rounded-md cursor-pointer">
                                      <button
                                        onClick={() => {
                                          setNewCategoryParentId("none")
                                          setCreateDialogSelectedPath([])
                                          setIsCreateDialogTreeSelectorOpen(false)
                                        }}
                                        className="w-full text-left text-sm hover:text-primary"
                                      >
                                        Sin categoría padre (Categoría principal)
                                      </button>
                                    </div>
                                    
                                    {/* Separador */}
                                    {categoriesTree.length > 0 && (
                                      <div className="border-t my-1" />
                                    )}
                                    
                                    {/* Árbol de categorías */}
                                    {categoriesTree.length > 0 ? (
                                      renderCreateDialogCategoryTree(categoriesTree)
                                    ) : (
                                      <div className="text-sm text-muted-foreground p-2">
                                        No hay categorías disponibles
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsCreateCategoryOpen(false)
                              setNewCategoryName("")
                              setNewCategoryDescription("")
                              setNewCategoryParentId("none")
                              setCreateDialogSelectedPath([])
                              setCreateDialogExpandedCategories(new Set())
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={handleCreateCategory} 
                            disabled={!newCategoryName.trim() || isCreatingCategory}
                          >
                            {isCreatingCategory ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creando...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Crear
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    {/* Botón para gestionar categorías */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <div className="p-2">
                          <div className="text-xs text-muted-foreground mb-2">Seleccionar categoría:</div>
                          <div className="relative" ref={manageCategorySelectorRef}>
                            <Button
                              variant="outline"
                              onClick={() => setIsManageCategorySelectorOpen(!isManageCategorySelectorOpen)}
                              className="w-full justify-between h-8 text-xs"
                              disabled={treeLoading}
                            >
                              <span className="truncate">
                                {selectedCategoryToManage ? selectedCategoryToManage.name : "Seleccionar..."}
                              </span>
                              <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                            
                            {isManageCategorySelectorOpen && (
                              <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-32 overflow-y-auto">
                                <div className="p-1">
                                  {categoriesTree.length > 0 ? (
                                    renderManageCategoryTree(categoriesTree)
                                  ) : (
                                    <div className="text-xs text-muted-foreground p-2">
                                      No hay categorías
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {selectedCategoryToManage && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={openEditCategory}>
                              <Edit className="h-3 w-3 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente la categoría "{selectedCategoryToManage.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDeleteCategory}>
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </div>
                  {treeError && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      Error al cargar categorías: {treeError}
                    </div>
                  )}
                  
                  {/* Nuevo selector de árbol */}
                  <div className="relative" ref={treeSelectorRef}>
                    <Button
                      variant="outline"
                      onClick={() => setIsTreeSelectorOpen(!isTreeSelectorOpen)}
                      className="w-full justify-between bg-background/50 h-10"
                      disabled={treeLoading}
                    >
                      <span className="truncate">
                        {treeLoading ? "Cargando categorías..." : getSelectedCategoryDisplay()}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                    
                    {isTreeSelectorOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
                        <div className="p-2">
                          {categoriesTree.length > 0 ? (
                            renderCategoryTree(categoriesTree)
                          ) : (
                            <div className="text-sm text-muted-foreground p-2">
                              No hay categorías disponibles
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Diálogo de editar categoría */}
                <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Editar Categoría</DialogTitle>
                      <DialogDescription>
                        Modifica los detalles de la categoría seleccionada.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-category-name">Nombre *</Label>
                        <Input
                          id="edit-category-name"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          placeholder="Nombre de la categoría"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-category-description">Descripción</Label>
                        <Textarea
                          id="edit-category-description"
                          value={editCategoryDescription}
                          onChange={(e) => setEditCategoryDescription(e.target.value)}
                          placeholder="Descripción opcional"
                          className="bg-background/50"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-category-parent">Categoría Padre (Opcional)</Label>
                        
                        {/* Selector de árbol para editar categoría */}
                        <div className="relative" ref={editDialogTreeSelectorRef}>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditDialogTreeSelectorOpen(!isEditDialogTreeSelectorOpen)}
                            className="w-full justify-between bg-background/50 h-10"
                            disabled={treeLoading}
                          >
                            <span className="truncate text-left">
                              {treeLoading ? "Cargando categorías..." : getEditDialogSelectedCategoryDisplay()}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                          
                          {isEditDialogTreeSelectorOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
                              <div className="p-2">
                                {/* Opción para sin categoría padre */}
                                <div className="py-2 px-2 hover:bg-muted/50 rounded-md cursor-pointer">
                                  <button
                                    onClick={() => {
                                      setEditCategoryParentId("none")
                                      setEditDialogSelectedPath([])
                                      setIsEditDialogTreeSelectorOpen(false)
                                    }}
                                    className="w-full text-left text-sm hover:text-primary"
                                  >
                                    Sin categoría padre (Categoría principal)
                                  </button>
                                </div>
                                
                                {/* Separador */}
                                {categoriesTree.length > 0 && (
                                  <div className="border-t my-1" />
                                )}
                                
                                {/* Árbol de categorías (excluyendo la categoría actual) */}
                                {categoriesTree.length > 0 ? (
                                  renderEditDialogCategoryTree(
                                    categoriesTree.filter(cat => cat.id !== editingCategory?.id)
                                  )
                                ) : (
                                  <div className="text-sm text-muted-foreground p-2">
                                    No hay categorías disponibles
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="edit-category-active"
                            checked={editCategoryIsActive}
                            onChange={(e) => setEditCategoryIsActive(e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor="edit-category-active" className="text-sm">
                            Categoría activa
                          </Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditCategoryOpen(false)
                          setEditCategoryName("")
                          setEditCategoryDescription("")
                          setEditCategoryParentId("none")
                          setEditCategoryIsActive(true)
                          setEditDialogSelectedPath([])
                          setEditDialogExpandedCategories(new Set())
                          setEditingCategory(null)
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleUpdateCategory} 
                        disabled={!editCategoryName.trim() || isUpdatingCategory}
                      >
                        {isUpdatingCategory ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Actualizando...
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Actualizar
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Context Type Selection */}
                <div className="space-y-2">
                  <Label>Tipo de Contexto *</Label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="contextType"
                        value="text"
                        checked={contextType === "text"}
                        onChange={() => handleContextTypeChange("text")}
                        className="text-primary"
                      />
                      <span>Texto</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="contextType"
                        value="pdf"
                        checked={contextType === "pdf"}
                        onChange={() => handleContextTypeChange("pdf")}
                        className="text-primary"
                      />
                      <span>PDF</span>
                    </label>
                  </div>
                </div>

                {/* Context Field */}
                {contextType === "text" && (
                  <div className="space-y-2">
                    <Label htmlFor="context">Contexto Adicional *</Label>
                    <Textarea
                      id="context"
                      placeholder="Proporciona contexto adicional que ayude a generar una mejor respuesta..."
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      className="bg-background/50 min-h-[100px]"
                      rows={4}
                      required
                    />
                  </div>
                )}



                {/* File Upload */}
                {contextType === "pdf" && (
                  <div className="space-y-2">
                    <Label>Documento PDF *</Label>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/30"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {isDragActive
                          ? "Suelta el archivo aquí..."
                          : "Arrastra un archivo PDF aquí o haz clic para seleccionar"}
                      </p>
                    </div>

                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">{file.file.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {(file.file.size / 1024 / 1024).toFixed(2)} MB
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Generate Response Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={generateResponse}
                    disabled={!question.trim() || isGenerating || !selectedCategoryId ||
                      (contextType === "text" && !context.trim()) || 
                      (contextType === "pdf" && uploadedFiles.length === 0)}
                    className="bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Generar Respuesta con IA
                      </>
                    )}
                  </Button>
                </div>

                {/* Validation Message */}
                {question.trim() && (
                  <div className="text-center">
                    {!selectedCategoryId && (
                      <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
                        📂 Selecciona una categoría para continuar
                      </p>
                    )}
                    {selectedCategoryId && ((contextType === "text" && !context.trim()) || (contextType === "pdf" && uploadedFiles.length === 0)) && (
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        💡 {contextType === "text" ? "Agrega contexto de texto" : "Sube un archivo PDF"} para generar una respuesta más precisa
                      </p>
                    )}
                  </div>
                )}

                {/* Generation Progress */}
                {isGenerating && (
                  <div className="space-y-3">
                    <Progress value={generationProgress} className="w-full" />
                    <div className="text-center space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Procesando contenido... {Math.round(generationProgress)}%
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {context.trim() && (
                          <p>📝 Enviando contexto de texto...</p>
                        )}
                        {uploadedFiles.length > 0 && (
                          <p>📄 Procesando {uploadedFiles.length} archivo(s) PDF...</p>
                        )}
                        <p>🤖 Generando respuesta con IA...</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generated Response Preview */}
            {showPreview && generatedResponse && (
              <Card className="backdrop-blur-sm bg-card/80 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Vista Previa de la Pregunta</span>
                  </CardTitle>
                  <CardDescription>Revisa todos los detalles antes de guardar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Información básica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-primary">Categoría</Label>
                      <Badge variant="outline" className="mt-1">
                        {selectedPath.length > 0 
                          ? selectedPath.map(cat => cat.name).join(" > ")
                          : "Sin categoría"
                        }
                      </Badge>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-semibold text-primary">Tipo de Contexto</Label>
                      <Badge 
                        variant={contextType === "pdf" ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {contextType === "pdf" ? "Documento PDF" : "Texto"}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Pregunta */}
                  <div>
                    <Label className="text-sm font-semibold text-primary">Pregunta</Label>
                    <div className="mt-2 p-4 bg-muted/30 rounded-lg border">
                      <p className="text-sm leading-relaxed">{question}</p>
                    </div>
                  </div>
                  
                  {/* Contexto */}
                  {contextType === "text" && context.trim() && (
                    <div>
                      <Label className="text-sm font-semibold text-primary">Contexto Proporcionado</Label>
                      <div className="mt-2 p-4 bg-muted/30 rounded-lg border max-h-32 overflow-y-auto">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{context}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Archivos PDF */}
                  {contextType === "pdf" && uploadedFiles.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold text-primary">Archivos PDF</Label>
                      <div className="mt-2 space-y-2">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{file.file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Respuesta generada */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold text-primary">Respuesta Generada por IA</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingResponse(!isEditingResponse)}
                        className="text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        {isEditingResponse ? "Vista previa" : "Editar"}
                      </Button>
                    </div>
                    
                    {isEditingResponse ? (
                      <Textarea
                        value={editableModelResponse}
                        onChange={(e) => setEditableModelResponse(e.target.value)}
                        className="min-h-32 text-sm"
                        placeholder="Edita la respuesta generada por IA..."
                      />
                    ) : (
                      <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm leading-relaxed whitespace-pre-line">{editableModelResponse}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowPreview(false)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button onClick={saveContent} className="bg-secondary hover:bg-secondary/90">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Contenido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips Card */}
            <Card className="backdrop-blur-sm bg-card/80 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Consejos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Preguntas Claras</p>
                    <p className="text-xs text-muted-foreground">Formula preguntas específicas y directas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Contexto Relevante</p>
                    <p className="text-xs text-muted-foreground">Proporciona información adicional útil</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Tags Descriptivos</p>
                    <p className="text-xs text-muted-foreground">Usa etiquetas que faciliten la búsqueda</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="backdrop-blur-sm bg-card/80 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Estado del Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">IA Disponible</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full" />
                    <span className="text-xs text-secondary">Activo</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Procesamiento</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full" />
                    <span className="text-xs text-secondary">Normal</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Base de Datos</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full" />
                    <span className="text-xs text-secondary">Conectada</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
