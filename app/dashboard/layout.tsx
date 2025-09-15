import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - Chatbot Universitario",
  description: "Panel de administración del chatbot universitario",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
