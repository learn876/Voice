export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          booking_time: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          service_requested: string | null
          status: string | null
        }
        Insert: {
          booking_time?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          service_requested?: string | null
          status?: string | null
        }
        Update: {
          booking_time?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          service_requested?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          complaint_details: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          sentiment: string | null
          summary: string | null
          transcript: string | null
        }
        Insert: {
          complaint_details?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          sentiment?: string | null
          summary?: string | null
          transcript?: string | null
        }
        Update: {
          complaint_details?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          sentiment?: string | null
          summary?: string | null
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          phone: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          phone: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string
        }
        Relationships: []
      }
      account_wallet: {
        Row: {
          id: string
          balance_inr: number
          rate_per_min_inr: number
          total_calls_handled: number | null
          total_minutes_consumed: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          balance_inr?: number
          rate_per_min_inr?: number
          total_calls_handled?: number | null
          total_minutes_consumed?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          balance_inr?: number
          rate_per_min_inr?: number
          total_calls_handled?: number | null
          total_minutes_consumed?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      merge_anonymous_customer: {
        Args: { source_anon_id: string; target_verified_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
