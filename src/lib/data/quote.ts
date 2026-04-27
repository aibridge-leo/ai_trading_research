import type { QuoteSnapshot } from "@/lib/types";

interface YahooChartMeta {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  previousClose?: number;
  regularMarketVolume?: number;
  currency?: string;
  fullExchangeName?: string;
  exchangeName?: string;
}

interface YahooChartResponse {
  chart?: {
    result?: { meta: YahooChartMeta }[];
    error?: { code: string; description: string } | null;
  };
}

export async function fetchQuote(symbol: string): Promise<QuoteSnapshot | null> {
  const ticker = symbol.toUpperCase().trim();
  if (!/^[A-Z.\-]{1,10}$/.test(ticker)) return null;

  try {
    // v8 chart 엔드포인트: 인증 없이도 동작하며, 가격/이전 종가/거래량 등 핵심 메타 제공
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) return null;
    const data = (await res.json()) as YahooChartResponse;
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta || meta.regularMarketPrice === undefined) return null;

    const prev = meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice;
    const change = meta.regularMarketPrice - prev;
    const changePercent = prev > 0 ? (change / prev) * 100 : 0;

    return {
      symbol: meta.symbol,
      shortName: meta.shortName ?? meta.longName ?? null,
      price: meta.regularMarketPrice,
      change,
      changePercent,
      // v8 chart에는 시총이 없음 — UI에서 "—" 표시. (별도 엔드포인트 필요시 추후 보강)
      marketCap: null,
      volume: meta.regularMarketVolume ?? null,
      currency: meta.currency ?? "USD",
      exchange: meta.fullExchangeName ?? meta.exchangeName ?? null,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[fetchQuote] failed:", err);
    return null;
  }
}
