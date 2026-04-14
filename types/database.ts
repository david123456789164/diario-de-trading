export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          preferred_currency: string;
          approved: boolean;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          preferred_currency?: string;
          approved?: boolean;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          preferred_currency?: string;
          approved?: boolean;
          approved_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      pending_signups: {
        Row: {
          id: string;
          name: string;
          email: string;
          password_encrypted: string | null;
          password_nonce: string | null;
          status: "pending" | "approved" | "rejected";
          created_at: string;
          approved_at: string | null;
          approved_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          password_encrypted?: string | null;
          password_nonce?: string | null;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
        };
        Update: {
          name?: string;
          email?: string;
          password_encrypted?: string | null;
          password_nonce?: string | null;
          status?: "pending" | "approved" | "rejected";
          approved_at?: string | null;
          approved_by?: string | null;
        };
        Relationships: [];
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          ticker: string;
          asset_type: string;
          direction: string;
          setup: string;
          entry_date: string;
          exit_date: string | null;
          entry_price: number;
          exit_price: number | null;
          initial_stop_loss: number | null;
          initial_take_profit: number | null;
          quantity: number;
          fees: number;
          account_size: number | null;
          planned_risk_amount: number | null;
          thesis: string | null;
          notes: string | null;
          mistakes: string | null;
          lesson_learned: string | null;
          status: string;
          tags: string[] | null;
          screenshot_path: string | null;
          screenshot_file_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          ticker: string;
          asset_type: string;
          direction: string;
          setup: string;
          entry_date: string;
          exit_date?: string | null;
          entry_price: number;
          exit_price?: number | null;
          initial_stop_loss?: number | null;
          initial_take_profit?: number | null;
          quantity: number;
          fees?: number;
          account_size?: number | null;
          planned_risk_amount?: number | null;
          thesis?: string | null;
          notes?: string | null;
          mistakes?: string | null;
          lesson_learned?: string | null;
          status: string;
          tags?: string[] | null;
          screenshot_path?: string | null;
          screenshot_file_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          ticker?: string;
          asset_type?: string;
          direction?: string;
          setup?: string;
          entry_date?: string;
          exit_date?: string | null;
          entry_price?: number;
          exit_price?: number | null;
          initial_stop_loss?: number | null;
          initial_take_profit?: number | null;
          quantity?: number;
          fees?: number;
          account_size?: number | null;
          planned_risk_amount?: number | null;
          thesis?: string | null;
          notes?: string | null;
          mistakes?: string | null;
          lesson_learned?: string | null;
          status?: string;
          tags?: string[] | null;
          screenshot_path?: string | null;
          screenshot_file_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      seed_demo_trades: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type PendingSignupRow = Database["public"]["Tables"]["pending_signups"]["Row"];
export type TradeRow = Database["public"]["Tables"]["trades"]["Row"];
export type TradeInsert = Database["public"]["Tables"]["trades"]["Insert"];
export type TradeUpdate = Database["public"]["Tables"]["trades"]["Update"];
