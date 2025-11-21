"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useQuestions } from "@/hooks/use-questions"

export default function PendingQuestionsNotification() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false)
  const { questions, loading, error, applyFilters } = useQuestions()

  useEffect(() => {
    // Fetch pending questions
    applyFilters({ status: "PENDING", page_size: 6 }) // Show 6 questions, 2 per row
    setHasAppliedFilters(true)
  }, [applyFilters])

  const pendingCount = questions.length

  // Don't show until filters are applied to avoid showing initial questions
  if (!hasAppliedFilters || loading) {
    return (
      <Card className="bg-yellow-50 border-yellow-200 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg text-yellow-800">Cargando preguntas pendientes...</CardTitle>
          </div>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg text-red-800">Error al cargar preguntas pendientes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (pendingCount === 0) {
    return null // Don't show if no pending questions
  }

  return (
    <Card className="bg-yellow-50 border-red-200 shadow-md">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-yellow-100 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-lg text-black-800">
                  Preguntas Pendientes
                </CardTitle>
                <Badge variant="secondary" className="bg-red-200 text-red-800">
                  {pendingCount}
                </Badge>
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-red-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-red-600" />
              )}
            </div>
            <p className="text-black-700 text-sm mt-1">
              Recuerda validar estas preguntas para que estén disponibles en el chatbot.
            </p>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {questions.slice(0, 6).map((question) => (
                <div key={question.question_id} className="bg-white p-2 rounded-md border border-red-200">
                  <p className="text-sm text-gray-800 font-medium line-clamp-2">{question.question_text}</p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className="text-xs">
                      {question.category_name}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(question.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {pendingCount > 6 && (
              <p className="text-yellow-700 text-sm text-center mb-3">
                Y {pendingCount - 6} más...
              </p>
            )}
            <div className="flex justify-center">
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                <Link href="/dashboard/validation?status=PENDING">
                  Ir a Validación
                </Link>
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}