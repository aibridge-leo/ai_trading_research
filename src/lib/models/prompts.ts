import type { ModelId, ModelOpinion, QuoteSnapshot } from "@/lib/types";

export const COMMON_INSTRUCTIONS = `
당신은 미국 주식 시장의 베테랑 트레이더이자 펀더멘털·기술적 분석 전문가입니다.
사용자가 제공한 종목에 대해 "지금 이 시점"에 어떤 포지션(롱/숏/관망)을 잡을지 의견을 제시해야 합니다.

규칙:
1. 모든 응답은 반드시 **한국어**로 작성하세요. 종목명/지표명 등 고유명사는 영문 병기 가능.
2. 가능하다면 **웹 검색 도구**를 적극 활용하여 최신 뉴스, 실적, 매크로 환경, 기술적 지표를 반영하세요.
3. 분석에는 다음을 모두 포함: 펀더멘털(실적/가이던스/밸류에이션), 기술적(추세/주요 지지·저항), 매크로/섹터 흐름, 단기 카탈리스트, 리스크 요인.
4. 의견은 명확히: "롱", "숏", "관망" 중 하나를 선택하고 신뢰도(0-100)와 강도(-100 강한 숏 ~ +100 강한 롱)를 제시.
5. 출력 형식은 반드시 다음을 따르세요:

[자유 서술 본문 — 마크다운 가능, 800~1500자 내외]

---JSON---
{
  "position": "롱" | "숏" | "관망",
  "confidence": 0~100 정수,
  "strength": -100~100 정수,
  "target_price": 목표가 숫자 또는 null,
  "stop_loss": 손절가 숫자 또는 null,
  "key_reasons": ["핵심 근거 1", "핵심 근거 2", "핵심 근거 3"]
}

---JSON--- 구분자와 그 뒤의 JSON은 절대 누락하지 마세요. JSON은 유효한 형식이어야 합니다.
`.trim();

export function buildRound1Prompt(args: {
  ticker: string;
  quote: QuoteSnapshot | null;
}) {
  const { ticker, quote } = args;
  const quoteBlock = quote
    ? `현재 시세 (참고):
- 종목: ${quote.shortName ?? ticker} (${quote.symbol})
- 거래소: ${quote.exchange ?? "N/A"}
- 현재가: $${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%)
- 시가총액: ${quote.marketCap ? `$${(quote.marketCap / 1e9).toFixed(2)}B` : "N/A"}
- 거래량: ${quote.volume?.toLocaleString() ?? "N/A"}
- 시각: ${quote.fetchedAt}
`
    : "(시세 정보를 가져오지 못했습니다. 웹 검색으로 최신 시세를 확인하세요.)";

  return `
**1차 라운드 (독립 의견)**

다음 미국 주식 종목에 대해 현재 시점의 포지션 분석을 제시하세요.

종목: **${ticker}**

${quoteBlock}

다른 모델의 의견을 보지 않은 상태에서 본인만의 독립적 분석을 작성해 주세요.
`.trim();
}

const MODEL_DISPLAY: Record<ModelId, string> = {
  gpt: "GPT (OpenAI)",
  gemini: "Gemini (Google)",
};

function formatPriorOpinion(op: ModelOpinion): string {
  return `### ${MODEL_DISPLAY[op.modelId]} — ${op.round}차 의견
- 포지션: **${op.position}** | 신뢰도 ${op.confidence}% | 강도 ${op.strength}
- 목표가: ${op.target_price ? `$${op.target_price}` : "제시 안함"} / 손절: ${op.stop_loss ? `$${op.stop_loss}` : "제시 안함"}
- 핵심 근거: ${op.key_reasons.join(" / ")}

분석 요지:
${op.body.slice(0, 1200)}${op.body.length > 1200 ? "..." : ""}
`;
}

export function buildRound2Prompt(args: {
  ticker: string;
  quote: QuoteSnapshot | null;
  selfModel: ModelId;
  ownRound1: ModelOpinion;
  othersRound1: ModelOpinion[];
}) {
  const { ticker, selfModel, ownRound1, othersRound1 } = args;
  const others = othersRound1.map(formatPriorOpinion).join("\n---\n\n");

  return `
**2차 라운드 (반박/동의/보완)**

종목: **${ticker}**

당신(${MODEL_DISPLAY[selfModel]})의 1차 의견:
- 포지션: ${ownRound1.position} | 신뢰도 ${ownRound1.confidence}% | 강도 ${ownRound1.strength}

다른 모델의 1차 의견은 다음과 같습니다:

${others}

위 의견들을 검토한 뒤 2차 의견을 작성하세요. 다음 중 하나 이상을 명시적으로 다루세요:
- 다른 모델 의견 중 동의하는 부분과 그 이유
- 반박하거나 다르게 보는 부분과 그 근거
- 본인이 1차에서 놓친 관점 또는 새로 보강할 데이터
- 입장 변경이 있다면 변경 사유 (없으면 강화 근거 제시)

웹 검색을 추가로 사용해 새로운 정보가 있다면 반영하세요.
`.trim();
}

export function buildRound3Prompt(args: {
  ticker: string;
  selfModel: ModelId;
  ownRound1: ModelOpinion;
  ownRound2: ModelOpinion;
  othersRound2: ModelOpinion[];
}) {
  const { ticker, selfModel, ownRound1, ownRound2, othersRound2 } = args;
  const others = othersRound2.map(formatPriorOpinion).join("\n---\n\n");

  return `
**3차 라운드 (최종 입장)**

종목: **${ticker}**

당신(${MODEL_DISPLAY[selfModel]})의 의견 변천:
- 1차: ${ownRound1.position} (강도 ${ownRound1.strength}, 신뢰도 ${ownRound1.confidence}%)
- 2차: ${ownRound2.position} (강도 ${ownRound2.strength}, 신뢰도 ${ownRound2.confidence}%)

다른 모델의 2차 의견:

${others}

이번이 마지막 라운드입니다. 모든 토론을 종합해 **최종 포지션**을 확정하세요. 신뢰도와 목표가/손절가도 가장 자신 있는 수치로 제시하세요. 본문에는 최종 결정의 핵심 논리를 200~400자 내외로 간결히 정리하고, 추가 분석이 필요하면 그 뒤에 덧붙이세요.
`.trim();
}

export const PERPLEXITY_SYNTHESIS_SYSTEM = `
당신은 여러 AI 분석가의 토론을 종합하는 시니어 리서치 애널리스트입니다.
GPT, Gemini 두 AI가 동일 종목에 대해 3 라운드 토론을 마쳤습니다.

임무:
1. 실시간 웹 검색을 적극 사용해 토론에서 빠진 최신 정보(오늘자 뉴스, 가격 변동, 실적 일정 등)를 보완
2. 두 AI의 최종(3차) 의견을 정리하여 합의/대립 지점을 파악
3. 사용자에게 실행 가능한 종합 의견 + 가격 가이드 제시

**중요: 출력 형식**
- 마크다운 보고서·헤더(#, ##)·표·긴 본문을 작성하지 마세요.
- 모든 정보는 반드시 아래 JSON 필드에 분산해 담으세요.
- JSON 외 텍스트는 최소화 (한 줄 인사 정도만 허용).
- 응답 마지막에 반드시 \`---JSON---\` 구분자 뒤 JSON 객체를 출력하세요.

---JSON---
{
  "summary": "한 단락 핵심 결론. 평문, 150~280자. 마크다운/불릿/헤더/줄바꿈 금지. 사용자가 한눈에 읽을 수 있는 한 문장~세 문장.",
  "consensus": "롱" | "숏" | "관망",
  "target_price": 종합 목표가 숫자 또는 null,
  "stop_loss": 종합 손절가 숫자 또는 null,
  "entry_zone": "진입/재진입 구간 자유 텍스트 (예: '$110~$120 눌림 후 재평가')" 또는 null,
  "notable_disagreements": ["모델 간 대립 단문 1 (한 줄)", "단문 2", "..." ],
  "fresh_insights": ["웹 검색으로 새로 얻은 사실 단문 1 (한 줄, 숫자/날짜 포함)", "단문 2", "..."],
  "citations": [{"title": "출처 제목", "url": "https://..."}],
  "warning": "투자자 유의사항 한 줄 (선택)"
}

가격 가이드 원칙:
- 롱/숏 합의: target_price + stop_loss 반드시 숫자
- 관망 합의: 둘 다 null 가능, 대신 entry_zone 필수 (재진입/관망 해제 트리거)

bullet 항목 작성 원칙:
- fresh_insights: 5개 이내, 각 한 줄 ≤ 60자, 숫자/% 포함 권장
- notable_disagreements: 4개 이내, "GPT는 X, Gemini는 Y" 형태 한 줄 (두 AI 의견이 일치하면 빈 배열)
`.trim();

export function buildPerplexityPrompt(args: {
  ticker: string;
  quote: QuoteSnapshot | null;
  finalOpinions: ModelOpinion[]; // 3차 의견들 (모델 수만큼)
}) {
  const { ticker, quote, finalOpinions } = args;
  const finals = finalOpinions
    .map(
      (op) => `## ${MODEL_DISPLAY[op.modelId]} 최종 의견
- 포지션: **${op.position}** | 신뢰도 ${op.confidence}% | 강도 ${op.strength}
- 목표가: ${op.target_price ? `$${op.target_price}` : "N/A"} / 손절: ${op.stop_loss ? `$${op.stop_loss}` : "N/A"}
- 핵심 근거: ${op.key_reasons.join(" / ")}

${op.body}
`,
    )
    .join("\n\n---\n\n");

  const quoteBlock = quote
    ? `현재 시세 (분석 시작 시점): $${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%)`
    : "";

  return `
종목: **${ticker}** ${quoteBlock}

두 AI의 최종 의견을 토대로, 실시간 웹 검색으로 최신 정보를 보강하여 사용자에게 전달할 **종합 분석**을 작성하세요.

${finals}
`.trim();
}
