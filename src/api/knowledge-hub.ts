/**
 * AyushDevX — Knowledge Hub API
 *
 * All functions are TanStack Start server functions.
 * Admin mutations use the service-role client (bypass RLS).
 * Public queries use the anon client (RLS enforced).
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createAdminClient, createServerClient, createUntypedAdminClient } from "@/lib/supabase/server";

// ─────────────────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────────────────

const DownloadUrlSchema = z.object({
  resourceId: z.string().uuid(),
  storagePath: z.string().min(1),
});

const UploadResourceSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  categoryId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  fileBase64: z.string().min(1),
  fileName: z.string().min(1),
  fileSizeMb: z.number().max(15),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published"]).default("published"),
  accessToken: z.string(),
});

const UpdateStatusSchema = z.object({
  resourceId: z.string().uuid(),
  status: z.enum(["draft", "published"]),
  accessToken: z.string(),
});

const DeleteResourceSchema = z.object({
  resourceId: z.string().uuid(),
  storagePath: z.string().optional(),
  accessToken: z.string(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Auth Utilities
// ─────────────────────────────────────────────────────────────────────────────

async function verifyAdmin(accessToken: string) {
  const supabase = createServerClient(accessToken);
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error("Unauthorized: Invalid access token.");
  }
  
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
  const p = profile as { role: string } | null;
  if (profileError || p?.role !== "admin") {
    throw new Error("Forbidden: You do not have permission to perform this action.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public — Fetch published resources
// ─────────────────────────────────────────────────────────────────────────────

export const fetchPublishedResources = async () => {
  const { supabase } = await import("@/lib/supabase/client");

  const { data, error } = await supabase
    .from("resources")
    .select(
      `id, title, description, category_id, storage_path, file_url,
       file_size, file_type, tags, download_count, featured, created_at,
       resource_categories ( id, name, slug )`,
    )
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[knowledge-hub] fetchPublishedResources error:", error.message);
    return { resources: [], error: error.message };
  }

  return { resources: data ?? [], error: null };
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Fetch all resources
// ─────────────────────────────────────────────────────────────────────────────

export const fetchAllResources = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ accessToken: z.string() }).parse(data))
  .handler(async ({ data }) => {
    try {
      await verifyAdmin(data.accessToken);
    } catch (e: any) {
      return { resources: [], error: e.message };
    }

    const supabase = createAdminClient();

  const { data: resData, error } = await supabase
    .from("resources")
    .select(
      `id, title, description, category_id, storage_path, file_url,
       file_size, file_type, tags, download_count, status, featured,
       created_at, updated_at, resource_categories ( id, name, slug )`,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[knowledge-hub] fetchAllResources error:", error.message);
    return { resources: [], error: error.message };
  }

  return { resources: resData ?? [], error: null };
});

// ─────────────────────────────────────────────────────────────────────────────
// Public — Generate a signed download URL
// ─────────────────────────────────────────────────────────────────────────────

export const getDownloadUrl = async ({ data }: { data: { resourceId: string; storagePath: string } }): Promise<{ url: string | null; error: string | null }> => {
  const { supabase } = await import("@/lib/supabase/client");

  const { data: signedData, error } = await supabase.storage
    .from("knowledge-hub-pdfs")
    .createSignedUrl(data.storagePath, 3600);

  if (error || !signedData?.signedUrl) {
    console.error("[knowledge-hub] getDownloadUrl error:", error?.message);
    return { url: null, error: error?.message ?? "Failed to generate download URL" };
  }

  // Best effort increment download count via RPC if available, or just ignore for now
  supabase.rpc('increment_download_count', { res_id: data.resourceId }).then(() => {}).catch(() => {});

  return { url: signedData.signedUrl, error: null };
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Upload a new resource PDF
// ─────────────────────────────────────────────────────────────────────────────

export const adminUploadResource = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => UploadResourceSchema.parse(data))
  .handler(
    async ({
      data,
    }): Promise<{ success: boolean; resourceId?: string; error: string | null }> => {
      try {
        await verifyAdmin(data.accessToken);
      } catch (e: any) {
        return { success: false, error: e.message };
      }

      const supabase = createAdminClient();

      // Decode base64 to Uint8Array
      const base64Data = data.fileBase64.replace(
        /^data:application\/pdf;base64,/,
        "",
      );
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      // Sanitize filename
      const safeFileName = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `pdfs/${Date.now()}_${safeFileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("knowledge-hub-pdfs")
        .upload(storagePath, bytes, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        console.error("[knowledge-hub] Upload error:", uploadError.message);
        return { success: false, error: uploadError.message };
      }

      // Insert DB record using untyped client to avoid strict type inference issues
      const insertPayload = {
        title: data.title,
        description: data.description ?? null,
        category_id: data.categoryId ?? null,
        storage_path: storagePath,
        file_type: "PDF",
        file_size: Math.round(data.fileSizeMb * 1024 * 1024),
        tags: data.tags ?? [],
        status: data.status,
        featured: data.featured ?? false,
      };
      const untypedAdmin = createUntypedAdminClient();
      const { data: resource, error: insertError } = await untypedAdmin
        .from("resources")
        .insert([insertPayload])
        .select("id")
        .single();

      if (insertError) {
        console.error("[knowledge-hub] DB insert error:", insertError.message);
        await supabase.storage.from("knowledge-hub-pdfs").remove([storagePath]);
        return { success: false, error: insertError.message };
      }

      return {
        success: true,
        resourceId: (resource as { id: string }).id,
        error: null,
      };
    },
  );

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Update resource status (publish / unpublish)
// ─────────────────────────────────────────────────────────────────────────────

export const adminUpdateResourceStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => UpdateStatusSchema.parse(data))
  .handler(async ({ data }): Promise<{ success: boolean; error: string | null }> => {
    try {
      await verifyAdmin(data.accessToken);
    } catch (e: any) {
      return { success: false, error: e.message };
    }

    const supabase = createAdminClient();

    // Use untyped client for mutations to avoid strict type never inference
    const untypedSupabase = createUntypedAdminClient();
    const { error } = await untypedSupabase
      .from("resources")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.resourceId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Delete a resource (removes DB record + Storage file)
// ─────────────────────────────────────────────────────────────────────────────

export const adminDeleteResource = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => DeleteResourceSchema.parse(data))
  .handler(async ({ data }): Promise<{ success: boolean; error: string | null }> => {
    try {
      await verifyAdmin(data.accessToken);
    } catch (e: any) {
      return { success: false, error: e.message };
    }

    const supabase = createAdminClient();

    const { error: deleteError } = await supabase
      .from("resources")
      .delete()
      .eq("id", data.resourceId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    if (data.storagePath) {
      const { error: storageError } = await supabase.storage
        .from("knowledge-hub-pdfs")
        .remove([data.storagePath]);

      if (storageError) {
        console.warn("[knowledge-hub] Storage delete warning:", storageError.message);
      }
    }

    return { success: true, error: null };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Public — Fetch resource categories
// ─────────────────────────────────────────────────────────────────────────────

export const fetchCategories = async () => {
  const { supabase } = await import("@/lib/supabase/client");

  const { data, error } = await supabase
    .from("resource_categories")
    .select("id, name, slug, description")
    .order("sort_order");

  if (error) {
    return { categories: [], error: error.message };
  }

  return { categories: data ?? [], error: null };
};
