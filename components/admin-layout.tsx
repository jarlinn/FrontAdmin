"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  MessageSquare,
  CheckCircle,
  BarChart3,
  Settings,
  Menu,
  X,
  GraduationCap,
  LogOut,
  User,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCallback } from "react"
import { authService } from "@/lib/auth"
import { useAuthState } from "@/hooks/use-auth-state"
import { API_CONFIG } from "@/lib/api-config"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Contenido", href: "/dashboard/content", icon: MessageSquare },
  { name: "Validación", href: "/dashboard/validation", icon: CheckCircle },
  // { name: "Estadísticas", href: "/dashboard/statistics", icon: BarChart3 },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

interface UserProfile {
  id: string
  name: string | null
  email: string
  role: string
  is_active: boolean
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthState()

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Cargar perfil del usuario
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const loadUserProfile = async () => {
        try {
          const response = await authService.authenticatedFetch(`${API_CONFIG.BASE_URL}/profile/me`)
          if (response.ok) {
            const profile = await response.json()
            setUserProfile(profile)
          }
        } catch (error) {
          console.error('Error loading user profile:', error)
        }
      }
      loadUserProfile()
    }
  }, [isAuthenticated, isLoading])

  const handleLogout = useCallback(() => {
    authService.logout()
  }, [])

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no renderizar nada (se redirigirá)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Background effect removed for clean look */}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col bg-gray-50 border-r border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-red-600 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Admin Panel</h2>
                <p className="text-xs text-gray-600">Chatbot Universitario</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-red-600 text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center justify-center w-8 h-8 bg-red-600 rounded-full">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userProfile?.name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {userProfile?.email || 'usuario@email.com'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              asChild
            >
              <button onClick={handleLogout} className="flex w-full items-center">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </button>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-black hover:bg-gray-100">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
          </div>
        </div>

        {/* Page content */}
        <main className="relative p-6 bg-gray-50 min-h-screen">{children}</main>
      </div>
    </div>
  )
}
