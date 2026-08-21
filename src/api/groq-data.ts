import { sanitizeHistory, sanitizeInput } from "./groq-shared";
import { z } from "zod";

export const QueryDataSchema = z.object({
  message: z.string().min(1).max(2000),
  csvContext: z.string(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .optional(),
});

export type DataInput = z.infer<typeof QueryDataSchema>;
export interface DataResponse {
  answer: string;
  error: string | null;
  errorMessage?: string;
}

function classifyError(status: number, body: string): DataResponse {
  if (status === 429) {
    return {
      answer: "",
      error: "rate_limited",
      errorMessage: "The AI service is busy. Please wait 30 seconds and try again.",
    };
  }
  if (status === 503) {
    return {
      answer: "",
      error: "service_unavailable",
      errorMessage: "AI service is temporarily unavailable. Please try again shortly.",
    };
  }
  if (status === 408 || status === 504) {
    return {
      answer: "",
      error: "timeout",
      errorMessage: "The AI request timed out. Your CSV may be too large — try a smaller file.",
    };
  }
  if (status >= 500) {
    return {
      answer: "",
      error: "server_error",
      errorMessage: "The AI backend encountered an error. Please try again in a moment.",
    };
  }
  return {
    answer: "",
    error: "api_error",
    errorMessage: body || "Something went wrong. Please try again.",
  };
}

export const queryDataAnalyst = async ({
  data,
}: {
  data: DataInput;
}): Promise<DataResponse> => {
  try {
    const cleanMessage = sanitizeInput(data.message);
    const cleanHistory = sanitizeHistory(data.history ?? []);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 28_000);

    let res: Response;
    try {
      res = await fetch("/api/python/data_analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanMessage,
          csvContext: data.csvContext,
          history: cleanHistory,
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
      return classifyError(res.status, bodyText);
    }

    const json = (await res.json()) as { answer?: string; error?: string | null };

    if (json.error) {
      return {
        answer: "",
        error: "api_error",
        errorMessage: json.error,
      };
    }

    return { answer: json.answer || "No response.", error: null };
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      return {
        answer: "",
        error: "timeout",
        errorMessage: "Request timed out. Try a smaller dataset or simpler question.",
      };
    }
    return {
      answer: "",
      error: "network_error",
      errorMessage: "Cannot reach the AI backend. Please check your connection and try again.",
    };
  }
};
