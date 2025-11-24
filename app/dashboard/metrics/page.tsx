"use client"

import AdminLayout from "@/components/admin-layout"
import FrequentQuestionsTable from "@/components/frequent-questions-table"
import FrequentQuestionsPieChart from "@/components/frequent-questions-pie-chart"
import FrequentQuestionsVerticalChart from "@/components/frequent-questions-vertical-chart"
import ExportControls from "@/components/export-controls"
import ReportGenerator from "@/components/report-generator"
import { useFrequentQuestions } from "@/hooks/use-frequent-questions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, PieChart, Table } from "lucide-react"

export default function MetricsPage() {
  const { data } = useFrequentQuestions()

  return (
    <AdminLayout>
      <div className="space-y-6">
        <ExportControls
          data={data}
          title="preguntas-frecuentes"
        />
        <ReportGenerator />

        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Tabla
            </TabsTrigger>
            <TabsTrigger value="vertical-bar" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Barras Verticales
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Distribución
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-6">
            <FrequentQuestionsTable />
          </TabsContent>

          <TabsContent value="vertical-bar" className="mt-6">
            <FrequentQuestionsVerticalChart />
          </TabsContent>

          <TabsContent value="pie" className="mt-6">
            <FrequentQuestionsPieChart />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}