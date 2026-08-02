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
      })
    )
    .optional(),
});

export type DataInput = z.infer<typeof QueryDataSchema>;
export interface DataResponse { answer: string; error: string | null }

export const queryDataAnalyst = async ({ data }: { data: DataInput }): Promise<DataResponse> => {
  try {
    const cleanMessage = sanitizeInput(data.message);
    const cleanHistory = sanitizeHistory(data.history ?? []);

    const res = await fetch("/api/python/data_analyst", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: cleanMessage,
        csvContext: data.csvContext,
        history: cleanHistory,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        return { answer: "Rate limited. Please wait.", error: "rate_limited" };
      }
      return { answer: "Error communicating with backend.", error: "api_error" };
    }

    const json = await res.json();
    if (json.error) {
      return { answer: json.error, error: "api_error" };
    }
    
    return { answer: json.answer || "No response.", error: null };
  } catch (e: any) {
    console.error("[Data Analyst] Exception:", e.message);
    return { answer: e.message, error: "api_error" };
  }
};
