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
          student_name: string
          student_dob: string
          student_gender: string
          class: string
          section_name: string
          roll_no: number
          father_name: string
          mother_name: string
        }
        Insert: {
          admission_no: string
          student_name: string
          student_dob: string
          student_gender: string
          class: string
          section_name: string
          roll_no: number
          father_name: string
          mother_name: string
        }
        Update: {
          admission_no?: string
          student_name?: string
          student_dob?: string
          student_gender?: string
          class?: string
          section_name?: string
          roll_no?: number
          father_name?: string
          mother_name?: string
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
export type Student = Database['public']['Tables']['students']['Row']
