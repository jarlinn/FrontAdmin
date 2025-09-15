"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Lock, Save, AlertCircle, CheckCircle2 } from "lucide-react"
import AdminLayout from "@/components/admin-layout"
import { useAuthFetch } from "@/hooks/use-auth-fetch"
import { API_CONFIG } from "@/lib/api-config"

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

  const { fetchData: fetchProfile, loading: profileLoading, error: profileError } = useAuthFetch()
  const { fetchData: updateProfile, loading: updateProfileLoading, error: updateProfileError } = useAuthFetch()
  const { fetchData: updatePassword, loading: updatePasswordLoading, error: updatePasswordError } = useAuthFetch()

  // Cargar perfil del usuario al montar el componente
  useEffect(() => {
    loadUserProfile()
  }, [])

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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSuccess(false)

    try {
      // Preparar datos para enviar (solo los campos que han cambiado o están completos)
      const updateData: ProfileUpdateData = {}
      
      if (profileForm.name && profileForm.name.trim() !== '') {
        updateData.name = profileForm.name.trim()
      }
      
      if (profileForm.email && profileForm.email.trim() !== '') {
        updateData.email = profileForm.email.trim()
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
    } catch (error) {
      console.error('Error updating password:', error)
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
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email || ''}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="tu@email.com"
                      className={`bg-background/50 ${
                        profileForm.email && 
                        !isValidEmail(profileForm.email)
                          ? 'border-red-500 focus:border-red-500'
                          : profileForm.email && 
                            isValidEmail(profileForm.email)
                            ? 'border-green-500 focus:border-green-500'
                            : ''
                      }`}
                      required
                    />
                    {profileForm.email && !isValidEmail(profileForm.email) && (
                      <p className="text-xs text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Por favor ingresa un correo electrónico válido
                      </p>
                    )}
                    {profileForm.email && isValidEmail(profileForm.email) && (
                      <p className="text-xs text-green-600 flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Correo electrónico válido
                      </p>
                    )}
                    {!profileForm.email && (
                      <p className="text-xs text-muted-foreground">
                        Asegúrate de usar un correo válido y accesible
                      </p>
                    )}
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
                    className="w-full" 
                    disabled={Boolean(
                      updateProfileLoading || 
                      (isFieldEmpty(profileForm.name) && isFieldEmpty(profileForm.email)) ||
                      (profileForm.email && !isValidEmail(profileForm.email))
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

                {updatePasswordError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{updatePasswordError}</AlertDescription>
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
                    className="bg-background/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                    placeholder="Ingresa tu nueva contraseña"
                    className="bg-background/50"
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
                    className={`bg-background/50 ${
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
                  className="w-full" 
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
      </div>
    </AdminLayout>
  )
}
