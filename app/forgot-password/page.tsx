"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { authService } from "@/lib/auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await authService.requestPasswordReset(email)
      setSuccess(true)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Error desconocido al solicitar recuperación')
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
              <CardTitle className="text-xl">¡Correo Enviado!</CardTitle>
              <CardDescription className="text-center">
                Hemos enviado las instrucciones de recuperación a tu correo electrónico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <strong>Revisa tu bandeja de entrada</strong><br />
                  Si no ves el correo en unos minutos, revisa tu carpeta de spam o correo no deseado.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• El enlace de recuperación expirará en 1 hora</p>
                <p>• Si no recibiste el correo, puedes intentar nuevamente</p>
                <p>• Contacta al administrador si persisten los problemas</p>
              </div>

              <div className="flex flex-col space-y-3 pt-4">
                <Button
                  onClick={() => {
                    setSuccess(false)
                    setEmail("")
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Enviar Otro Correo
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

        {/* Forgot Password Card */}
        <Card className="backdrop-blur-md bg-card/80 border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Recuperar Contraseña</CardTitle>
            <CardDescription className="text-center">
              Ingresa tu correo electrónico y te enviaremos las instrucciones para recuperar tu contraseña
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
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@universidad.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-100 border-gray-300"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Instrucciones
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
