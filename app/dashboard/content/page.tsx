"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, X, Brain, Save, Eye, Loader2, CheckCircle, Plus, ChevronDown, ChevronRight, Edit, Trash2, MoreHorizontal, Settings, Tag, Layers } from "lucide-react"
import AdminLayout from "@/components/admin-layout"
import { useDropzone } from "react-dropzone"
import { buildApiUrl, API_CONFIG, handleApiError } from "@/lib/api-config"
import { useAuthFetch } from "@/hooks/use-auth-fetch"
import { useQuestions } from "@/hooks/use-questions"
import { useModalities } from "@/hooks/use-modalities"
import { useSubmodalities, useSubmodalitiesByModality } from "@/hooks/use-submodalities"
import { useNewCategories, useCategoriesBySubmodality, useCategoriesByModality } from "@/hooks/use-new-categories"
import { Modality, Submodality } from "@/lib/modalities"
import { NewCategory } from "@/lib/new-categories"
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
  const [selectedModalityId, setSelectedModalityId] = useState<string>("")
  const [selectedSubmodalityId, setSelectedSubmodalityId] = useState<string>("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedResponse, setGeneratedResponse] = useState("")
  const [editableModelResponse, setEditableModelResponse] = useState("")
  const [isEditingResponse, setIsEditingResponse] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null)
  const [selectedPath, setSelectedPath] = useState<any[]>([])
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Estados para modalidades
  const [isCreateModalityOpen, setIsCreateModalityOpen] = useState(false)
  const [isEditModalityOpen, setIsEditModalityOpen] = useState(false)
  const [newModalityName, setNewModalityName] = useState("")
  const [newModalityDescription, setNewModalityDescription] = useState("")
  const [editingModality, setEditingModality] = useState<Modality | null>(null)
  const [isSubmittingModality, setIsSubmittingModality] = useState(false)

  // Estados para submodalidades
  const [isCreateSubmodalityOpen, setIsCreateSubmodalityOpen] = useState(false)
  const [isEditSubmodalityOpen, setIsEditSubmodalityOpen] = useState(false)
  const [newSubmodalityName, setNewSubmodalityName] = useState("")
  const [newSubmodalityDescription, setNewSubmodalityDescription] = useState("")
  const [newSubmodalityModalityId, setNewSubmodalityModalityId] = useState("")
  const [editingSubmodality, setEditingSubmodality] = useState<Submodality | null>(null)
  const [isSubmittingSubmodality, setIsSubmittingSubmodality] = useState(false)

  // Estados para categorías nuevas
   const [isCreateNewCategoryOpen, setIsCreateNewCategoryOpen] = useState(false)
   const [isEditNewCategoryOpen, setIsEditNewCategoryOpen] = useState(false)
   const [newCategoryHierName, setNewCategoryHierName] = useState("")
   const [newCategoryHierDescription, setNewCategoryHierDescription] = useState("")
   const [newCategorySubmodalityId, setNewCategorySubmodalityId] = useState("")
   const [newCategoryModalityId, setNewCategoryModalityId] = useState("")
   const [newCategoryParentType, setNewCategoryParentType] = useState<"modality" | "submodality">("submodality")
   const [editingNewCategory, setEditingNewCategory] = useState<NewCategory | null>(null)
   const [isSubmittingNewCategory, setIsSubmittingNewCategory] = useState(false)

   // Estados para filtros en la estructura jerárquica
   const [filterModalityId, setFilterModalityId] = useState<string>("all")
   const [filterSubmodalityId, setFilterSubmodalityId] = useState<string>("all")
   const [filterCategoryId, setFilterCategoryId] = useState<string>("all")

  // Estados para confirmaciones de eliminación
  const [isDeleteModalityOpen, setIsDeleteModalityOpen] = useState(false)
  const [isDeleteSubmodalityOpen, setIsDeleteSubmodalityOpen] = useState(false)
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<any>(null)

  // Hooks
  const { fetchData, loading: authLoading } = useAuthFetch()
  const { questions, loading: questionsLoading, refreshQuestions } = useQuestions()
  const {
    modalities,
    loading: modalitiesLoading,
    error: modalitiesError,
    createModality,
    updateModality,
    deleteModality,
    refreshModalities
  } = useModalities()

  const {
    submodalities,
    loading: submodalitiesLoading,
    error: submodalitiesError,
    createSubmodality,
    updateSubmodality,
    deleteSubmodality
  } = useSubmodalities()

  const {
    submodalities: submodalitiesByModality,
    loading: submodalitiesByModalityLoading
  } = useSubmodalitiesByModality(selectedModalityId)

  const {
    newCategories,
    loading: newCategoriesLoading,
    error: newCategoriesError,
    createNewCategory,
    updateNewCategory,
    deleteNewCategory
  } = useNewCategories()

  const {
    categories: categoriesBySubmodality,
    loading: categoriesBySubmodalityLoading
  } = useCategoriesBySubmodality(selectedSubmodalityId !== "none" ? selectedSubmodalityId : null)

  const {
    categories: categoriesByModality,
    loading: categoriesByModalityLoading
  } = useCategoriesByModality(selectedModalityId)

  // Combined categories for selection with proper filtering logic
  const allAvailableCategories = useMemo(() => {
    // If a specific submodality is selected, only show categories under that submodality
    if (selectedSubmodalityId && selectedSubmodalityId !== "none" && categoriesBySubmodality) {
      return categoriesBySubmodality
    }

    // If "Ninguna" is selected for submodality, show only categories directly under the modality
    if (selectedSubmodalityId === "none" && categoriesByModality) {
      return categoriesByModality.filter(category => !category.submodality_id)
    }

    // If modality is selected but no submodality choice made yet, show all categories under that modality
    if (selectedModalityId && categoriesByModality) {
      return categoriesByModality
    }

    // If nothing is selected, return empty array
    return []
  }, [selectedModalityId, selectedSubmodalityId, categoriesByModality, categoriesBySubmodality])

  // Clear dependent selections when parent changes
   useEffect(() => {
     setSelectedSubmodalityId("none")
     setSelectedCategoryId("")
   }, [selectedModalityId])

   useEffect(() => {
     setSelectedCategoryId("")
   }, [selectedSubmodalityId])

   // Clear filter selections when parent filter changes
   useEffect(() => {
     setFilterSubmodalityId("all")
     setFilterCategoryId("all")
   }, [filterModalityId])

   useEffect(() => {
     setFilterCategoryId("all")
   }, [filterSubmodalityId])

   // Filtered data for hierarchy view
   const filteredModalities = useMemo(() => {
     if (filterModalityId === "all") return modalities || []
     return (modalities || []).filter(modality => modality.id === filterModalityId)
   }, [modalities, filterModalityId])

   const filteredSubmodalities = useMemo(() => {
     if (filterModalityId === "all") return submodalities || []
     return (submodalities || []).filter(submodality => submodality.modality_id === filterModalityId)
   }, [submodalities, filterModalityId])

   const filteredCategories = useMemo(() => {
     let categories = newCategories || []

     if (filterModalityId !== "all") {
       categories = categories.filter(cat => cat.modality_id === filterModalityId)
     }

     if (filterSubmodalityId !== "all") {
       categories = categories.filter(cat => cat.submodality_id === filterSubmodalityId)
     }

     if (filterCategoryId !== "all") {
       categories = categories.filter(cat => cat.id === filterCategoryId)
     }

     return categories
   }, [newCategories, filterModalityId, filterSubmodalityId, filterCategoryId])

  // Funciones para manejar modalidades
  const handleCreateModality = async () => {
    if (!newModalityName.trim()) return

    setIsSubmittingModality(true)
    const result = await createModality({
      name: newModalityName,
      description: newModalityDescription || undefined
    })

    if (result.success) {
      setNewModalityName("")
      setNewModalityDescription("")
      setIsCreateModalityOpen(false)

      console.log("Modalidad creada exitosamente")
    } else {
      if (result.error?.startsWith('Ya existe una modalidad')) {
        setErrorMessage('Ya existe una modalidad con ese nombre')
        setShowErrorDialog(true)
      } else {
        setErrorMessage(result.error || 'Error al crear la modalidad')
        setShowErrorDialog(true)
      }
    }

    setIsSubmittingModality(false)
  }

  const handleEditModality = async () => {
    if (!editingModality || !newModalityName.trim()) return

    setIsSubmittingModality(true)
    const result = await updateModality(editingModality.id, {
      name: newModalityName,
      description: newModalityDescription || undefined
    })

    if (result.success) {
      setNewModalityName("")
      setNewModalityDescription("")
      setEditingModality(null)
      setIsEditModalityOpen(false)

      console.log("Modalidad actualizada exitosamente")
    } else {
      if (result.error?.startsWith('Ya existe una modalidad')) {
        setErrorMessage('Ya existe una modalidad con ese nombre')
        setShowErrorDialog(true)
      } else {
        setErrorMessage(result.error || 'Error al actualizar la modalidad')
        setShowErrorDialog(true)
      }
    }

    setIsSubmittingModality(false)
  }

  const handleDeleteModality = (modality: Modality) => {
    setDeletingItem(modality)
    setIsDeleteModalityOpen(true)
  }

  const confirmDeleteModality = async () => {
    if (!deletingItem) return

    const result = await deleteModality(deletingItem.id)
    if (result.success) {
      console.log("Modalidad eliminada exitosamente")
      setIsDeleteModalityOpen(false)
      setDeletingItem(null)
    } else {
      // Show specific error message for active relations
      if (result.error?.includes('relaciones') || result.error?.includes('asociadas') || result.error?.includes('foreign key')) {
        setErrorMessage(`No se puede eliminar la modalidad "${deletingItem.name}" porque tiene preguntas o submodalidades asociadas.`)
      } else {
        setErrorMessage(result.error || 'Error al eliminar la modalidad')
      }
      setShowErrorDialog(true)
      setIsDeleteModalityOpen(false)
      setDeletingItem(null)
    }
  }

  const openEditModality = (modality: Modality) => {
    setEditingModality(modality)
    setNewModalityName(modality.name)
    setNewModalityDescription(modality.description || "")
    setIsEditModalityOpen(true)
  }

  // Funciones para manejar submodalidades
  const handleCreateSubmodality = async () => {
    if (!newSubmodalityName.trim() || !newSubmodalityModalityId) return

    setIsSubmittingSubmodality(true)
    const result = await createSubmodality({
      name: newSubmodalityName,
      description: newSubmodalityDescription || undefined,
      modality_id: newSubmodalityModalityId
    })

    if (result.success) {
      setNewSubmodalityName("")
      setNewSubmodalityDescription("")
      setNewSubmodalityModalityId("")
      setIsCreateSubmodalityOpen(false)

      console.log("Submodalidad creada exitosamente")
    } else {
      if (result.error?.startsWith('Ya existe una submodalidad')) {
        setErrorMessage('Ya existe una submodalidad con ese nombre')
        setShowErrorDialog(true)
      } else {
        setErrorMessage(result.error || 'Error al crear la submodalidad')
        setShowErrorDialog(true)
      }
    }

    setIsSubmittingSubmodality(false)
  }

  const handleEditSubmodality = async () => {
    if (!editingSubmodality || !newSubmodalityName.trim()) return

    setIsSubmittingSubmodality(true)
    const result = await updateSubmodality(editingSubmodality.id, {
      name: newSubmodalityName,
      description: newSubmodalityDescription || undefined,
      modality_id: newSubmodalityModalityId || editingSubmodality.modality_id
    })

    if (result.success) {
      setNewSubmodalityName("")
      setNewSubmodalityDescription("")
      setNewSubmodalityModalityId("")
      setEditingSubmodality(null)
      setIsEditSubmodalityOpen(false)

      console.log("Submodalidad actualizada exitosamente")
    } else {
      if (result.error?.startsWith('Ya existe una submodalidad')) {
        setErrorMessage('Ya existe una submodalidad con ese nombre')
        setShowErrorDialog(true)
      } else {
        setErrorMessage(result.error || 'Error al actualizar la submodalidad')
        setShowErrorDialog(true)
      }
    }

    setIsSubmittingSubmodality(false)
  }

  const handleDeleteSubmodality = (submodality: Submodality) => {
    setDeletingItem(submodality)
    setIsDeleteSubmodalityOpen(true)
  }

  const confirmDeleteSubmodality = async () => {
    if (!deletingItem) return

    try {
      const result = await deleteSubmodality(deletingItem.id)
      if (result.success) {
        console.log("Submodalidad eliminada exitosamente")
        setIsDeleteSubmodalityOpen(false)
        setDeletingItem(null)
      } else {
        // Show specific error message for active relations
        setErrorMessage(`No se puede eliminar la submodalidad "${deletingItem.name}" porque tiene preguntas o categorías asociadas.`)
        setShowErrorDialog(true)
        setIsDeleteSubmodalityOpen(false)
        setDeletingItem(null)
      }
    } catch (error: any) {
      console.error("Error al eliminar submodalidad:", error)
      // Assume it's due to relations if delete fails
      const errorMessage = `No se puede eliminar la submodalidad "${deletingItem.name}" debido a que tiene relaciones con preguntas o categorías.`
      setErrorMessage(errorMessage)
      setShowErrorDialog(true)
      setIsDeleteSubmodalityOpen(false)
      setDeletingItem(null)
    }
  }

  const openEditSubmodality = (submodality: Submodality) => {
    setEditingSubmodality(submodality)
    setNewSubmodalityName(submodality.name)
    setNewSubmodalityDescription(submodality.description || "")
    setNewSubmodalityModalityId(submodality.modality_id)
    setIsEditSubmodalityOpen(true)
  }

  // Funciones para manejar categorías nuevas
  const handleCreateNewCategory = async () => {
    if (!newCategoryHierName.trim()) return

    // Validate that exactly one parent is selected
    if (newCategoryParentType === "submodality" && !newCategorySubmodalityId) {
      setErrorMessage('Debes seleccionar una submodalidad')
      setShowErrorDialog(true)
      return
    }
    if (newCategoryParentType === "modality" && !newCategoryModalityId) {
      setErrorMessage('Debes seleccionar una modalidad')
      setShowErrorDialog(true)
      return
    }

    setIsSubmittingNewCategory(true)
    const result = await createNewCategory({
      name: newCategoryHierName,
      description: newCategoryHierDescription || undefined,
      submodality_id: newCategoryParentType === "submodality" ? newCategorySubmodalityId : null,
      modality_id: newCategoryParentType === "modality" ? newCategoryModalityId : null
    })

    if (result.success) {
      setNewCategoryHierName("")
      setNewCategoryHierDescription("")
      setNewCategorySubmodalityId("")
      setNewCategoryModalityId("")
      setNewCategoryParentType("submodality")
      setIsCreateNewCategoryOpen(false)

      console.log("Categoría creada exitosamente")
    } else {
      if (result.error?.startsWith('Ya existe una categoría')) {
        setErrorMessage('Ya existe una categoría con ese nombre')
        setShowErrorDialog(true)
      } else {
        setErrorMessage(result.error || 'Error al crear la categoría')
        setShowErrorDialog(true)
      }
    }

    setIsSubmittingNewCategory(false)
  }

  const handleEditNewCategory = async () => {
    if (!editingNewCategory || !newCategoryHierName.trim()) return

    // Validate that exactly one parent is selected
    if (newCategoryParentType === "submodality" && !newCategorySubmodalityId) {
      setErrorMessage('Debes seleccionar una submodalidad')
      setShowErrorDialog(true)
      return
    }
    if (newCategoryParentType === "modality" && !newCategoryModalityId) {
      setErrorMessage('Debes seleccionar una modalidad')
      setShowErrorDialog(true)
      return
    }

    setIsSubmittingNewCategory(true)
    const result = await updateNewCategory(editingNewCategory.id, {
      name: newCategoryHierName,
      description: newCategoryHierDescription || undefined,
      submodality_id: newCategoryParentType === "submodality" ? newCategorySubmodalityId : null,
      modality_id: newCategoryParentType === "modality" ? newCategoryModalityId : null
    })

    if (result.success) {
      setNewCategoryHierName("")
      setNewCategoryHierDescription("")
      setNewCategorySubmodalityId("")
      setNewCategoryModalityId("")
      setNewCategoryParentType("submodality")
      setEditingNewCategory(null)
      setIsEditNewCategoryOpen(false)

      console.log("Categoría actualizada exitosamente")
    } else {
      if (result.error?.startsWith('Ya existe una categoría')) {
        setErrorMessage('Ya existe una categoría con ese nombre')
        setShowErrorDialog(true)
      } else {
        setErrorMessage(result.error || 'Error al actualizar la categoría')
        setShowErrorDialog(true)
      }
    }

    setIsSubmittingNewCategory(false)
  }

  const handleDeleteNewCategory = (category: NewCategory) => {
    setDeletingItem(category)
    setIsDeleteCategoryOpen(true)
  }

  const confirmDeleteCategory = async () => {
    if (!deletingItem) return

    try {
      const result = await deleteNewCategory(deletingItem.id)
      if (result.success) {
        console.log("Categoría eliminada exitosamente")
        setIsDeleteCategoryOpen(false)
        setDeletingItem(null)
      } else {
        // Show specific error message for active relations
        setErrorMessage(`No se puede eliminar la categoría "${deletingItem.name}" porque tiene preguntas asociadas.`)
        setShowErrorDialog(true)
        setIsDeleteCategoryOpen(false)
        setDeletingItem(null)
      }
    } catch (error: any) {
      console.error("Error al eliminar categoría:", error)
      // Assume it's due to relations if delete fails
      const errorMessage = `No se puede eliminar la categoría "${deletingItem.name}" debido a que tiene relaciones con preguntas.`
      setErrorMessage(errorMessage)
      setShowErrorDialog(true)
      setIsDeleteCategoryOpen(false)
      setDeletingItem(null)
    }
  }

  const openEditNewCategory = (category: NewCategory) => {
    setEditingNewCategory(category)
    setNewCategoryHierName(category.name)
    setNewCategoryHierDescription(category.description || "")
    setNewCategoryParentType(category.submodality_id ? "submodality" : "modality")
    setNewCategorySubmodalityId(category.submodality_id || "")
    setNewCategoryModalityId(category.modality_id || "")
    setIsEditNewCategoryOpen(true)
  }

  // Funciones para manejo de archivos
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (contextType !== "pdf") return

    setUploadedFiles([])

    if (acceptedFiles.length > 0 && acceptedFiles[0].type === "application/pdf") {
      const file = acceptedFiles[0]
      const uploadedFile: UploadedFile = {
        file,
        preview: file.name,
        id: Math.random().toString(36).substr(2, 9)
      }
      setUploadedFiles([uploadedFile])
    }

    if (acceptedFiles.length > 0 && contextType !== "pdf") {
      setContextType("pdf")
      setContext("")
    }
  }, [contextType])

  // Función para manejo de archivos de documentos
  const onDropDocument = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles([])

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const uploadedFile: UploadedFile = {
        file,
        preview: file.name,
        id: Math.random().toString(36).substr(2, 9)
      }
      setUploadedFiles([uploadedFile])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  const { getRootProps: getDocumentRootProps, getInputProps: getDocumentInputProps, isDragActive: isDocumentDragActive } = useDropzone({
    onDrop: onDropDocument,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false
  })

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id))
  }

  // Función para generar respuesta
  const handleGenerateResponse = async () => {
    if (!question.trim()) {
      setErrorMessage('Debes escribir una pregunta')
      setShowErrorDialog(true)
      return
    }
    if (contextType === "text" && !context.trim()) {
      setErrorMessage('Debes proporcionar contexto en texto')
      setShowErrorDialog(true)
      return
    }
    if (contextType === "pdf" && uploadedFiles.length === 0) {
      setErrorMessage('Debes subir un archivo PDF')
      setShowErrorDialog(true)
      return
    }
    if (!selectedModalityId) {
      setErrorMessage('Debes seleccionar una modalidad')
      setShowErrorDialog(true)
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    setGeneratedResponse("")
    setCurrentQuestionId(null)

    try {
      const formData = new FormData()
      formData.append('question_text', question)
      formData.append('context_type', contextType)
      
      formData.append('modality_id', selectedModalityId)
      if (selectedSubmodalityId && selectedSubmodalityId !== "none") {
        formData.append('submodality_id', selectedSubmodalityId)
      }
      if (selectedCategoryId) {
        formData.append('category_id', selectedCategoryId)
      }

      if (contextType === "text") {
        formData.append('context_text', context)
      } else if (contextType === "pdf" && uploadedFiles.length > 0) {
        formData.append('context_file', uploadedFiles[0].file)
      }

      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const response = await fetchData(buildApiUrl(API_CONFIG.ENDPOINTS.QUESTIONS_NO_SLASH), {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setGenerationProgress(100)

      if (response) {
        setGeneratedResponse(response.model_response || response.response)

        if (response.question_id || response.id) {
          setCurrentQuestionId(response.question_id || response.id)
        }

        setEditableModelResponse(response.model_response || response.response)
        setShowPreview(true)

        console.log("Pregunta generada exitosamente:", response)
      }
    } catch (error: any) {
      // console.error("Error al generar respuesta:", error)
      // Handle different error types and status codes
      let errorMessage = "Error desconocido al generar la pregunta"

      if (error?.status) {
        switch (error.status) {
          case 400:
            errorMessage = "Datos inválidos. Verifica que todos los campos estén completos y correctos."
            break
          case 401:
            errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente."
            break
          case 403:
            errorMessage = "No tienes permisos para realizar esta acción."
            break
          case 404:
            errorMessage = "Recurso no encontrado. Verifica la configuración del servidor."
            break
          case 413:
            errorMessage = "El archivo PDF es demasiado grande. Intenta con un archivo más pequeño."
            break
          case 422:
            errorMessage = "Datos de entrada inválidos. Revisa la información proporcionada."
            break
          case 429:
            errorMessage = "Demasiadas solicitudes. Espera un momento antes de intentar nuevamente."
            break
          case 500:
            errorMessage = "Error al crear la pregunta. Inténtalo más tarde."
            break
          case 502:
          case 503:
          case 504:
            errorMessage = "Servicio temporalmente no disponible. Inténtalo más tarde."
            break
          default:
            if (error.status >= 500) {
              errorMessage = "Error del servidor. Inténtalo más tarde."
            } else if (error.status >= 400) {
              errorMessage = "Error en la solicitud. Verifica los datos e intenta nuevamente."
            }
        }
      } else if (error?.message) {
        // Network errors or other errors with messages
        if (error.message.includes('fetch')) {
          errorMessage = "Error de conexión. Verifica tu conexión a internet e intenta nuevamente."
        } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorMessage = "La solicitud tardó demasiado. Inténtalo nuevamente."
        } else {
          errorMessage = error.message
        }
      }

      setErrorMessage(errorMessage)
      setShowErrorDialog(true)
    } finally {
      setIsGenerating(false)
    }
  }

  // Función para subir documento
  const handleUploadDocument = async () => {
    if (!question.trim()) {
      setErrorMessage('Debes escribir el texto de la pregunta')
      setShowErrorDialog(true)
      return
    }
    if (uploadedFiles.length === 0) {
      setErrorMessage('Debes subir un archivo')
      setShowErrorDialog(true)
      return
    }
    if (!selectedModalityId) {
      setErrorMessage('Debes seleccionar una modalidad')
      setShowErrorDialog(true)
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      const formData = new FormData()
      formData.append('question_text', question)
      formData.append('file', uploadedFiles[0].file)
      formData.append('modality_id', selectedModalityId)
      if (selectedSubmodalityId && selectedSubmodalityId !== "none") {
        formData.append('submodality_id', selectedSubmodalityId)
      }
      if (selectedCategoryId) {
        formData.append('category_id', selectedCategoryId)
      }

      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const response = await fetchData(buildApiUrl(API_CONFIG.ENDPOINTS.DOCUMENTS), {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setGenerationProgress(100)

      if (response) {
        console.log("Documento subido exitosamente:", response)
        setShowSuccessDialog(true)
      }
    } catch (error: any) {
      console.error("Error al subir documento:", error)

      let errorMessage = "Error desconocido al subir el documento"

      if (error?.status) {
        switch (error.status) {
          case 400:
            errorMessage = "Datos inválidos. Verifica que todos los campos estén completos y correctos."
            break
          case 401:
            errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente."
            break
          case 403:
            errorMessage = "No tienes permisos para realizar esta acción."
            break
          case 404:
            errorMessage = "Recurso no encontrado. Verifica la configuración del servidor."
            break
          case 413:
            errorMessage = "El archivo es demasiado grande. Intenta con un archivo más pequeño."
            break
          case 422:
            errorMessage = "Datos de entrada inválidos. Revisa la información proporcionada."
            break
          case 500:
            errorMessage = "Error al subir el documento. Inténtalo más tarde."
            break
          default:
            if (error.status >= 500) {
              errorMessage = "Error del servidor. Inténtalo más tarde."
            } else if (error.status >= 400) {
              errorMessage = "Error en la solicitud. Verifica los datos e intenta nuevamente."
            }
        }
      } else if (error?.message) {
        if (error.message.includes('fetch')) {
          errorMessage = "Error de conexión. Verifica tu conexión a internet e intenta nuevamente."
        } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorMessage = "La solicitud tardó demasiado. Inténtalo nuevamente."
        } else {
          errorMessage = error.message
        }
      }

      setErrorMessage(errorMessage)
      setShowErrorDialog(true)
    } finally {
      setIsGenerating(false)
    }
  }

  // Función para actualizar respuesta
  const handleUpdateResponse = async () => {
    if (!editableModelResponse.trim()) {
      setErrorMessage('La respuesta no puede estar vacía')
      setShowErrorDialog(true)
      return
    }

    if (!currentQuestionId) {
      setErrorMessage('No hay una pregunta para actualizar')
      setShowErrorDialog(true)
      return
    }

    try {
      const formData = new FormData()
      formData.append('model_response', editableModelResponse)

      const response = await fetchData(buildApiUrl(`${API_CONFIG.ENDPOINTS.QUESTIONS_NO_SLASH}/${currentQuestionId}`), {
        method: 'PATCH',
        body: formData
      })

      console.log("Respuesta actualizada exitosamente:", response)

      // Show success dialog
      setShowSuccessDialog(true)
    } catch (error: any) {
      console.error("Error al actualizar respuesta:", error)

      let errorMessage = "Error al guardar la respuesta"

      if (error?.status) {
        switch (error.status) {
          case 400:
            errorMessage = "Datos inválidos. La respuesta no puede estar vacía."
            break
          case 401:
            errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente."
            break
          case 403:
            errorMessage = "No tienes permisos para modificar esta respuesta."
            break
          case 404:
            errorMessage = "Pregunta no encontrada. Puede que haya sido eliminada."
            break
          case 500:
            errorMessage = "Error interno del servidor. Inténtalo más tarde."
            break
          default:
            if (error.status >= 500) {
              errorMessage = "Error del servidor. Inténtalo más tarde."
            } else if (error.status >= 400) {
              errorMessage = "Error al guardar. Verifica los datos e intenta nuevamente."
            }
        }
      } else if (error?.message) {
        if (error.message.includes('fetch')) {
          errorMessage = "Error de conexión. Verifica tu conexión a internet."
        } else {
          errorMessage = error.message
        }
      }

      setErrorMessage(errorMessage)
      setShowErrorDialog(true)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Principal */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Contenido</h1>
          <p className="text-muted-foreground">
            Administra preguntas, modalidades, submodalidades y categorías
          </p>
        </div>

        {/* Sección Principal: Preguntas */}
        <div className="space-y-6">
          <Card className="border-2 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-black">
                <Brain className="h-6 w-6 text-red-600" />
                Generación de Preguntas
              </CardTitle>
              <CardDescription className="text-base text-gray-700">
                Función principal: Crea preguntas con contexto y respuestas generadas por IA
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs para gestión de estructura */}
        <Tabs defaultValue="questions" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-muted-foreground">Gestión del Sistema</h2>
              <p className="text-sm text-muted-foreground">Administra la estructura jerárquica y genera contenido</p>
            </div>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="questions" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Preguntas
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentos
              </TabsTrigger>
              <TabsTrigger value="hierarchy" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Estructura Jerárquica
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content: Preguntas */}
          <TabsContent value="questions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-black">
                      <Brain className="h-5 w-5 text-red-600" />
                      Generar Nueva Pregunta
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Crea preguntas con contexto y respuestas generadas por IA
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Question Field */}
                    <div className="space-y-2">
                      <Label htmlFor="question">Pregunta *</Label>
                      <Textarea
                        id="question"
                        placeholder="¿Cuál es tu pregunta?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={3}
                        className="resize-none bg-gray-100 border-gray-300"
                      />
                    </div>

                    {/* Hierarchical Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Modalidad */}
                      <div className="space-y-2">
                        <Label>Modalidad *</Label>
                        <div className="flex gap-2">
                          <Select value={selectedModalityId} onValueChange={setSelectedModalityId}>
                            <SelectTrigger className="bg-gray-100 border-gray-300 flex-1">
                              <SelectValue placeholder="Selecciona modalidad" />
                            </SelectTrigger>
                            <SelectContent>
                              {modalities?.map((modality) => (
                                <SelectItem key={modality.id} value={modality.id}>
                                  {modality.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedModalityId && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedModalityId("")}
                              className="px-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Submodalidad */}
                      <div className="space-y-2">
                        <Label>Submodalidad (Opcional)</Label>
                        <div className="flex gap-2">
                          <Select
                            value={selectedSubmodalityId === "none" ? "none" : (selectedSubmodalityId || "none")}
                            onValueChange={(value) => setSelectedSubmodalityId(value === "none" ? "none" : value)}
                            disabled={!selectedModalityId}
                          >
                            <SelectTrigger className="bg-gray-100 border-gray-300 flex-1">
                              <SelectValue placeholder="Selecciona submodalidad (opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                Ninguna (directo bajo modalidad)
                              </SelectItem>
                              {submodalitiesByModality?.map((submodality) => (
                                <SelectItem key={submodality.id} value={submodality.id}>
                                  {submodality.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedSubmodalityId && selectedSubmodalityId !== "none" && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSubmodalityId("none")}
                              className="px-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Categoría */}
                      <div className="space-y-2">
                        <Label>Categoría (Opcional)</Label>
                        <div className="flex gap-2">
                          <Select
                            value={selectedCategoryId}
                            onValueChange={setSelectedCategoryId}
                            disabled={!selectedModalityId}
                          >
                            <SelectTrigger className="bg-gray-100 border-gray-300 flex-1">
                              <SelectValue placeholder="Selecciona categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {allAvailableCategories?.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedCategoryId && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCategoryId("")}
                              className="px-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Context Type Selection */}
                    <div className="space-y-2">
                      <Label>Tipo de Contexto</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          className={`${
                            contextType === "text"
                              ? "bg-red-200 text-red-800 border-red-300 hover:bg-red-300"
                              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-red-100 hover:text-red-700"
                          } border`}
                          size="sm"
                          onClick={() => {
                            setContextType("text")
                            setUploadedFiles([])
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Texto
                        </Button>
                        <Button
                          type="button"
                          className={`${
                            contextType === "pdf"
                              ? "bg-red-200 text-red-800 border-red-300 hover:bg-red-300"
                              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-red-100 hover:text-red-700"
                          } border`}
                          size="sm"
                          onClick={() => {
                            setContextType("pdf")
                            setContext("")
                          }}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    </div>

                    {/* Context Field */}
                    {contextType === "text" && (
                      <div className="space-y-2">
                        <Label htmlFor="context">Contexto *</Label>
                        <Textarea
                          id="context"
                          placeholder="Proporciona el contexto para la pregunta..."
                          value={context}
                          onChange={(e) => setContext(e.target.value)}
                          rows={6}
                          className="bg-gray-100 border-gray-300"
                        />
                      </div>
                    )}

                    {/* File Upload */}
                    {contextType === "pdf" && (
                      <div className="space-y-4">
                        {uploadedFiles.length === 0 ? (
                          <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                              isDragActive
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25 hover:border-primary/50"
                            }`}
                          >
                            <input {...getInputProps()} />
                            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {isDragActive
                                ? "Suelta el archivo PDF aquí..."
                                : "Arrastra un archivo PDF aquí o haz clic para seleccionar"}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label>Archivo subido:</Label>
                            <div className="space-y-2">
                              {uploadedFiles.map((uploadedFile) => (
                                <div
                                  key={uploadedFile.id}
                                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-sm">{uploadedFile.preview}</span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(uploadedFile.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Generate Response Button */}
                    <Button
                      onClick={handleGenerateResponse}
                      disabled={isGenerating}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
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
                          Generar Respuesta
                        </>
                      )}
                    </Button>

                    {/* Validation Message */}
                    {!selectedModalityId && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Nota:</strong> Debes seleccionar al menos una modalidad para generar la pregunta.
                        </p>
                      </div>
                    )}

                    {/* Generation Progress */}
                    {isGenerating && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Generando respuesta...</span>
                          <span>{generationProgress}%</span>
                        </div>
                        <Progress value={generationProgress} className="w-full" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Generated Response Preview */}
                {showPreview && generatedResponse && (
                  <Card className="bg-white border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-black">
                        <Eye className="h-5 w-5 text-red-600" />
                        Vista Previa de la Respuesta
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Revisa y edita la respuesta antes de guardar
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Información básica */}
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                          <Label className="text-xs text-muted-foreground">MODALIDAD</Label>
                          <p className="text-sm font-medium">
                            {modalities?.find(m => m.id === selectedModalityId)?.name || "No especificada"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">SUBMODALIDAD</Label>
                          <p className="text-sm font-medium">
                            {selectedSubmodalityId 
                              ? submodalitiesByModality?.find(s => s.id === selectedSubmodalityId)?.name || "No especificada"
                              : "No especificada"
                            }
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">CATEGORÍA</Label>
                          <p className="text-sm font-medium">
                            {selectedCategoryId
                              ? allAvailableCategories?.find(c => c.id === selectedCategoryId)?.name || "No especificada"
                              : "No especificada"
                            }
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">TIPO DE CONTEXTO</Label>
                          <p className="text-sm font-medium">{contextType === "text" ? "Texto" : "PDF"}</p>
                        </div>
                      </div>

                      {/* Pregunta */}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">PREGUNTA</Label>
                        <p className="text-sm mt-1 p-3 bg-background border rounded-md">{question}</p>
                      </div>

                      {/* Contexto */}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">CONTEXTO</Label>
                        {contextType === "text" ? (
                          <p className="text-sm mt-1 p-3 bg-background border rounded-md whitespace-pre-wrap">
                            {context}
                          </p>
                        ) : (
                          <div className="mt-1 p-3 bg-background border rounded-md">
                            {uploadedFiles.map((file) => (
                              <div key={file.id} className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4" />
                                {file.preview}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Respuesta generada */}
                      <div>
                        <Label htmlFor="editableResponse" className="text-sm font-medium text-muted-foreground">
                          RESPUESTA GENERADA
                        </Label>
                        <Textarea
                          id="editableResponse"
                          value={editableModelResponse}
                          onChange={(e) => setEditableModelResponse(e.target.value)}
                          rows={10}
                          className="mt-1 font-mono text-sm focus:ring-black focus:border-black"
                        />
                      </div>

                      {/* Botones de acción */}
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateResponse} className="flex-1 bg-red-600 hover:bg-red-700">
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Respuesta
                        </Button>
                        <Button
                          variant="outline"
                          onClick={async () => {
                            if (currentQuestionId) {
                              try {
                                await fetchData(buildApiUrl(`${API_CONFIG.ENDPOINTS.QUESTIONS_NO_SLASH}/${currentQuestionId}`), {
                                  method: 'DELETE'
                                })
                              } catch (error) {
                                console.error("Error al eliminar la pregunta:", error)
                              }
                            }
                            setShowPreview(false)
                            setCurrentQuestionId(null)
                            setGeneratedResponse("")
                            setEditableModelResponse("")
                          }}
                          className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Tips Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">💡 Consejos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="space-y-2">
                      <p><strong>Jerarquía:</strong></p>
                      <p className="text-muted-foreground">
                        Modalidad → Submodalidad → Categoría
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p><strong>Preguntas efectivas:</strong></p>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Sé específico y claro</li>
                        <li>• Proporciona contexto relevante</li>
                        <li>• Usa la jerarquía correcta</li>
                      </ul>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p><strong>Contexto PDF:</strong></p>
                      <p className="text-muted-foreground">
                        El archivo PDF se procesará automáticamente para extraer el texto relevante.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Estado del Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Modalidades:</span>
                      <Badge variant="secondary">{modalities?.length || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Submodalidades:</span>
                      <Badge variant="secondary">{submodalities?.length || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Categorías:</span>
                      <Badge variant="secondary">{newCategories?.length || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Preguntas:</span>
                      <Badge variant="secondary">{questions?.length || 0}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab Content: Documentos */}
          <TabsContent value="documents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-black">
                      <FileText className="h-5 w-5 text-red-600" />
                      Subir Nuevo Documento
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Sube documentos para ofrecer archivos en lugar de respuestas generadas por IA
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Question Text Field */}
                    <div className="space-y-2">
                      <Label htmlFor="documentQuestion">Texto de la Pregunta *</Label>
                      <Textarea
                        id="documentQuestion"
                        placeholder="¿Cuál es el texto de la pregunta para este documento?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={3}
                        className="resize-none bg-gray-100 border-gray-300"
                      />
                    </div>

                    {/* Hierarchical Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Modalidad */}
                      <div className="space-y-2">
                        <Label>Modalidad *</Label>
                        <div className="flex gap-2">
                          <Select value={selectedModalityId} onValueChange={setSelectedModalityId}>
                            <SelectTrigger className="bg-gray-100 border-gray-300 flex-1">
                              <SelectValue placeholder="Selecciona modalidad" />
                            </SelectTrigger>
                            <SelectContent>
                              {modalities?.map((modality) => (
                                <SelectItem key={modality.id} value={modality.id}>
                                  {modality.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedModalityId && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedModalityId("")}
                              className="px-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Submodalidad */}
                      <div className="space-y-2">
                        <Label>Submodalidad (Opcional)</Label>
                        <div className="flex gap-2">
                          <Select
                            value={selectedSubmodalityId === "none" ? "none" : (selectedSubmodalityId || "none")}
                            onValueChange={(value) => setSelectedSubmodalityId(value === "none" ? "none" : value)}
                            disabled={!selectedModalityId}
                          >
                            <SelectTrigger className="bg-gray-100 border-gray-300 flex-1">
                              <SelectValue placeholder="Selecciona submodalidad (opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                Ninguna (directo bajo modalidad)
                              </SelectItem>
                              {submodalitiesByModality?.map((submodality) => (
                                <SelectItem key={submodality.id} value={submodality.id}>
                                  {submodality.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedSubmodalityId && selectedSubmodalityId !== "none" && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSubmodalityId("none")}
                              className="px-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Categoría */}
                      <div className="space-y-2">
                        <Label>Categoría (Opcional)</Label>
                        <div className="flex gap-2">
                          <Select
                            value={selectedCategoryId}
                            onValueChange={setSelectedCategoryId}
                            disabled={!selectedModalityId}
                          >
                            <SelectTrigger className="bg-gray-100 border-gray-300 flex-1">
                              <SelectValue placeholder="Selecciona categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {allAvailableCategories?.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedCategoryId && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCategoryId("")}
                              className="px-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-4">
                      <Label>Archivo del Documento *</Label>
                      {uploadedFiles.length === 0 ? (
                        <div
                          {...getDocumentRootProps()}
                          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            isDocumentDragActive
                              ? "border-primary bg-primary/5"
                              : "border-muted-foreground/25 hover:border-primary/50"
                          }`}
                        >
                          <input {...getDocumentInputProps()} />
                          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {isDocumentDragActive
                              ? "Suelta el archivo aquí..."
                              : "Arrastra un archivo aquí o haz clic para seleccionar"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Formatos soportados: PDF, DOC, DOCX, TXT, etc.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>Archivo subido:</Label>
                          <div className="space-y-2">
                            {uploadedFiles.map((uploadedFile) => (
                              <div
                                key={uploadedFile.id}
                                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm">{uploadedFile.preview}</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(uploadedFile.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Upload Document Button */}
                    <Button
                      onClick={handleUploadDocument}
                      disabled={isGenerating || uploadedFiles.length === 0 || !question.trim() || !selectedModalityId}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Subir Documento
                        </>
                      )}
                    </Button>

                    {/* Validation Message */}
                    {!selectedModalityId && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Nota:</strong> Debes seleccionar al menos una modalidad para subir el documento.
                        </p>
                      </div>
                    )}

                    {/* Upload Progress */}
                    {isGenerating && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subiendo documento...</span>
                          <span>{generationProgress}%</span>
                        </div>
                        <Progress value={generationProgress} className="w-full" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Tips Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">💡 Consejos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="space-y-2">
                      <p><strong>Jerarquía:</strong></p>
                      <p className="text-muted-foreground">
                        Modalidad → Submodalidad → Categoría
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p><strong>Documentos:</strong></p>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Sube archivos relevantes para las preguntas</li>
                        <li>• Asegúrate de que el texto de la pregunta sea claro</li>
                        <li>• Usa la jerarquía correcta para organizar</li>
                      </ul>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p><strong>Formatos soportados:</strong></p>
                      <p className="text-muted-foreground">
                        PDF, DOC, DOCX, TXT y otros formatos comunes.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Estado del Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Modalidades:</span>
                      <Badge variant="secondary">{modalities?.length || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Submodalidades:</span>
                      <Badge variant="secondary">{submodalities?.length || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Categorías:</span>
                      <Badge variant="secondary">{newCategories?.length || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Preguntas:</span>
                      <Badge variant="secondary">{questions?.length || 0}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab Content: Estructura Jerárquica */}
          <TabsContent value="hierarchy" className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Estructura Jerárquica</h2>
              <p className="text-muted-foreground">Gestiona modalidades, submodalidades y categorías en orden ascendente</p>
            </div>

            {/* Filters */}
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Filtros
                </CardTitle>
                <CardDescription>
                  Filtra la estructura jerárquica para encontrar elementos específicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Modality Filter */}
                  <div className="space-y-2">
                    <Label>Filtrar por Modalidad</Label>
                    <div className="flex gap-2">
                      <Select value={filterModalityId} onValueChange={setFilterModalityId}>
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue placeholder="Todas las modalidades" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todas las modalidades
                          </SelectItem>
                          {modalities?.map((modality) => (
                            <SelectItem key={modality.id} value={modality.id}>
                              {modality.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filterModalityId !== "all" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFilterModalityId("all")}
                          className="px-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Submodality Filter */}
                  <div className="space-y-2">
                    <Label>Filtrar por Submodalidad</Label>
                    <div className="flex gap-2">
                      <Select
                        value={filterSubmodalityId}
                        onValueChange={setFilterSubmodalityId}
                        disabled={filterModalityId === "all"}
                      >
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue placeholder="Todas las submodalidades" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todas las submodalidades
                          </SelectItem>
                          {filteredSubmodalities?.map((submodality) => (
                            <SelectItem key={submodality.id} value={submodality.id}>
                              {submodality.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filterSubmodalityId !== "all" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFilterSubmodalityId("all")}
                          className="px-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label>Filtrar por Categoría</Label>
                    <div className="flex gap-2">
                      <Select
                        value={filterCategoryId}
                        onValueChange={setFilterCategoryId}
                        disabled={filterModalityId === "all"}
                      >
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todas las categorías
                          </SelectItem>
                          {filteredCategories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filterCategoryId !== "all" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFilterCategoryId("all")}
                          className="px-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">
                    Modalidades: {filteredModalities.length} {filterModalityId !== "all" && "(filtradas)"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">
                    Submodalidades: {filteredSubmodalities.length} {filterModalityId !== "all" && "(filtradas)"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">
                    Categorías: {filteredCategories.length} {(filterModalityId !== "all" || filterSubmodalityId !== "all" || filterCategoryId !== "all") && "(filtradas)"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsCreateModalityOpen(true)} size="sm" className="bg-red-200 text-red-800 border-red-300 hover:bg-red-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Modalidad
                </Button>
                <Button onClick={() => setIsCreateSubmodalityOpen(true)} size="sm" className="bg-red-200 text-red-800 border-red-300 hover:bg-red-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Submodalidad
                </Button>
                <Button onClick={() => setIsCreateNewCategoryOpen(true)} size="sm" className="bg-red-200 text-red-800 border-red-300 hover:bg-red-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Categoría
                </Button>
              </div>
            </div>

            {/* Modalidades */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Modalidades</h3>
                <Badge variant="secondary">{filteredModalities.length}</Badge>
              </div>

              {modalitiesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredModalities.map((modality) => (
                    <Card key={modality.id} className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Modalidad:</span>
                              <h4 className="font-semibold text-base mt-1">{modality.name}</h4>
                            </div>
                            {modality.description && (
                              <div>
                                <span className="text-sm font-medium text-muted-foreground">Descripción:</span>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {modality.description}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="outline" className="text-xs">
                              {modality.total_submodalities} submodalidades
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {modality.total_categories} categorías
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {modality.total_questions} preguntas
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModality(modality)}
                            className="h-8 w-8 p-0"
                            title="Editar modalidad"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteModality(modality)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            title="Eliminar modalidad"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Submodalidades */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Submodalidades</h3>
                <Badge variant="secondary">{filteredSubmodalities.length}</Badge>
              </div>

              {submodalitiesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSubmodalities.map((submodality) => (
                    <Card key={submodality.id} className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Modalidad:</span>
                              <p className="text-sm text-blue-600 font-medium mt-1">{submodality.modality_name}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Submodalidad:</span>
                              <h4 className="font-semibold text-base mt-1">{submodality.name}</h4>
                            </div>
                            {submodality.description && (
                              <div>
                                <span className="text-sm font-medium text-muted-foreground">Descripción:</span>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {submodality.description}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="outline" className="text-xs">
                              {submodality.total_categories} categorías
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {submodality.total_questions} preguntas
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditSubmodality(submodality)}
                            className="h-8 w-8 p-0"
                            title="Editar submodalidad"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSubmodality(submodality)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            title="Eliminar submodalidad"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Categorías */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Categorías</h3>
                <Badge variant="secondary">{filteredCategories.length}</Badge>
              </div>

              {newCategoriesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategories.map((category: NewCategory) => (
                    <Card key={category.id} className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Modalidad:</span>
                              <p className="text-sm text-blue-600 font-medium mt-1">{category.modality_name}</p>
                            </div>
                            {category.submodality_name && (
                              <div>
                                <span className="text-sm font-medium text-muted-foreground">Submodalidad:</span>
                                <p className="text-sm text-green-600 font-medium mt-1">{category.submodality_name}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Categoría:</span>
                              <h4 className="font-semibold text-base mt-1">{category.name}</h4>
                            </div>
                            {category.description && (
                              <div>
                                <span className="text-sm font-medium text-muted-foreground">Descripción:</span>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {category.description}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="outline" className="text-xs">
                              {category.total_questions} preguntas
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditNewCategory(category)}
                            className="h-8 w-8 p-0"
                            title="Editar categoría"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNewCategory(category)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            title="Eliminar categoría"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {/* Create Modality Dialog */}
        <Dialog open={isCreateModalityOpen} onOpenChange={setIsCreateModalityOpen}>
          <DialogContent className="bg-white border-red-200">
            <DialogHeader>
              <DialogTitle className="text-black">Crear Nueva Modalidad</DialogTitle>
              <DialogDescription className="text-gray-600">
                Agrega una nueva modalidad al sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="modalityName" className="text-black">Nombre *</Label>
                <Input
                  id="modalityName"
                  value={newModalityName}
                  onChange={(e) => setNewModalityName(e.target.value)}
                  placeholder="Nombre de la modalidad"
                  className="border-red-200 focus:border-red-400"
                />
              </div>
              <div>
                <Label htmlFor="modalityDescription" className="text-black">Descripción</Label>
                <Textarea
                  id="modalityDescription"
                  value={newModalityDescription}
                  onChange={(e) => setNewModalityDescription(e.target.value)}
                  placeholder="Descripción de la modalidad"
                  rows={3}
                  className="border-red-200 focus:border-red-400"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalityOpen(false)}
                className="border-red-300 text-black hover:bg-red-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateModality}
                disabled={isSubmittingModality}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmittingModality ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Modalidad"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modality Dialog */}
        <Dialog open={isEditModalityOpen} onOpenChange={setIsEditModalityOpen}>
          <DialogContent className="bg-white border-red-200">
            <DialogHeader>
              <DialogTitle className="text-black">Editar Modalidad</DialogTitle>
              <DialogDescription className="text-gray-600">
                Modifica los datos de la modalidad
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editModalityName" className="text-black">Nombre *</Label>
                <Input
                  id="editModalityName"
                  value={newModalityName}
                  onChange={(e) => setNewModalityName(e.target.value)}
                  placeholder="Nombre de la modalidad"
                  className="border-red-200 focus:border-red-400"
                />
              </div>
              <div>
                <Label htmlFor="editModalityDescription" className="text-black">Descripción</Label>
                <Textarea
                  id="editModalityDescription"
                  value={newModalityDescription}
                  onChange={(e) => setNewModalityDescription(e.target.value)}
                  placeholder="Descripción de la modalidad"
                  rows={3}
                  className="border-red-200 focus:border-red-400"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditModalityOpen(false)}
                className="border-red-300 text-black hover:bg-red-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEditModality}
                disabled={isSubmittingModality}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmittingModality ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Modalidad"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Submodality Dialog */}
        <Dialog open={isCreateSubmodalityOpen} onOpenChange={setIsCreateSubmodalityOpen}>
          <DialogContent className="bg-white border-red-200">
            <DialogHeader>
              <DialogTitle className="text-black">Crear Nueva Submodalidad</DialogTitle>
              <DialogDescription className="text-gray-600">
                Agrega una nueva submodalidad al sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="submodalityModality" className="text-black">Modalidad Padre *</Label>
                <Select value={newSubmodalityModalityId} onValueChange={setNewSubmodalityModalityId}>
                  <SelectTrigger className="border-red-200 focus:border-red-400">
                    <SelectValue placeholder="Selecciona modalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {modalities?.map((modality) => (
                      <SelectItem key={modality.id} value={modality.id}>
                        {modality.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="submodalityName" className="text-black">Nombre *</Label>
                <Input
                  id="submodalityName"
                  value={newSubmodalityName}
                  onChange={(e) => setNewSubmodalityName(e.target.value)}
                  placeholder="Nombre de la submodalidad"
                  className="border-red-200 focus:border-red-400"
                />
              </div>
              <div>
                <Label htmlFor="submodalityDescription" className="text-black">Descripción</Label>
                <Textarea
                  id="submodalityDescription"
                  value={newSubmodalityDescription}
                  onChange={(e) => setNewSubmodalityDescription(e.target.value)}
                  placeholder="Descripción de la submodalidad"
                  rows={3}
                  className="border-red-200 focus:border-red-400"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateSubmodalityOpen(false)}
                className="border-red-300 text-black hover:bg-red-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateSubmodality}
                disabled={isSubmittingSubmodality}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmittingSubmodality ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Submodalidad"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Submodality Dialog */}
        <Dialog open={isEditSubmodalityOpen} onOpenChange={setIsEditSubmodalityOpen}>
          <DialogContent className="bg-white border-red-200">
            <DialogHeader>
              <DialogTitle className="text-black">Editar Submodalidad</DialogTitle>
              <DialogDescription className="text-gray-600">
                Modifica los datos de la submodalidad
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editSubmodalityModality" className="text-black">Modalidad Padre *</Label>
                <Select value={newSubmodalityModalityId} onValueChange={setNewSubmodalityModalityId}>
                  <SelectTrigger className="border-red-200 focus:border-red-400">
                    <SelectValue placeholder="Selecciona modalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {modalities?.map((modality) => (
                      <SelectItem key={modality.id} value={modality.id}>
                        {modality.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editSubmodalityName" className="text-black">Nombre *</Label>
                <Input
                  id="editSubmodalityName"
                  value={newSubmodalityName}
                  onChange={(e) => setNewSubmodalityName(e.target.value)}
                  placeholder="Nombre de la submodalidad"
                  className="border-red-200 focus:border-red-400"
                />
              </div>
              <div>
                <Label htmlFor="editSubmodalityDescription" className="text-black">Descripción</Label>
                <Textarea
                  id="editSubmodalityDescription"
                  value={newSubmodalityDescription}
                  onChange={(e) => setNewSubmodalityDescription(e.target.value)}
                  placeholder="Descripción de la submodalidad"
                  rows={3}
                  className="border-red-200 focus:border-red-400"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditSubmodalityOpen(false)}
                className="border-red-300 text-black hover:bg-red-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEditSubmodality}
                disabled={isSubmittingSubmodality}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmittingSubmodality ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Submodalidad"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Category Dialog */}
        <Dialog open={isCreateNewCategoryOpen} onOpenChange={setIsCreateNewCategoryOpen}>
          <DialogContent className="bg-white border-red-200">
            <DialogHeader>
              <DialogTitle className="text-black">Crear Nueva Categoría</DialogTitle>
              <DialogDescription className="text-gray-600">
                Agrega una nueva categoría al sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Parent Type Selection */}
              <div>
                <Label className="text-black">¿Dónde crear la categoría?</Label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="parentType"
                      value="modality"
                      checked={newCategoryParentType === "modality"}
                      onChange={(e) => {
                        setNewCategoryParentType(e.target.value as "modality")
                        setNewCategorySubmodalityId("")
                      }}
                      className="text-red-600"
                    />
                    <span className="text-sm">Directo bajo Modalidad</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="parentType"
                      value="submodality"
                      checked={newCategoryParentType === "submodality"}
                      onChange={(e) => {
                        setNewCategoryParentType(e.target.value as "submodality")
                        setNewCategoryModalityId("")
                      }}
                      className="text-red-600"
                    />
                    <span className="text-sm">Bajo Submodalidad</span>
                  </label>
                </div>
              </div>

              {/* Parent Selection */}
              {newCategoryParentType === "modality" && (
                <div>
                  <Label htmlFor="categoryModality" className="text-black">Modalidad Padre *</Label>
                  <Select value={newCategoryModalityId} onValueChange={setNewCategoryModalityId}>
                    <SelectTrigger className="border-red-200 focus:border-red-400">
                      <SelectValue placeholder="Selecciona modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {modalities?.map((modality) => (
                        <SelectItem key={modality.id} value={modality.id}>
                          {modality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {newCategoryParentType === "submodality" && (
                <div>
                  <Label htmlFor="categorySubmodality" className="text-black">Submodalidad Padre *</Label>
                  <Select value={newCategorySubmodalityId} onValueChange={setNewCategorySubmodalityId}>
                    <SelectTrigger className="border-red-200 focus:border-red-400">
                      <SelectValue placeholder="Selecciona submodalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {submodalities?.map((submodality) => (
                        <SelectItem key={submodality.id} value={submodality.id}>
                          {submodality.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="categoryName" className="text-black">Nombre *</Label>
                <Input
                  id="categoryName"
                  value={newCategoryHierName}
                  onChange={(e) => setNewCategoryHierName(e.target.value)}
                  placeholder="Nombre de la categoría"
                  className="border-red-200 focus:border-red-400"
                />
              </div>
              <div>
                <Label htmlFor="categoryDescription" className="text-black">Descripción</Label>
                <Textarea
                  id="categoryDescription"
                  value={newCategoryHierDescription}
                  onChange={(e) => setNewCategoryHierDescription(e.target.value)}
                  placeholder="Descripción de la categoría"
                  rows={3}
                  className="border-red-200 focus:border-red-400"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateNewCategoryOpen(false)}
                className="border-red-300 text-black hover:bg-red-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateNewCategory}
                disabled={isSubmittingNewCategory}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmittingNewCategory ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Categoría"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={isEditNewCategoryOpen} onOpenChange={setIsEditNewCategoryOpen}>
          <DialogContent className="bg-white border-red-200">
            <DialogHeader>
              <DialogTitle className="text-black">Editar Categoría</DialogTitle>
              <DialogDescription className="text-gray-600">
                Modifica los datos de la categoría
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Parent Type Selection */}
              <div>
                <Label className="text-black">¿Dónde ubicar la categoría?</Label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="editParentType"
                      value="modality"
                      checked={newCategoryParentType === "modality"}
                      onChange={(e) => {
                        setNewCategoryParentType(e.target.value as "modality")
                        setNewCategorySubmodalityId("")
                        // If modality is not set but we have editing category with modality_id, set it
                        if (!newCategoryModalityId && editingNewCategory?.modality_id) {
                          setNewCategoryModalityId(editingNewCategory.modality_id)
                        }
                      }}
                      className="text-red-600"
                    />
                    <span className="text-sm">Directo bajo Modalidad</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="editParentType"
                      value="submodality"
                      checked={newCategoryParentType === "submodality"}
                      onChange={(e) => {
                        setNewCategoryParentType(e.target.value as "submodality")
                        setNewCategoryModalityId("")
                      }}
                      className="text-red-600"
                    />
                    <span className="text-sm">Bajo Submodalidad</span>
                  </label>
                </div>
              </div>

              {/* Parent Selection */}
              {newCategoryParentType === "modality" && (
                <div>
                  <Label htmlFor="editCategoryModality" className="text-black">Modalidad Padre *</Label>
                  <Select value={newCategoryModalityId} onValueChange={setNewCategoryModalityId}>
                    <SelectTrigger className="border-red-200 focus:border-red-400">
                      <SelectValue placeholder="Selecciona modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {modalities?.map((modality) => (
                        <SelectItem key={modality.id} value={modality.id}>
                          {modality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {newCategoryParentType === "submodality" && (
                <div>
                  <Label htmlFor="editCategorySubmodality" className="text-black">Submodalidad Padre *</Label>
                  <Select value={newCategorySubmodalityId} onValueChange={setNewCategorySubmodalityId}>
                    <SelectTrigger className="border-red-200 focus:border-red-400">
                      <SelectValue placeholder="Selecciona submodalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {submodalities?.map((submodality) => (
                        <SelectItem key={submodality.id} value={submodality.id}>
                          {submodality.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="editCategoryName" className="text-black">Nombre *</Label>
                <Input
                  id="editCategoryName"
                  value={newCategoryHierName}
                  onChange={(e) => setNewCategoryHierName(e.target.value)}
                  placeholder="Nombre de la categoría"
                  className="border-red-200 focus:border-red-400"
                />
              </div>
              <div>
                <Label htmlFor="editCategoryDescription" className="text-black">Descripción</Label>
                <Textarea
                  id="editCategoryDescription"
                  value={newCategoryHierDescription}
                  onChange={(e) => setNewCategoryHierDescription(e.target.value)}
                  placeholder="Descripción de la categoría"
                  rows={3}
                  className="border-red-200 focus:border-red-400"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditNewCategoryOpen(false)}
                className="border-red-300 text-black hover:bg-red-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEditNewCategory}
                disabled={isSubmittingNewCategory}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmittingNewCategory ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Categoría"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Modality Confirmation Dialog */}
        <AlertDialog open={isDeleteModalityOpen} onOpenChange={setIsDeleteModalityOpen}>
          <AlertDialogContent className="bg-white border-red-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-black">¿Eliminar Modalidad?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                ¿Estás seguro de que deseas eliminar la modalidad <strong>"{deletingItem?.name}"</strong>?.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-red-300 text-black hover:bg-red-50">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDeleteModality}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Submodality Confirmation Dialog */}
        <AlertDialog open={isDeleteSubmodalityOpen} onOpenChange={setIsDeleteSubmodalityOpen}>
          <AlertDialogContent className="bg-white border-red-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-black">¿Eliminar Submodalidad?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                ¿Estás seguro de que deseas eliminar la submodalidad <strong>"{deletingItem?.name}"</strong>?.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-red-300 text-black hover:bg-red-50">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDeleteSubmodality}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Category Confirmation Dialog */}
        <AlertDialog open={isDeleteCategoryOpen} onOpenChange={setIsDeleteCategoryOpen}>
          <AlertDialogContent className="bg-white border-red-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-black">¿Eliminar Categoría?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                ¿Estás seguro de que deseas eliminar la categoría <strong>"{deletingItem?.name}"</strong>?.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-red-300 text-black hover:bg-red-50">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDeleteCategory}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Success Dialog */}
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent className="bg-white border-red-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-black">
                {currentQuestionId ? "¡Pregunta creada exitosamente!" : "¡Documento subido exitosamente!"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                {currentQuestionId
                  ? "La pregunta ha sido guardada correctamente. ¿Deseas ir a la página de validación?"
                  : "El documento ha sido subido correctamente."
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-red-300 text-black hover:bg-red-50">
                Quedarme aquí
              </AlertDialogCancel>
              {currentQuestionId && (
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    // Reset form
                    setQuestion("")
                    setContext("")
                    setUploadedFiles([])
                    setGeneratedResponse("")
                    setEditableModelResponse("")
                    setIsEditingResponse(false)
                    setShowPreview(false)
                    setSelectedCategoryId("")
                    setSelectedModalityId("")
                    setSelectedSubmodalityId("")
                    setSelectedPath([])
                    setCurrentQuestionId(null)
                    setShowSuccessDialog(false)
                    // Redirect to validation page
                    router.push('/dashboard/validation')
                  }}
                >
                  Ir a Validación
                </AlertDialogAction>
              )}
              {!currentQuestionId && (
                <AlertDialogAction
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    // Reset form
                    setQuestion("")
                    setUploadedFiles([])
                    setSelectedCategoryId("")
                    setSelectedModalityId("")
                    setSelectedSubmodalityId("")
                    setShowSuccessDialog(false)
                  }}
                >
                  Subir Otro Documento
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Dialog */}
        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent className="bg-white border-red-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-black">Error</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                {errorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => setShowErrorDialog(false)}
              >
                Aceptar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}
