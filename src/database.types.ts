export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          cancellation_reason: string | null
          client_id: string
          created_at: string
          date_time: string
          id: string
          notes: string | null
          payment_status: string | null
          refund_status: string | null
          rescheduled_from: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          therapist_id: string
          therapist_service_id: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          client_id: string
          created_at?: string
          date_time: string
          id?: string
          notes?: string | null
          payment_status?: string | null
          refund_status?: string | null
          rescheduled_from?: string | null
          status: string
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          therapist_id: string
          therapist_service_id?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          client_id?: string
          created_at?: string
          date_time?: string
          id?: string
          notes?: string | null
          payment_status?: string | null
          refund_status?: string | null
          rescheduled_from?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          therapist_id?: string
          therapist_service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_therapist_service_id_fkey"
            columns: ["therapist_service_id"]
            isOneToOne: false
            referencedRelation: "therapist_services"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_history: {
        Row: {
          ai_reply_text: string
          audio_url: string | null
          created_at: string
          id: string
          message_text: string
          mood_tag: string | null
          user_id: string
        }
        Insert: {
          ai_reply_text: string
          audio_url?: string | null
          created_at?: string
          id?: string
          message_text: string
          mood_tag?: string | null
          user_id: string
        }
        Update: {
          ai_reply_text?: string
          audio_url?: string | null
          created_at?: string
          id?: string
          message_text?: string
          mood_tag?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crisis_events: {
        Row: {
          created_at: string
          detected_at: string
          id: string
          message_context_hash: string | null
          severity_level: string
          trigger_keywords: string[] | null
          user_id: string
          user_response: string | null
        }
        Insert: {
          created_at?: string
          detected_at?: string
          id?: string
          message_context_hash?: string | null
          severity_level: string
          trigger_keywords?: string[] | null
          user_id: string
          user_response?: string | null
        }
        Update: {
          created_at?: string
          detected_at?: string
          id?: string
          message_context_hash?: string | null
          severity_level?: string
          trigger_keywords?: string[] | null
          user_id?: string
          user_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crisis_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          mood: number
          tags: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mood: number
          tags?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mood?: number
          tags?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_entries: {
        Row: {
          created_at: string
          id: string
          mood: number
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood: number
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mood?: number
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_logs: {
        Row: {
          id: string
          logged_at: string
          mood_tag: string | null
          text: string
          user_id: string
        }
        Insert: {
          id?: string
          logged_at?: string
          mood_tag?: string | null
          text: string
          user_id: string
        }
        Update: {
          id?: string
          logged_at?: string
          mood_tag?: string | null
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          patient_id: string
          sessions_used_current_cycle: number | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          therapist_service_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          patient_id: string
          sessions_used_current_cycle?: number | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          therapist_service_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          patient_id?: string
          sessions_used_current_cycle?: number | null
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          therapist_service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_subscriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_subscriptions_therapist_service_id_fkey"
            columns: ["therapist_service_id"]
            isOneToOne: false
            referencedRelation: "therapist_services"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_refunds: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_intent_id: string
          reason: string | null
          refund_id: string
          refunded_by: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_intent_id: string
          reason?: string | null
          refund_id: string
          refunded_by?: string | null
          status: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_intent_id?: string
          reason?: string | null
          refund_id?: string
          refunded_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_refunds_refunded_by_fkey"
            columns: ["refunded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          consent_given: boolean | null
          created_at: string
          email: string
          free_session_credit: boolean | null
          full_name: string
          id: string
          phone_number: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          consent_given?: boolean | null
          created_at?: string
          email: string
          free_session_credit?: boolean | null
          full_name: string
          id: string
          phone_number?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          consent_given?: boolean | null
          created_at?: string
          email?: string
          free_session_credit?: boolean | null
          full_name?: string
          id?: string
          phone_number?: string | null
          role?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          author: string
          category: string[] | null
          content: string
          created_at: string
          id: string
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          author: string
          category?: string[] | null
          content: string
          created_at?: string
          id?: string
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          author?: string
          category?: string[] | null
          content?: string
          created_at?: string
          id?: string
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: []
      }
      therapist_profiles: {
        Row: {
          availability: string[] | null
          cancellation_fee_percentage: number | null
          cancellation_policy: string | null
          certifications: string[] | null
          description: string
          education: string[] | null
          experience_years: number
          id: string
          rate_per_hour: number
          rating: number | null
          reschedule_policy: string | null
          specialization: string[]
          stripe_account_id: string | null
          stripe_charges_enabled: boolean | null
          stripe_onboarding_complete: boolean | null
          stripe_payouts_enabled: boolean | null
          user_id: string
        }
        Insert: {
          availability?: string[] | null
          cancellation_fee_percentage?: number | null
          cancellation_policy?: string | null
          certifications?: string[] | null
          description: string
          education?: string[] | null
          experience_years: number
          id?: string
          rate_per_hour: number
          rating?: number | null
          reschedule_policy?: string | null
          specialization: string[]
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_onboarding_complete?: boolean | null
          stripe_payouts_enabled?: boolean | null
          user_id: string
        }
        Update: {
          availability?: string[] | null
          cancellation_fee_percentage?: number | null
          cancellation_policy?: string | null
          certifications?: string[] | null
          description?: string
          education?: string[] | null
          experience_years?: number
          id?: string
          rate_per_hour?: number
          rating?: number | null
          reschedule_policy?: string | null
          specialization?: string[]
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_onboarding_complete?: boolean | null
          stripe_payouts_enabled?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_services: {
        Row: {
          billing_interval: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price_amount: number
          session_quota: number | null
          stripe_price_id: string
          stripe_product_id: string
          therapist_profile_id: string
          type: string
          updated_at: string
        }
        Insert: {
          billing_interval?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price_amount: number
          session_quota?: number | null
          stripe_price_id: string
          stripe_product_id: string
          therapist_profile_id: string
          type: string
          updated_at?: string
        }
        Update: {
          billing_interval?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_amount?: number
          session_quota?: number | null
          stripe_price_id?: string
          stripe_product_id?: string
          therapist_profile_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_services_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never