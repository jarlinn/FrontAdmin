"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import {
  Users,
  MessageSquare,
  Clock,
  TrendingUp,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import AdminLayout from "@/components/admin-layout"

// Mock data for charts
const userActivityData = [
  { date: "2024-01-01", usuarios: 45, consultas: 120 },
  { date: "2024-01-02", usuarios: 52, consultas: 145 },
  { date: "2024-01-03", usuarios: 48, consultas: 132 },
  { date: "2024-01-04", usuarios: 61, consultas: 178 },
  { date: "2024-01-05", usuarios: 55, consultas: 156 },
  { date: "2024-01-06", usuarios: 67, consultas: 189 },
  { date: "2024-01-07", usuarios: 72, consultas: 203 },
  { date: "2024-01-08", usuarios: 58, consultas: 167 },
  { date: "2024-01-09", usuarios: 63, consultas: 184 },
  { date: "2024-01-10", usuarios: 69, consultas: 195 },
  { date: "2024-01-11", usuarios: 74, consultas: 218 },
  { date: "2024-01-12", usuarios: 68, consultas: 201 },
  { date: "2024-01-13", usuarios: 71, consultas: 209 },
  { date: "2024-01-14", usuarios: 76, consultas: 234 },
]

const frequentQuestionsData = [
  { pregunta: "Requisitos inscripción", cantidad: 156 },
  { pregunta: "Horarios biblioteca", cantidad: 134 },
  { pregunta: "Solicitar becas", cantidad: 98 },
  { pregunta: "Programas académicos", cantidad: 87 },
  { pregunta: "Campus virtual", cantidad: 76 },
  { pregunta: "Calendario académico", cantidad: 65 },
  { pregunta: "Servicios estudiantiles", cantidad: 54 },
  { pregunta: "Laboratorios", cantidad: 43 },
]

const tagUsageData = [
  { name: "Inscripciones", value: 234, color: "#2563eb" },
  { name: "Horarios", value: 189, color: "#10b981" },
  { name: "Becas", value: 156, color: "#f59e0b" },
  { name: "Programas", value: 134, color: "#ef4444" },
  { name: "Servicios", value: 98, color: "#8b5cf6" },
  { name: "Otros", value: 87, color: "#6b7280" },
]

const responseTimeData = [
  { hora: "00:00", tiempo: 1.2 },
  { hora: "02:00", tiempo: 1.1 },
  { hora: "04:00", tiempo: 1.0 },
  { hora: "06:00", tiempo: 1.3 },
  { hora: "08:00", tiempo: 2.1 },
  { hora: "10:00", tiempo: 2.8 },
  { hora: "12:00", tiempo: 3.2 },
  { hora: "14:00", tiempo: 2.9 },
  { hora: "16:00", tiempo: 2.6 },
  { hora: "18:00", tiempo: 2.3 },
  { hora: "20:00", tiempo: 1.8 },
  { hora: "22:00", tiempo: 1.4 },
]

const realTimeMetrics = [
  {
    title: "Usuarios Conectados",
    value: "47",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
    description: "Usuarios activos en este momento",
  },
  {
    title: "Consultas Hoy",
    value: "234",
    change: "+18%",
    changeType: "positive" as const,
    icon: MessageSquare,
    description: "Preguntas respondidas en las últimas 24h",
  },
  {
    title: "Tiempo Promedio",
    value: "2.3s",
    change: "-8%",
    changeType: "positive" as const,
    icon: Clock,
    description: "Tiempo promedio de respuesta",
  },
  {
    title: "Tasa de Éxito",
    value: "94.2%",
    change: "+2%",
    changeType: "positive" as const,
    icon: CheckCircle,
    description: "Consultas resueltas satisfactoriamente",
  },
]

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleExport = () => {
    // Mock export functionality
    console.log("Exporting statistics data...")
    alert("Datos exportados exitosamente")
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Estadísticas y Análisis</h1>
            <p className="text-muted-foreground">Análisis detallado del rendimiento del chatbot universitario</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Últimas 24h</SelectItem>
                <SelectItem value="7d">Últimos 7 días</SelectItem>
                <SelectItem value="30d">Últimos 30 días</SelectItem>
                <SelectItem value="90d">Últimos 90 días</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {realTimeMetrics.map((metric, index) => (
            <Card key={index} className="backdrop-blur-sm bg-card/80 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={metric.changeType === "positive" ? "default" : "destructive"} className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {metric.change}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Activity Chart */}
          <Card className="backdrop-blur-sm bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Actividad de Usuarios</span>
              </CardTitle>
              <CardDescription>Usuarios activos y consultas realizadas por día</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("es-ES", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="usuarios"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                    name="Usuarios"
                  />
                  <Area
                    type="monotone"
                    dataKey="consultas"
                    stackId="2"
                    stroke="hsl(var(--secondary))"
                    fill="hsl(var(--secondary))"
                    fillOpacity={0.6}
                    name="Consultas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Response Time Chart */}
          <Card className="backdrop-blur-sm bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Tiempo de Respuesta</span>
              </CardTitle>
              <CardDescription>Tiempo promedio de respuesta por hora del día</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hora" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    label={{ value: "Segundos", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`${value}s`, "Tiempo de Respuesta"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="tiempo"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Frequent Questions Chart */}
          <Card className="backdrop-blur-sm bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Preguntas Más Frecuentes</span>
              </CardTitle>
              <CardDescription>Top 8 preguntas más consultadas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={frequentQuestionsData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="pregunta"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="cantidad" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tag Usage Pie Chart */}
          <Card className="backdrop-blur-sm bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Uso por Tags</span>
              </CardTitle>
              <CardDescription>Distribución de consultas por categorías</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tagUsageData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {tagUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Table */}
        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Resumen Detallado</span>
            </CardTitle>
            <CardDescription>Métricas detalladas del período seleccionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">1,247</div>
                <div className="text-sm text-muted-foreground">Total de Preguntas</div>
                <div className="text-xs text-green-600">+15% vs período anterior</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-secondary">892</div>
                <div className="text-sm text-muted-foreground">Usuarios Únicos</div>
                <div className="text-xs text-green-600">+24% vs período anterior</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-accent">94.2%</div>
                <div className="text-sm text-muted-foreground">Tasa de Satisfacción</div>
                <div className="text-xs text-green-600">+2.1% vs período anterior</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">2.3s</div>
                <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
                <div className="text-xs text-green-600">-12% vs período anterior</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Estado del Sistema</span>
            </CardTitle>
            <CardDescription>Monitoreo en tiempo real del rendimiento del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <div className="font-medium">Servidor IA</div>
                  <div className="text-sm text-muted-foreground">Procesamiento de consultas</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm text-green-600">Operativo</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <div className="font-medium">Base de Datos</div>
                  <div className="text-sm text-muted-foreground">Almacenamiento de conocimiento</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm text-green-600">Operativo</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <div className="font-medium">API Gateway</div>
                  <div className="text-sm text-muted-foreground">Interfaz de comunicación</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-sm text-yellow-600">Carga Alta</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
