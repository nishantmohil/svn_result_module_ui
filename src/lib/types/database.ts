export type Database = {
  public: {
    Tables: {
      test_results: {
        Row: {
          id: number
          admission_no: string
          subject_name: string
          marks_obtained: number
          max_marks: number
          test_date: string
          attendance: boolean | null
          test_category: string | null
        }
        Insert: {
          id?: number
          admission_no: string
          subject_name: string
          marks_obtained: number
          max_marks: number
          test_date: string
          attendance?: boolean | null
          test_category?: string | null
        }
        Update: {
          id?: number
          admission_no?: string
          subject_name?: string
          marks_obtained?: number
          max_marks?: number
          test_date?: string
          attendance?: boolean | null
          test_category?: string | null
        }
      }
      students: {
        Row: {
          admission_no: string
          // Add other student fields as needed
        }
        Insert: {
          admission_no: string
          // Add other student fields as needed
        }
        Update: {
          admission_no?: string
          // Add other student fields as needed
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type TestResult = Database['public']['Tables']['test_results']['Row']
