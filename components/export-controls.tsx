"use client"

import { Download, FileSpreadsheet, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportToCSV, exportAsImage } from '@/lib/export-utils'
import { FrequentQuestionMetric } from '@/lib/metrics'

interface ExportControlsProps {
  data: FrequentQuestionMetric[]
  title?: string
  chartElementId?: string
}

export default function ExportControls({ data, title = 'frequent-questions', chartElementId }: ExportControlsProps) {
  const handleExportCSV = () => {
    exportToCSV(data, title)
  }


  const handleExportImage = () => {
    if (chartElementId) {
      exportAsImage(chartElementId, title)
    } else {
      alert('ID del elemento del gráfico no especificado')
    }
  }

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2 text-sm text-gray-600 mr-4">
        <Download className="h-4 w-4" />
        <span className="font-medium">Exportar Reporte:</span>
      </div>

      <Button
        onClick={handleExportCSV}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        disabled={data.length === 0}
      >
        <FileSpreadsheet className="h-4 w-4" />
        CSV
      </Button>



      {chartElementId && (
        <Button
          onClick={handleExportImage}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={data.length === 0}
        >
          <Image className="h-4 w-4" />
          PNG
        </Button>
      )}
    </div>
  )
}