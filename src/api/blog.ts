/**
 * AyushDevX — Blog API
 *
 * All mutations are TanStack Start server functions.
 * Admin mutations use the service-role client (bypass RLS).
 * Public queries use the anon client (RLS enforced).
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createAdminClient,
  createServerClient,
  createUntypedAdminClient,
} from "@/lib/supabase/server";

// ─────────────────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────────────────

const CreatePostSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  excerpt: z.string().max(500).optional(),
  body: z.string(),
  coverImageBase64: z.string().optional(),
  coverImageFileName: z.string().optional(),
  pdfPath: z.string().optional(),
  pdfUrl: z.string().optional(),
  pdfTitle: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published"]).default("published"),
  readTimeMinutes: z.number().min(1).max(120).optional(),
  accessToken: z.string(),
});

const UpdatePostSchema = z.object({
  postId: z.string().uuid(),
  title: z.string().min(3).max(200).optional(),
  slug: z.string().min(3).max(200).optional(),
  excerpt: z.string().max(500).optional(),
  body: z.string().optional(),
  coverImageBase64: z.string().optional(),
  coverImageFileName: z.string().optional(),
  pdfPath: z.string().optional(),
  pdfUrl: z.string().optional(),
  pdfTitle: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published"]).optional(),
  readTimeMinutes: z.number().min(1).max(120).optional(),
  accessToken: z.string(),
});

const DeletePostSchema = z.object({
  postId: z.string().uuid(),
  coverImagePath: z.string().optional(),
  accessToken: z.string(),
});

const UpdatePostStatusSchema = z.object({
  postId: z.string().uuid(),
  status: z.enum(["draft", "published"]),
  accessToken: z.string(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Auth Utilities
// ─────────────────────────────────────────────────────────────────────────────

async function verifyAdmin(accessToken: string) {
  const supabase = createServerClient(accessToken);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

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
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function estimateReadTime(body: string): number {
  const wordsPerMinute = 200;
  const wordCount = body.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

async function uploadCoverImage(
  supabase: ReturnType<typeof createAdminClient>,
  base64: string,
  fileName: string,
): Promise<{ path: string; url: string } | null> {
  try {
    // Strip data URL prefix for any image type
    const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, "");
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `covers/${Date.now()}_${safeFileName}`;

    // Detect content type
    const ext = safeFileName.split(".").pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };
    const contentType = contentTypeMap[ext ?? ""] ?? "image/jpeg";

    const { error: uploadError } = await supabase.storage
      .from("blog-images")
      .upload(storagePath, bytes, { contentType, upsert: false });

    if (uploadError) {
      console.error("[blog] Cover image upload error:", uploadError.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("blog-images")
      .getPublicUrl(storagePath);

    return { path: storagePath, url: urlData.publicUrl };
  } catch (e) {
    console.error("[blog] Cover image upload exception:", e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public — Fetch all published blog posts
// ─────────────────────────────────────────────────────────────────────────────

export const fetchPublishedBlogPosts = async () => {
  const { supabase } = await import("@/lib/supabase/client");

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, cover_image_url, tags, category, featured, read_time_minutes, view_count, created_at",
    )
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[blog] fetchPublishedBlogPosts error:", error.message);
    return { posts: [], error: error.message };
  }

  return { posts: data ?? [], error: null };
};

// ─────────────────────────────────────────────────────────────────────────────
// Public — Fetch single blog post by slug (increments view count)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchBlogPostBySlug = async (slug: string) => {
  const { supabase } = await import("@/lib/supabase/client");

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, body, cover_image_url, cover_image_path, pdf_path, pdf_url, pdf_title, tags, category, featured, read_time_minutes, view_count, created_at, updated_at",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    console.error("[blog] fetchBlogPostBySlug error:", error.message);
    return { post: null, error: error.message };
  }

  // Increment view count (best effort)
  if (data?.id) {
    supabase
      .rpc("increment_blog_view_count", { post_id: data.id })
      .then(() => {})
      .catch(() => {});
  }

  return { post: data, error: null };
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Fetch all blog posts (any status)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchAllBlogPosts = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ accessToken: z.string() }).parse(data),
  )
  .handler(async ({ data }) => {
    try {
      await verifyAdmin(data.accessToken);
    } catch (e: any) {
      return { posts: [], error: e.message };
    }

    const supabase = createAdminClient();
    const { data: postsData, error } = await supabase
      .from("blog_posts")
      .select(
        "id, title, slug, excerpt, cover_image_url, cover_image_path, pdf_path, pdf_title, tags, category, featured, status, read_time_minutes, view_count, created_at, updated_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[blog] fetchAllBlogPosts error:", error.message);
      return { posts: [], error: error.message };
    }

    return { posts: postsData ?? [], error: null };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Create a new blog post
// ─────────────────────────────────────────────────────────────────────────────

export const adminCreateBlogPost = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => CreatePostSchema.parse(data))
  .handler(
    async ({ data }): Promise<{ success: boolean; postId?: string; error: string | null }> => {
      try {
        await verifyAdmin(data.accessToken);
      } catch (e: any) {
        return { success: false, error: e.message };
      }

      const supabase = createAdminClient();

      // Upload cover image if provided
      let coverImagePath: string | undefined;
      let coverImageUrl: string | undefined;

      if (data.coverImageBase64 && data.coverImageFileName) {
        const uploaded = await uploadCoverImage(
          supabase,
          data.coverImageBase64,
          data.coverImageFileName,
        );
        if (uploaded) {
          coverImagePath = uploaded.path;
          coverImageUrl = uploaded.url;
        }
      }

      const readTime = data.readTimeMinutes ?? estimateReadTime(data.body);

      const insertPayload = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt ?? null,
        body: data.body,
        cover_image_path: coverImagePath ?? null,
        cover_image_url: coverImageUrl ?? null,
        pdf_path: data.pdfPath ?? null,
        pdf_url: data.pdfUrl ?? null,
        pdf_title: data.pdfTitle ?? null,
        tags: data.tags ?? [],
        category: data.category ?? null,
        featured: data.featured ?? false,
        status: data.status,
        read_time_minutes: readTime,
      };

      const untypedAdmin = createUntypedAdminClient();
      const { data: post, error: insertError } = await untypedAdmin
        .from("blog_posts")
        .insert([insertPayload])
        .select("id")
        .single();

      if (insertError) {
        console.error("[blog] DB insert error:", insertError.message);
        // Cleanup uploaded image on failure
        if (coverImagePath) {
          await supabase.storage.from("blog-images").remove([coverImagePath]);
        }
        return { success: false, error: insertError.message };
      }

      return { success: true, postId: (post as { id: string }).id, error: null };
    },
  );

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Update an existing blog post
// ─────────────────────────────────────────────────────────────────────────────

export const adminUpdateBlogPost = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => UpdatePostSchema.parse(data))
  .handler(
    async ({ data }): Promise<{ success: boolean; error: string | null }> => {
      try {
        await verifyAdmin(data.accessToken);
      } catch (e: any) {
        return { success: false, error: e.message };
      }

      const supabase = createAdminClient();

      // Upload new cover image if provided
      let coverImagePath: string | undefined;
      let coverImageUrl: string | undefined;

      if (data.coverImageBase64 && data.coverImageFileName) {
        const uploaded = await uploadCoverImage(
          supabase,
          data.coverImageBase64,
          data.coverImageFileName,
        );
        if (uploaded) {
          coverImagePath = uploaded.path;
          coverImageUrl = uploaded.url;
        }
      }

      const updatePayload: Record<string, any> = {};
      if (data.title !== undefined) updatePayload.title = data.title;
      if (data.slug !== undefined) updatePayload.slug = data.slug;
      if (data.excerpt !== undefined) updatePayload.excerpt = data.excerpt;
      if (data.body !== undefined) {
        updatePayload.body = data.body;
        updatePayload.read_time_minutes =
          data.readTimeMinutes ?? estimateReadTime(data.body);
      }
      if (coverImagePath) updatePayload.cover_image_path = coverImagePath;
      if (coverImageUrl) updatePayload.cover_image_url = coverImageUrl;
      if (data.pdfPath !== undefined) updatePayload.pdf_path = data.pdfPath;
      if (data.pdfUrl !== undefined) updatePayload.pdf_url = data.pdfUrl;
      if (data.pdfTitle !== undefined) updatePayload.pdf_title = data.pdfTitle;
      if (data.tags !== undefined) updatePayload.tags = data.tags;
      if (data.category !== undefined) updatePayload.category = data.category;
      if (data.featured !== undefined) updatePayload.featured = data.featured;
      if (data.status !== undefined) updatePayload.status = data.status;

      const untypedAdmin = createUntypedAdminClient();
      const { error } = await untypedAdmin
        .from("blog_posts")
        .update(updatePayload)
        .eq("id", data.postId);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    },
  );

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Update blog post status (publish / draft)
// ─────────────────────────────────────────────────────────────────────────────

export const adminUpdateBlogPostStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => UpdatePostStatusSchema.parse(data))
  .handler(
    async ({ data }): Promise<{ success: boolean; error: string | null }> => {
      try {
        await verifyAdmin(data.accessToken);
      } catch (e: any) {
        return { success: false, error: e.message };
      }

      const untypedAdmin = createUntypedAdminClient();
      const { error } = await untypedAdmin
        .from("blog_posts")
        .update({ status: data.status, updated_at: new Date().toISOString() })
        .eq("id", data.postId);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    },
  );

// ─────────────────────────────────────────────────────────────────────────────
// Admin — Delete a blog post (removes DB record + cover image from Storage)
// ─────────────────────────────────────────────────────────────────────────────

export const adminDeleteBlogPost = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => DeletePostSchema.parse(data))
  .handler(
    async ({ data }): Promise<{ success: boolean; error: string | null }> => {
      try {
        await verifyAdmin(data.accessToken);
      } catch (e: any) {
        return { success: false, error: e.message };
      }

      const supabase = createAdminClient();

      const { error: deleteError } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", data.postId);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      // Clean up cover image from storage
      if (data.coverImagePath) {
        await supabase.storage
          .from("blog-images")
          .remove([data.coverImagePath])
          .catch(() => {});
      }

      return { success: true, error: null };
    },
  );
