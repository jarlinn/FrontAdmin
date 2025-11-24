"use client"

import AdminLayout from "@/components/admin-layout"
import FrequentQuestionsTable from "@/components/frequent-questions-table"
import FrequentQuestionsPieChart from "@/components/frequent-questions-pie-chart"
import FrequentQuestionsVerticalChart from "@/components/frequent-questions-vertical-chart"
import ModalityDistributionTable from "@/components/modality-distribution-table"
import ModalityDistributionVerticalChart from "@/components/modality-distribution-vertical-chart"
import ModalityDistributionPieChart from "@/components/modality-distribution-pie-chart"
import SubmodalityDistributionTable from "@/components/submodality-distribution-table"
import SubmodalityDistributionVerticalChart from "@/components/submodality-distribution-vertical-chart"
import SubmodalityDistributionPieChart from "@/components/submodality-distribution-pie-chart"
import CategoryDistributionTable from "@/components/category-distribution-table"
import CategoryDistributionVerticalChart from "@/components/category-distribution-vertical-chart"
import CategoryDistributionPieChart from "@/components/category-distribution-pie-chart"
import SimilarityScoreDistributionTable from "@/components/similarity-score-distribution-table"
import SimilarityScoreDistributionVerticalChart from "@/components/similarity-score-distribution-vertical-chart"
import SimilarityScoreDistributionPieChart from "@/components/similarity-score-distribution-pie-chart"
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

        {/* Sección de Distribución por Modalidad */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Distribución por Modalidad</h2>

          <Tabs defaultValue="modality-table" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="modality-table" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Tabla
              </TabsTrigger>
              <TabsTrigger value="modality-vertical-bar" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Barras Verticales
              </TabsTrigger>
              <TabsTrigger value="modality-pie" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Distribución
              </TabsTrigger>
            </TabsList>

            <TabsContent value="modality-table" className="mt-6">
              <ModalityDistributionTable />
            </TabsContent>

            <TabsContent value="modality-vertical-bar" className="mt-6">
              <ModalityDistributionVerticalChart />
            </TabsContent>

            <TabsContent value="modality-pie" className="mt-6">
              <ModalityDistributionPieChart />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sección de Distribución por Submodalidad */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Distribución por Submodalidad</h2>

          <Tabs defaultValue="submodality-table" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="submodality-table" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Tabla
              </TabsTrigger>
              <TabsTrigger value="submodality-vertical-bar" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Barras Verticales
              </TabsTrigger>
              <TabsTrigger value="submodality-pie" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Distribución
              </TabsTrigger>
            </TabsList>

            <TabsContent value="submodality-table" className="mt-6">
              <SubmodalityDistributionTable />
            </TabsContent>

            <TabsContent value="submodality-vertical-bar" className="mt-6">
              <SubmodalityDistributionVerticalChart />
            </TabsContent>

            <TabsContent value="submodality-pie" className="mt-6">
              <SubmodalityDistributionPieChart />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sección de Distribución por Categoría */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Distribución por Categoría</h2>

          <Tabs defaultValue="category-table" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="category-table" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Tabla
              </TabsTrigger>
              <TabsTrigger value="category-vertical-bar" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Barras Verticales
              </TabsTrigger>
              <TabsTrigger value="category-pie" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Distribución
              </TabsTrigger>
            </TabsList>

            <TabsContent value="category-table" className="mt-6">
              <CategoryDistributionTable />
            </TabsContent>

            <TabsContent value="category-vertical-bar" className="mt-6">
              <CategoryDistributionVerticalChart />
            </TabsContent>

            <TabsContent value="category-pie" className="mt-6">
              <CategoryDistributionPieChart />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sección de Distribución por Similarity Score */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Distribución por Similarity Score</h2>

          <Tabs defaultValue="similarity-table" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="similarity-table" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Tabla
              </TabsTrigger>
              <TabsTrigger value="similarity-vertical-bar" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Barras Verticales
              </TabsTrigger>
              <TabsTrigger value="similarity-pie" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Distribución
              </TabsTrigger>
            </TabsList>

            <TabsContent value="similarity-table" className="mt-6">
              <SimilarityScoreDistributionTable />
            </TabsContent>

            <TabsContent value="similarity-vertical-bar" className="mt-6">
              <SimilarityScoreDistributionVerticalChart />
            </TabsContent>

            <TabsContent value="similarity-pie" className="mt-6">
              <SimilarityScoreDistributionPieChart />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  )
}