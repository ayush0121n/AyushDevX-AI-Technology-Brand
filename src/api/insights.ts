/**
 * AyushDevX — Insights API
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Public — Fetch published insights
// ─────────────────────────────────────────────────────────────────────────────

export const fetchPublishedInsights = async () => {
  const { supabase } = await import("@/lib/supabase/client");

  const { data, error } = await supabase
    .from("insights")
    .select(
      `id, slug, title, category, published_date, read_time, summary, tags, featured`
    )
    .order("published_date", { ascending: false });

  if (error) {
    console.error("[insights] fetchPublishedInsights error:", error.message);
    return { insights: [], error: error.message };
  }

  return { insights: data ?? [], error: null };
};
