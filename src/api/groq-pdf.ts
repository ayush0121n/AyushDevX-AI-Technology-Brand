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
  errorMessage?: string;
}

function classifyError(
  status: number,
  body: string,
  docTitle: string,
): PdfChatResponse {
  const base = { answer: "", pageRef: "", citations: [], documentTitle: docTitle };
  if (status === 429) {
    return {
      ...base,
      error: "rate_limited",
      errorMessage: "The AI service is busy. Please wait 30 seconds and try again.",
    };
  }
  if (status === 503) {
    return {
      ...base,
      error: "service_unavailable",
      errorMessage: "AI service is temporarily unavailable. Please try again shortly.",
    };
  }
  if (status === 408 || status === 504) {
    return {
      ...base,
      error: "timeout",
      errorMessage: "The AI request timed out. Please try again.",
    };
  }
  if (status >= 500) {
    return {
      ...base,
      error: "server_error",
      errorMessage: "The AI backend encountered an error. Please try again in a moment.",
    };
  }
  return {
    ...base,
    error: "api_error",
    errorMessage: body || "Something went wrong. Please try again.",
  };
}

export const queryPdfChat = async ({
  data,
}: {
  data: PdfChatInput;
}): Promise<PdfChatResponse> => {
  const docTitle = data.documentId;
  try {
    const cleanMessage = sanitizeInput(data.message);
    const cleanHistory = sanitizeHistory(data.history ?? []);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25_000);

    let res: Response;
    try {
      res = await fetch("/api/python/pdf_chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanMessage,
          documentId: data.documentId,
          history: cleanHistory,
          customContent: data.customContent,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      let bodyText = "";
      try {
        const errorJson = await res.json();
        bodyText = errorJson.detail || errorJson.error || "";
      } catch {
        // ignore
      }
      return classifyError(res.status, bodyText, docTitle);
    }

    const json = (await res.json()) as {
      answer?: string;
      pageRef?: string;
      citations?: string[];
      error?: string;
    };

    if (json.error) {
      return {
        answer: "",
        pageRef: "",
        citations: [],
        documentTitle: docTitle,
        error: "api_error",
        errorMessage: json.error,
      };
    }

    return {
      answer: json.answer || "No response.",
      pageRef: json.pageRef || "",
      citations: json.citations || [],
      documentTitle: docTitle,
    };
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      return {
        answer: "",
        pageRef: "",
        citations: [],
        documentTitle: docTitle,
        error: "timeout",
        errorMessage: "Request timed out. Please try again.",
      };
    }
    return {
      answer: "",
      pageRef: "",
      citations: [],
      documentTitle: docTitle,
      error: "network_error",
      errorMessage: "Cannot reach the AI backend. Please check your connection and try again.",
    };
  }
};
