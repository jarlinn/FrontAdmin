"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Loader2 } from 'lucide-react'
import { useAuthFetch } from '@/hooks/use-auth-fetch'
import { API_CONFIG, buildApiUrl } from '@/lib/api-config'

interface ReportResponse {
  status: string
  message: string
  download_url: string
  filename: string
  expires_in_hours: number
  file_size_bytes: number
  generated_at: string
  report_period_days: number
}

export default function ReportGenerator() {
  const [generating, setGenerating] = useState(false)
  const { fetchData } = useAuthFetch()

  const handleGenerateReport = async () => {
    setGenerating(true)
    try {
      const response: ReportResponse = await fetchData(
        buildApiUrl(API_CONFIG.ENDPOINTS.REPORTS_FREQUENT_QUESTIONS_DOWNLOAD),
        { method: 'POST' }
      )

      if (response.status === 'success' && response.download_url) {
        // Open the PDF in a new tab
        window.open(response.download_url, '_blank')
      } else {
        alert('Error al generar el reporte: ' + response.message)
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error al generar el reporte. Por favor, inténtalo de nuevo.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-blue-50 rounded-lg border">
      <div className="flex items-center gap-2 text-sm text-gray-600 mr-4">
        <FileText className="h-4 w-4" />
        <span className="font-medium">Generar Reporte de Preguntas Más Frecuentes:</span>
      </div>

      <Button
        onClick={handleGenerateReport}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        disabled={generating}
      >
        {generating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        {generating ? 'Generando...' : 'Generar Reporte'}
      </Button>
    </div>
  )
}