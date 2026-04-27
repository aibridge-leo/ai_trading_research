# AI Compete — 멀티 LLM 미국 주식 포지션 분석 대시보드 (One-Shot Prompt)

> 아래 내용을 통째로 Claude Code에 붙여넣으세요. 빈 폴더에서 시작하면 풀스택 Next.js 앱이 완성됩니다.

---

## 🎯 프로젝트 목표

미국 주식 티커를 입력하면 **GPT · Gemini · Claude** 3개 LLM이 실시간 웹서치 기반으로 **3 라운드 토론**(독립 의견 → 상호 검토 → 최종 입장)을 진행하고, **Perplexity**가 9개 의견을 받아 실시간 서치로 보강한 **종합 분석**을 내는 대시보드를 만들어 주세요. 모든 응답은 한국어 강제, 다크 모드 트레이딩 대시보드 톤.

---

## 🛠 기술 스택 (정확한 버전)

| 항목 | 버전/선택 |
|---|---|
| Framework | Next.js **16.x** (App Router, Turbopack) |
| 언어 | TypeScript 5.7+ |
| 스타일 | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| AI SDK | Vercel `ai` v6 + `@ai-sdk/openai` v3 + `@ai-sdk/google` v3 + `@ai-sdk/anthropic` v3 |
| 애니메이션 | Framer Motion v11 |
| 아이콘 | Lucide React |
| 폰트 | Geist Sans + Geist Mono (`geist` 패키지) |
| 유틸 | `clsx`, `tailwind-merge`, `class-variance-authority`, `zod` |
| Node | 20+ (개발 시 24 사용) |

> **주의**: AI SDK v5/v6에서 모델 어댑터의 web search tool API가 v4와 다릅니다. 반드시 `@ai-sdk/anthropic@^3`, `@ai-sdk/google@^3`, `@ai-sdk/openai@^3`, `ai@^6` 사용. v1.x를 쓰면 Claude/Gemini의 web search 툴이 노출되지 않습니다.

> **폴더명 주의**: `npx create-next-app` 사용 시 폴더명에 공백/대문자가 있으면 거부됩니다. `package.json`을 직접 작성해 수동 셋업 권장 (이 프롬프트도 그 방식).

---

## 🤖 LLM 구성 (절대 최신 모델, 2026-04 기준)

토론 참여 (3 라운드 × 3 모델 = 9개 의견):

| 모델 | ID | Web Search Tool |
|---|---|---|
| GPT | `gpt-5.4` | `openai.responses("gpt-5.4")` + `openai.tools.webSearchPreview({ searchContextSize: "medium" })` |
| Gemini | `gemini-3-pro-preview` | `google.tools.googleSearch({})` |
| Claude | `claude-opus-4-7` | `anthropic.tools.webSearch_20250305({ maxUses: 5 })` |

종합 (1회):

| 모델 | ID | 비고 |
|---|---|---|
| Perplexity | `sonar-reasoning-pro` | 검색·인용 내장. raw fetch (`https://api.perplexity.ai/chat/completions`) |

각 파일에 **저비용 대체 모델**을 주석으로 명시: `gpt-5.4-mini` / `gemini-3-flash-preview` / `claude-sonnet-4-6`.

---

## 🔑 환경변수 (`.env.local`)

```
OPENAI_API_KEY=sk-proj-...
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...
```

> Anthropic API 키는 **Claude.ai 구독과 별개**. console.anthropic.com에서 결제 등록 후 발급해야 함을 README에 명시.

`.env.local.example`을 함께 작성하고 `.gitignore`에 `.env*` 추가.

---

## 📐 아키텍처

### 토론 흐름 (서버 측 오케스트레이션)

```
종목 입력
   │
   ▼
[Yahoo Finance v8 chart로 시세 조회]
   │
   ▼
Round 1: GPT, Gemini, Claude 병렬 호출 (각자 독립 의견)
   │
   ▼
Round 2: 각 모델에 "다른 두 모델의 1차 의견"을 컨텍스트로 주입 → 반박/동의/보완
   │
   ▼
Round 3: 각 모델에 "다른 두 모델의 2차 의견" 주입 → 최종 입장
   │
   ▼
Perplexity sonar-reasoning-pro: 9개 의견 + 실시간 서치 → 종합 요약
   │
   ▼
JSON 파일로 이력 저장
```

- **라운드 간 직렬, 라운드 내 3개 모델 병렬** (`Promise.all`)
- 모델 호출 실패 시 placeholder opinion으로 graceful degrade (다른 모델 진행 계속)
- **모델별 토글**: 사용자가 GPT/Gemini/Claude 중 선택적으로 비활성화 가능. 비활성 모델은 토론 컨텍스트에서도 완전히 제외.

### 스트리밍 (SSE)

`POST /api/analyze` → `text/event-stream` 응답. 이벤트 타입:

```ts
type StreamEvent =
  | { type: "start"; ticker: string; quote: QuoteSnapshot | null }
  | { type: "round-begin"; round: 1 | 2 | 3 }
  | { type: "opinion"; opinion: ModelOpinion }
  | { type: "model-error"; modelId: ModelId; round: 1|2|3; message: string }
  | { type: "synthesis-begin" }
  | { type: "synthesis-delta"; text: string }
  | { type: "synthesis"; payload: SynthesisPayload }
  | { type: "done"; recordId: string }
  | { type: "error"; message: string };
```

프론트는 fetch streaming 리더로 받아 각 카드를 실시간 갱신.

---

## 📊 데이터 스키마

```ts
type ModelId = "gpt" | "gemini" | "claude";
type Position = "롱" | "숏" | "관망";

interface OpinionPayload {
  position: Position;
  confidence: number;      // 0-100
  strength: number;        // -100 ~ +100 (음수 = 숏 강도, 양수 = 롱 강도)
  target_price: number | null;
  stop_loss: number | null;
  key_reasons: string[];   // 3개 내외
  body: string;            // 자유 서술 본문 (한국어)
}

interface ModelOpinion extends OpinionPayload {
  modelId: ModelId;
  round: 1 | 2 | 3;
}

interface QuoteSnapshot {
  symbol: string;
  shortName: string | null;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number | null;  // v8 chart엔 없으므로 null
  volume: number | null;
  currency: string;
  exchange: string | null;
  fetchedAt: string;
}

interface SynthesisPayload {
  summary: string;                    // 150~280자 평문 (마크다운 금지)
  consensus: Position;
  target_price: number | null;
  stop_loss: number | null;
  entry_zone: string | null;          // "$110~$120 눌림 후" 같은 자유 텍스트
  notable_disagreements: string[];    // 4개 이내, 한 줄
  fresh_insights: string[];           // 5개 이내, 숫자/날짜 포함 권장
  citations: { title: string; url: string }[];
  warning?: string;
}

interface AnalysisRecord {
  id: string;
  ticker: string;
  startedAt: string;
  finishedAt: string | null;
  quote: QuoteSnapshot | null;
  opinions: ModelOpinion[];
  synthesis: SynthesisPayload | null;
}
```

---

## 🧠 프롬프트 설계

### 공통 시스템 프롬프트 (3 라운드 모두)

- 한국어 강제, 종목명/지표는 영문 병기 가능
- 웹 검색 도구 적극 활용 지시
- 펀더멘털·기술적·매크로·카탈리스트·리스크 모두 다루기
- **출력 형식 강제**:
  ```
  [자유 서술 본문 - 마크다운 가능, 800~1500자]

  ---JSON---
  { position, confidence, strength, target_price, stop_loss, key_reasons }
  ```

### 라운드별 사용자 프롬프트

- **Round 1**: 종목 + 시세만 주고 독립 의견
- **Round 2**: "당신의 1차 + 다른 두 모델의 1차"를 보여주고 반박/동의/보완 유도
- **Round 3**: "당신의 1·2차 + 다른 두 모델의 2차"를 보여주고 최종 입장 확정. 본문은 200~400자로 간결히.

### Perplexity 시스템 프롬프트 (별도)

- **마크다운 보고서·헤더·표·긴 본문 금지**. 모든 정보는 JSON 필드로 분산
- summary: 150~280자 한 단락 평문
- fresh_insights: 5개 이내, 각 한 줄 ≤60자, 숫자/% 포함
- notable_disagreements: 4개 이내, "GPT는 X, Gemini는 Y" 형식
- 출력 마지막에 `---JSON---` 구분자 + JSON 객체

---

## 🔧 파서 (`src/lib/models/parse.ts`) — 견고하게 구현

LLM 응답에서 JSON을 안전하게 추출하는 게 핵심. 다음 4가지 처리:

1. **`<think>...</think>` 블록 제거** (sonar-reasoning-pro가 추론 트레이스 출력)
2. **균형 잡힌 중괄호 매칭** — 문자열 내 `{`, `}`, escape 문자 정확히 무시. 정규식 대신 직접 walking 구현
3. **3단계 폴백**: `---JSON---` 뒤 → ```\`\`\`json``` 펜스 → 가장 긴 balanced `{...}`
4. **흔한 JSON 오류 자동 보정**: trailing comma, smart quotes(`"` `"` `'` `'`)

`summary`가 비어있을 때만 본문 폴백 (전체 본문 노출 방지). 첫 단락만 280자로 잘라 사용.

---

## 🎨 UI 레이아웃

### 페이지 흐름 (위→아래)

```
[헤더: AI Compete 로고 + 부제]
[검색창: 티커 자동완성]
[모델 토글 바: 검색 전엔 별도 표시, 검색 후엔 토론 그리드 상단에 통합]
─── 분석 시작 후 ───
[시세 헤더: 좌(티커) | 중(가격+등락률) | 우(시총+거래량) — grid-cols-3]
[진행 인디케이터]
[3 라운드 토론 (3×3 카드 그리드)]
[모델별 최종 포지션 게이지 (가로 3열)]   ← 토론 하단
[Perplexity 종합 판단 패널]
[면책 문구 — 자본시장법 안전장치]
```

### 색상 팔레트 (다크 모드 기본)

```css
--color-background: #0a0a0b;
--color-surface: #111114;
--color-surface-elevated: #1a1a1f;
--color-border: #2a2a32;
--color-foreground: #f4f4f5;
--color-muted: #71717a;
--color-long: #10b981;       /* emerald */
--color-short: #ef4444;      /* red */
--color-neutral: #f59e0b;    /* amber */
--color-gpt: #10a37f;
--color-gemini: #4285f4;
--color-claude: #d97706;
--color-perplexity: #20b8cd;
```

상단 글로우(`bg-radial-glow`), 브랜드 그라데이션(`text-gradient-brand`), pulse-ring 애니메이션 추가.

### 게이지 디자인 (`Gauge.tsx`)

- 반원형 SVG (200×100), 중심 바늘
- 배경 호: 빨강→앰버→녹색 그라데이션 (좌=강한 숏, 우=강한 롱)
- −100/−50/0/+50/+100 5개 눈금
- 바늘 = strength 위치 (-90°~+90°), 색상 = position
- 호 아래 라벨: "강한 숏 / 중립 / 강한 롱"
- **하단에 강도 바 + 신뢰도 바 분리 표시** (호와 별개로) — 강도 바는 가운데 0 기준 좌우 채움
- 게이지 섹션 상단에 한 줄 캡션: "바늘=포지션 방향과 강도, 강도 바=−100~+100, 신뢰도 바=0~100%"

### 분석 진행 중 시각화

게이지 (모델당):
- 호가 회색으로 비워지고 모델 액센트 색으로 점진적 채워짐 (0/33/66/100%)
- 가운데 큰 "00%~95%" 카운트업 + textShadow glow
- 호 1.6s 주기 펄스
- "포지션" 행은 "1/3 라운드" 식 표기

토론 카드 (라운드당):
- 점근 곡선 `pct = 95 × (1 − e^(-경과초/8))` — 8s≈63%, 25s≈92%, 무한대→95%
- 가운데 큰 "XX%" 카운트업
- 하단 진행 바 (모델 색)
- 우상단 경과 시간 "12s"
- 강도/신뢰도 바는 shimmer 애니메이션 (좌→우 흐르는 그라데이션)

### 토론 카드 (`OpinionCard.tsx`) 접기/펼치기

**기본 접힘 상태**: 헤더(N차 의견 + 포지션 배지), 메타 행(신뢰도/강도/목표/손절)까지만 표시.

**본문은 완전히 숨김** (미리보기 X). "본문 보기 (XXX자)" 버튼으로 토글.

펼치면: 본문(max-h-600 스크롤) + 핵심 근거 불릿. 본문 길이 무관하게 항상 토글 가능.

`DiscussionGrid` 우상단에 **"전체 펼치기 / 전체 접기"** 일괄 토글 버튼 (nonce 패턴으로 자식 카드 강제 동기화).

### Perplexity 종합 패널 (`SynthesisPanel.tsx`)

블록 분리 구조:

1. 헤더 (Perplexity 로고 + 합의 배지)
2. 가격 가이드 3분할 스트립: 🎯 목표가(녹) / 🛡️ 손절가(적) / 📍 진입 권장 구간(앰버)
3. 💬 핵심 결론 박스 (180자 미리보기, 길면 "전체 보기" 토글)
4. 좌(✨ 실시간 보강 정보) / 우(⚖️ 모델 간 대립) 2단 그리드
5. ⚠️ 경고 (있을 때만)
6. 📚 출처 칩 (외부 링크)

### 모델 토글

- 카드 형태 버튼 3개 (아이콘 + 모델명 + 프로바이더 + Power 아이콘)
- 비활성: `opacity-25 grayscale` + 점선 테두리 + "비활성" 배지
- 분석 중엔 토글 잠김
- 0개 활성 시 "분석 시작" 버튼 비활성 + 경고 표시

---

## 🌐 외부 데이터

### Yahoo Finance (시세) — v8 chart 사용 (v7은 NOT)

`https://query1.finance.yahoo.com/v7/finance/quote`은 인증 강화로 자주 실패. **반드시 v8 chart 엔드포인트 사용**:

```
GET https://query1.finance.yahoo.com/v8/finance/chart/{TICKER}?interval=1d&range=2d
```

User-Agent 헤더 필수 (`Mozilla/5.0 ...`). 응답의 `chart.result[0].meta`에서 가격/거래량/거래소명/`chartPreviousClose` 추출. **시총은 이 엔드포인트에 없음** → null로 두고 UI는 "—" 표시.

### 티커 자동완성

S&P 500 + NASDAQ 100 핵심 + 인기 ETF 약 90개를 정적 배열로 하드코딩 (`src/lib/data/tickers.ts`).
검색 우선순위: **정확 매칭 > 티커 prefix > 회사명 부분 매칭**.
`/api/tickers?q=AAPL` → 최대 8개 반환.

### JSON 이력 저장

분석 완료 시 `data/history/{ISO타임스탬프}_{TICKER}.json`에 9개 의견 + 종합 전체 보존. `data/history/.gitkeep` 추가하고 `.gitignore`에 `/data/history/*.json !.gitkeep`.

---

## 📁 파일 구조

```
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts      # SSE 토론 오케스트레이션
│   │   │   ├── quote/route.ts        # Yahoo Finance v8 시세
│   │   │   ├── tickers/route.ts      # 티커 자동완성
│   │   │   └── history/route.ts      # 이력 목록
│   │   ├── globals.css               # Tailwind v4 + 커스텀 변수/애니메이션
│   │   ├── layout.tsx                # GeistSans/Mono, ko lang
│   │   └── page.tsx                  # 메인 페이지 (상태 + 스트리밍)
│   ├── components/
│   │   ├── TickerSearch.tsx
│   │   ├── PriceHeader.tsx           # grid-cols-3 (좌/중/우)
│   │   ├── ModelIcon.tsx             # GPT 로고는 invertOnDark 처리
│   │   ├── ModelToggleBar.tsx
│   │   ├── Gauge.tsx                 # 진행률 카운트업 + 완료 후 정상 게이지
│   │   ├── GaugePanel.tsx
│   │   ├── OpinionCard.tsx           # 접기 기본, 본문 완전 숨김
│   │   ├── DiscussionGrid.tsx        # 일괄 펼치기/접기 버튼
│   │   ├── SynthesisPanel.tsx        # 블록 분리 레이아웃
│   │   └── Disclaimer.tsx
│   └── lib/
│       ├── types.ts
│       ├── utils.ts                  # cn, 포맷터
│       ├── models/
│       │   ├── prompts.ts            # 시스템/라운드별 프롬프트 빌더
│       │   ├── parse.ts              # <think> 제거 + balanced JSON 추출
│       │   ├── gpt.ts
│       │   ├── gemini.ts
│       │   ├── claude.ts
│       │   ├── perplexity.ts         # raw fetch
│       │   └── index.ts              # callModel + 120s timeout
│       ├── orchestrator/
│       │   └── index.ts              # 3 라운드 + 종합 + 이력 저장
│       └── data/
│           ├── quote.ts              # Yahoo v8
│           ├── tickers.ts            # 정적 리스트
│           └── history.ts            # JSON 파일 I/O
├── public/icons/
│   ├── gpt.png         # OpenAI 검정 로고 (다크모드에서 invert)
│   ├── gemini.png      # 4점 별 컬러
│   ├── claude.png      # Anthropic 오렌지 sparkle
│   └── perplexity.png  # 시안 심볼
├── data/history/.gitkeep
├── .env.local.example
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── package.json
└── README.md
```

> **아이콘**: 4개 PNG를 `public/icons/`에 직접 배치해야 합니다 (저작권 있는 공식 로고). 없으면 `ModelIcon` 컴포넌트가 fallback으로 색깔 원을 표시하도록 구현.

---

## ⚠️ 알려진 함정 (반드시 회피)

1. **Yahoo v7 quote 엔드포인트 쓰지 말 것** → 401/쿠키 인증 요구. 무조건 v8 chart 사용.
2. **AI SDK 버전** → v1.x는 Claude/Gemini의 web search tool이 노출 안 됨. 반드시 v6+ (`@ai-sdk/anthropic@^3` 등).
3. **CVE-2025-66478** → Next.js 15.1.x는 보안 취약점. `next@latest` (16.x)로 업그레이드.
4. **`<think>` 블록** → sonar-reasoning-pro가 추론을 노출. 파서에서 반드시 제거.
5. **JSON 파싱 폴백** → `summary`가 비면 본문 전체로 폴백하지 말 것 (마크다운 보고서 전체가 노출됨). 첫 단락만 잘라 사용.
6. **모델 호출 실패** → throw하지 말고 placeholder opinion 반환. 다른 모델은 계속.
7. **종목 입력 검증** → `/^[A-Z.\-]{1,10}$/`로 sanitize.
8. **API 키 보안** → 모든 LLM 호출은 백엔드 라우트에서. 프론트 노출 절대 금지.
9. **자본시장법 면책 문구** → 하단 고정 ("투자 자문이 아닌 정보 제공 목적").

---

## 🚀 Windows용 .bat 런처 (선택 사항)

`{Desktop}/AI-Compete-Start.bat`:

```batch
@echo off
title AI Compete Dev Server
setlocal

set "PROJECT_DIR=<프로젝트_절대경로>"
set "URL=http://localhost:3000"

cd /d "%PROJECT_DIR%"
if not "%errorlevel%"=="0" ( echo Cannot find project & pause & exit /b 1 )

if not exist "node_modules\" (
    call npm install
    if not "%errorlevel%"=="0" ( echo npm install failed & pause & exit /b 1 )
)

netstat -ano | findstr ":3000" | findstr "LISTENING" > nul 2>&1
if "%errorlevel%"=="0" (
    echo Already running. Opening browser...
    start "" "%URL%"
    pause
    exit /b 0
)

start "" /min cmd /c "ping -n 7 127.0.0.1 > nul & start "" %URL%"
call npm run dev
pause
```

> **반드시 영문만 사용**. 한글 메시지 넣으면 cmd가 .bat을 CP949로 파싱해서 mojibake로 명령 오인식 발생. `^<` `^>` 같은 escape 문자도 if 블록 안에서 parser 충돌 위험 → 회피.

---

## ✅ 사용자 액션 (Claude Code 작업 후)

1. `npm run dev` (또는 .bat 더블클릭)
2. `.env.local`에 4개 API 키 입력
3. 브라우저에서 `http://localhost:3000` → 종목 입력 → 분석 시작
4. 30~75초 후 결과 (Anthropic 토큰 사용량 가장 많음, 회당 약 $0.50~$2)

---

## 🎬 Claude Code에게 부탁

위 스펙대로 **빈 폴더에서 시작해 동작하는 앱까지 한 번에 구현**해 주세요. 순서:

1. `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.local.example` 작성
2. `npm install` 실행
3. `src/` 트리 전체 작성 (위 파일 구조 그대로)
4. `public/icons/` 폴더 생성 (사용자가 PNG를 직접 배치하도록 README에 안내, 또는 fallback UI)
5. `data/history/.gitkeep` 생성
6. `npx tsc --noEmit`로 타입체크 통과 확인
7. `npm run dev`로 서버 기동 확인 (포트 200 응답 + `/api/quote?symbol=AAPL` 동작 확인)
8. README.md 작성 (Anthropic API 키 안내 강조)

진행 중 막히는 지점은 사용자에게 명확히 질문하세요. 막연한 추측보다 한 번 묻는 편이 안전합니다.
