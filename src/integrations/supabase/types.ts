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
      admin_access_denials: {
        Row: {
          admin_role: string | null
          attempted_email: string | null
          created_at: string
          id: string
          path: string | null
          reason: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          admin_role?: string | null
          attempted_email?: string | null
          created_at?: string
          id?: string
          path?: string | null
          reason: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          admin_role?: string | null
          attempted_email?: string | null
          created_at?: string
          id?: string
          path?: string | null
          reason?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          notes: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          notes?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      business_hours_overrides: {
        Row: {
          close_time: string | null
          created_at: string
          holiday_key: string | null
          id: string
          label: string | null
          note: string | null
          open_time: string | null
          override_date: string
          status: Database["public"]["Enums"]["hours_override_status"]
          updated_at: string
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          holiday_key?: string | null
          id?: string
          label?: string | null
          note?: string | null
          open_time?: string | null
          override_date: string
          status?: Database["public"]["Enums"]["hours_override_status"]
          updated_at?: string
        }
        Update: {
          close_time?: string | null
          created_at?: string
          holiday_key?: string | null
          id?: string
          label?: string | null
          note?: string | null
          open_time?: string | null
          override_date?: string
          status?: Database["public"]["Enums"]["hours_override_status"]
          updated_at?: string
        }
        Relationships: []
      }
      business_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      catering_inquiries: {
        Row: {
          budget_range: string | null
          created_at: string
          email: string
          event_date: string | null
          event_location: string | null
          event_time: string | null
          food_requested: string | null
          guest_count: number | null
          id: string
          message: string | null
          name: string
          phone: string
          service_type: string | null
          status: string
        }
        Insert: {
          budget_range?: string | null
          created_at?: string
          email: string
          event_date?: string | null
          event_location?: string | null
          event_time?: string | null
          food_requested?: string | null
          guest_count?: number | null
          id?: string
          message?: string | null
          name: string
          phone: string
          service_type?: string | null
          status?: string
        }
        Update: {
          budget_range?: string | null
          created_at?: string
          email?: string
          event_date?: string | null
          event_location?: string | null
          event_time?: string | null
          food_requested?: string | null
          guest_count?: number | null
          id?: string
          message?: string | null
          name?: string
          phone?: string
          service_type?: string | null
          status?: string
        }
        Relationships: []
      }
      community_discounts: {
        Row: {
          allow_online_selection: boolean | null
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          eligible_groups: Json
          ends_at: string | null
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_subtotal: number | null
          requires_id_verification: boolean | null
          starts_at: string | null
          terms: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          allow_online_selection?: boolean | null
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value: number
          eligible_groups?: Json
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_subtotal?: number | null
          requires_id_verification?: boolean | null
          starts_at?: string | null
          terms?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          allow_online_selection?: boolean | null
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          eligible_groups?: Json
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_subtotal?: number | null
          requires_id_verification?: boolean | null
          starts_at?: string | null
          terms?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          customer_name: string
          email: string | null
          id: string
          message: string
          phone: string | null
          status: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          email?: string | null
          id?: string
          message: string
          phone?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          email?: string | null
          id?: string
          message?: string
          phone?: string | null
          status?: string
        }
        Relationships: []
      }
      content_overrides: {
        Row: {
          content_key: string
          content_value: Json
          created_at: string
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content_key: string
          content_value?: Json
          created_at?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content_key?: string
          content_value?: Json
          created_at?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      holiday_events: {
        Row: {
          banner_message: string | null
          banner_title: string | null
          business_status: string | null
          close_time: string | null
          created_at: string | null
          display_order: number | null
          holiday_date: string
          holiday_name: string
          holiday_type: string
          id: string
          is_active: boolean | null
          open_time: string | null
          special_id: string | null
          updated_at: string | null
        }
        Insert: {
          banner_message?: string | null
          banner_title?: string | null
          business_status?: string | null
          close_time?: string | null
          created_at?: string | null
          display_order?: number | null
          holiday_date: string
          holiday_name: string
          holiday_type?: string
          id?: string
          is_active?: boolean | null
          open_time?: string | null
          special_id?: string | null
          updated_at?: string | null
        }
        Update: {
          banner_message?: string | null
          banner_title?: string | null
          business_status?: string | null
          close_time?: string | null
          created_at?: string | null
          display_order?: number | null
          holiday_date?: string
          holiday_name?: string
          holiday_type?: string
          id?: string
          is_active?: boolean | null
          open_time?: string | null
          special_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "holiday_events_special_id_fkey"
            columns: ["special_id"]
            isOneToOne: false
            referencedRelation: "specials"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_visible: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_visible?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_visible?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_item_options: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_required: boolean
          menu_item_id: string
          option_group: string
          option_name: string
          price_adjustment: number
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_required?: boolean
          menu_item_id: string
          option_group: string
          option_name: string
          price_adjustment?: number
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_required?: boolean
          menu_item_id?: string
          option_group?: string
          option_name?: string
          price_adjustment?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_options_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allow_notes: boolean
          category_id: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_available: boolean
          is_featured: boolean
          is_popular: boolean
          is_sold_out: boolean
          name: string
          online_ordering_enabled: boolean
          price: number | null
          price_alt: number | null
          price_label: string | null
          requires_options: boolean
          updated_at: string
        }
        Insert: {
          allow_notes?: boolean
          category_id: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          is_popular?: boolean
          is_sold_out?: boolean
          name: string
          online_ordering_enabled?: boolean
          price?: number | null
          price_alt?: number | null
          price_label?: string | null
          requires_options?: boolean
          updated_at?: string
        }
        Update: {
          allow_notes?: boolean
          category_id?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          is_popular?: boolean
          is_sold_out?: boolean
          name?: string
          online_ordering_enabled?: boolean
          price?: number | null
          price_alt?: number | null
          price_label?: string | null
          requires_options?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_name: string
          line_total: number
          menu_item_id: string | null
          notes: string | null
          order_id: string
          quantity: number
          selected_options: Json
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          line_total?: number
          menu_item_id?: string | null
          notes?: string | null
          order_id: string
          quantity?: number
          selected_options?: Json
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          line_total?: number
          menu_item_id?: string | null
          notes?: string | null
          order_id?: string
          quantity?: number
          selected_options?: Json
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          community_group: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          delivery_fee: number
          discount_amount: number | null
          discount_id: string | null
          discount_name: string | null
          discount_status: string | null
          discount_verified_at: string | null
          discount_verified_by: string | null
          heroes_acknowledged: boolean
          heroes_discount_amount: number
          heroes_discount_status:
            | Database["public"]["Enums"]["heroes_status"]
            | null
          heroes_group: string | null
          id: string
          notes: string | null
          order_number: string | null
          order_type: string
          payment_status: string
          pickup_time: string | null
          service_fee: number
          status: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subtotal: number
          tax: number
          tip: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          community_group?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          delivery_fee?: number
          discount_amount?: number | null
          discount_id?: string | null
          discount_name?: string | null
          discount_status?: string | null
          discount_verified_at?: string | null
          discount_verified_by?: string | null
          heroes_acknowledged?: boolean
          heroes_discount_amount?: number
          heroes_discount_status?:
            | Database["public"]["Enums"]["heroes_status"]
            | null
          heroes_group?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          order_type?: string
          payment_status?: string
          pickup_time?: string | null
          service_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          tax?: number
          tip?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          community_group?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          delivery_fee?: number
          discount_amount?: number | null
          discount_id?: string | null
          discount_name?: string | null
          discount_status?: string | null
          discount_verified_at?: string | null
          discount_verified_by?: string | null
          heroes_acknowledged?: boolean
          heroes_discount_amount?: number
          heroes_discount_status?:
            | Database["public"]["Enums"]["heroes_status"]
            | null
          heroes_group?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          order_type?: string
          payment_status?: string
          pickup_time?: string | null
          service_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          tax?: number
          tip?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          must_change_password: boolean
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          must_change_password?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          must_change_password?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      review_likes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_likes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          is_approved: boolean
          likes_count: number
          photo_url: string | null
          rating: number
          title: string | null
          user_id: string | null
        }
        Insert: {
          author_name: string
          body: string
          created_at?: string
          id?: string
          is_approved?: boolean
          likes_count?: number
          photo_url?: string | null
          rating: number
          title?: string | null
          user_id?: string | null
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          likes_count?: number
          photo_url?: string | null
          rating?: number
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      special_items: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          included_sides: number | null
          is_active: boolean | null
          item_name: string
          menu_item_id: string | null
          regular_price: number | null
          selected_options: Json | null
          special_id: string | null
          special_price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          included_sides?: number | null
          is_active?: boolean | null
          item_name: string
          menu_item_id?: string | null
          regular_price?: number | null
          selected_options?: Json | null
          special_id?: string | null
          special_price: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          included_sides?: number | null
          is_active?: boolean | null
          item_name?: string
          menu_item_id?: string | null
          regular_price?: number | null
          selected_options?: Json | null
          special_id?: string | null
          special_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "special_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "special_items_special_id_fkey"
            columns: ["special_id"]
            isOneToOne: false
            referencedRelation: "specials"
            referencedColumns: ["id"]
          },
        ]
      }
      specials: {
        Row: {
          all_day_orderable: boolean
          available_from: string | null
          available_until: string | null
          created_at: string
          description: string | null
          display_order: number
          end_time: string | null
          holiday_key: string | null
          id: string
          image_url: string | null
          is_active: boolean
          regular_price: number | null
          sold_out: boolean
          special_price: number
          start_time: string | null
          title: string
          type: Database["public"]["Enums"]["special_type"]
          updated_at: string
          weekdays: number[] | null
        }
        Insert: {
          all_day_orderable?: boolean
          available_from?: string | null
          available_until?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          end_time?: string | null
          holiday_key?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          regular_price?: number | null
          sold_out?: boolean
          special_price: number
          start_time?: string | null
          title: string
          type: Database["public"]["Enums"]["special_type"]
          updated_at?: string
          weekdays?: number[] | null
        }
        Update: {
          all_day_orderable?: boolean
          available_from?: string | null
          available_until?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          end_time?: string | null
          holiday_key?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          regular_price?: number | null
          sold_out?: boolean
          special_price?: number
          start_time?: string | null
          title?: string
          type?: Database["public"]["Enums"]["special_type"]
          updated_at?: string
          weekdays?: number[] | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      admin_level: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_active_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "customer" | "super_admin"
      heroes_status: "pending_verification" | "verified" | "removed"
      hours_override_status: "open" | "closed" | "special_hours"
      order_status:
        | "pending"
        | "pending_payment"
        | "confirmed"
        | "preparing"
        | "ready"
        | "out_for_delivery"
        | "completed"
        | "cancelled"
        | "refunded"
      special_type: "daily" | "lunch" | "holiday" | "featured" | "catering"
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
      app_role: ["admin", "customer", "super_admin"],
      heroes_status: ["pending_verification", "verified", "removed"],
      hours_override_status: ["open", "closed", "special_hours"],
      order_status: [
        "pending",
        "pending_payment",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "completed",
        "cancelled",
        "refunded",
      ],
      special_type: ["daily", "lunch", "holiday", "featured", "catering"],
    },
  },
} as const
