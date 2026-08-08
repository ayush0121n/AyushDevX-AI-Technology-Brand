import { sanitizeInput, sanitizeHistory } from "./groq-shared";
import { z } from "zod";

const inputSchema = z.object({
  message: z.string().min(1).max(800),
  documentId: z.enum(["rag-whitepaper", "malaria-cnn-paper", "monolith-guide"]),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(600),
      }),
    )
    .max(8)
    .optional()
    .default([]),
  customContent: z.string().optional(),
});

export type PdfChatInput = z.infer<typeof inputSchema>;

export interface PdfChatResponse {
  answer: string;
  pageRef: string;
  citations: string[];
  documentTitle: string;
  error?: string;
}

export const queryPdfChat = async ({ data }: { data: PdfChatInput }): Promise<PdfChatResponse> => {
  const docTitle = data.documentId;
  try {
    const cleanMessage = sanitizeInput(data.message);
    const cleanHistory = sanitizeHistory(data.history ?? []);

    const res = await fetch("/api/python/pdf_chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: cleanMessage,
        documentId: data.documentId,
        history: cleanHistory,
        customContent: data.customContent
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        return { answer: "Rate limited. Please wait.", pageRef: "", citations: [], documentTitle: docTitle, error: "rate_limited" };
      }
      let errorMsg = "Error communicating with PDF backend.";
      try {
        const errorJson = await res.json();
        if (errorJson.detail) {
          errorMsg = typeof errorJson.detail === "string" ? errorJson.detail : JSON.stringify(errorJson.detail);
        } else if (errorJson.error) {
          errorMsg = errorJson.error;
        }
      } catch (e) {
        // ignore
      }
      return { answer: errorMsg, pageRef: "", citations: [], documentTitle: docTitle, error: "api_error" };
    }

    const json = await res.json() as { answer?: string; pageRef?: string; citations?: string[]; error?: string };
    if (json.error) {
      return { answer: json.error, pageRef: "", citations: [], documentTitle: docTitle, error: "api_error" };
    }
    
    return { 
      answer: json.answer || "No response.", 
      pageRef: json.pageRef || "", 
      citations: json.citations || [], 
      documentTitle: docTitle 
    };
  } catch (e: any) {
    console.error("[PDF] Exception:", e.message);
    return { answer: e.message, pageRef: "", citations: [], documentTitle: docTitle, error: "api_error" };
  }
};
