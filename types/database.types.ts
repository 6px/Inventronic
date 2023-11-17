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
      locations: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string | null
          owner_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
          owner_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
          owner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Locations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      parts: {
        Row: {
          created_at: string
          description: string | null
          footprint: string | null
          id: number
          min_quantity: number | null
          name: string | null
          owner_id: string | null
          quantity: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          footprint?: string | null
          id?: number
          min_quantity?: number | null
          name?: string | null
          owner_id?: string | null
          quantity?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          footprint?: string | null
          id?: number
          min_quantity?: number | null
          name?: string | null
          owner_id?: string | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Parts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}