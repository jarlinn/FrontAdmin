"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react"
import Link from "next/link"
import { API_CONFIG } from "@/lib/api-config"
import { authService } from "@/lib/auth"

export default function EmailChangeCompletePage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const statusParam = searchParams.get('status')
    const token = searchParams.get('token')
    const messageParam = searchParams.get('message')

    if (statusParam === 'success') {
      setStatus('success')
      setMessage(messageParam || '¡Cambio de correo electrónico completado exitosamente! Ahora puedes cerrar sesión y acceder con tu nuevo correo electrónico.')

      // Limpiar la sesión ya que el email y posiblemente la contraseña han cambiado
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('token_expiry')
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      }
    } else if (statusParam === 'error') {
      setStatus('error')
      setMessage('Error al completar el cambio de correo electrónico. El enlace puede haber expirado o ser inválido.')
    } else if (token) {
      // Si hay token pero no status, procesar directamente
      const completeEmailChange = async () => {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/auth/email-change-complete?token=${encodeURIComponent(token)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          const data = await response.json()

          if (response.ok) {
            setStatus('success')
            setMessage(data.message || '¡Cambio de correo electrónico completado exitosamente!')

            // Limpiar la sesión ya que el email y posiblemente la contraseña han cambiado
            if (typeof window !== 'undefined') {
              localStorage.removeItem('access_token')
              localStorage.removeItem('refresh_token')
              localStorage.removeItem('token_expiry')
              document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
            }
          } else {
            setStatus('error')
            setMessage(data.detail || data.message || 'Error al completar el cambio de correo electrónico.')
          }
        } catch (error) {
          console.error('Error completing email change:', error)
          setStatus('error')
          setMessage('Error de conexión. Inténtalo más tarde.')
        }
      }

      completeEmailChange()
    } else {
      setStatus('error')
      setMessage('Enlace de verificación inválido o expirado.')
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
              <Mail className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Confirmación de Cambio de Email</CardTitle>
          <CardDescription>
            Procesando la confirmación de tu cambio de correo electrónico
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-600" />
              <p className="text-muted-foreground">Verificando tu solicitud...</p>
            </div>
          )}

          {status === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-2">
            {status === 'success' && (
              <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                <Link href="/dashboard">
                  Ir al Dashboard
                </Link>
              </Button>
            )}

            {status === 'error' && (
              <Button
                onClick={() => router.push('/dashboard/settings')}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Volver a Configuración
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Ir al Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}