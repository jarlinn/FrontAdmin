"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Search,
  Filter,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  FileText,
  Eye,
  Download,
  Save,
  Upload,
  X,
  ChevronUp,
  MoreHorizontal,
} from "lucide-react"
import AdminLayout from "@/components/admin-layout"
import { useDropzone } from "react-dropzone"
import { useQuestions } from "@/hooks/use-questions"
import { Question, QuestionFilters, UpdateQuestionRequest } from "@/lib/questions"
import { useModalities } from "@/hooks/use-modalities"
import { useSubmodalities, useSubmodalitiesByModality } from "@/hooks/use-submodalities"
import { useNewCategories, useCategoriesBySubmodality } from "@/hooks/use-new-categories"
import { Modality } from "@/lib/modalities"
import { NewCategory } from "@/lib/new-categories"
import { authService } from "@/lib/auth"
import { buildApiUrl } from "@/lib/api-config"

const statusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "PENDING", label: "Pendiente" },
  { value: "APPROVED", label: "Aprobado" },
  { value: "DISABLED", label: "Rechazado" },
]

interface EditUploadedFile {
  file: File
  preview: string
  id: string
}

export default function ValidationPage() {
  // Estados locales
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [modalityFilter, setModalityFilter] = useState("all")
  const [submodalityFilter, setSubmodalityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Hooks para datos reales
  const { questions, pagination, loading, error, refreshQuestions, updateQuestionStatus, updateQuestion, recalculateQuestion, deleteQuestion, applyFilters, goToPage } = useQuestions()

  // Filtrar preguntas únicas por question_id
  const uniqueQuestions = useMemo(() => {
    const seen = new Set()
    return questions.filter(q => {
      if (seen.has(q.question_id)) return false
      seen.add(q.question_id)
      return true
    })
  }, [questions])
  const { modalities, loading: modalitiesLoading } = useModalities()
  const { submodalities: submodalitiesByModality, loading: submodalitiesByModalityLoading } = useSubmodalitiesByModality(modalityFilter !== "all" ? modalityFilter : "")
  const { categories: categoriesBySubmodality, loading: categoriesBySubmodalityLoading } = useCategoriesBySubmodality(submodalityFilter !== "all" ? submodalityFilter : "")
  
// Estados para selector de categorías
const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)

const [editingItem, setEditingItem] = useState<Question | null>(null)
  const [deletingItem, setDeletingItem] = useState<Question | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isReprocessing, setIsReprocessing] = useState<string | null>(null)
  
  // Estados para edición
  const [editedQuestionText, setEditedQuestionText] = useState("")
  const [editedModelResponse, setEditedModelResponse] = useState("")
  const [editedContextText, setEditedContextText] = useState("")
  const [editedContextType, setEditedContextType] = useState<"text" | "pdf">("text")
  const [editedModalityId, setEditedModalityId] = useState("")
  const [editedSubmodalityId, setEditedSubmodalityId] = useState("")
  const [editedCategoryId, setEditedCategoryId] = useState("")
  const [editUploadedFiles, setEditUploadedFiles] = useState<EditUploadedFile[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [previewingDocument, setPreviewingDocument] = useState<Question | null>(null)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [documentLoading, setDocumentLoading] = useState(false)
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [activatingQuestion, setActivatingQuestion] = useState<string | null>(null)
  const [rejectingQuestion, setRejectingQuestion] = useState<string | null>(null)
  const [disablingQuestion, setDisablingQuestion] = useState<string | null>(null)
  const [recalculatingQuestion, setRecalculatingQuestion] = useState<string | null>(null)
  const [expandedResponses, setExpandedResponses] = useState<Set<string>>(new Set())
  const [truncatedResponses, setTruncatedResponses] = useState<Set<string>>(new Set())

  // Hooks para edición jerárquica
  const { submodalities: editSubmodalitiesByModality, loading: editSubmodalitiesByModalityLoading } = useSubmodalitiesByModality(editedModalityId || "")
  const { categories: editCategoriesBySubmodality, loading: editCategoriesBySubmodalityLoading } = useCategoriesBySubmodality(editedSubmodalityId || "")

  // Función para detectar si el contenido está truncado
  const checkIfTruncated = (element: HTMLElement) => {
    return element.scrollHeight > element.clientHeight
  }

  // Función para manejar expansión de respuestas
  const toggleResponseExpansion = (questionId: string) => {
    const newExpanded = new Set(expandedResponses)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedResponses(newExpanded)
  }

  // Aplicar filtros con debounce para búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters: QuestionFilters = {}

      // Siempre incluir status (el backend maneja "all" como mostrar todos)
      filters.status = statusFilter as "PENDING" | "APPROVED" | "DISABLED" | "all"

      // Nuevos filtros jerárquicos
      filters.modality_id = modalityFilter === "all" ? "" : modalityFilter
      filters.submodality_id = submodalityFilter === "all" ? "" : submodalityFilter
      filters.category_id = categoryFilter === "all" ? "" : categoryFilter

      filters.search = searchTerm.trim()

      console.log('🔍 Enviando filtros al backend:', filters)

      // Llamar directamente a applyFilters sin incluirlo en dependencias
      applyFilters(filters)
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, modalityFilter, submodalityFilter, categoryFilter])



  // Función para obtener el full_path de una categoría por ID
  const getCategoryFullPath = (question: Question): string => {
    // Debug: Log what we're receiving
    console.log('🔍 Question data for display:', {
      question_id: question.question_id,
      full_name: question.full_name,
      category_name: question.category_name,
      modality_id: question.modality_id,
      submodality_id: question.submodality_id,
      category_id: question.category_id
    })

    // Use the full_name field provided by the backend
    return question.full_name || question.category_name || "Sin categoría"
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprobado
          </Badge>
        )
      case "DISABLED":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazado
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }



  // Funciones para manejar archivos en edición
  const onEditFileDrop = useCallback((acceptedFiles: File[]) => {
    if (editedContextType !== "pdf") return
    
    // Limpiar archivos anteriores ya que solo se acepta un PDF
    setEditUploadedFiles([])
    
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }))
    setEditUploadedFiles(newFiles)
  }, [editedContextType])

  const { getRootProps: getEditRootProps, getInputProps: getEditInputProps, isDragActive: isEditDragActive } = useDropzone({
    onDrop: onEditFileDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  })

  const removeEditFile = (id: string) => {
    setEditUploadedFiles((prev) => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter((file) => file.id !== id)
    })
  }

  const handleEdit = (question: Question) => {
    // Debug: Log what we're loading for edit
    console.log('📝 Loading question for edit:', {
      question_id: question.question_id,
      full_name: question.full_name,
      category_name: question.category_name,
      modality_id: question.modality_id,
      submodality_id: question.submodality_id,
      category_id: question.category_id,
      question_text: question.question_text
    })

    setEditingItem(question)
    // Inicializar los campos con los valores actuales
    setEditedQuestionText(question.question_text)
    setEditedModelResponse(question.model_response || question.response || "")
    setEditedContextText(question.context_text || "")
    setEditedContextType(question.context_type)
    setEditedModalityId(question.modality_id || "")
    setEditedSubmodalityId(question.submodality_id || "")
    setEditedCategoryId(question.category_id)

    // Limpiar archivos subidos
    setEditUploadedFiles([])
  }

  const handleSaveEdit = async () => {
    if (!editingItem) return

    try {
      setIsSaving(true)
      
      // Siempre usar FormData según el nuevo formato del backend
      const formData = new FormData()

      // Agregar campos básicos
      formData.append('question_text', editedQuestionText)
      formData.append('model_response', editedModelResponse)
      formData.append('context_type', editedContextType)
      formData.append('category_id', editedCategoryId)
      if (editedModalityId) {
        formData.append('modality_id', editedModalityId)
      }
      if (editedSubmodalityId) {
        formData.append('submodality_id', editedSubmodalityId)
      }

      // Debug: Log what we're sending
      console.log('🔄 Enviando actualización de pregunta:', {
        question_text: editedQuestionText,
        model_response: editedModelResponse,
        context_type: editedContextType,
        category_id: editedCategoryId,
        modality_id: editedModalityId,
        submodality_id: editedSubmodalityId
      })

      // Log FormData contents
      console.log('📝 FormData contents:')
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`)
      }
      
      // Agregar contexto según el tipo
      if (editedContextType === "text") {
        formData.append('context_text', editedContextText)
      } else if (editedContextType === "pdf" && editUploadedFiles.length > 0) {
        // Solo agregar archivo si hay uno nuevo seleccionado
        formData.append('context_file', editUploadedFiles[0].file)
      }
      
      // Actualizar la pregunta en el backend
      console.log('📡 Enviando actualización al backend...')
      const updatedQuestion = await updateQuestion(editingItem.question_id, formData)
      console.log('✅ Respuesta del backend:', updatedQuestion)

      // Refrescar la lista completa para asegurar sincronización
      console.log('🔄 Refrescando lista de preguntas...')
      await refreshQuestions()

      // Cerrar el diálogo
      handleCloseEdit()
      
    } catch (error) {
      console.error("Error al guardar cambios:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCloseEdit = () => {
    setEditingItem(null)
    setEditedQuestionText("")
    setEditedModelResponse("")
    setEditedContextText("")
    setEditedContextType("text")
    setEditedModalityId("")
    setEditedSubmodalityId("")
    setEditedCategoryId("")

    // Limpiar archivos y liberar memoria
    editUploadedFiles.forEach(file => URL.revokeObjectURL(file.preview))
    setEditUploadedFiles([])
  }

  const handleDelete = (question: Question) => {
    setDeletingItem(question)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingItem) {
      try {
        await deleteQuestion(deletingItem.question_id)
        setDeletingItem(null)
        setIsDeleteDialogOpen(false)
        // Quick reload to prevent empty container
        window.location.reload()
      } catch (error) {
        console.error("Error al eliminar pregunta:", error)
        setDeletingItem(null)
        setIsDeleteDialogOpen(false)
      }
    }
  }

  const handleReprocess = async (question: Question) => {
    try {
      setIsReprocessing(question.question_id)
      await recalculateQuestion(question.question_id)
      // La pregunta se actualizará automáticamente en el estado a través del hook
    } catch (error) {
      console.error("Error al reprocesar pregunta:", error)
    } finally {
      setIsReprocessing(null)
    }
  }

  const handleStatusChange = async (questionId: string, newStatus: "APPROVED" | "DISABLED") => {
    try {
      // Establecer el estado de carga apropiado
      if (newStatus === "APPROVED") {
        setActivatingQuestion(questionId)
      } else if (newStatus === "DISABLED") {
        setDisablingQuestion(questionId)
      }

      await updateQuestionStatus(questionId, newStatus)

      // Opcional: mostrar mensaje de éxito
      console.log(`Pregunta ${newStatus === "APPROVED" ? "activada" : "deshabilitada"} exitosamente`)

    } catch (error) {
      console.error("Error al actualizar estado:", error)
      // Aquí podrías mostrar un toast o notificación de error
    } finally {
      // Limpiar estados de carga
      setActivatingQuestion(null)
      setRejectingQuestion(null)
      setDisablingQuestion(null)
    }
  }

  const loadDocumentPreview = async (questionId: string) => {
    setDocumentLoading(true)
    setDocumentError(null)
    
    try {
      // Construir la URL del endpoint del archivo
      const fileUrl = buildApiUrl(`/chat/questions/${questionId}/file`)
      
      // Hacer la petición autenticada
      const response = await authService.authenticatedFetch(fileUrl)
      
      if (!response.ok) {
        throw new Error(`Error al cargar documento: ${response.status}`)
      }

      // Crear un blob URL para el PDF
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setDocumentUrl(url)
      
    } catch (error) {
      console.error("Error al cargar documento:", error)
      setDocumentError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setDocumentLoading(false)
    }
  }

  const handleDocumentPreview = async (question: Question) => {
    setPreviewingDocument(question)
    if (question.question_id) {
      await loadDocumentPreview(question.question_id)
    }
  }

  const handleClosePreview = () => {
    setPreviewingDocument(null)
    if (documentUrl) {
      URL.revokeObjectURL(documentUrl) // Limpiar memoria
      setDocumentUrl(null)
    }
    setDocumentError(null)
  }

  const handleDownloadDocument = async () => {
    if (!previewingDocument?.question_id) return
    
    try {
      const fileUrl = buildApiUrl(`/chat/questions/${previewingDocument.question_id}/file`)
      const response = await authService.authenticatedFetch(fileUrl)
      
      if (!response.ok) {
        throw new Error(`Error al descargar documento: ${response.status}`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = previewingDocument.context_file?.split('/').pop() || 'documento.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error("Error al descargar documento:", error)
    }
  }



  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Validación de Respuestas</h1>
          <p className="text-muted-foreground">Revisa y valida las respuestas generadas por la IA</p>
        </div>

        <Card className="bg-white border-gray-200 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg text-black">
              <Filter className="h-5 w-5 text-red-600" />
              <span>Filtros y Búsqueda</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Primera fila: Buscar, Estado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar preguntas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-100 border-gray-300 h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Estado</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-background/50 h-10 focus:ring-red-300 focus:ring-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="focus:bg-red-50 focus:text-red-900">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Segunda fila: Modalidad, Submodalidad, Categoría, Resultados */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Modalidad</Label>
                  <Select value={modalityFilter} onValueChange={(value) => {
                    setModalityFilter(value)
                    setSubmodalityFilter("all") // Reset submodality when modality changes
                    setCategoryFilter("all") // Reset category when modality changes
                  }}>
                    <SelectTrigger className="bg-background/50 h-10 focus:ring-red-300 focus:ring-2" disabled={modalitiesLoading}>
                      <SelectValue placeholder="Todas las modalidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="focus:bg-red-50 focus:text-red-900">Todas las modalidades</SelectItem>
                      {modalities?.map((modality) => (
                        <SelectItem key={modality.id} value={modality.id} className="focus:bg-red-50 focus:text-red-900">
                          {modality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Submodalidad</Label>
                  <Select
                    value={submodalityFilter}
                    onValueChange={(value) => {
                      setSubmodalityFilter(value)
                      setCategoryFilter("all") // Reset category when submodality changes
                    }}
                    disabled={modalityFilter === "all" || submodalitiesByModalityLoading}
                  >
                    <SelectTrigger className="bg-background/50 h-10 focus:ring-red-300 focus:ring-2">
                      <SelectValue placeholder="Todas las submodalidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="focus:bg-red-50 focus:text-red-900">Todas las submodalidades</SelectItem>
                      {submodalitiesByModality?.map((submodality) => (
                        <SelectItem key={submodality.id} value={submodality.id} className="focus:bg-red-50 focus:text-red-900">
                          {submodality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Categoría</Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                    disabled={categoriesBySubmodalityLoading || submodalityFilter === "all"}
                  >
                    <SelectTrigger className="bg-background/50 h-10 focus:ring-red-300 focus:ring-2">
                      <SelectValue placeholder={categoriesBySubmodalityLoading ? "Cargando categorías..." : "Todas las categorías"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="focus:bg-red-50 focus:text-red-900">
                        Todas las categorías
                      </SelectItem>
                      {categoriesBySubmodality?.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="focus:bg-red-50 focus:text-red-900">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Resultados</Label>
                  <div className="flex items-center h-10 px-3 bg-muted/30 rounded-md">
                    <span className="text-sm text-muted-foreground">
                      {pagination ? `${pagination.total_items} elementos` : `${questions.length} elementos`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando preguntas...</span>
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <div className="text-red-600 dark:text-red-400 mb-2">Error al cargar preguntas</div>
            <div className="text-sm text-muted-foreground mb-4">{error}</div>
            <Button onClick={() => refreshQuestions()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        ) : (
          <Card className="bg-white border-gray-200 shadow-md">
            <CardContent className="p-0">
              {/* Encabezados de la tabla - Responsivo */}
              <div className="hidden md:grid grid-cols-12 gap-3 lg:gap-4 p-4 border-b border-gray-200 bg-gray-50">
                <div className="col-span-6 lg:col-span-6 xl:col-span-7 text-sm font-medium text-muted-foreground">
                  Pregunta / Respuesta Generada
                </div>
                <div className="col-span-2 lg:col-span-2 xl:col-span-2 text-sm font-medium text-muted-foreground">
                  Estado
                </div>
                <div className="col-span-2 lg:col-span-2 xl:col-span-1 text-sm font-medium text-muted-foreground">
                  Modalidad / Doc
                </div>
                <div className="col-span-2 lg:col-span-2 xl:col-span-2 text-sm font-medium text-muted-foreground text-right">
                  Acciones
                </div>
              </div>

              {/* Filas de datos */}
              <div className="space-y-3 p-4">
                {uniqueQuestions.map((question) => (
                  <Card
                    key={question.question_id}
                    className="bg-white border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 lg:gap-4">
                    {/* Columna: Pregunta / Respuesta */}
                    <div className="md:col-span-6 lg:col-span-6 xl:col-span-7 space-y-2">
                      <div>
                        <h3 className="font-semibold text-sm leading-tight mb-1">
                          {question.question_text}
                        </h3>
                        {(question.model_response || question.response) && (
                          <div className="text-xs text-muted-foreground">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">Respuesta Generada:</span>
                            </div>
                            <div className="relative">
                              <div 
                                ref={(el) => {
                                  if (el && !expandedResponses.has(question.question_id)) {
                                    // Detectar si está truncado después del render
                                    setTimeout(() => {
                                      const isTruncated = checkIfTruncated(el)
                                      const newTruncated = new Set(truncatedResponses)
                                      if (isTruncated) {
                                        newTruncated.add(question.question_id)
                                      } else {
                                        newTruncated.delete(question.question_id)
                                      }
                                      setTruncatedResponses(newTruncated)
                                    }, 10)
                                  }
                                }}
                                className={`mt-1 text-sm text-foreground/80 leading-relaxed transition-all duration-200 ${
                                  expandedResponses.has(question.question_id) 
                                    ? "max-h-60 overflow-y-auto" 
                                    : "line-clamp-3"
                                }`}
                                style={{
                                  scrollbarWidth: 'thin',
                                  scrollbarColor: 'rgb(203 213 225) transparent'
                                }}
                              >
                                <div className={`${
                                  expandedResponses.has(question.question_id) 
                                    ? "whitespace-pre-wrap p-3 bg-muted/30 rounded-md border" 
                                    : ""
                                }`}>
                                  {question.model_response || question.response}
                                </div>
                              </div>
                              {truncatedResponses.has(question.question_id) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleResponseExpansion(question.question_id)}
                                  className="absolute -bottom-1 right-0 h-5 w-5 p-0 text-blue-600 hover:text-blue-700 bg-background/80 hover:bg-background rounded-full shadow-sm"
                                  title={expandedResponses.has(question.question_id) ? "Ver menos" : "Ver más"}
                                >
                                  {expandedResponses.has(question.question_id) ? (
                                    <ChevronUp className="h-3 w-3" />
                                  ) : (
                                    <MoreHorizontal className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Información adicional en móvil/tablet */}
                        <div className="lg:hidden mt-3 pt-3 border-t border-border/30">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {getStatusBadge(question.status)}
                            <Badge variant="outline" className="text-xs">
                              {getCategoryFullPath(question)}
                            </Badge>
                            <Badge 
                              variant={question.context_type === "pdf" ? "default" : "secondary"} 
                              className="text-xs"
                            >
                              {question.context_type === "pdf" ? "PDF" : "Texto"}
                            </Badge>
                            <div className="flex items-center space-x-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(question.created_at).toLocaleDateString()}</span>
                            </div>
                            {question.context_file && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDocumentPreview(question)}
                                className="h-6 w-6 p-0"
                                title="Ver documento PDF"
                              >
                                <Eye className="h-3 w-3 text-blue-600" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Columna: Estado */}
                    <div className="hidden md:flex md:col-span-2 lg:col-span-2 xl:col-span-2 flex-col justify-start space-y-1">
                      {getStatusBadge(question.status)}
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(question.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Columna: Categoría (con Doc abajo) */}
                    <div className="hidden md:flex md:col-span-2 lg:col-span-2 xl:col-span-1 flex-col justify-start space-y-1">
                      <Badge variant="outline" className="text-xs w-fit">
                        {getCategoryFullPath(question)}
                      </Badge>
                      <Badge 
                        variant={question.context_type === "pdf" ? "default" : "secondary"} 
                        className="text-xs w-fit"
                      >
                        {question.context_type === "pdf" ? "PDF" : "Texto"}
                      </Badge>
                      {question.context_file && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDocumentPreview(question)}
                          className="h-6 w-6 p-0 self-start"
                          title="Ver documento PDF"
                        >
                          <Eye className="h-3 w-3 text-blue-600" />
                        </Button>
                      )}
                    </div>

                    {/* Columna: Acciones */}
                  <div className="md:col-span-2 lg:col-span-2 xl:col-span-2 flex flex-col md:items-end space-y-2">
                    {question.status === "PENDING" && (
                      <div className="flex flex-col space-y-1" key="pending-actions">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(question.question_id, "APPROVED")}
                          disabled={activatingQuestion === question.question_id || rejectingQuestion === question.question_id}
                          className="text-green-600 hover:text-green-700 hover:border-green-600 h-7 px-3 w-20"
                        >
                          {activatingQuestion === question.question_id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          <span className="text-xs">
                            {activatingQuestion === question.question_id ? "Aprobando..." : "Aprobar"}
                          </span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(question.question_id, "DISABLED")}
                          disabled={activatingQuestion === question.question_id || rejectingQuestion === question.question_id}
                          className="text-red-600 hover:text-red-700 hover:border-red-600 h-7 px-3 w-20"
                        >
                          {rejectingQuestion === question.question_id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          <span className="text-xs">
                            {rejectingQuestion === question.question_id ? "Rechazando..." : "Rechazar"}
                          </span>
                        </Button>
                      </div>
                    )}
                    {question.status === "DISABLED" && (
                      <div className="flex flex-col space-y-1" key="disabled-actions">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(question.question_id, "APPROVED")}
                          disabled={activatingQuestion === question.question_id}
                          className="text-green-600 hover:text-green-700 hover:border-green-600 h-7 px-3 w-20"
                        >
                          {activatingQuestion === question.question_id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          <span className="text-xs">
                            {activatingQuestion === question.question_id ? "Activando..." : "Activar"}
                          </span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(question)}
                          className="text-red-600 hover:text-red-700 hover:border-red-600 h-7 px-3 w-20"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          <span className="text-xs">Eliminar</span>
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      {question.status !== "DISABLED" && (
                        <Button
                          key="edit"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(question)}
                          className="h-7 w-7 p-0"
                          title="Ver detalles"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        key="reprocess"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReprocess(question)}
                        disabled={isReprocessing === question.question_id}
                        className="h-7 w-7 p-0"
                        title="Reprocesar"
                      >
                        {isReprocessing === question.question_id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                      </Button>
                      {question.status === "APPROVED" && (
                        <Button
                          key="disable"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(question.question_id, "DISABLED")}
                          disabled={disablingQuestion === question.question_id}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          title="Deshabilitar"
                        >
                          {disablingQuestion === question.question_id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                      {question.status !== "DISABLED" && (
                        <Button
                          key="delete"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(question)}
                          className="text-destructive hover:text-destructive h-7 w-7 p-0"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Página {pagination.page} de {pagination.total_pages} ({pagination.total_items} elementos total)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={!pagination.has_previous || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={!pagination.has_next || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Dialog open={!!previewingDocument} onOpenChange={handleClosePreview}>
          <DialogContent className="max-w-6xl max-h-[90vh] w-[90vw]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Vista Previa del Documento</span>
              </DialogTitle>
              <DialogDescription>
                {previewingDocument?.context_file?.split('/').pop() || 'Archivo PDF'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 min-h-[500px] max-h-[70vh]">
              {documentLoading && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin mr-3" />
                  <span>Cargando documento...</span>
                </div>
              )}
              
              {documentError && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <XCircle className="h-16 w-16 text-red-500 mb-4" />
                  <p className="text-red-600 mb-2">Error al cargar el documento</p>
                  <p className="text-sm text-muted-foreground mb-4">{documentError}</p>
                  <Button
                    variant="outline"
                    onClick={() => previewingDocument && loadDocumentPreview(previewingDocument.question_id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reintentar
                  </Button>
                </div>
              )}
              
              {documentUrl && !documentLoading && !documentError && (
                <iframe
                  src={documentUrl}
                  className="w-full h-full border rounded-lg"
                  title="Vista previa del documento PDF"
                />
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleClosePreview}>
                Cerrar
              </Button>
              <Button onClick={handleDownloadDocument} disabled={!documentUrl}>
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingItem} onOpenChange={handleCloseEdit}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Pregunta</DialogTitle>
              <DialogDescription>Modifica los campos que desees actualizar. Los campos no modificados mantendrán sus valores actuales.</DialogDescription>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-6">
                {/* Pregunta */}
                <div className="space-y-2">
                  <Label htmlFor="editQuestionText" className="text-sm font-medium">
                    Pregunta *
                  </Label>
                  <Input
                    id="editQuestionText"
                    value={editedQuestionText}
                    onChange={(e) => setEditedQuestionText(e.target.value)}
                    placeholder="Escribe tu pregunta aquí..."
                    className="bg-background/50"
                  />
                </div>

                {/* Modalidad */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Modalidad *</Label>
                  <Select
                    value={editedModalityId}
                    onValueChange={(value) => {
                      setEditedModalityId(value)
                      setEditedSubmodalityId("") // Reset submodality when modality changes
                      setEditedCategoryId("") // Reset category when modality changes
                    }}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Selecciona una modalidad" />
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

                {/* Submodalidad */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Submodalidad</Label>
                  <Select
                    value={editedSubmodalityId}
                    onValueChange={(value) => {
                      setEditedSubmodalityId(value)
                      setEditedCategoryId("") // Reset category when submodality changes
                    }}
                    disabled={!editedModalityId || editSubmodalitiesByModalityLoading}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Selecciona una submodalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {editSubmodalitiesByModality?.map((submodality) => (
                        <SelectItem key={submodality.id} value={submodality.id}>
                          {submodality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Categoría *</Label>
                  <Select
                    value={editedCategoryId}
                    onValueChange={setEditedCategoryId}
                    disabled={!editedSubmodalityId || editCategoriesBySubmodalityLoading}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {editCategoriesBySubmodality?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo de Contexto */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tipo de Contexto</Label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="editContextType"
                        value="text"
                        checked={editedContextType === "text"}
                        onChange={() => setEditedContextType("text")}
                        className="text-primary"
                      />
                      <span>Texto</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="editContextType"
                        value="pdf"
                        checked={editedContextType === "pdf"}
                        onChange={() => setEditedContextType("pdf")}
                        className="text-primary"
                      />
                      <span>PDF</span>
                    </label>
                  </div>
                </div>

                {/* Contexto de Texto - Solo si el tipo es texto */}
                {editedContextType === "text" && (
                  <div className="space-y-2">
                    <Label htmlFor="editContextText" className="text-sm font-medium">
                      Contexto de Texto *
                    </Label>
                    <Textarea
                      id="editContextText"
                      value={editedContextText}
                      onChange={(e) => setEditedContextText(e.target.value)}
                      className="min-h-[200px] bg-background/50"
                      placeholder="Proporciona el contexto para responder la pregunta..."
                    />
                  </div>
                )}

                {/* Upload de PDF - Solo si el tipo es PDF */}
                {editedContextType === "pdf" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Documento PDF</Label>
                    <div
                      {...getEditRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isEditDragActive
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/30"
                      }`}
                    >
                      <input {...getEditInputProps()} />
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {isEditDragActive
                          ? "Suelta el archivo aquí..."
                          : "Arrastra un nuevo archivo PDF aquí o haz clic para seleccionar"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Si no subes un archivo nuevo, se mantendrá el PDF actual
                      </p>
                    </div>

                    {/* Archivos subidos */}
                    {editUploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Archivo seleccionado:</Label>
                        {editUploadedFiles.map((uploadedFile) => (
                          <div
                            key={uploadedFile.id}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="h-6 w-6 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium">{uploadedFile.file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEditFile(uploadedFile.id)}
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

                {/* Información del archivo PDF (solo lectura) */}
                {editingItem.context_file && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Archivo PDF Actual</Label>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">{editingItem.context_file.split('/').pop()}</p>
                          <p className="text-xs text-muted-foreground">{editingItem.context_file}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Nota: Para cambiar el archivo PDF, usa la sección de creación de contenido.
                    </p>
                  </div>
                )}

                {/* Respuesta Generada por el Modelo */}
                <div className="space-y-2">
                  <Label htmlFor="editModelResponse" className="text-sm font-medium">
                    Respuesta Generada por el Modelo
                  </Label>
                  <Textarea
                    id="editModelResponse"
                    value={editedModelResponse}
                    onChange={(e) => setEditedModelResponse(e.target.value)}
                    className="min-h-[150px] bg-background/50"
                    placeholder="Respuesta generada automáticamente por el modelo de IA..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta respuesta fue generada automáticamente y puede ser editada según sea necesario.
                  </p>
                </div>

                {/* Estado actual */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Estado Actual</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(editingItem.status)}
                    <span className="text-xs text-muted-foreground">
                      Creado el {new Date(editingItem.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCloseEdit}
                disabled={isSaving}
                className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) setDeletingItem(null)
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente la pregunta y su respuesta.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}
