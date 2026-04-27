import { parseSynthesis } from "./parse";
import { PERPLEXITY_SYNTHESIS_SYSTEM } from "./prompts";
import type { SynthesisPayload } from "@/lib/types";

interface PerplexityResponse {
  choices: { message: { content: string } }[];
  citations?: string[];
}

export async function callPerplexitySynthesis(
  prompt: string,
  onDelta?: (text: string) => void,
): Promise<SynthesisPayload> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY가 설정되지 않았습니다.");
  }

  // Sonar 모델은 실시간 웹 검색을 내장하고 있음
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // sonar-reasoning-pro: 단계별 추론 + 실시간 웹 검색 + 풍부한 인용. 종합 분석에 최적.
      // 더 깊은 자율 리서치가 필요하면 'sonar-deep-research'(비용 ↑) 사용 가능.
      model: "sonar-reasoning-pro",
      messages: [
        { role: "system", content: PERPLEXITY_SYNTHESIS_SYSTEM },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      stream: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Perplexity API 오류 (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = (await res.json()) as PerplexityResponse;
  const content = data.choices?.[0]?.message?.content ?? "";

  // Optional: emit content as a single chunk for UX consistency
  if (onDelta && content) onDelta(content);

  const parsed = parseSynthesis(content);

  // Merge top-level citations array (Perplexity returns array of URLs)
  if (data.citations && data.citations.length > 0 && parsed.citations.length === 0) {
    parsed.citations = data.citations.slice(0, 12).map((url) => ({
      title: new URL(url).hostname,
      url,
    }));
  }

  return parsed;
}
