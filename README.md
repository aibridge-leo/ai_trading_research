# AI Compete · Multi-LLM 미국 주식 포지션 분석 대시보드

> 종목을 입력하면 **GPT · Gemini** 두 LLM이 실시간 웹 검색을 활용해 **3 라운드 토론**을 진행하고, **Perplexity**가 6개 의견 + 실시간 보강 정보를 종합해 최종 포지션을 제시합니다.

![dashboard](https://img.shields.io/badge/Next.js-16-black) ![ts](https://img.shields.io/badge/TypeScript-5.7-blue) ![ai-sdk](https://img.shields.io/badge/Vercel%20AI%20SDK-v6-purple) ![license](https://img.shields.io/badge/license-MIT-green)

---

## 핵심 기능

- 🤖 **3개 LLM 협업** — GPT-5.4 · Gemini 3 Pro 토론 + Perplexity Sonar Reasoning Pro 종합
- 🔄 **3 라운드 토론** — 독립 의견 → 상호 검토 → 최종 입장 (총 6개 카드)
- 🌐 **실시간 웹 검색** — 모든 모델이 자체 검색 도구로 최신 뉴스/실적/시세 반영
- 📊 **인터랙티브 게이지** — 각 모델의 포지션 강도(−100~+100) + 신뢰도(0~100%) 시각화
- 💡 **Perplexity 종합** — 합의/대립 포인트, 실시간 보강 정보, 가격 가이드(목표가/손절가/진입 구간), 출처 인용
- 💾 **JSON 이력 저장** — 모든 분석을 `data/history/`에 보존
- 🌙 **다크 모드 트레이딩 톤** — 모던 UI + 진행률 카운트업 애니메이션

---

## 스크린샷

`(여기에 스크린샷 추가 예정)`

---

## 빠른 시작

### 1. 클론 + 의존성 설치

```bash
git clone https://github.com/aibridge-leo/ai_trading_research.git
cd ai_trading_research
npm install
```

### 2. API 키 4개 발급

| 키 | 발급처 | 비고 |
|---|---|---|
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | |
| `GOOGLE_GENERATIVE_AI_API_KEY` | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) | 무료 한도 충분 |
| `PERPLEXITY_API_KEY` | [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api) | |

> Anthropic API 키는 **사용하지 않습니다** (현재 버전은 GPT + Gemini + Perplexity 3종만 사용).

### 3. `.env.local` 작성

```bash
cp .env.local.example .env.local
```

그리고 에디터로 열어 위 4개 키를 채웁니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속 → 종목 티커(예: `AAPL`, `NVDA`, `TSLA`) 입력 → "분석 시작".

### 5. (선택) 모델 로고 추가

기본 상태에서는 모델 액센트 색상의 **이니셜 원 배지**(G/G/P)로 표시됩니다. 공식 로고를 사용하고 싶다면 `public/icons/` 폴더에 다음 파일명으로 PNG를 배치하세요:

| 파일 | 모델 |
|---|---|
| `public/icons/gpt.png` | OpenAI ChatGPT |
| `public/icons/gemini.png` | Google Gemini |
| `public/icons/perplexity.png` | Perplexity |

> 로고 파일은 상표권 보호 대상이므로 저장소에 포함되지 않습니다. 파일이 없어도 앱은 정상 동작합니다.

---

## 작동 방식

```
사용자가 종목 입력
   │
   ▼
[Yahoo Finance v8 chart로 시세 조회]
   │
   ▼
Round 1: GPT, Gemini 병렬 호출 (각자 독립 의견)
   │
   ▼
Round 2: 다른 모델의 1차 의견을 컨텍스트로 주입 → 반박/동의/보완
   │
   ▼
Round 3: 다른 모델의 2차 의견을 보고 최종 입장 확정
   │
   ▼
Perplexity sonar-reasoning-pro: 6개 의견 + 실시간 검색 → 종합 요약
   │
   ▼
data/history/{timestamp}_{TICKER}.json 으로 자동 저장
```

라운드 간은 직렬, 라운드 내 2개 모델은 병렬 호출 (`Promise.all`).

---

## 비용 가이드

1회 분석당 호출 = **6 (토론) + 1 (Perplexity 종합) = 7 콜**, 모두 웹 검색 포함.

| 모델 | 1회 분석 호출 수 | 추정 비용 |
|---|---|---|
| GPT-5.4 | 3 | ~$0.10 |
| Gemini 3 Pro | 3 | ~$0.10 |
| Perplexity Sonar Reasoning Pro | 1 | ~$0.05 |
| **합계** | **7** | **~$0.25 / 회** |

> **비용 절감 팁**: 각 모델 파일에서 `gpt-5.4` → `gpt-5.4-mini`, `gemini-3-pro-preview` → `gemini-3-flash-preview`로 바꾸면 회당 $0.05 수준까지 내려갑니다.

---

## 기술 스택

- **Framework**: Next.js 16 (App Router, Turbopack)
- **언어**: TypeScript 5.7+
- **스타일**: Tailwind CSS v4
- **AI SDK**: Vercel `ai` v6 + `@ai-sdk/openai`/`google` v3
- **애니메이션**: Framer Motion
- **아이콘**: Lucide React + 각 사 공식 로고
- **폰트**: Geist Sans / Mono
- **시세**: Yahoo Finance v8 chart endpoint (인증 불필요)
- **이력**: 로컬 JSON 파일 (DB 없음)

---

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts    # SSE 토론 오케스트레이션
│   │   ├── quote/route.ts      # 시세 API
│   │   ├── tickers/route.ts    # 자동완성
│   │   └── history/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── TickerSearch.tsx        # 자동완성 입력
│   ├── PriceHeader.tsx         # 시세 헤더 (3분할)
│   ├── ModelToggleBar.tsx      # 모델 활성/비활성 토글
│   ├── Gauge.tsx + GaugePanel  # 포지션 게이지 (진행률 카운트업)
│   ├── OpinionCard.tsx         # 카드별 접기/펼치기
│   ├── DiscussionGrid.tsx      # 2 모델 × 3 라운드 토론 그리드
│   ├── SynthesisPanel.tsx      # Perplexity 종합 (블록 분리)
│   └── Disclaimer.tsx
└── lib/
    ├── types.ts
    ├── models/
    │   ├── prompts.ts          # 라운드별 프롬프트 빌더
    │   ├── parse.ts            # <think> 제거 + balanced JSON 추출
    │   ├── gpt.ts / gemini.ts / perplexity.ts
    │   └── index.ts
    ├── orchestrator/
    │   └── index.ts            # 3 라운드 오케스트레이션
    └── data/
        ├── quote.ts            # Yahoo Finance v8
        ├── tickers.ts          # 미국 주식 정적 리스트
        └── history.ts          # JSON 파일 I/O
```

---

## 모델 변경

각 LLM 어댑터 파일 상단의 `model:` 라인 한 줄만 바꾸면 즉시 교체됩니다.

```ts
// src/lib/models/gpt.ts
model: openai.responses("gpt-5.4"),  // → "gpt-5.4-mini" 등
```

지원 모델 ID는 `node_modules/@ai-sdk/{provider}/dist/index.d.ts`에서 확인 가능.

---

## 알려진 제약

- **시총 표시 안 됨** — Yahoo v8 chart가 시총을 제공하지 않아 "—"로 표시
- **Anthropic Opus 토큰 비용 부담** — Sonnet으로 다운그레이드 권장
- **Yahoo Finance 비공식 API** — 갑자기 막힐 가능성 있음 (대안: Alpha Vantage, Finnhub)
- **JSON 파서 의존** — LLM이 JSON 형식을 깨면 폴백 처리되지만, 가끔 빈약한 응답이 나올 수 있음

---

## 면책 조항

본 서비스는 **투자 자문이 아닌 정보 제공 목적**으로만 제공되는 AI 분석 도구입니다.

- 한국 자본시장법상 투자자문업·투자권유에 해당하지 않습니다
- 모든 투자 결정과 손익에 대한 책임은 사용자 본인에게 있습니다
- AI 모델은 잘못된 정보나 환각을 생성할 수 있습니다
- 반드시 추가 리서치와 본인 판단을 거쳐 의사결정하세요

---

## 라이선스

[MIT](LICENSE)

---

## Claude Code 사용자라면

[`QUICK_INSTALL.md`](QUICK_INSTALL.md) 파일을 Claude Code에 통째로 붙여넣으면 클론·설치·키 안내·서버 실행까지 자동으로 진행됩니다 (1~2분 소요).
