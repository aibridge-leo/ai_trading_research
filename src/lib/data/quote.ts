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

interface YahooChartResult {
  meta: YahooChartMeta;
  timestamp?: number[];
  indicators?: {
    quote?: { close?: (number | null)[]; volume?: (number | null)[] }[];
  };
}

interface YahooChartResponse {
  chart?: {
    result?: YahooChartResult[];
    error?: { code: string; description: string } | null;
  };
}

export async function fetchQuote(symbol: string): Promise<QuoteSnapshot | null> {
  const ticker = symbol.toUpperCase().trim();
  if (!/^[A-Z.\-]{1,10}$/.test(ticker)) return null;

  try {
    // range=7d: 최근 거래일 5~7개를 받아 close[-2]를 진짜 직전 거래일 종가로 사용.
    // chartPreviousClose는 "range 시작 직전 종가"라 잘못된 기준 (예: range=2d면 3일 전 종가).
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=7d`;
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
    const result = data.chart?.result?.[0];
    const meta = result?.meta;
    if (!meta || meta.regularMarketPrice === undefined) return null;

    const price = meta.regularMarketPrice;

    // 직전 거래일 종가: close 배열에서 마지막 유효값의 직전(끝-2)
    // close[-1]은 오늘(또는 가장 최신) 종가/현재가이고, close[-2]가 진짜 어제 종가.
    const closes = (result?.indicators?.quote?.[0]?.close ?? []).filter(
      (c): c is number => typeof c === "number" && Number.isFinite(c),
    );
    let prevClose: number;
    if (closes.length >= 2) {
      // 마지막 close가 현재가와 거의 같으면 그게 "오늘" → 직전(끝-2) 사용
      // 다르면 마지막 close 자체가 직전 거래일 (장 시작 전 등)
      const last = closes[closes.length - 1];
      const isLastToday = Math.abs(last - price) < 0.01;
      prevClose = isLastToday ? closes[closes.length - 2] : last;
    } else if (closes.length === 1) {
      prevClose = closes[0];
    } else {
      // 폴백: chartPreviousClose (정확하지 않지만 없으면 0% 표시 방지)
      prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    }

    const change = price - prevClose;
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

    return {
      symbol: meta.symbol,
      shortName: meta.shortName ?? meta.longName ?? null,
      price,
      change,
      changePercent,
      // v8 chart에는 시총이 없음
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
