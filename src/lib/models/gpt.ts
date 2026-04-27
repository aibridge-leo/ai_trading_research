import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { parseOpinion } from "./parse";
import { COMMON_INSTRUCTIONS } from "./prompts";
import type { OpinionPayload } from "@/lib/types";

export async function callGPT(prompt: string): Promise<OpinionPayload> {
  const { text } = await generateText({
    // GPT-5.4 (2026-03 출시) - OpenAI 최신 플래그십. 비용/속도가 부담되면 'gpt-5.4-mini'로 교체.
    model: openai.responses("gpt-5.4"),
    system: COMMON_INSTRUCTIONS,
    prompt,
    tools: {
      web_search_preview: openai.tools.webSearchPreview({
        searchContextSize: "medium",
      }),
    },
    maxRetries: 1,
  });
  return parseOpinion(text);
}
