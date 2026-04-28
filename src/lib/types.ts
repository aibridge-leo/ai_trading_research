export type ModelId = "gpt" | "gemini";

export interface ModelMeta {
  id: ModelId;
  label: string;
  provider: string;
  accent: string; // hex color
  icon: string; // public 경로
  // GPT 로고가 검정색이라 다크 배경에서 흰색으로 반전 처리 필요
  invertOnDark?: boolean;
}

export const MODELS: ModelMeta[] = [
  {
    id: "gpt",
    label: "GPT",
    provider: "OpenAI · GPT-5.4",
    accent: "#10a37f",
    icon: "/icons/gpt.png",
    invertOnDark: true,
  },
  {
    id: "gemini",
    label: "Gemini",
    provider: "Google · Gemini 3 Pro",
    accent: "#4285f4",
    icon: "/icons/gemini.png",
  },
];

export const PERPLEXITY_META = {
  label: "Perplexity",
  provider: "Sonar Reasoning Pro",
  accent: "#20b8cd",
  icon: "/icons/perplexity.png",
};

export type Position = "롱" | "숏" | "관망";

export interface OpinionPayload {
  position: Position;
  // 신뢰도 0-100
  confidence: number;
  // 롱/숏 강도 -100 (강한 숏) ~ +100 (강한 롱). 관망이면 0 부근.
  strength: number;
  target_price: number | null;
  stop_loss: number | null;
  key_reasons: string[];
  // 자유 서술 본문 (한국어)
  body: string;
}

export interface ModelOpinion extends OpinionPayload {
  modelId: ModelId;
  round: 1 | 2 | 3;
}

export interface QuoteSnapshot {
  symbol: string;
  shortName: string | null;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number | null;
  volume: number | null;
  currency: string;
  exchange: string | null;
  fetchedAt: string; // ISO
}

export interface SynthesisPayload {
  // Perplexity 종합
  summary: string;
  consensus: Position;
  // 실행 가격 가이드 (관망이면 모두 null 가능)
  target_price: number | null;
  stop_loss: number | null;
  entry_zone: string | null; // "$110~$120 눌림 후" 같은 자유 텍스트
  notable_disagreements: string[];
  fresh_insights: string[]; // 실시간 서치로 새로 얻은 정보
  citations: { title: string; url: string }[];
  warning?: string;
}

export interface AnalysisRecord {
  id: string;
  ticker: string;
  startedAt: string;
  finishedAt: string | null;
  quote: QuoteSnapshot | null;
  opinions: ModelOpinion[];
  synthesis: SynthesisPayload | null;
}

export type StreamEvent =
  | { type: "start"; ticker: string; quote: QuoteSnapshot | null }
  | { type: "round-begin"; round: 1 | 2 | 3 }
  | { type: "opinion"; opinion: ModelOpinion }
  | { type: "model-error"; modelId: ModelId; round: 1 | 2 | 3; message: string }
  | { type: "synthesis-begin" }
  | { type: "synthesis-delta"; text: string }
  | { type: "synthesis"; payload: SynthesisPayload }
  | { type: "done"; recordId: string }
  | { type: "error"; message: string };
