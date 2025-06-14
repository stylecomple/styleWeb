export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      active_discounts: {
        Row: {
          created_at: string
          created_by: string
          discount_percentage: number
          discount_type: string
          id: string
          is_active: boolean
          target_value: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          discount_percentage: number
          discount_type: string
          id?: string
          is_active?: boolean
          target_value?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          discount_percentage?: number
          discount_type?: string
          id?: string
          is_active?: boolean
          target_value?: string | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          app_logo_url: string | null
          created_at: string
          email_receiver: string | null
          favicon_url: string | null
          hide_lovable_banner: boolean | null
          id: string
          is_store_open: boolean
          notification_sound_url: string | null
          theme_config: Json | null
          updated_at: string
          visa_card_config: Json | null
          zain_cash_config: Json | null
        }
        Insert: {
          app_logo_url?: string | null
          created_at?: string
          email_receiver?: string | null
          favicon_url?: string | null
          hide_lovable_banner?: boolean | null
          id?: string
          is_store_open?: boolean
          notification_sound_url?: string | null
          theme_config?: Json | null
          updated_at?: string
          visa_card_config?: Json | null
          zain_cash_config?: Json | null
        }
        Update: {
          app_logo_url?: string | null
          created_at?: string
          email_receiver?: string | null
          favicon_url?: string | null
          hide_lovable_banner?: boolean | null
          id?: string
          is_store_open?: boolean
          notification_sound_url?: string | null
          theme_config?: Json | null
          updated_at?: string
          visa_card_config?: Json | null
          zain_cash_config?: Json | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          icon: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon: string
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      changes_log: {
        Row: {
          action_type: string
          admin_id: string
          admin_name: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action_type: string
          admin_id: string
          admin_name?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action_type?: string
          admin_id?: string
          admin_name?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          rating: number | null
          status: string | null
          subject: string
          updated_at: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          rating?: number | null
          status?: string | null
          subject: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          rating?: number | null
          status?: string | null
          subject?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          selected_color: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          selected_color?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
          selected_color?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          governorate: string | null
          id: string
          payment_method: string | null
          phone: string | null
          shipping_address: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          governorate?: string | null
          id?: string
          payment_method?: string | null
          phone?: string | null
          shipping_address?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          governorate?: string | null
          id?: string
          payment_method?: string | null
          phone?: string | null
          shipping_address?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          categories: string[] | null
          colors: string[] | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          images: string[] | null
          is_active: boolean | null
          name: string
          options: Json | null
          price: number
          stock_quantity: number | null
          subcategories: string[] | null
          updated_at: string | null
        }
        Insert: {
          categories?: string[] | null
          colors?: string[] | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name: string
          options?: Json | null
          price: number
          stock_quantity?: number | null
          subcategories?: string[] | null
          updated_at?: string | null
        }
        Update: {
          categories?: string[] | null
          colors?: string[] | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name?: string
          options?: Json | null
          price?: number
          stock_quantity?: number | null
          subcategories?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string | null
          icon: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          icon: string
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          icon?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_active_discounts: {
        Args: { product_ids?: string[] }
        Returns: undefined
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      manage_discount_category: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_all_product_discounts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_all_products_discount: {
        Args: { new_discount: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user" | "owner" | "order_manager" | "products_adder"
      product_category:
        | "makeup"
        | "perfumes"
        | "flowers"
        | "home"
        | "personal_care"
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

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "owner", "order_manager", "products_adder"],
      product_category: [
        "makeup",
        "perfumes",
        "flowers",
        "home",
        "personal_care",
      ],
    },
  },
} as const
