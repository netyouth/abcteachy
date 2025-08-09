export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      booking_audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["booking_action"]
          actor_id: string | null
          actor_role: string | null
          booking_id: string
          created_at: string
          details: Json
          id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["booking_action"]
          actor_id?: string | null
          actor_role?: string | null
          booking_id: string
          created_at?: string
          details?: Json
          id?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["booking_action"]
          actor_id?: string | null
          actor_role?: string | null
          booking_id?: string
          created_at?: string
          details?: Json
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_audit_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string
          created_by: string | null
          end_at: string
          feedback: string | null
          id: string
          join_link: string | null
          metadata: Json
          rescheduled_from_id: string | null
          start_at: string
          status: Database["public"]["Enums"]["booking_status"]
          student_id: string
          student_notes: string | null
          teacher_id: string
          teacher_notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_at: string
          feedback?: string | null
          id?: string
          join_link?: string | null
          metadata?: Json
          rescheduled_from_id?: string | null
          start_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_id: string
          student_notes?: string | null
          teacher_id: string
          teacher_notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_at?: string
          feedback?: string | null
          id?: string
          join_link?: string | null
          metadata?: Json
          rescheduled_from_id?: string | null
          start_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_id?: string
          student_notes?: string | null
          teacher_id?: string
          teacher_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_rescheduled_from_id_fkey"
            columns: ["rescheduled_from_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          room_name: string
          sender_id: string
          sender_role: Database["public"]["Enums"]["user_role"]
          sequence_number: number
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          room_name: string
          sender_id: string
          sender_role: Database["public"]["Enums"]["user_role"]
          sequence_number: number
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          room_name?: string
          sender_id?: string
          sender_role?: Database["public"]["Enums"]["user_role"]
          sequence_number?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          student_id: string | null
          teacher_id: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          student_id?: string | null
          teacher_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          student_id?: string | null
          teacher_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      student_teacher_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          is_active: boolean
          student_id: string
          teacher_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          student_id: string
          teacher_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_teacher_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_teacher_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_teacher_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_availability: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_active: boolean
          slot_minutes: number
          start_time: string
          teacher_id: string
          timezone: string
          updated_at: string
          weekday: number
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_active?: boolean
          slot_minutes?: number
          start_time: string
          teacher_id: string
          timezone?: string
          updated_at?: string
          weekday: number
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean
          slot_minutes?: number
          start_time?: string
          teacher_id?: string
          timezone?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "teacher_availability_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_unavailability: {
        Row: {
          created_at: string
          end_at: string
          id: string
          reason: string | null
          start_at: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_at: string
          id?: string
          reason?: string | null
          start_at: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_at?: string
          id?: string
          reason?: string | null
          start_at?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_unavailability_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
      get_available_chat_users: {
        Args: { target_role_param: Database["public"]["Enums"]["user_role"] }
        Returns: {
          id: string
          full_name: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_admin_dashboard_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_chat_messages: {
        Args: { room_name_param: string; limit_param?: number }
        Returns: {
          id: string
          room_name: string
          sender_id: string
          sender_name: string
          sender_role: Database["public"]["Enums"]["user_role"]
          content: string
          sequence_number: number
          created_at: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_conversations: {
        Args: { limit_param?: number }
        Returns: {
          room_name: string
          other_user_id: string
          other_full_name: string
          other_role: Database["public"]["Enums"]["user_role"]
          last_message: string
          last_message_at: string
        }[]
      }
      get_or_create_conversation: {
        Args: { p_student_id: string; p_teacher_id: string }
        Returns: string
      }
      get_user_profile: {
        Args: { user_id: string }
        Returns: {
          id: string
          full_name: string
          avatar_url: string
          role: Database["public"]["Enums"]["user_role"]
          created_at: string
          updated_at: string
        }[]
      }
      get_teacher_unavailable_times: {
        Args: { p_teacher_id: string; p_day_start: string; p_day_end: string }
        Returns: { start_at: string; end_at: string }[]
      }
      get_teacher_booked_times: {
        Args: { p_teacher_id: string; p_day_start: string; p_day_end: string }
        Returns: { start_at: string; end_at: string }[]
      }
      get_teacher_day_schedule: {
        Args: { p_teacher_id: string; p_day_start: string; p_day_end: string }
        Returns: { id: string; start_at: string; end_at: string; status: Database["public"]["Enums"]["booking_status"]; created_at: string; updated_at: string }[]
      }
      get_teacher_bookings: {
        Args: { p_teacher_id: string; p_from?: string; p_to?: string }
        Returns: Tables<'bookings'>[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      create_booking: {
        Args: { p_student_id: string; p_teacher_id: string; p_start_at: string; p_end_at: string; p_created_by?: string }
        Returns: string
      }
      get_student_bookings: {
        Args: { p_student_id: string; p_from?: string; p_to?: string }
        Returns: Tables<'bookings'>[]
      }
      update_booking_status: {
        Args: { p_booking_id: string; p_status: string }
        Returns: void
      }
    }
    Enums: {
      booking_action:
        | "created"
        | "updated"
        | "canceled"
        | "completed"
        | "rescheduled"
        | "assigned"
        | "status_changed"
      booking_status:
        | "pending"
        | "confirmed"
        | "canceled"
        | "completed"
        | "rescheduled"
      user_role: "student" | "teacher" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["student", "teacher", "admin"],
    },
  },
} as const

// Export simplified types for easy use
export type UserRole = Database["public"]["Enums"]["user_role"]
export type Profile = Tables<"profiles">
export type ChatMessage = Tables<"chat_messages">
export type Conversation = Tables<"conversations">
export type Message = Tables<"messages">