"use client"

import AdminLayout from "@/components/admin-layout"
import FrequentQuestionsTable from "@/components/frequent-questions-table"
import ExportControls from "@/components/export-controls"
import ReportGenerator from "@/components/report-generator"
import { useFrequentQuestions } from "@/hooks/use-frequent-questions"

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
        <FrequentQuestionsTable />
      </div>
    </AdminLayout>
  )
}