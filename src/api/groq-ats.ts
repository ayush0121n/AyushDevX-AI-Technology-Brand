import { sanitizeInput, sanitizeHistory } from "./groq-shared";
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

export const analyzeAts = async ({ data }: { data: AtsInput }): Promise<AtsResponse> => {
  try {
    const cleanResume = sanitizeInput(data.resumeText);
    const cleanJob = sanitizeInput(data.jobText);

    const res = await fetch("/api/python/ats_matcher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeText: cleanResume,
        jobText: cleanJob,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        return { error: "rate_limited", errorMessage: "Rate limited. Please wait." };
      }
      let errorMsg = "Error communicating with ATS backend.";
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
      return { error: "api_error", errorMessage: errorMsg };
    }

    const json = await res.json() as { result?: any; error?: string };
    if (json.error) {
      return { error: "api_error", errorMessage: json.error };
    }
    
    const validated = atsResponseSchema.safeParse(json.result);
    if (!validated.success) {
      return { error: "parse_error", errorMessage: "Failed to parse ATS response." };
    }
    return { result: validated.data };
  } catch (e: any) {
    console.error("[ATS] Exception:", e.message);
    return { error: "api_error", errorMessage: e.message };
  }
};
