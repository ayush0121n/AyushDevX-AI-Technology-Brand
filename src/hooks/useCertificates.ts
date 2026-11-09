import { useState, useEffect } from "react";
import { CertificateGalleryItem, initialCertificates } from "@/data/certificatesData";

const STORAGE_KEY = "ayushdevx_certificates_v1";

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

  const saveCertificates = (certs: CertificateGalleryItem[]) => {
    setCertificates(certs);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(certs));
      } catch (e) {
        console.error("Failed to save certificates to localStorage", e);
      }
    }
  };

  const addCertificate = (cert: CertificateGalleryItem) => {
    const updated = [cert, ...certificates];
    saveCertificates(updated);
  };

  const deleteCertificate = (id: string) => {
    const updated = certificates.filter((c) => c.id !== id);
    saveCertificates(updated);
  };

  const resetToDefault = () => {
    saveCertificates(initialCertificates);
  };

  return {
    certificates,
    addCertificate,
    deleteCertificate,
    resetToDefault,
  };
}

