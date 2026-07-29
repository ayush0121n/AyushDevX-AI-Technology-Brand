/**
 * AyushDevX — Supabase exports
 *
 * Browser code:    import { supabase } from '@/lib/supabase'
 * Server code:     import { createAdminClient, createServerClient } from '@/lib/supabase'
 * Types:           import type { Project, Profile, ... } from '@/lib/supabase'
 */

export { supabase } from "./client";
export { createAdminClient, createServerClient } from "./server";
export type {
  Database,
  Json,
  Profile,
  Project,
  Product,
  ResourceCategory,
  Resource,
  Blog,
  ContactMessage,
  Certificate,
  Conversation,
  Message,
} from "./types";
