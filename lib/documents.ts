// Tipos y interfaces para documentos
export interface Document {
  document_id: string
  status: "APPROVED" | "DISABLED"
  question_text: string
  file_path: string
  file_name: string
  file_type: string
  modality_id: string
  modality_name: string
  submodality_id: string | null
  submodality_name: string | null
  category_id: string | null
  category_name: string | null
  hierarchy_level: "modality" | "submodality" | "category"
  full_name: string
  full_path: string
  created_at: string
}

export interface DocumentFilters {
  status?: "APPROVED" | "DISABLED" | "all"
  modality_id?: string
  submodality_id?: string
  category_id?: string
  search?: string
}

export interface DocumentPagination {
  page: number
  page_size: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

export interface DocumentsResponse {
  items: Document[]
  pagination: DocumentPagination
}

export interface UpdateDocumentStatusRequest {
  status: "APPROVED" | "DISABLED"
}