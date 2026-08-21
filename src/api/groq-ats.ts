import { sanitizeInput } from "./groq-shared";
import { z } from "zod";

const atsResponseSchema = z.object({
  score: z.number().min(0).max(100),
  label: z.enum(["Excellent Fit", "Strong Fit", "Good Fit", "Partial Fit", "Weak Fit"]),
  matched: z.array(z.string()),
  missing: z.array(z.string()),
  recommendation: z.string(),
  sectionSuggestions: z.array(
    z.object({
      section: z.string(),
      suggestion: z.string(),
    }),
  ),
});

export type AtsResult = z.infer<typeof atsResponseSchema>;

export const inputSchema = z.object({
  resumeText: z.string().min(20).max(3000),
  jobText: z.string().min(20).max(3000),
});

export type AtsInput = z.infer<typeof inputSchema>;

export interface AtsResponse {
  result?: AtsResult;
  error?: string;
  errorMessage?: string;
}

function classifyError(status: number, body: string): AtsResponse {
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

export const analyzeAts = async ({
  data,
}: {
  data: AtsInput;
}): Promise<AtsResponse> => {
  try {
    const cleanResume = sanitizeInput(data.resumeText);
    const cleanJob = sanitizeInput(data.jobText);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25_000);

    let res: Response;
    try {
      res = await fetch("/api/python/ats_matcher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: cleanResume,
          jobText: cleanJob,
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

    const json = (await res.json()) as { result?: unknown; error?: string };

    if (json.error) {
      return { error: "api_error", errorMessage: json.error };
    }

    const validated = atsResponseSchema.safeParse(json.result);
    if (!validated.success) {
      return {
        error: "parse_error",
        errorMessage: "Received an unexpected response format. Please try again.",
      };
    }

    return { result: validated.data };
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      return {
        error: "timeout",
        errorMessage: "Request timed out. Please try again.",
      };
    }
    return {
      error: "network_error",
      errorMessage: "Cannot reach the AI backend. Please check your connection and try again.",
    };
  }
};
