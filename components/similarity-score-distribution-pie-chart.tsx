"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useSimilarityScoreDistribution } from '@/hooks/use-similarity-score-distribution'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface SimilarityScoreDistributionPieChartProps {
  title?: string
  height?: number
}

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#7c3aed', '#c2410c', '#0891b2', '#be185d']

export default function SimilarityScoreDistributionPieChart({
  title = "Distribución por Similarity Score",
  height = 500
}: SimilarityScoreDistributionPieChartProps) {
  const { data, loading, error, refresh } = useSimilarityScoreDistribution()

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

  // Preparar datos para el gráfico de pie
  const chartData = data.map((item, index) => ({
    name: item.range,
    value: item.count,
    percentage: data.length > 0 ? ((item.count / data.reduce((sum, s) => sum + s.count, 0)) * 100).toFixed(1) : '0',
    numericRange: `${item.minScore} - ${item.maxScore}`
  }))

  if (chartData.length === 0 && !error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[500px]">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No hay datos disponibles</p>
              <p className="text-sm text-gray-400">La consulta a Prometheus no retornó resultados</p>
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
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg max-w-sm">
          <p className="font-medium text-sm mb-1">Rango:</p>
          <p className="text-xs text-gray-700 mb-1">{data.name}</p>
          <p className="text-xs text-gray-600 mb-1">({data.numericRange})</p>
          <p className="text-sm">
            Frecuencia: {data.value} ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null // Don't show labels for slices smaller than 5%

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>
                  {value} ({entry.payload.percentage}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}