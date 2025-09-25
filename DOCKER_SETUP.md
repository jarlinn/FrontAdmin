# Docker Setup para FrontAdmin

Esta guía proporciona instrucciones completas para configurar y ejecutar el proyecto FrontAdmin utilizando Docker y Docker Compose.

## 📋 Requisitos Previos

- **Docker**: Versión 20.10 o superior
- **Docker Compose**: Versión 2.0 o superior
- **Sistema Operativo**: Linux, macOS o Windows con WSL2

### Verificar instalación
```bash
docker --version
docker-compose --version
```

## 🚀 Comandos Básicos

### Iniciar todos los servicios
```bash
docker-compose up -d
```

### Detener todos los servicios
```bash
docker-compose down
```

### Ver logs de un servicio específico
```bash
docker-compose logs app
```

### Ver logs en tiempo real
```bash
docker-compose logs -f app
```

## ⚙️ Configuración de Entorno

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# API Backend
NEXT_PUBLIC_API_URL=http://host.docker.internal:8000

# Información de la aplicación
NEXT_PUBLIC_APP_NAME=ChatBot Admin
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**Nota**: `host.docker.internal` permite acceder al backend que se ejecuta en el host local.

### Servicios Incluidos

- **app**: Aplicación principal de Next.js (puerto 3000)

## 🌐 Acceso a Servicios

- **Aplicación Frontend**: http://localhost:3000
- **API Backend**: Debe estar ejecutándose en el host en el puerto 8000

## 🛠️ Comandos Útiles

### Ejecutar comandos dentro del contenedor
```bash
# Acceder al shell del contenedor
docker-compose exec app sh

# Instalar nuevas dependencias
docker-compose exec app pnpm install <package>

# Ejecutar linting
docker-compose exec app pnpm run lint

# Construir para producción
docker-compose exec app pnpm run build
```

### Reconstruir y reiniciar servicios
```bash
# Reconstruir imagen y reiniciar
docker-compose up -d --build

# Reiniciar un servicio específico
docker-compose restart app
```

### Limpiar contenedores e imágenes
```bash
# Detener y eliminar contenedores
docker-compose down

# Eliminar volúmenes (¡cuidado: elimina datos persistentes!)
docker-compose down -v

# Limpiar imágenes no utilizadas
docker image prune -f
```

## 🔧 Solución de Problemas

### Problema: "Connection refused" al conectarse al backend
**Solución**: Asegúrate de que el backend esté ejecutándose en `localhost:8000` en el host. Si usas Docker para el backend también, usa el nombre del servicio en lugar de `host.docker.internal`.

### Problema: Cambios no se reflejan en desarrollo
**Solución**: Verifica que los volúmenes estén montados correctamente. Reinicia el contenedor:
```bash
docker-compose restart app
```

### Problema: Puerto 3000 ya está en uso
**Solución**: Cambia el puerto en `docker-compose.yml` o libera el puerto:
```bash
# En macOS/Linux
lsof -ti:3000 | xargs kill -9

# En Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problema: Error de permisos en archivos
**Solución**: Asegúrate de que los archivos del proyecto tengan permisos adecuados. En Linux/macOS:
```bash
sudo chown -R $USER:$USER .
```

### Problema: Contenedor no inicia
**Verificar logs**:
```bash
docker-compose logs app
```

**Verificar estado**:
```bash
docker-compose ps
```

### Problema: Memoria insuficiente
**Solución**: Aumenta la memoria asignada a Docker (Docker Desktop > Settings > Resources).

## 📊 Monitoreo

### Ver estado de servicios
```bash
docker-compose ps
```

### Ver uso de recursos
```bash
docker stats
```

### Ver logs de todos los servicios
```bash
docker-compose logs
```

## 🔄 Desarrollo vs Producción

### Desarrollo (docker-compose)
- Montaje de volúmenes para hot-reload
- Servidor de desarrollo de Next.js
- Variables de entorno de desarrollo

### Producción (Dockerfile standalone)
- Imagen optimizada y minimalista
- Build estático de Next.js
- Configuración para despliegue

Para producción, usa:
```bash
docker build -t frontadmin .
docker run -p 3000:3000 frontadmin
```

## 📝 Notas Adicionales

- El proyecto usa `pnpm` como gestor de paquetes
- Los archivos `.env` están excluidos del contenedor por seguridad
- El contenedor está configurado para desarrollo local con hot-reload
- Para producción, considera usar un registry de contenedores como Docker Hub o AWS ECR

## 🆘 Soporte

Si encuentras problemas no cubiertos aquí:

1. Revisa los logs detallados: `docker-compose logs -f`
2. Verifica la configuración de red: `docker network ls`
3. Consulta la documentación oficial de Docker
4. Crea un issue en el repositorio del proyecto