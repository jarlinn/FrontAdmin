"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { useFrequentQuestions } from '@/hooks/use-frequent-questions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface FrequentQuestionsChartProps {
  title?: string
  height?: number
  elementId?: string
}

export default function FrequentQuestionsChart({
  title = "Top 5 Preguntas Más Frecuentes",
  height = 500,
  elementId
}: FrequentQuestionsChartProps) {
  const { data, loading, error, refresh } = useFrequentQuestions()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[500px]">
            <div className="text-center">
              <p className="text-red-500 mb-2">Error al cargar los datos</p>
              <p className="text-sm text-gray-500">{error}</p>
              <button
                onClick={refresh}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reintentar
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Preparar datos para el gráfico
  const chartData = data.map((item, index) => ({
    question_text: item.question_text.length > 50
      ? `${item.question_text.substring(0, 50)}...`
      : item.question_text,
    full_question: item.question_text,
    count: item.count,
    question_id: item.question_id
  }))

  if (chartData.length === 0 && !error) {
    return (
      <div id={elementId}>
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <p className="text-gray-500 mb-2">No hay datos disponibles</p>
                <p className="text-sm text-gray-400">La consulta a Prometheus no retornó resultados</p>
                <p className="text-xs text-gray-400 mt-2">Posibles causas:</p>
                <ul className="text-xs text-gray-400 text-left max-w-xs mx-auto">
                  <li>• La métrica 'frequent_questions_total' no existe</li>
                  <li>• No hay datos para esta métrica aún</li>
                  <li>• Los labels question_id y question_text son diferentes</li>
                </ul>
                <button
                  onClick={refresh}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg max-w-sm">
          <p className="font-medium text-sm mb-1">Pregunta:</p>
          <p className="text-xs text-gray-700 mb-2 break-words">{data.full_question}</p>
          <p className="text-sm">
            <span className="font-medium">Frecuencia:</span> {data.count}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div id={elementId}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              layout="horizontal"
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 250,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                label={{ value: 'Número de Ocurrencias', position: 'insideBottom', offset: -5 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                dataKey="question_text"
                type="category"
                width={220}
                tick={{ textAnchor: 'start', fontSize: 11, width: 200 }}
                interval={0}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="count"
                  position="insideRight"
                  style={{ fill: 'white', fontSize: '12px', fontWeight: 'bold' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}