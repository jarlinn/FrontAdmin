"use client"

import { useModalityDistribution } from '@/hooks/use-modality-distribution'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface ModalityDistributionTableProps {
  title?: string
}

export default function ModalityDistributionTable({
  title = "Distribución por Modalidad",
}: ModalityDistributionTableProps) {
  const { data, loading, error, refresh } = useModalityDistribution()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
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
          <div className="flex items-center justify-center h-[200px]">
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

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No hay datos disponibles</p>
              <p className="text-sm text-gray-400">La consulta a Prometheus no retornó resultados</p>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Modalidad</TableHead>
              <TableHead className="w-24 text-right">Frecuencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.modality}>
                <TableCell>
                  <Badge variant="outline">{index + 1}</Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {item.modality}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {item.count}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}