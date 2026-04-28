# AI Compete — 빠른 설치 (Claude Code 전용 One-Shot Prompt)

> 아래 내용을 통째로 Claude Code에 붙여넣으세요. 약 1~2분 후 바로 사용 가능합니다.

---

## 작업 지시

다음 작업을 순서대로 진행해 주세요. 각 단계가 완료될 때마다 짧게 보고하고, 막히면 즉시 사용자에게 알리세요.

### 1. 저장소 클론

```bash
git clone https://github.com/aibridge-leo/ai_trading_research.git
cd ai_trading_research
```

폴더가 이미 있으면 사용자에게 덮어쓸지 다른 폴더명을 쓸지 물어보세요.

### 2. 의존성 설치

```bash
npm install
```

설치는 1~2분 정도 걸립니다. 경고(warning)는 정상이지만, 에러가 나면 보고해 주세요.

### 3. 환경변수 파일 생성

`.env.local.example` 파일을 `.env.local`로 복사하세요.

```bash
cp .env.local.example .env.local
```

(Windows PowerShell이면 `Copy-Item .env.local.example .env.local`)

### 4. 사용자에게 API 키 발급 안내

`.env.local`은 비어있는 템플릿이므로, 사용자에게 **3개 키를 발급받아 채워달라고** 안내하세요:

| 키 | 발급처 | 비고 |
|---|---|---|
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys | 유료 (사용량 과금) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | https://aistudio.google.com/app/apikey | 무료 한도 충분 |
| `PERPLEXITY_API_KEY` | https://www.perplexity.ai/settings/api | $5 정도 충전 권장 |

키 입력이 끝났다는 사용자 응답을 받기 전에 다음 단계로 넘어가지 마세요.

### 5. 개발 서버 실행

```bash
npm run dev
```

`✓ Ready in ...ms` 메시지가 뜨면 브라우저에서 다음 URL을 안내하세요:

```
http://localhost:3000
```

### 6. 사용 안내

사용자에게 짧게 안내해 주세요:

- 검색창에 미국 주식 티커 입력 (예: `AAPL`, `NVDA`, `TSLA`)
- "분석 시작" 클릭
- 30~75초 후 결과 (GPT + Gemini 3 라운드 토론 + Perplexity 종합)
- 회당 비용 약 $0.25 예상
- 분석 이력은 `data/history/` 폴더에 JSON으로 자동 저장
- 모델 로고는 선택사항 (없으면 컬러 원 + 이니셜 폴백 표시)

---

## 막힐 때 자주 보는 이슈

- **포트 3000 이미 점유**: `lsof -i :3000` (mac/linux) 또는 작업관리자에서 `node.exe` 종료 후 재시도
- **`npm install` 중 EACCES 등 권한 오류**: 사용자 홈 디렉터리에서 시도하거나 sudo 없이 npm 설정 점검
- **`.env.local` 인식 안 됨**: 파일명 정확히 확인(`env.local` 아님), dev 서버 재시작
- **Anthropic 키 안내 X**: 이 앱은 Anthropic을 사용하지 않음 (이전 버전엔 있었으나 제거됨)

---

## 더 자세한 정보

저장소 README: https://github.com/aibridge-leo/ai_trading_research#readme
