/**
 * AyushDevX — Supabase Database Types
 *
 * Auto-generate this file by running:
 *   npx supabase gen types typescript --project-id zkgixwywetajnogrihfy > src/lib/supabase/types.ts
 *
 * Until then, this file provides a typed placeholder.
 */

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
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "user" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "admin";
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          long_description: string | null;
          problem: string | null;
          solution: string | null;
          challenges: string | null;
          results: string | null;
          future_improvements: string | null;
          image_url: string | null;
          demo_url: string | null;
          github_url: string | null;
          case_study_url: string | null;
          technologies: string[];
          status: "draft" | "published";
          featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          long_description?: string | null;
          problem?: string | null;
          solution?: string | null;
          challenges?: string | null;
          results?: string | null;
          future_improvements?: string | null;
          image_url?: string | null;
          demo_url?: string | null;
          github_url?: string | null;
          case_study_url?: string | null;
          technologies?: string[];
          status?: "draft" | "published";
          featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          tagline: string | null;
          description: string | null;
          features: string[];
          icon: string | null;
          image_url: string | null;
          demo_url: string | null;
          status: "draft" | "published" | "coming_soon";
          featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          tagline?: string | null;
          description?: string | null;
          features?: string[];
          icon?: string | null;
          image_url?: string | null;
          demo_url?: string | null;
          status?: "draft" | "published" | "coming_soon";
          featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      resource_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          color: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["resource_categories"]["Insert"]
        >;
      };
      resources: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category_id: string | null;
          file_url: string | null;
          file_size: number | null;
          file_type: string | null;
          thumbnail_url: string | null;
          tags: string[];
          download_count: number;
          status: "draft" | "published";
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category_id?: string | null;
          file_url?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          thumbnail_url?: string | null;
          tags?: string[];
          download_count?: number;
          status?: "draft" | "published";
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["resources"]["Insert"]>;
      };
      blogs: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string | null;
          image_url: string | null;
          category: string | null;
          tags: string[];
          reading_time: number;
          status: "draft" | "published";
          featured: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content?: string | null;
          image_url?: string | null;
          category?: string | null;
          tags?: string[];
          reading_time?: number;
          status?: "draft" | "published";
          featured?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blogs"]["Insert"]>;
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string | null;
          message: string;
          status: "unread" | "read" | "replied";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject?: string | null;
          message: string;
          status?: "unread" | "read" | "replied";
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["contact_messages"]["Insert"]
        >;
      };
      certificates: {
        Row: {
          id: string;
          title: string;
          issuer: string;
          issue_date: string | null;
          credential_url: string | null;
          image_url: string | null;
          description: string | null;
          skills: string[];
          status: "draft" | "published";
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          issuer: string;
          issue_date?: string | null;
          credential_url?: string | null;
          image_url?: string | null;
          description?: string | null;
          skills?: string[];
          status?: "draft" | "published";
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["certificates"]["Insert"]>;
      };
      conversations: {
        Row: {
          id: string;
          session_id: string;
          tool: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          tool: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["conversations"]["Insert"]
        >;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string | null;
          role: "user" | "assistant";
          content: string;
          sources: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id?: string | null;
          role: "user" | "assistant";
          content: string;
          sources?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ─── Convenience type aliases ──────────────────────────────────────────────

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ResourceCategory =
  Database["public"]["Tables"]["resource_categories"]["Row"];
export type Resource = Database["public"]["Tables"]["resources"]["Row"];
export type Blog = Database["public"]["Tables"]["blogs"]["Row"];
export type ContactMessage =
  Database["public"]["Tables"]["contact_messages"]["Row"];
export type Certificate = Database["public"]["Tables"]["certificates"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
