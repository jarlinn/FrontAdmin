"use client"

import React, { memo, useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  Eye,
  ChevronUp,
  MoreHorizontal,
} from "lucide-react"
import { Question } from "@/lib/questions"

interface QuestionItemProps {
  question: Question
  approvingQuestion: string | null
  rejectingQuestion: string | null
  isReprocessing: string | null
  expandedResponses: Set<string>
  truncatedResponses: Set<string>
  onStatusChange: (questionId: string, status: "APPROVED" | "DISABLED") => void
  onEdit: (question: Question) => void
  onDelete: (question: Question) => void
  onReprocess: (question: Question) => void
  onDocumentPreview: (question: Question) => void
  onToggleResponseExpansion: (questionId: string) => void
  onCheckTruncated: (questionId: string, isTruncated: boolean) => void
}

const QuestionItem = memo(function QuestionItem({
  question,
  approvingQuestion,
  rejectingQuestion,
  isReprocessing,
  expandedResponses,
  truncatedResponses,
  onStatusChange,
  onEdit,
  onDelete,
  onReprocess,
  onDocumentPreview,
  onToggleResponseExpansion,
  onCheckTruncated,
}: QuestionItemProps) {
  const responseRef = useRef<HTMLDivElement>(null)

  // Verificar si el contenido está truncado
  useEffect(() => {
    if (responseRef.current && !expandedResponses.has(question.question_id)) {
      const isTruncated = responseRef.current.scrollHeight > responseRef.current.clientHeight
      onCheckTruncated(question.question_id, isTruncated)
    }
  }, [question.question_id, expandedResponses, onCheckTruncated])

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

  return (
    <Card className="backdrop-blur-sm bg-card/50 border-border/30 hover:bg-card/70 transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          {/* Columna: Pregunta / Respuesta */}
          <div className="lg:col-span-4 xl:col-span-5 space-y-2">
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
                      ref={responseRef}
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
                        onClick={() => onToggleResponseExpansion(question.question_id)}
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
                    {question.category_name}
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
                      onClick={() => onDocumentPreview(question)}
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
          <div className="hidden lg:flex lg:col-span-2 xl:col-span-2 flex-col justify-start space-y-1">
            {getStatusBadge(question.status)}
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(question.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Columna: Categoría (con Doc abajo) */}
          <div className="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col justify-start space-y-1">
            <Badge variant="outline" className="text-xs w-fit">
              {question.category_name}
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
                onClick={() => onDocumentPreview(question)}
                className="h-6 w-6 p-0 self-start"
                title="Ver documento PDF"
              >
                <Eye className="h-3 w-3 text-blue-600" />
              </Button>
            )}
          </div>

          {/* Columna: Acciones */}
          <div className="lg:col-span-2 xl:col-span-2 flex flex-col lg:items-end space-y-2">
            {question.status === "PENDING" && (
              <div className="flex flex-col space-y-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(question.question_id, "APPROVED")}
                  disabled={approvingQuestion === question.question_id || rejectingQuestion === question.question_id}
                  className="text-green-600 hover:text-green-700 hover:border-green-600 h-7 px-3 w-20"
                >
                  {approvingQuestion === question.question_id ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  <span className="text-xs">
                    {approvingQuestion === question.question_id ? "Aprobando..." : "Aprobar"}
                  </span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(question.question_id, "DISABLED")}
                  disabled={approvingQuestion === question.question_id || rejectingQuestion === question.question_id}
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
            <div className="flex items-center space-x-1">
              {question.status !== "DISABLED" && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onEdit(question)} 
                  className="h-7 w-7 p-0"
                  title="Ver detalles"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReprocess(question)}
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
              {question.status !== "DISABLED" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(question)}
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
  )
})

export default QuestionItem
