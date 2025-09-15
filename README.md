# FrontAdmin - Panel de Administración de Chatbot

Panel de administración moderno para gestionar un sistema de chatbot con IA, construido con Next.js 15 y React 19.

## 🚀 Características

- **Dashboard Completo**: Vista general con métricas y estadísticas
- **Gestión de Contenido**: Crear y gestionar preguntas con contexto de texto o PDF
- **Validación de Respuestas**: Revisar y aprobar respuestas generadas por IA
- **Estadísticas Avanzadas**: Gráficos y métricas de uso del chatbot
- **Gestión de Categorías**: Organización jerárquica de contenido
- **Autenticación Segura**: Sistema completo con JWT y refresh tokens
- **Recuperación de Contraseña**: Flujo completo de recuperación por email
- **Interfaz Moderna**: UI responsive con tema claro/oscuro

## 🛠️ Tecnologías

- **Framework**: Next.js 15 con App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Gráficos**: Recharts
- **Iconos**: Lucide React
- **Autenticación**: JWT con refresh tokens
- **Subida de Archivos**: React Dropzone

## 📋 Requisitos Previos

- Node.js 18+ 
- npm, yarn o pnpm
- API Backend del chatbot ejecutándose

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd FrontAdmin
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Configurar variables de entorno**
   
   Crear un archivo `.env.local` en la raíz del proyecto:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_APP_NAME=ChatBot Admin
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   # o
   pnpm dev
   ```

5. **Abrir en el navegador**
   
   Visita [http://localhost:3000](http://localhost:3000)

## 🔐 Autenticación

### Credenciales por defecto
- **Email**: `admin@gmail.com`
- **Contraseña**: `admin`

### Endpoints de API requeridos
- `POST /auth/token` - Login
- `POST /auth/refresh/` - Refresh token
- `POST /auth/password-reset-request` - Solicitar recuperación
- `POST /auth/password-reset` - Resetear contraseña

## 📁 Estructura del Proyecto

```
FrontAdmin/
├── app/                    # App Router de Next.js
│   ├── dashboard/         # Páginas del dashboard
│   ├── login/            # Página de login
│   ├── forgot-password/  # Recuperación de contraseña
│   └── reset-password/   # Reset de contraseña
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes de UI (shadcn/ui)
│   └── admin-layout.tsx # Layout principal
├── hooks/               # Custom hooks
├── lib/                 # Utilidades y configuración
│   ├── auth.ts         # Servicio de autenticación
│   ├── api-config.ts   # Configuración de API
│   └── utils.ts        # Utilidades generales
├── middleware.ts       # Middleware de autenticación
└── public/            # Archivos estáticos
```

## 🎯 Funcionalidades Principales

### 1. Dashboard
- Métricas generales del sistema
- Estadísticas de uso
- Accesos rápidos a funciones principales

### 2. Gestión de Contenido
- Crear preguntas con contexto de texto o PDF
- Generar respuestas automáticas con IA
- Organizar contenido por categorías
- Gestión de tags y metadatos

### 3. Validación
- Revisar respuestas generadas por IA
- Aprobar, rechazar o editar contenido
- Reprocesar preguntas con nuevos parámetros
- Vista previa de documentos PDF

### 4. Estadísticas
- Gráficos de actividad de usuarios
- Métricas de rendimiento
- Análisis de preguntas frecuentes
- Exportación de datos

### 5. Configuración
- Gestión de categorías jerárquicas
- Configuración de parámetros del sistema
- Herramientas de administración

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Iniciar en producción
npm run start

# Linting
npm run lint
```

## 🌐 Despliegue

### Vercel (Recomendado)
1. Conectar el repositorio a Vercel
2. Configurar las variables de entorno
3. Desplegar automáticamente

### Docker
```bash
# Construir imagen
docker build -t frontadmin .

# Ejecutar contenedor
docker run -p 3000:3000 frontadmin
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

## 🔄 Changelog

### v1.0.0
- Implementación inicial del panel de administración
- Sistema de autenticación completo
- Gestión de contenido y validación
- Dashboard con estadísticas
- Interfaz responsive con tema claro/oscuro
