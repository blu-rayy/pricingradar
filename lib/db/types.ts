// Database types for Supabase
// These match the schema defined in schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      competitors: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          marketplace: string;
          base_url: string | null;
          scrape_frequency: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          marketplace: string;
          base_url?: string | null;
          scrape_frequency?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          marketplace?: string;
          base_url?: string | null;
          scrape_frequency?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          sku: string;
          name: string;
          description: string | null;
          current_price: number;
          currency: string;
          category: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sku: string;
          name: string;
          description?: string | null;
          current_price: number;
          currency?: string;
          category?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sku?: string;
          name?: string;
          description?: string | null;
          current_price?: number;
          currency?: string;
          category?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      competitor_products: {
        Row: {
          id: string;
          competitor_id: string;
          url: string;
          external_id: string | null;
          name: string | null;
          current_price: number | null;
          currency: string;
          image_url: string | null;
          seller_name: string | null;
          rating: number | null;
          review_count: number | null;
          in_stock: boolean;
          last_scraped_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          competitor_id: string;
          url: string;
          external_id?: string | null;
          name?: string | null;
          current_price?: number | null;
          currency?: string;
          image_url?: string | null;
          seller_name?: string | null;
          rating?: number | null;
          review_count?: number | null;
          in_stock?: boolean;
          last_scraped_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          competitor_id?: string;
          url?: string;
          external_id?: string | null;
          name?: string | null;
          current_price?: number | null;
          currency?: string;
          image_url?: string | null;
          seller_name?: string | null;
          rating?: number | null;
          review_count?: number | null;
          in_stock?: boolean;
          last_scraped_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_mappings: {
        Row: {
          id: string;
          product_id: string;
          competitor_product_id: string;
          confidence_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          competitor_product_id: string;
          confidence_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          competitor_product_id?: string;
          confidence_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      price_history: {
        Row: {
          id: string;
          competitor_product_id: string;
          price: number;
          original_price: number | null;
          discount_percentage: number | null;
          currency: string;
          in_stock: boolean;
          scraped_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          competitor_product_id: string;
          price: number;
          original_price?: number | null;
          discount_percentage?: number | null;
          currency?: string;
          in_stock?: boolean;
          scraped_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          competitor_product_id?: string;
          price?: number;
          original_price?: number | null;
          discount_percentage?: number | null;
          currency?: string;
          in_stock?: boolean;
          scraped_at?: string;
          created_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          name: string;
          condition: string;
          threshold_value: number;
          product_id: string | null;
          competitor_id: string | null;
          notify_email: boolean;
          notify_slack: boolean;
          webhook_url: string | null;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          condition: string;
          threshold_value: number;
          product_id?: string | null;
          competitor_id?: string | null;
          notify_email?: boolean;
          notify_slack?: boolean;
          webhook_url?: string | null;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          condition?: string;
          threshold_value?: number;
          product_id?: string | null;
          competitor_id?: string | null;
          notify_email?: boolean;
          notify_slack?: boolean;
          webhook_url?: string | null;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      alert_logs: {
        Row: {
          id: string;
          alert_id: string;
          competitor_product_id: string;
          previous_price: number | null;
          current_price: number;
          change_percentage: number | null;
          message: string;
          suggested_action: string | null;
          is_read: boolean;
          triggered_at: string;
        };
        Insert: {
          id?: string;
          alert_id: string;
          competitor_product_id: string;
          previous_price?: number | null;
          current_price: number;
          change_percentage?: number | null;
          message: string;
          suggested_action?: string | null;
          is_read?: boolean;
          triggered_at?: string;
        };
        Update: {
          id?: string;
          alert_id?: string;
          competitor_product_id?: string;
          previous_price?: number | null;
          current_price?: number;
          change_percentage?: number | null;
          message?: string;
          suggested_action?: string | null;
          is_read?: boolean;
          triggered_at?: string;
        };
      };
      scrape_logs: {
        Row: {
          id: string;
          competitor_id: string | null;
          competitor_product_id: string | null;
          status: string;
          products_scraped: number;
          products_failed: number;
          error_message: string | null;
          duration_ms: number | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          competitor_id?: string | null;
          competitor_product_id?: string | null;
          status: string;
          products_scraped?: number;
          products_failed?: number;
          error_message?: string | null;
          duration_ms?: number | null;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          competitor_id?: string | null;
          competitor_product_id?: string | null;
          status?: string;
          products_scraped?: number;
          products_failed?: number;
          error_message?: string | null;
          duration_ms?: number | null;
          started_at?: string;
          completed_at?: string | null;
        };
      };
    };
    Views: {
      v_current_prices: {
        Row: {
          competitor_product_id: string;
          product_name: string | null;
          current_price: number | null;
          currency: string;
          in_stock: boolean;
          last_scraped_at: string | null;
          competitor_id: string;
          competitor_name: string;
          marketplace: string;
          internal_product_id: string | null;
          internal_product_name: string | null;
          internal_price: number | null;
          sku: string | null;
        };
      };
      v_price_comparison: {
        Row: {
          product_id: string;
          sku: string;
          product_name: string;
          your_price: number;
          currency: string;
          competitor_count: number;
          min_competitor_price: number | null;
          max_competitor_price: number | null;
          avg_competitor_price: number | null;
          price_vs_avg: number | null;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience types for table rows
export type Competitor = Database['public']['Tables']['competitors']['Row'];
export type CompetitorInsert = Database['public']['Tables']['competitors']['Insert'];
export type CompetitorUpdate = Database['public']['Tables']['competitors']['Update'];

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

export type CompetitorProduct = Database['public']['Tables']['competitor_products']['Row'];
export type CompetitorProductInsert = Database['public']['Tables']['competitor_products']['Insert'];
export type CompetitorProductUpdate = Database['public']['Tables']['competitor_products']['Update'];

export type ProductMapping = Database['public']['Tables']['product_mappings']['Row'];
export type ProductMappingInsert = Database['public']['Tables']['product_mappings']['Insert'];
export type ProductMappingUpdate = Database['public']['Tables']['product_mappings']['Update'];

export type PriceHistory = Database['public']['Tables']['price_history']['Row'];
export type PriceHistoryInsert = Database['public']['Tables']['price_history']['Insert'];

export type Alert = Database['public']['Tables']['alerts']['Row'];
export type AlertInsert = Database['public']['Tables']['alerts']['Insert'];
export type AlertUpdate = Database['public']['Tables']['alerts']['Update'];

export type AlertLog = Database['public']['Tables']['alert_logs']['Row'];
export type AlertLogInsert = Database['public']['Tables']['alert_logs']['Insert'];

export type ScrapeLog = Database['public']['Tables']['scrape_logs']['Row'];
export type ScrapeLogInsert = Database['public']['Tables']['scrape_logs']['Insert'];
export type ScrapeLogUpdate = Database['public']['Tables']['scrape_logs']['Update'];

// View types
export type CurrentPrice = Database['public']['Views']['v_current_prices']['Row'];
export type PriceComparison = Database['public']['Views']['v_price_comparison']['Row'];

