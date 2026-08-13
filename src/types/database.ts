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
    PostgrestVersion: "14.15"
  }
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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      analytics_daily_events: {
        Row: {
          dimension_1: string
          dimension_2: string
          event_count: number
          event_date: string
          event_name: string
          last_seen_at: string
        }
        Insert: {
          dimension_1?: string
          dimension_2?: string
          event_count?: number
          event_date?: string
          event_name: string
          last_seen_at?: string
        }
        Update: {
          dimension_1?: string
          dimension_2?: string
          event_count?: number
          event_date?: string
          event_name?: string
          last_seen_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      catalog_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          changed_at: string
          entity_id: string
          entity_type: string
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          changed_at?: string
          entity_id: string
          entity_type: string
          id?: never
        }
        Update: {
          action?: string
          actor_id?: string | null
          changed_at?: string
          entity_id?: string
          entity_type?: string
          id?: never
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          icon_name: string
          id: string
          image_path: string | null
          is_listed: boolean
          is_published: boolean
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          icon_name: string
          id: string
          image_path?: string | null
          is_listed?: boolean
          is_published?: boolean
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          icon_name?: string
          id?: string
          image_path?: string | null
          is_listed?: boolean
          is_published?: boolean
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      product_collections: {
        Row: {
          collection_id: string
          display_order: number
          product_id: string
        }
        Insert: {
          collection_id: string
          display_order?: number
          product_id: string
        }
        Update: {
          collection_id?: string
          display_order?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_collections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string
          created_at: string
          display_order: number
          height: number
          id: string
          product_id: string
          storage_path: string
          variant: string
          width: number
        }
        Insert: {
          alt_text: string
          created_at?: string
          display_order?: number
          height: number
          id: string
          product_id: string
          storage_path: string
          variant: string
          width: number
        }
        Update: {
          alt_text?: string
          created_at?: string
          display_order?: number
          height?: number
          id?: string
          product_id?: string
          storage_path?: string
          variant?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          id: string
          is_featured: boolean
          name: string
          price: number
          seo_description: string | null
          seo_title: string | null
          sku: string
          slug: string
          status: string
          theme: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          id: string
          is_featured?: boolean
          name: string
          price: number
          seo_description?: string | null
          seo_title?: string | null
          sku: string
          slug: string
          status?: string
          theme?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          id?: string
          is_featured?: boolean
          name?: string
          price?: number
          seo_description?: string | null
          seo_title?: string | null
          sku?: string
          slug?: string
          status?: string
          theme?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      site_content_sections: {
        Row: {
          body: string
          content_key: string
          created_at: string
          created_by: string | null
          display_order: number
          icon_name: string | null
          kind: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body: string
          content_key: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          icon_name?: string | null
          kind: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: string
          content_key?: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          icon_name?: string | null
          kind?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_display_name: string
          created_at: string
          created_by: string | null
          display_order: number
          id: number
          photo_consent_reference: string | null
          photo_path: string | null
          quote: string
          rating: number
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          author_display_name: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: never
          photo_consent_reference?: string | null
          photo_path?: string | null
          quote: string
          rating: number
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          author_display_name?: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: never
          photo_consent_reference?: string | null
          photo_path?: string | null
          quote?: string
          rating?: number
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_site_content: { Args: never; Returns: Database['public']['Tables']['site_content_sections']['Row'][] }
      get_admin_testimonials: { Args: never; Returns: Database['public']['Tables']['testimonials']['Row'][] }
      is_catalog_admin: { Args: never; Returns: boolean }
      record_catalog_event: {
        Args: {
          p_dimension_1?: string
          p_dimension_2?: string
          p_event_name: string
        }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
