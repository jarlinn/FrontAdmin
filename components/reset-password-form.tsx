"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { authService } from "@/lib/auth"

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError('Token de recuperación no válido o faltante')
    }
  }, [searchParams])

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []

    if (password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres')
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validaciones
    if (!token) {
      setError('Token de recuperación no válido')
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    const passwordErrors = validatePassword(newPassword)
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(', '))
      setIsLoading(false)
      return
    }

    try {
      await authService.resetPassword(token, newPassword)
      setSuccess(true)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Error desconocido al resetear la contraseña')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header section with logo and title stacked vertically */}
        <div className="bg-red-600 text-white py-4 px-4 md:py-6">
          <div className="max-w-6xl mx-auto flex flex-col items-center space-y-3">
            {/* UFPS Logo centered at top */}
            <img
              src="/ufpslogo.png"
              alt="UFPS Logo"
              className="h-12 md:h-16 lg:h-20 w-auto"
            />

            {/* Title below the logo */}
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-extrabold text-center text-white tracking-wide drop-shadow-lg leading-tight">
              Sistema de Información de Modalidades de Trabajos de Grado
            </h1>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* University Logo Header */}
            <div className="text-center mb-8">
              <img
                src="/logo_ingsistemas.png"
                alt="Ingeniería de Sistemas Logo"
                className="h-50 w-auto mx-auto mb-6"
              />
            </div>

            {/* Success Card */}
            <Card className="backdrop-blur-md bg-card/80 border-border/50 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-xl">¡Contraseña Actualizada!</CardTitle>
              <CardDescription className="text-center">
                Tu contraseña ha sido cambiada exitosamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Cambio exitoso</strong><br />
                  Ya puedes iniciar sesión con tu nueva contraseña.
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ir al Login
              </Button>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>© 2025 Universidad UFPS - Programa de Ingeniería de Sistemas</p>
          </div>
          </div>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header section with logo and title stacked vertically */}
        <div className="bg-red-600 text-white py-4 px-4 md:py-6">
          <div className="max-w-6xl mx-auto flex flex-col items-center space-y-3">
            {/* UFPS Logo centered at top */}
            <img
              src="/ufpslogo.png"
              alt="UFPS Logo"
              className="h-12 md:h-16 lg:h-20 w-auto"
            />

            {/* Title below the logo */}
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-extrabold text-center text-white tracking-wide drop-shadow-lg leading-tight">
              Sistema de Información de Modalidades de Trabajos de Grado
            </h1>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* University Logo Header */}
            <div className="text-center mb-8">
              <img
                src="/logo_ingsistemas.png"
                alt="Ingeniería de Sistemas Logo"
                className="h-50 w-auto mx-auto mb-6"
              />
            </div>

            {/* Error Card */}
            <Card className="backdrop-blur-md bg-card/80 border-border/50 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="text-xl">Enlace No Válido</CardTitle>
              <CardDescription className="text-center">
                El enlace de recuperación no es válido o ha expirado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error || 'Token de recuperación no válido o faltante'}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col space-y-3">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/forgot-password">
                    Solicitar Nuevo Enlace
                  </Link>
                </Button>

                <Button asChild className="w-full">
                  <Link href="/login">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>© 2025 Universidad UFPS - Programa de Ingeniería de Sistemas</p>
          </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header section with logo and title stacked vertically */}
      <div className="bg-red-600 text-white py-4 px-4 md:py-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center space-y-3">
          {/* UFPS Logo centered at top */}
          <img
            src="/ufpslogo.png"
            alt="UFPS Logo"
            className="h-12 md:h-16 lg:h-20 w-auto"
          />

          {/* Title below the logo */}
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-extrabold text-center text-white tracking-wide drop-shadow-lg leading-tight">
            Sistema de Información de Modalidades de Trabajos de Grado
          </h1>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* University Logo Header */}
          <div className="text-center mb-8">
            <img
              src="/logo_ingsistemas.png"
              alt="Ingeniería de Sistemas Logo"
              className="h-50 w-auto mx-auto mb-6"
            />
          </div>

          {/* Reset Password Card */}
          <Card className="backdrop-blur-md bg-card/80 border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Nueva Contraseña</CardTitle>
            <CardDescription className="text-center">
              Ingresa tu nueva contraseña para completar la recuperación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 bg-gray-100 border-gray-300"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 bg-background/50 backdrop-blur-sm"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium">Requisitos de la contraseña:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li className={newPassword.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}>
                    Al menos 6 caracteres
                  </li>
                  <li className={newPassword === confirmPassword && newPassword.length > 0 ? 'text-green-600 dark:text-green-400' : ''}>
                    Las contraseñas deben coincidir
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white"
                disabled={isLoading || !newPassword.trim() || !confirmPassword.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Actualizar Contraseña
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver al Login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2025 Universidad UFPS - Programa de Ingeniería de Sistemas</p>
        </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}