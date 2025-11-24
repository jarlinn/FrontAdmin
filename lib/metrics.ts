// Servicio para manejar métricas de Prometheus
const PROMETHEUS_BASE_URL = process.env.NEXT_PUBLIC_PROMETHEUS_URL || 'http://localhost:9090'

export interface FrequentQuestionMetric {
  question_id: string
  question_text: string
  count: number
}


export interface PrometheusQueryResponse {
  status: string
  data?: {
    resultType: string
    result: Array<{
      metric: {
        question_id: string
        question_text: string
      }
      value?: [number, string] // For instant query
      values?: Array<[number, string]> // For range query
    }>
  }
  error?: string
}

class MetricsService {
  /**
     * Obtener las top 5 preguntas más frecuentes
     */
  async getTopFrequentQuestions(): Promise<FrequentQuestionMetric[]> {
    try {
      // Query range for historical data
      const query = encodeURIComponent('frequent_questions_total')
      const end = Math.floor(Date.now() / 1000)
      const start = end - (15 * 24 * 3600) // 15 days ago
      const step = 120 // 1 hour
      const url = `${PROMETHEUS_BASE_URL}/api/v1/query_range?query=${query}&start=${start}&end=${end}&step=${step}`

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Error al consultar Prometheus: ${response.status}`)
      }

      const data: PrometheusQueryResponse = await response.json()

      if (data.status !== 'success') {
        throw new Error(`Error en la respuesta de Prometheus: ${data.error || 'Respuesta no exitosa'}`)
      }

      if (!data.data) {
        throw new Error('No se recibió data en la respuesta de Prometheus')
      }

      // Group by question_id and question_text, sum the counts
      const grouped: { [key: string]: FrequentQuestionMetric } = {}

      data.data.result.forEach(item => {
        const question_id = item.metric.question_id || ''
        const question_text = item.metric.question_text || ''
        const key = `${question_id}:${question_text}`
        const latestValue = item.values ? item.values[item.values.length - 1][1] : '0'
        const count = parseFloat(latestValue)

        if (grouped[key]) {
          grouped[key].count += count
        } else {
          grouped[key] = {
            question_id,
            question_text,
            count
          }
        }
      })

      const result = Object.values(grouped).sort((a, b) => b.count - a.count)

      return result
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de conexión a Prometheus')
    }
  }

}

// Exportar instancia singleton
export const metricsService = new MetricsService()