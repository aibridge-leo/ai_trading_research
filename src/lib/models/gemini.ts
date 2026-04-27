import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { parseOpinion } from "./parse";
import { COMMON_INSTRUCTIONS } from "./prompts";
import type { OpinionPayload } from "@/lib/types";

export async function callGemini(prompt: string): Promise<OpinionPayload> {
  const { text } = await generateText({
    // Gemini 3 Pro (2026 출시 최신) - Google 최신 플래그십. 더 빠른 응답이 필요하면 'gemini-3-flash-preview'.
    model: google("gemini-3-pro-preview"),
    system: COMMON_INSTRUCTIONS,
    prompt,
    tools: {
      google_search: google.tools.googleSearch({}),
    },
    maxRetries: 1,
  });
  return parseOpinion(text);
}
