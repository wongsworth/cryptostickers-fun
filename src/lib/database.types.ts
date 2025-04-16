export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      images: {
        Row: {
          id: string
          created_at?: string
          url: string
          tags: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          url: string
          tags?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          url?: string
          tags?: string[] | null
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at?: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
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