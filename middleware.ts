import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isPasswordRecoveryRoute = request.nextUrl.pathname === '/forgot-password' || request.nextUrl.pathname === '/reset-password'
  const isEmailChangeComplete = request.nextUrl.pathname === '/auth/email-change-complete'
  const isPublicRoute = isLoginPage || isPasswordRecoveryRoute || request.nextUrl.pathname === '/' || isEmailChangeComplete

  // Si no hay token y no está en una ruta pública, redirigir al login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    // Guardar la URL original para redirigir después del login
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si hay token y está en la página de login, redirigir al dashboard
  if (token && isLoginPage) {
    // Verificar si hay una URL de redirección
    const redirectUrl = request.nextUrl.searchParams.get('redirect')
    const targetUrl = redirectUrl && redirectUrl !== '/login' ? redirectUrl : '/dashboard'
    return NextResponse.redirect(new URL(targetUrl, request.url))
  }

  // Si está en la raíz y tiene token, redirigir al dashboard
  if (token && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Si no tiene token y está en la raíz, redirigir al login
  if (!token && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
