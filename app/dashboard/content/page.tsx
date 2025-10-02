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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, X, Brain, Save, Eye, Loader2, CheckCircle, Plus, ChevronDown, ChevronRight, Edit, Trash2, MoreHorizontal, Settings, Tag, Layers } from "lucide-react"
import AdminLayout from "@/components/admin-layout"
import { useDropzone } from "react-dropzone"
import { buildApiUrl, API_CONFIG, handleApiError } from "@/lib/api-config"
import { useAuthFetch } from "@/hooks/use-auth-fetch"
import { useQuestions } from "@/hooks/use-questions"
import { useModalities } from "@/hooks/use-modalities"
import { useSubmodalities, useSubmodalitiesByModality } from "@/hooks/use-submodalities"
import { useNewCategories, useCategoriesBySubmodality } from "@/hooks/use-new-categories"
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
  const [editingNewCategory, setEditingNewCategory] = useState<NewCategory | null>(null)
  const [isSubmittingNewCategory, setIsSubmittingNewCategory] = useState(false)

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
  } = useCategoriesBySubmodality(selectedSubmodalityId)

  // Clear dependent selections when parent changes
  useEffect(() => {
    setSelectedSubmodalityId("")
    setSelectedCategoryId("")
  }, [selectedModalityId])

  useEffect(() => {
    setSelectedCategoryId("")
  }, [selectedSubmodalityId])

  // Funciones para manejar modalidades
  const handleCreateModality = async () => {
    if (!newModalityName.trim()) return

    setIsSubmittingModality(true)
    try {
      await createModality({
        name: newModalityName,
        description: newModalityDescription || undefined
      })

      setNewModalityName("")
      setNewModalityDescription("")
      setIsCreateModalityOpen(false)

      console.log("Modalidad creada exitosamente")
    } catch (error: any) {
      if (error.message?.startsWith('Ya existe una modalidad')) {
        setErrorMessage('Ya existe una modalidad con ese nombre')
        setShowErrorDialog(true)
      } else {
        console.error("Error al crear modalidad:", error)
        setErrorMessage(error.message || 'Error al crear la modalidad')
        setShowErrorDialog(true)
      }
    } finally {
      setIsSubmittingModality(false)
    }
  }

  const handleEditModality = async () => {
    if (!editingModality || !newModalityName.trim()) return

    setIsSubmittingModality(true)
    try {
      await updateModality(editingModality.id, {
        name: newModalityName,
        description: newModalityDescription || undefined
      })

      setNewModalityName("")
      setNewModalityDescription("")
      setEditingModality(null)
      setIsEditModalityOpen(false)

      console.log("Modalidad actualizada exitosamente")
    } catch (error: any) {
      if (error.message?.startsWith('Ya existe una modalidad')) {
        setErrorMessage('Ya existe una modalidad con ese nombre')
        setShowErrorDialog(true)
      } else {
        console.error("Error al actualizar modalidad:", error)
        setErrorMessage(error.message || 'Error al actualizar la modalidad')
        setShowErrorDialog(true)
      }
    } finally {
      setIsSubmittingModality(false)
    }
  }

  const handleDeleteModality = async (modalityId: string) => {
    try {
      await deleteModality(modalityId)
      console.log("Modalidad eliminada exitosamente")
    } catch (error) {
      console.error("Error al eliminar modalidad:", error)
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
    try {
      await createSubmodality({
        name: newSubmodalityName,
        description: newSubmodalityDescription || undefined,
        modality_id: newSubmodalityModalityId
      })

      setNewSubmodalityName("")
      setNewSubmodalityDescription("")
      setNewSubmodalityModalityId("")
      setIsCreateSubmodalityOpen(false)

      console.log("Submodalidad creada exitosamente")
    } catch (error: any) {
      if (error.message?.startsWith('Ya existe una submodalidad')) {
        setErrorMessage('Ya existe una submodalidad con ese nombre')
        setShowErrorDialog(true)
      } else {
        console.error("Error al crear submodalidad:", error)
        setErrorMessage(error.message || 'Error al crear la submodalidad')
        setShowErrorDialog(true)
      }
    } finally {
      setIsSubmittingSubmodality(false)
    }
  }

  const handleEditSubmodality = async () => {
    if (!editingSubmodality || !newSubmodalityName.trim()) return

    setIsSubmittingSubmodality(true)
    try {
      await updateSubmodality(editingSubmodality.id, {
        name: newSubmodalityName,
        description: newSubmodalityDescription || undefined,
        modality_id: newSubmodalityModalityId || editingSubmodality.modality_id
      })

      setNewSubmodalityName("")
      setNewSubmodalityDescription("")
      setNewSubmodalityModalityId("")
      setEditingSubmodality(null)
      setIsEditSubmodalityOpen(false)

      console.log("Submodalidad actualizada exitosamente")
    } catch (error: any) {
      if (error.message?.startsWith('Ya existe una submodalidad')) {
        setErrorMessage('Ya existe una submodalidad con ese nombre')
        setShowErrorDialog(true)
      } else {
        console.error("Error al actualizar submodalidad:", error)
        setErrorMessage(error.message || 'Error al actualizar la submodalidad')
        setShowErrorDialog(true)
      }
    } finally {
      setIsSubmittingSubmodality(false)
    }
  }

  const handleDeleteSubmodality = async (submodalityId: string) => {
    try {
      await deleteSubmodality(submodalityId)
      console.log("Submodalidad eliminada exitosamente")
    } catch (error) {
      console.error("Error al eliminar submodalidad:", error)
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
    if (!newCategoryHierName.trim() || !newCategorySubmodalityId) return

    setIsSubmittingNewCategory(true)
    try {
      await createNewCategory({
        name: newCategoryHierName,
        description: newCategoryHierDescription || undefined,
        submodality_id: newCategorySubmodalityId
      })

      setNewCategoryHierName("")
      setNewCategoryHierDescription("")
      setNewCategorySubmodalityId("")
      setIsCreateNewCategoryOpen(false)

      console.log("Categoría creada exitosamente")
    } catch (error: any) {
      if (error.message?.startsWith('Ya existe una categoría')) {
        setErrorMessage('Ya existe una categoría con ese nombre')
        setShowErrorDialog(true)
      } else {
        console.error("Error al crear categoría:", error)
        setErrorMessage(error.message || 'Error al crear la categoría')
        setShowErrorDialog(true)
      }
    } finally {
      setIsSubmittingNewCategory(false)
    }
  }

  const handleEditNewCategory = async () => {
    if (!editingNewCategory || !newCategoryHierName.trim()) return

    setIsSubmittingNewCategory(true)
    try {
      await updateNewCategory(editingNewCategory.id, {
        name: newCategoryHierName,
        description: newCategoryHierDescription || undefined,
        submodality_id: newCategorySubmodalityId || editingNewCategory.submodality_id
      })

      setNewCategoryHierName("")
      setNewCategoryHierDescription("")
      setNewCategorySubmodalityId("")
      setEditingNewCategory(null)
      setIsEditNewCategoryOpen(false)

      console.log("Categoría actualizada exitosamente")
    } catch (error: any) {
      if (error.message?.startsWith('Ya existe una categoría')) {
        setErrorMessage('Ya existe una categoría con ese nombre')
        setShowErrorDialog(true)
      } else {
        console.error("Error al actualizar categoría:", error)
        setErrorMessage(error.message || 'Error al actualizar la categoría')
        setShowErrorDialog(true)
      }
    } finally {
      setIsSubmittingNewCategory(false)
    }
  }

  const handleDeleteNewCategory = async (categoryId: string) => {
    try {
      await deleteNewCategory(categoryId)
      console.log("Categoría eliminada exitosamente")
    } catch (error) {
      console.error("Error al eliminar categoría:", error)
    }
  }

  const openEditNewCategory = (category: NewCategory) => {
    setEditingNewCategory(category)
    setNewCategoryHierName(category.name)
    setNewCategoryHierDescription(category.description || "")
    setNewCategorySubmodalityId(category.submodality_id)
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
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
      if (selectedSubmodalityId) {
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

      const response = await fetchData(buildApiUrl(API_CONFIG.ENDPOINTS.QUESTIONS), {
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
    } catch (error) {
      console.error("Error al generar respuesta:", error)
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
    } catch (error) {
      console.error("Error al actualizar respuesta:", error)
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
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="questions" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Preguntas
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
                            value={selectedSubmodalityId}
                            onValueChange={setSelectedSubmodalityId}
                            disabled={!selectedModalityId}
                          >
                            <SelectTrigger className="bg-gray-100 border-gray-300 flex-1">
                              <SelectValue placeholder="Selecciona submodalidad" />
                            </SelectTrigger>
                            <SelectContent>
                              {submodalitiesByModality?.map((submodality) => (
                                <SelectItem key={submodality.id} value={submodality.id}>
                                  {submodality.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedSubmodalityId && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSubmodalityId("")}
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
                            disabled={!selectedSubmodalityId}
                          >
                            <SelectTrigger className="bg-gray-100 border-gray-300 flex-1">
                              <SelectValue placeholder="Selecciona categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {categoriesBySubmodality?.map((category) => (
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
                              ? categoriesBySubmodality?.find(c => c.id === selectedCategoryId)?.name || "No especificada"
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
                          onClick={() => setShowPreview(false)}
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

          {/* Tab Content: Estructura Jerárquica */}
          <TabsContent value="hierarchy" className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Estructura Jerárquica</h2>
              <p className="text-muted-foreground">Gestiona modalidades, submodalidades y categorías en orden ascendente</p>
            </div>

            {/* Modalidades */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Modalidades</h3>
                  <Badge variant="secondary">{modalities?.length || 0}</Badge>
                </div>
                <Button onClick={() => setIsCreateModalityOpen(true)} size="sm" className="bg-red-200 text-red-800 border-red-300 hover:bg-red-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Modalidad
                </Button>
              </div>

              {modalitiesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modalities?.map((modality) => (
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
                            onClick={() => handleDeleteModality(modality.id)}
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Submodalidades</h3>
                  <Badge variant="secondary">{submodalities?.length || 0}</Badge>
                </div>
                <Button onClick={() => setIsCreateSubmodalityOpen(true)} size="sm" className="bg-red-200 text-red-800 border-red-300 hover:bg-red-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Submodalidad
                </Button>
              </div>

              {submodalitiesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {submodalities?.map((submodality) => (
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
                            onClick={() => handleDeleteSubmodality(submodality.id)}
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Categorías</h3>
                  <Badge variant="secondary">{newCategories?.length || 0}</Badge>
                </div>
                <Button onClick={() => setIsCreateNewCategoryOpen(true)} size="sm" className="bg-red-200 text-red-800 border-red-300 hover:bg-red-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Categoría
                </Button>
              </div>

              {newCategoriesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {newCategories?.map((category: NewCategory) => (
                    <Card key={category.id} className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Modalidad:</span>
                              <p className="text-sm text-blue-600 font-medium mt-1">{category.modality_name}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Submodalidad:</span>
                              <p className="text-sm text-green-600 font-medium mt-1">{category.submodality_name}</p>
                            </div>
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
                            onClick={() => handleDeleteNewCategory(category.id)}
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

        {/* Success Dialog */}
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent className="bg-white border-red-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-black">¡Pregunta creada exitosamente!</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                La pregunta ha sido guardada correctamente. ¿Deseas ir a la página de validación?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-red-300 text-black hover:bg-red-50">
                Quedarme aquí
              </AlertDialogCancel>
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
