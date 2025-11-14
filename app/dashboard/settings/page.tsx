"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { User, Lock, Save, AlertCircle, CheckCircle2, HelpCircle, Mail, Clock, X, MessageSquare, Phone, MapPin, Globe, Facebook, Instagram, Twitter } from "lucide-react"
import Link from "next/link"
import { useEffect as useReactEffect } from "react"
import AdminLayout from "@/components/admin-layout"
import { useAuthFetch } from "@/hooks/use-auth-fetch"
import { API_CONFIG } from "@/lib/api-config"
import { authService } from "@/lib/auth"

// Interfaces para los datos del usuario
interface UserProfile {
  id: string
  name: string | null
  email: string
  role: string
  is_active: boolean
}

interface ProfileUpdateData {
  name?: string
  email?: string
}

interface PasswordUpdateData {
  current_password: string
  new_password: string
  confirm_password: string
}

interface GreetingConfig {
  greeting_message: string
  greeting_enabled: boolean
}

interface ContactConfig {
  office_name: string
  faculty_name: string
  university_name: string
  campus_location: string
  building_name: string
  floor_office: string
  street_address: string
  city: string
  state: string
  country: string
  director_name: string
  contact_phone: string
  contact_email: string
  website_url: string
  office_hours: string
  social_facebook: string
  social_instagram: string
  social_twitter: string
}

export default function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileForm, setProfileForm] = useState<ProfileUpdateData>({})
  const [passwordForm, setPasswordForm] = useState<PasswordUpdateData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Estados para cambio de email
  const [emailChangeForm, setEmailChangeForm] = useState({
    newEmail: '',
    token: ''
  })
  const [isEmailChangeRequesting, setIsEmailChangeRequesting] = useState(false)
  const [isEmailChangeConfirming, setIsEmailChangeConfirming] = useState(false)
  const [showEmailChangeDialog, setShowEmailChangeDialog] = useState(false)
  const [emailChangeTokenExpires, setEmailChangeTokenExpires] = useState<number | null>(null)
  const [emailChangeTimeLeft, setEmailChangeTimeLeft] = useState<number>(0)
  const [emailChangeSuccess, setEmailChangeSuccess] = useState<string | false>(false)
  const [emailChangeError, setEmailChangeError] = useState('')

  // Estados para configuración de saludo
  const [greetingConfig, setGreetingConfig] = useState<GreetingConfig>({
    greeting_message: '',
    greeting_enabled: true
  })
  const [greetingSuccess, setGreetingSuccess] = useState(false)
  const [greetingError, setGreetingError] = useState<string | null>(null)

  // Estados para configuración de información de contacto
  const [contactConfig, setContactConfig] = useState<ContactConfig>({
    office_name: '',
    faculty_name: '',
    university_name: '',
    campus_location: '',
    building_name: '',
    floor_office: '',
    street_address: '',
    city: '',
    state: '',
    country: '',
    director_name: '',
    contact_phone: '',
    contact_email: '',
    website_url: '',
    office_hours: '',
    social_facebook: '',
    social_instagram: '',
    social_twitter: ''
  })
  const [contactSuccess, setContactSuccess] = useState(false)
  const [contactError, setContactError] = useState<string | null>(null)

  const { fetchData: fetchProfile, loading: profileLoading, error: profileError } = useAuthFetch()
  const { fetchData: updateProfile, loading: updateProfileLoading, error: updateProfileError } = useAuthFetch()
  const { fetchData: updatePassword, loading: updatePasswordLoading, error: updatePasswordError } = useAuthFetch()
  const { fetchData: fetchGreeting, loading: greetingLoading } = useAuthFetch()
  const { fetchData: updateGreeting, loading: updateGreetingLoading } = useAuthFetch()
  const { fetchData: fetchContact, loading: contactLoading } = useAuthFetch()
  const { fetchData: updateContact, loading: updateContactLoading } = useAuthFetch()

  // Cargar perfil del usuario y configuraciones al montar el componente
  useEffect(() => {
    loadUserProfile()
    loadGreetingConfig()
    loadContactConfig()
  }, [])

  // Timer para expiración del token de cambio de email
  useReactEffect(() => {
    let interval: NodeJS.Timeout

    if (emailChangeTokenExpires) {
      interval = setInterval(() => {
        const now = Date.now()
        const timeLeft = Math.max(0, Math.floor((emailChangeTokenExpires - now) / 1000))
        setEmailChangeTimeLeft(timeLeft)

        if (timeLeft === 0) {
          setShowEmailChangeDialog(false)
          setEmailChangeTokenExpires(null)
          setEmailChangeError('El código de verificación ha expirado. Solicita uno nuevo.')
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [emailChangeTokenExpires])

  const loadUserProfile = async () => {
    try {
      const profile = await fetchProfile(`${API_CONFIG.BASE_URL}/profile/me`)
      setUserProfile(profile)
      setProfileForm({
        name: profile.name || '',
        email: profile.email || ''
      })
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const loadGreetingConfig = async () => {
    try {
      const config = await fetchGreeting(`${API_CONFIG.BASE_URL}/chat/config/greeting`)
      setGreetingConfig(config)
    } catch (error) {
      console.error('Error loading greeting config:', error)
    }
  }

  const loadContactConfig = async () => {
    try {
      const config = await fetchContact(`${API_CONFIG.BASE_URL}/chat/config/contact`)
      setContactConfig({
        office_name: config.office_name || '',
        faculty_name: config.faculty_name || '',
        university_name: config.university_name || '',
        campus_location: config.campus_location || '',
        building_name: config.building_name || '',
        floor_office: config.floor_office || '',
        street_address: config.street_address || '',
        city: config.city || '',
        state: config.state || '',
        country: config.country || '',
        director_name: config.director_name || '',
        contact_phone: config.contact_phone || '',
        contact_email: config.contact_email || '',
        website_url: config.website_url || '',
        office_hours: config.office_hours || '',
        social_facebook: config.social_facebook || '',
        social_instagram: config.social_instagram || '',
        social_twitter: config.social_twitter || ''
      })
    } catch (error) {
      console.error('Error loading contact config:', error)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSuccess(false)

    try {
      // Preparar datos para enviar (solo el nombre, ya que el email se maneja por separado)
      const updateData: ProfileUpdateData = {}

      if (profileForm.name && profileForm.name.trim() !== '') {
        updateData.name = profileForm.name.trim()
      }

      const updatedProfile = await updateProfile(`${API_CONFIG.BASE_URL}/profile/me`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })
      
      setUserProfile(updatedProfile)
      setProfileSuccess(true)
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  // Helper function para validar si un campo está vacío
  const isFieldEmpty = (value: string | undefined | null): boolean => {
    return !value || value.toString().trim() === ''
  }

  // Helper function para validar email
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSuccess(false)
    setPasswordError(null)

    // Validar que las contraseñas coincidan
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return // La validación visual ya maneja esto
    }

    try {
      // Solo enviar los campos requeridos por la API
      const passwordData = {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      }

      await updatePassword(`${API_CONFIG.BASE_URL}/profile/me/password`, {
        method: 'PUT',
        body: JSON.stringify(passwordData)
      })

      setPasswordSuccess(true)
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (error: any) {
      setPasswordSuccess(false)

      // Manejar error de contraseña incorrecta
      if (error?.status === 400) {
        setPasswordError('La contraseña actual es incorrecta. Verifícala e intenta nuevamente.')
      }
    }
  }

  // Función para solicitar cambio de email
  const handleEmailChangeRequest = async () => {
    if (!emailChangeForm.newEmail.trim()) return

    setIsEmailChangeRequesting(true)
    setEmailChangeError('')

    try {
      console.log('📤 Requesting email change for:', emailChangeForm.newEmail.trim())
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/email-change-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAccessToken()}`
        },
        body: JSON.stringify({
          new_email: emailChangeForm.newEmail.trim()
        })
      })

      const data = await response.json()
      console.log('📥 Response from email change request:', data)

      if (response.ok) {
        // Calcular tiempo de expiración (24 horas desde ahora)
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 horas
        setEmailChangeTokenExpires(expiresAt)
        setShowEmailChangeDialog(true)
      } else {
        // Manejar errores específicos por código de estado
        if (response.status === 400) {
          setEmailChangeError('Este correo electrónico ya está registrado en el sistema. Por favor, utiliza otro correo.')
        } else if (response.status === 422) {
          setEmailChangeError('El correo electrónico tiene un formato incorrecto. Verifica que sea una dirección de email válida.')
        } else if (response.status === 500) {
          setEmailChangeError('Error al intentar cambiar el correo electrónico. Inténtalo más tarde.')
        } else {
          setEmailChangeError(data.detail || data.message || 'Error al solicitar cambio de email')
        }
      }
    } catch (error) {
      console.error('Error requesting email change:', error)
      setEmailChangeError('Error de conexión. Inténtalo nuevamente.')
    } finally {
      setIsEmailChangeRequesting(false)
    }
  }

  // Función para confirmar cambio de email (Paso 2)
  const handleEmailChangeConfirm = async () => {
    if (!emailChangeForm.token.trim()) return

    setIsEmailChangeConfirming(true)
    setEmailChangeError('')

    try {
      console.log('🔐 Confirming email change with token:', emailChangeForm.token.trim(), 'for email:', emailChangeForm.newEmail.trim())
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/email-change-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAccessToken()}`
        },
        body: JSON.stringify({
          token: emailChangeForm.token.trim(),
          new_email: emailChangeForm.newEmail.trim()
        })
      })

      const data = await response.json()
      console.log('📥 Response from email change confirmation:', data)

      if (response.ok) {
        console.log('✅ Email change step 2 completed successfully')
        // Mostrar mensaje de éxito para el paso 2
        setEmailChangeSuccess('Verificación exitosa. Revisa tu nuevo correo electrónico para completar el cambio.')
        setShowEmailChangeDialog(false)
        setEmailChangeForm({ newEmail: '', token: '' })
        setEmailChangeTokenExpires(null)

        // Limpiar mensaje de éxito después de 10 segundos
        setTimeout(() => setEmailChangeSuccess(false), 10000)
      } else {
        setEmailChangeError(data.detail || data.message || 'Código de verificación incorrecto')
      }
    } catch (error) {
      console.error('Error confirming email change:', error)
      setEmailChangeError('Error de conexión. Inténtalo nuevamente.')
    } finally {
      setIsEmailChangeConfirming(false)
    }
  }

  // Función para cancelar cambio de email
  const handleCancelEmailChange = () => {
    setShowEmailChangeDialog(false)
    setEmailChangeForm({ newEmail: '', token: '' })
    setEmailChangeTokenExpires(null)
    setEmailChangeError('')
  }

  // Función para formatear tiempo restante
  const formatTimeLeft = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleGreetingUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGreetingSuccess(false)
    setGreetingError(null)

    try {
      await updateGreeting(`${API_CONFIG.BASE_URL}/chat/config/greeting`, {
        method: 'PATCH',
        body: JSON.stringify(greetingConfig)
      })

      setGreetingSuccess(true)

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setGreetingSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating greeting config:', error)
      setGreetingError('Error al actualizar la configuración del saludo')
      setTimeout(() => setGreetingError(null), 5000)
    }
  }

  const handleContactUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactSuccess(false)
    setContactError(null)

    try {
      await updateContact(`${API_CONFIG.BASE_URL}/chat/config/contact`, {
        method: 'PATCH',
        body: JSON.stringify(contactConfig)
      })

      setContactSuccess(true)

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setContactSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating contact config:', error)
      setContactError('Error al actualizar la información de contacto')
      setTimeout(() => setContactError(null), 5000)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground">Gestiona tu información personal y configuración de seguridad</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información General */}
          <Card className="backdrop-blur-sm bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Información General</span>
              </CardTitle>
              <CardDescription>Actualiza tu información personal</CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {profileSuccess && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Perfil actualizado exitosamente
                      </AlertDescription>
                    </Alert>
                  )}

                  {updateProfileError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{updateProfileError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      type="text"
                      value={profileForm.name || ''}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ingresa tu nombre completo"
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email || ''}
                      placeholder="tu@email.com"
                      className="bg-muted border-gray-300 text-muted-foreground cursor-not-allowed"
                      disabled
                      readOnly
                    />
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      Para cambiar tu correo electrónico, usa la sección "Cambio de Correo Electrónico" abajo
                    </p>
                  </div>

                  {userProfile && (
                    <div className="space-y-2">
                      <Label>Información del Perfil</Label>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>ID:</strong> {userProfile.id}</p>
                        <p><strong>Rol:</strong> {userProfile.role}</p>
                        <p><strong>Estado:</strong> {userProfile.is_active ? 'Activo' : 'Inactivo'}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={Boolean(
                      updateProfileLoading ||
                      isFieldEmpty(profileForm.name)
                    )}
                  >
                    {updateProfileLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Actualizar Información
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Actualización de Contraseña */}
          <Card className="backdrop-blur-sm bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Seguridad</span>
              </CardTitle>
              <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                {passwordSuccess && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Contraseña actualizada exitosamente
                    </AlertDescription>
                  </Alert>
                )}

                {passwordError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                    placeholder="Ingresa tu contraseña actual"
                    className="bg-background/50 border-gray-300 focus:border-red-400"
                    required
                  />
                  <div className="flex items-center justify-end">
                    <Link
                      href="/forgot-password"
                      className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <HelpCircle className="h-3 w-3 mr-1" />
                      ¿No recuerdas tu contraseña?
                    </Link>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                    placeholder="Ingresa tu nueva contraseña"
                    className="bg-background/50 border-gray-300 focus:border-red-400"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    La contraseña debe tener al menos 8 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                    placeholder="Confirma tu nueva contraseña"
                    className={`bg-background/50 border-gray-300 focus:border-red-400 ${
                      passwordForm.confirm_password &&
                      passwordForm.new_password !== passwordForm.confirm_password
                        ? 'border-red-500 focus:border-red-500'
                        : passwordForm.confirm_password &&
                          passwordForm.new_password === passwordForm.confirm_password
                          ? 'border-green-500 focus:border-green-500'
                          : ''
                    }`}
                    required
                  />
                  {passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password && (
                    <p className="text-xs text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Las contraseñas no coinciden
                    </p>
                  )}
                  {passwordForm.confirm_password && passwordForm.new_password === passwordForm.confirm_password && passwordForm.new_password.length >= 8 && (
                    <p className="text-xs text-green-600 flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Las contraseñas coinciden
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={
                    updatePasswordLoading ||
                    !passwordForm.current_password ||
                    !passwordForm.new_password ||
                    !passwordForm.confirm_password ||
                    passwordForm.new_password !== passwordForm.confirm_password ||
                    passwordForm.new_password.length < 8
                  }
                >
                  {updatePasswordLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
            </CardContent>
          </Card>
        </div>

        {/* Cambio de Email */}
        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Cambio de Correo Electrónico</span>
            </CardTitle>
            <CardDescription>Cambia tu dirección de correo electrónico con verificación de seguridad</CardDescription>
          </CardHeader>
          <CardContent>
            {emailChangeSuccess && (
              <Alert className="border-green-200 bg-green-50 mb-6">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {typeof emailChangeSuccess === 'string' ? emailChangeSuccess : '¡Correo electrónico actualizado exitosamente! Recuerda que mantendrás la misma contraseña.'}
                </AlertDescription>
              </Alert>
            )}

            {emailChangeError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{emailChangeError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">Nuevo Correo Electrónico</Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="nuevo@email.com"
                  value={emailChangeForm.newEmail}
                  onChange={(e) => setEmailChangeForm(prev => ({ ...prev, newEmail: e.target.value }))}
                  className="bg-background/50 border-gray-300 focus:border-red-400"
                  disabled={isEmailChangeRequesting}
                />
                <p className="text-xs text-muted-foreground">
                  Se enviará un código de verificación a tu correo actual
                </p>
              </div>

              <Button
                onClick={handleEmailChangeRequest}
                disabled={!emailChangeForm.newEmail.trim() || isEmailChangeRequesting}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {isEmailChangeRequesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enviando código...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Solicitar Cambio de Email
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Saludo Inicial */}
        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Saludo Inicial del Chatbot</span>
            </CardTitle>
            <CardDescription>Configura el mensaje de bienvenida que verán los usuarios al iniciar una conversación</CardDescription>
          </CardHeader>
          <CardContent>
            {greetingLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-20 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <form onSubmit={handleGreetingUpdate} className="space-y-6">
                {greetingSuccess && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Configuración de saludo actualizada exitosamente
                    </AlertDescription>
                  </Alert>
                )}

                {greetingError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{greetingError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between space-x-4">
                  <div className="space-y-1">
                    <Label htmlFor="greeting-enabled" className="text-base">
                      Habilitar Saludo
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Activa o desactiva el mensaje de bienvenida
                    </p>
                  </div>
                  <Switch
                    id="greeting-enabled"
                    checked={greetingConfig.greeting_enabled}
                    onCheckedChange={(checked) =>
                      setGreetingConfig(prev => ({ ...prev, greeting_enabled: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="greeting-message">Mensaje de Saludo</Label>
                  <Textarea
                    id="greeting-message"
                    value={greetingConfig.greeting_message}
                    onChange={(e) =>
                      setGreetingConfig(prev => ({ ...prev, greeting_message: e.target.value }))
                    }
                    placeholder="Escribe el mensaje de bienvenida para los usuarios..."
                    className="bg-background/50 border-gray-300 focus:border-red-400 min-h-[120px]"
                    disabled={!greetingConfig.greeting_enabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    Este mensaje se mostrará cuando un usuario inicie una conversación con el chatbot
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={updateGreetingLoading}
                >
                  {updateGreetingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Configuración
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Información de Contacto */}
        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Información de Contacto</span>
            </CardTitle>
            <CardDescription>Configura la información de contacto que se mostrará a los usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            {contactLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactUpdate} className="space-y-6">
                {contactSuccess && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Información de contacto actualizada exitosamente
                    </AlertDescription>
                  </Alert>
                )}

                {contactError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{contactError}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="office-name">Nombre de la Oficina</Label>
                    <Input
                      id="office-name"
                      value={contactConfig.office_name}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, office_name: e.target.value }))}
                      placeholder="Oficina Administrativa..."
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faculty-name">Nombre de la Facultad</Label>
                    <Input
                      id="faculty-name"
                      value={contactConfig.faculty_name}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, faculty_name: e.target.value }))}
                      placeholder="Facultad de Ingeniería..."
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university-name">Nombre de la Universidad</Label>
                    <Input
                      id="university-name"
                      value={contactConfig.university_name}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, university_name: e.target.value }))}
                      placeholder="Universidad Francisco de Paula Santander..."
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="campus-location">Ubicación del Campus</Label>
                    <Input
                      id="campus-location"
                      value={contactConfig.campus_location}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, campus_location: e.target.value }))}
                      placeholder="Campus Central..."
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="building-name">Nombre del Edificio</Label>
                    <Input
                      id="building-name"
                      value={contactConfig.building_name}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, building_name: e.target.value }))}
                      placeholder="Edificio de Ingenierías..."
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floor-office">Piso y Oficina</Label>
                    <Input
                      id="floor-office"
                      value={contactConfig.floor_office}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, floor_office: e.target.value }))}
                      placeholder="Piso 2, Oficina 201..."
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="street-address">Dirección</Label>
                    <Input
                      id="street-address"
                      value={contactConfig.street_address}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, street_address: e.target.value }))}
                      placeholder="Av. Gran Colombia No. 12E-96..."
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={contactConfig.city}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Cúcuta..."
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Estado/Departamento</Label>
                    <Input
                      id="state"
                      value={contactConfig.state}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Norte de Santander..."
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      value={contactConfig.country}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Colombia..."
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="director-name">Nombre del Director</Label>
                    <Input
                      id="director-name"
                      value={contactConfig.director_name}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, director_name: e.target.value }))}
                      placeholder=""
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Teléfono de Contacto</Label>
                    <Input
                      id="contact-phone"
                      value={contactConfig.contact_phone}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, contact_phone: e.target.value }))}
                      placeholder="+57 (7) 5776655..."
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Correo Electrónico</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactConfig.contact_email}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, contact_email: e.target.value }))}
                      placeholder="oficina.sistemas@ufps.edu.co..."
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website-url">Sitio Web</Label>
                    <Input
                      id="website-url"
                      value={contactConfig.website_url}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, website_url: e.target.value }))}
                      placeholder="www.ufps.edu.co/ingenieria/sistemas..."
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="office-hours">Horario de Oficina</Label>
                    <Textarea
                      id="office-hours"
                      value={contactConfig.office_hours}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, office_hours: e.target.value }))}
                      placeholder="Lunes a Viernes de 8:00 a.m. a 12:00 m. y de 2:00 p.m. a 5:00 p.m...."
                      className="bg-background/50 border-gray-300 focus:border-red-400 min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="social-facebook" className="flex items-center space-x-2">
                      <Facebook className="h-4 w-4" />
                      <span>Facebook</span>
                    </Label>
                    <Input
                      id="social-facebook"
                      value={contactConfig.social_facebook}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, social_facebook: e.target.value }))}
                      placeholder="https://facebook.com/ufps..."
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="social-instagram" className="flex items-center space-x-2">
                      <Instagram className="h-4 w-4" />
                      <span>Instagram</span>
                    </Label>
                    <Input
                      id="social-instagram"
                      value={contactConfig.social_instagram}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, social_instagram: e.target.value }))}
                      placeholder="https://instagram.com/ufps_oficial..."
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="social-twitter" className="flex items-center space-x-2">
                      <Twitter className="h-4 w-4" />
                      <span>Twitter/X</span>
                    </Label>
                    <Input
                      id="social-twitter"
                      value={contactConfig.social_twitter}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, social_twitter: e.target.value }))}
                      placeholder="https://twitter.com/UFPS_Cucuta..."
                      className="bg-background/50 border-gray-300 focus:border-red-400"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={updateContactLoading}
                >
                  {updateContactLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Información de Contacto
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para confirmación de cambio de email */}
      <Dialog open={showEmailChangeDialog} onOpenChange={setShowEmailChangeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Verificar Cambio de Email</span>
            </DialogTitle>
            <DialogDescription>
              Hemos enviado un código de verificación a tu correo actual.
              Ingresa el código para continuar con el proceso de cambio de email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {emailChangeError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{emailChangeError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="emailToken">Código de Verificación</Label>
              <Input
                id="emailToken"
                type="text"
                placeholder="Ingresa el código de verificación"
                value={emailChangeForm.token}
                onChange={(e) => setEmailChangeForm(prev => ({ ...prev, token: e.target.value }))}
                className="bg-background/50 border-gray-300 focus:border-red-400 text-center text-lg tracking-widest"
                maxLength={20}
                disabled={isEmailChangeConfirming}
              />
            </div>

            {emailChangeTimeLeft > 0 && (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Código expira en: {formatTimeLeft(emailChangeTimeLeft)}</span>
              </div>
            )}

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Proceso de cambio de email:</strong><br />
                1. Ingresa el código enviado a tu email actual<br />
                2. Después de verificar, recibirás un email en tu nueva dirección<br />
                3. Haz clic en el enlace del email para completar el cambio<br />
                4. Luego de confirmar el cambio, te llegara una nueva contraseña para el ingreso<br />
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={handleCancelEmailChange}
              disabled={isEmailChangeConfirming}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleEmailChangeConfirm}
              disabled={!emailChangeForm.token.trim() || isEmailChangeConfirming}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {isEmailChangeConfirming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar Cambio
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
