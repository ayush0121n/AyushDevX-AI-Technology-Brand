import { useState, useEffect } from "react";
import { CertificateGalleryItem, initialCertificates } from "@/data/certificatesData";
import { supabase } from "@/lib/supabase/client";

const STORAGE_KEY = "ayushdevx_certificates_v2";

export function useCertificates() {
  const [certificates, setCertificates] = useState<CertificateGalleryItem[]>(() => {
    if (typeof window === "undefined") return initialCertificates;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load certificates from localStorage", e);
    }
    return initialCertificates;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync from Supabase on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchFromSupabase() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("certificates")
          .select("*")
          .order("sort_order", { ascending: true });

        if (error) {
          console.warn("[useCertificates] Supabase fetch error, fallback active:", error.message);
          return;
        }

        if (data && data.length > 0 && isMounted) {
          const mapped: CertificateGalleryItem[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            issuer: d.issuer,
            category: d.category || "AI & GenAI",
            date: d.issue_date || "2026",
            image: d.image_url || "/certificates/Founderz_Microsoft_Agent_Architect.png",
            pdf: d.pdf_url || undefined,
            badge: d.badge || undefined,
          }));

          setCertificates(mapped);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
          } catch (e) {
            // ignore quota
          }
        }
      } catch (err) {
        console.warn("[useCertificates] Network error during Supabase sync:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchFromSupabase();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveToLocal = (certs: CertificateGalleryItem[]) => {
    setCertificates(certs);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(certs));
      } catch (e) {
        console.error("Failed to save certificates to localStorage", e);
      }
    }
  };

  const addCertificate = async (cert: CertificateGalleryItem) => {
    const updated = [cert, ...certificates];
    saveToLocal(updated);

    // Sync to Supabase in background
    try {
      await supabase.from("certificates").insert({
        title: cert.title,
        issuer: cert.issuer,
        issue_date: cert.date,
        category: cert.category,
        image_url: cert.image,
        pdf_url: cert.pdf,
        badge: cert.badge,
        status: "published",
        sort_order: 0,
      } as any);
    } catch (e) {
      console.error("[useCertificates] Error inserting certificate to Supabase:", e);
    }
  };

  const deleteCertificate = async (id: string) => {
    // 1. Optimistic local update so UI reflects immediately
    const updated = certificates.filter((c) => c.id !== id);
    saveToLocal(updated);

    // 2. Persist deletion in Supabase
    try {
      // Delete by UUID or by title
      const targetCert = certificates.find((c) => c.id === id);
      if (id.includes("-") && id.length === 36) {
        await supabase.from("certificates").delete().eq("id", id);
      } else if (targetCert) {
        await supabase.from("certificates").delete().eq("title", targetCert.title);
      }
    } catch (e) {
      console.error("[useCertificates] Error deleting certificate from Supabase:", e);
    }
  };

  const resetToDefault = () => {
    saveToLocal(initialCertificates);
  };

  return {
    certificates,
    isLoading,
    addCertificate,
    deleteCertificate,
    resetToDefault,
  };
}
