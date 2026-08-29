export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      college_classifications_verified: {
        Row: {
          classification_status: string
          college_name: string
          created_at: string | null
          id: string
          indicator_value: string | null
          last_verified: string | null
          official_indicator: string | null
          source_url: string | null
        }
        Insert: {
          classification_status?: string
          college_name: string
          created_at?: string | null
          id?: string
          indicator_value?: string | null
          last_verified?: string | null
          official_indicator?: string | null
          source_url?: string | null
        }
        Update: {
          classification_status?: string
          college_name?: string
          created_at?: string | null
          id?: string
          indicator_value?: string | null
          last_verified?: string | null
          official_indicator?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      colleges: {
        Row: {
          branches_offered: string
          city: string
          college_name: string
          created_at: string | null
          district: string
          id: string
          short_description: string | null
          tier_tag: string
          university_affiliation: string
          website_link: string
        }
        Insert: {
          branches_offered: string
          city: string
          college_name: string
          created_at?: string | null
          district: string
          id?: string
          short_description?: string | null
          tier_tag: string
          university_affiliation: string
          website_link: string
        }
        Update: {
          branches_offered?: string
          city?: string
          college_name?: string
          created_at?: string | null
          district?: string
          id?: string
          short_description?: string | null
          tier_tag?: string
          university_affiliation?: string
          website_link?: string
        }
        Relationships: []
      }
      colleges_official_2026: {
        Row: {
          branches_offered: string | null
          city: string | null
          college_name: string
          created_at: string | null
          district: string | null
          id: string
          last_verified: string | null
          official_source_url: string | null
          official_website_url: string | null
          university_affiliation: string | null
        }
        Insert: {
          branches_offered?: string | null
          city?: string | null
          college_name: string
          created_at?: string | null
          district?: string | null
          id?: string
          last_verified?: string | null
          official_source_url?: string | null
          official_website_url?: string | null
          university_affiliation?: string | null
        }
        Update: {
          branches_offered?: string | null
          city?: string | null
          college_name?: string
          created_at?: string | null
          district?: string | null
          id?: string
          last_verified?: string | null
          official_source_url?: string | null
          official_website_url?: string | null
          university_affiliation?: string | null
        }
        Relationships: []
      }
      cutoffs: {
        Row: {
          branch: string
          category: string
          closing_percentile: number
          college_name: string
          created_at: string | null
          id: string
          round: string
          year: number
        }
        Insert: {
          branch: string
          category: string
          closing_percentile: number
          college_name: string
          created_at?: string | null
          id?: string
          round: string
          year: number
        }
        Update: {
          branch?: string
          category?: string
          closing_percentile?: number
          college_name?: string
          created_at?: string | null
          id?: string
          round?: string
          year?: number
        }
        Relationships: []
      }
      cutoffs_official_2026: {
        Row: {
          academic_year: string
          branch: string | null
          candidature_type: string | null
          cap_round: string | null
          category: string | null
          closing_percentile: number | null
          college_name: string
          created_at: string | null
          data_status: string
          id: string
          last_verified: string | null
          source_url: string
        }
        Insert: {
          academic_year: string
          branch?: string | null
          candidature_type?: string | null
          cap_round?: string | null
          category?: string | null
          closing_percentile?: number | null
          college_name: string
          created_at?: string | null
          data_status?: string
          id?: string
          last_verified?: string | null
          source_url: string
        }
        Update: {
          academic_year?: string
          branch?: string | null
          candidature_type?: string | null
          cap_round?: string | null
          category?: string | null
          closing_percentile?: number | null
          college_name?: string
          created_at?: string | null
          data_status?: string
          id?: string
          last_verified?: string | null
          source_url?: string
        }
        Relationships: []
      }
      important_dates: {
        Row: {
          activity: string
          created_at: string | null
          end_date: string
          id: string
          link: string
          round: string
          start_date: string
          status: string
        }
        Insert: {
          activity: string
          created_at?: string | null
          end_date: string
          id?: string
          link: string
          round: string
          start_date: string
          status: string
        }
        Update: {
          activity?: string
          created_at?: string | null
          end_date?: string
          id?: string
          link?: string
          round?: string
          start_date?: string
          status?: string
        }
        Relationships: []
      }
      post_cap_updates_official: {
        Row: {
          college_name: string
          created_at: string | null
          id: string
          last_verified: string | null
          notice_url: string | null
          published_date: string | null
          status: string
          update_title: string | null
          update_type: string | null
        }
        Insert: {
          college_name: string
          created_at?: string | null
          id?: string
          last_verified?: string | null
          notice_url?: string | null
          published_date?: string | null
          status?: string
          update_title?: string | null
          update_type?: string | null
        }
        Update: {
          college_name?: string
          created_at?: string | null
          id?: string
          last_verified?: string | null
          notice_url?: string | null
          published_date?: string | null
          status?: string
          update_title?: string | null
          update_type?: string | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const
