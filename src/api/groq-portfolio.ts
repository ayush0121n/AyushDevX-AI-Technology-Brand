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
  errorMessage?: string;
}

const BACKEND_URL = "/api/python/portfolio";

function classifyError(status: number, body: string): { error: string; errorMessage: string } {
  if (status === 429) {
    return {
      error: "rate_limited",
      errorMessage: "The AI service is busy. Please wait 30 seconds and try again.",
    };
  }
  if (status === 503) {
    return {
      error: "service_unavailable",
      errorMessage: "AI service is temporarily unavailable. Please try again shortly.",
    };
  }
  if (status === 408 || status === 504) {
    return {
      error: "timeout",
      errorMessage: "The AI request timed out. Please try again.",
    };
  }
  if (status >= 500) {
    return {
      error: "server_error",
      errorMessage: "The AI backend encountered an error. Please try again in a moment.",
    };
  }
  return {
    error: "api_error",
    errorMessage: body || "Something went wrong. Please try again.",
  };
}

export const queryPortfolioAssistant = async ({
  data,
}: {
  data: PortfolioInput;
}): Promise<PortfolioResponse> => {
  try {
    const cleanMessage = sanitizeInput(data.message);
    const cleanHistory = sanitizeHistory(data.history ?? []);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25_000);

    let res: Response;
    try {
      res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cleanMessage, history: cleanHistory }),
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
        // ignore parse errors
      }
      const { error, errorMessage } = classifyError(res.status, bodyText);
      return { answer: "", citations: [], error, errorMessage };
    }

    const json = (await res.json()) as {
      answer?: string;
      citations?: string[];
      error?: string;
    };

    if (json.error) {
      return {
        answer: "",
        citations: [],
        error: "api_error",
        errorMessage: json.error,
      };
    }

    return {
      answer: json.answer || "No response.",
      citations: json.citations || [],
    };
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      return {
        answer: "",
        citations: [],
        error: "timeout",
        errorMessage: "Request timed out. Please try again.",
      };
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return {
      answer: "",
      citations: [],
      error: "network_error",
      errorMessage: "Cannot reach the AI backend. Please check your connection and try again.",
    };
  }
};
