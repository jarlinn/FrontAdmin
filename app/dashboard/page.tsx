"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Users,
  Clock,
  FileText,
  CheckCircle,
  BarChart3,
  Upload,
  Brain,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import AdminLayout from "@/components/admin-layout"

// Mock data for statistics
const stats = [
  {
    title: "Preguntas Configuradas",
    value: "1,247",
    change: "+12%",
    changeType: "positive" as const,
    icon: MessageSquare,
    description: "Total de preguntas en la base de conocimiento",
  },
  {
    title: "Pendientes de Revisión",
    value: "23",
    change: "-8%",
    changeType: "positive" as const,
    icon: AlertCircle,
    description: "Respuestas generadas por IA esperando validación",
  },
  {
    title: "Usuarios Activos",
    value: "892",
    change: "+24%",
    changeType: "positive" as const,
    icon: Users,
    description: "Usuarios que interactuaron en el último mes",
  },
  {
    title: "Tiempo Promedio",
    value: "2.3s",
    change: "-15%",
    changeType: "positive" as const,
    icon: Clock,
    description: "Tiempo promedio de respuesta del chatbot",
  },
]

const howItWorksSteps = [
  {
    step: 1,
    title: "Agregar Contenido",
    description: "Sube documentos PDF o ingresa texto directamente para alimentar la base de conocimiento",
    icon: Upload,
    color: "bg-primary/10 text-primary",
  },
  {
    step: 2,
    title: "IA Genera Respuestas",
    description: "El sistema procesa automáticamente el contenido y genera respuestas contextuales",
    icon: Brain,
    color: "bg-secondary/10 text-secondary",
  },
  {
    step: 3,
    title: "Validar y Editar",
    description: "Revisa, edita y aprueba las respuestas antes de que estén disponibles para los usuarios",
    icon: CheckCircle,
    color: "bg-accent/10 text-accent",
  },
]

const quickActions = [
  {
    title: "Nuevo Contenido",
    description: "Agregar nueva información al chatbot",
    href: "/dashboard/content",
    icon: FileText,
    color: "bg-primary hover:bg-primary/90",
  },
  {
    title: "Validar Respuestas",
    description: "Revisar respuestas pendientes",
    href: "/dashboard/validation",
    icon: CheckCircle,
    color: "bg-secondary hover:bg-secondary/90",
  },
  {
    title: "Ver Estadísticas",
    description: "Analizar el rendimiento del chatbot",
    href: "/dashboard/statistics",
    icon: BarChart3,
    color: "bg-accent hover:bg-accent/90",
  },
]

export default function DashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Bienvenido, Admin Usuario</h1>
          <p className="text-muted-foreground">
            Panel de administración del chatbot universitario - Ingeniería de Sistemas
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="backdrop-blur-sm bg-card/80 border-border/50 hover:bg-card/90 transition-colors"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={stat.changeType === "positive" ? "default" : "destructive"} className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works Section */}
        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">¿Cómo Funciona?</CardTitle>
            <CardDescription>Proceso simple para gestionar el conocimiento del chatbot universitario</CardDescription>
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
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full">
                      <ArrowRight className="h-6 w-6 text-muted-foreground mx-auto" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Accesos Rápidos</CardTitle>
            <CardDescription>Accede directamente a las funciones principales del sistema</CardDescription>
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

        {/* Recent Activity Preview */}
        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Actividad Reciente</CardTitle>
            <CardDescription>Últimas interacciones y cambios en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Nueva pregunta agregada",
                  details: "¿Cuáles son los requisitos para inscripción?",
                  time: "Hace 2 horas",
                  type: "content",
                },
                {
                  action: "Respuesta validada",
                  details: "Información sobre horarios de clases",
                  time: "Hace 4 horas",
                  type: "validation",
                },
                {
                  action: "Usuario activo",
                  details: "892 consultas realizadas hoy",
                  time: "Hace 6 horas",
                  type: "activity",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.details}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/dashboard/statistics">
                  Ver Todas las Actividades
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
