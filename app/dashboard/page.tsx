"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  CheckCircle,
  BarChart3,
  Upload,
  Brain,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import AdminLayout from "@/components/admin-layout"
import PendingQuestionsNotification from "@/components/pending-questions-notification"
import { API_CONFIG } from "@/lib/api-config"
import { authService } from "@/lib/auth"
import { Suspense } from "react"


const howItWorksSteps = [
  {
    step: 1,
    title: "Agregar Contenido",
    description: "Sube documentos PDF o ingresa texto directamente para alimentar la base de conocimiento",
    icon: Upload,
    color: "bg-red-100 text-red-600",
  },
  {
    step: 2,
    title: "IA Genera Respuestas",
    description: "El sistema procesa automáticamente el contenido y genera respuestas contextuales",
    icon: Brain,
    color: "bg-red-100 text-red-600",
  },
  {
    step: 3,
    title: "Validar y Editar",
    description: "Revisa, edita y aprueba las respuestas antes de que estén disponibles para los usuarios",
    icon: CheckCircle,
    color: "bg-red-100 text-red-600",
  },
]

const quickActions = [
  {
    title: "Nuevo Contenido",
    description: "Agregar nueva información al chatbot",
    href: "/dashboard/content",
    icon: FileText,
    color: "bg-red-600 hover:bg-red-700",
  },
  {
    title: "Validar Respuestas",
    description: "Revisar respuestas pendientes",
    href: "/dashboard/validation",
    icon: CheckCircle,
    color: "bg-red-600 hover:bg-red-700",
  },
  {
    title: "Ver Métricas",
    description: "Analizar métricas y descargar reportes",
    href: "/dashboard/metrics",
    icon: BarChart3,
    color: "bg-red-600 hover:bg-red-700",
  },
]

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get('token')

    if (token) {
      // Si hay un token, es una solicitud de completación de cambio de email
      const completeEmailChange = async () => {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/auth/email-change-complete?token=${encodeURIComponent(token)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            // Éxito - redirigir a la página de completación con mensaje de éxito
            router.push('/auth/email-change-complete?status=success&message=¡Cambio de correo electrónico completado exitosamente! Ahora puedes cerrar sesión y acceder con tu nuevo correo electrónico.')
          } else {
            // Error - redirigir a la página de completación con mensaje de error
            router.push('/auth/email-change-complete?status=error')
          }
        } catch (error) {
          console.error('Error completing email change:', error)
          router.push('/auth/email-change-complete?status=error')
        }
      }

      completeEmailChange()
    }
  }, [searchParams, router])

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-black">Bienvenido, Admin Usuario</h1>
          <p className="text-gray-600">
            Panel de administración del chatbot universitario - Ingeniería de Sistemas
          </p>
        </div>

        {/* Pending Questions Notification */}
        <PendingQuestionsNotification />

        {/* How It Works Section */}
        <Card className="bg-white border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-black">¿Cómo Funciona?</CardTitle>
            <CardDescription className="text-gray-600">Proceso simple para gestionar el conocimiento del chatbot universitario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {howItWorksSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center`}>
                      <step.icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          Paso {step.step}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-black">{step.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full">
                      <ArrowRight className="h-6 w-6 text-gray-400 mx-auto" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-black">Accesos Rápidos</CardTitle>
            <CardDescription className="text-gray-600">Accede directamente a las funciones principales del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  asChild
                  className={`h-auto p-6 ${action.color} text-white hover:scale-105 transition-all duration-200`}
                >
                  <Link href={action.href} className="flex flex-col items-center space-y-3">
                    <action.icon className="h-8 w-8" />
                    <div className="text-center space-y-1">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-sm opacity-90">{action.description}</div>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
