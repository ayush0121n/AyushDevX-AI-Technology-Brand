import { sanitizeHistory, sanitizeInput } from "./groq-shared";
import { z } from "zod";

const inputSchema = z.object({
  message: z.string().min(1).max(800),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(600),
      }),
    )
    .max(10)
    .optional()
    .default([]),
});

export type PortfolioInput = z.infer<typeof inputSchema>;

export interface PortfolioResponse {
  answer: string;
  citations: string[];
  error?: string;
}

export const queryPortfolioAssistant = async ({ data }: { data: PortfolioInput }): Promise<PortfolioResponse> => {
  try {
    const cleanMessage = sanitizeInput(data.message);
    const cleanHistory = sanitizeHistory(data.history ?? []);

    const res = await fetch("/api/python/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: cleanMessage,
        history: cleanHistory,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        return { answer: "Rate limited. Please wait.", citations: [], error: "rate_limited" };
      }
      let errorMsg = "Error communicating with backend.";
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
      return { answer: errorMsg, citations: [], error: "api_error" };
    }

    const json = await res.json() as { answer?: string; citations?: string[]; error?: string };
    if (json.error) {
      return { answer: json.error, citations: [], error: "api_error" };
    }
    
    return { 
      answer: json.answer || "No response.", 
      citations: json.citations || []
    };
  } catch (e: any) {
    console.error("[Portfolio] Exception:", e.message);
    return { answer: e.message, citations: [], error: "api_error" };
  }
};
