"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { useCategoryDistribution } from '@/hooks/use-category-distribution'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface CategoryDistributionVerticalChartProps {
  title?: string
  height?: number
}

export default function CategoryDistributionVerticalChart({
  title = "Distribución por Categoría - Barras Verticales",
  height = 500
}: CategoryDistributionVerticalChartProps) {
  const { data, loading, error, refresh } = useCategoryDistribution()

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

  // Preparar datos para el gráfico de barras verticales
  const chartData = data.map((item, index) => ({
    category: item.category,
    count: item.count
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg max-w-sm">
          <p className="font-medium text-sm mb-1">Categoría:</p>
          <p className="text-xs text-gray-700">{data.category}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 80,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              angle={-45}
              textAnchor="end"
              height={100}
              fontSize={11}
              interval={0}
            />
            <YAxis
              label={{ value: 'Número de Ocurrencias', angle: -90, position: 'insideLeft' }}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="count"
                position="top"
                style={{ fill: '#2563eb', fontSize: '12px', fontWeight: 'bold' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}