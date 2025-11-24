// Utilidades para exportar datos de métricas

import { FrequentQuestionMetric } from './metrics'
import domtoimage from 'dom-to-image'

/**
 * Exporta datos a CSV
 */
export function exportToCSV(data: FrequentQuestionMetric[], filename: string = 'frequent-questions') {
  if (data.length === 0) {
    alert('No hay datos para exportar')
    return
  }

  // Crear headers
  const headers = ['Posición', 'ID Pregunta', 'Pregunta', 'Frecuencia']

  // Crear filas de datos
  const rows = data.map((item, index) => [
    (index + 1).toString(),
    item.question_id,
    `"${item.question_text.replace(/"/g, '""')}"`, // Escapar comillas en CSV
    item.count.toString()
  ])

  // Combinar headers y datos
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')

  // Crear blob y descargar
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Exporta datos a JSON
 */
export function exportToJSON(data: FrequentQuestionMetric[], filename: string = 'frequent-questions') {
  if (data.length === 0) {
    alert('No hay datos para exportar')
    return
  }

  const jsonContent = JSON.stringify({
    title: 'Top 5 Preguntas Más Frecuentes',
    generatedAt: new Date().toISOString(),
    data: data
  }, null, 2)

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Genera un reporte de texto simple
 */
export function exportToText(data: FrequentQuestionMetric[], filename: string = 'frequent-questions-report') {
  if (data.length === 0) {
    alert('No hay datos para exportar')
    return
  }

  const reportLines = [
    'REPORTE DE PREGUNTAS MÁS FRECUENTES',
    '=' .repeat(50),
    `Generado: ${new Date().toLocaleString('es-ES')}`,
    '',
    'TOP PREGUNTAS POR FRECUENCIA:',
    '-' .repeat(30),
    ''
  ]

  data.forEach((item, index) => {
    reportLines.push(`${index + 1}. Pregunta: ${item.question_text}`)
    reportLines.push(`   Frecuencia: ${item.count}`)
    reportLines.push(`   ID: ${item.question_id}`)
    reportLines.push('')
  })

  const textContent = reportLines.join('\n')

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.txt`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Exporta un elemento HTML como imagen PNG
 */
export async function exportAsImage(elementId: string, filename: string = 'chart') {
  try {
    // Small delay to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100))

    const element = document.getElementById(elementId)
    console.log('Element found:', element, 'ID:', elementId)

    if (!element) {
      // Try to find all elements with IDs to debug
      const allElements = document.querySelectorAll('[id]')
      const ids = Array.from(allElements).map(el => el.id)
      console.log('Available IDs:', ids)

      throw new Error(`Element with id "${elementId}" not found. Available IDs: ${ids.join(', ')}`)
    }

    // Use dom-to-image for better CSS support
    const dataUrl = await domtoimage.toPng(element, {
      width: element.offsetWidth * 2, // Higher resolution
      height: element.offsetHeight * 2,
      style: {
        transform: 'scale(2)',
        transformOrigin: 'top left',
        width: element.offsetWidth + 'px',
        height: element.offsetHeight + 'px'
      },
      quality: 1,
      bgcolor: '#ffffff'
    })

    const link = document.createElement('a')
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('Error exporting as image:', error)
    alert(`Error al exportar la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}