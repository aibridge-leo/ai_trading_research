"use client";

import { ArrowDownRight, ArrowUpRight, Info } from "lucide-react";
import { cn, formatCompactUSD, formatNumber, formatPercent } from "@/lib/utils";
import type { QuoteSnapshot } from "@/lib/types";

interface Props {
  ticker: string;
  quote: QuoteSnapshot | null;
}

export function PriceHeader({ ticker, quote }: Props) {
  if (!quote) {
    return (
      <div className="flex items-baseline justify-between rounded-xl border bg-[var(--color-surface)]/60 px-5 py-4">
        <div>
          <div className="font-mono text-2xl font-bold tracking-tight">{ticker}</div>
          <div className="text-xs text-[var(--color-muted)]">시세 정보를 가져오는 중...</div>
        </div>
      </div>
    );
  }

  const up = quote.changePercent >= 0;
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  const fetchedLabel = formatFetchedAt(quote.fetchedAt);

  return (
    <div className="rounded-xl border bg-[var(--color-surface)]/60 backdrop-blur">
      <div className="grid grid-cols-1 items-center gap-4 px-5 py-4 sm:grid-cols-3 sm:gap-6">
        {/* 좌: 티커 */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight">{quote.symbol}</span>
            <span className="text-xs text-[var(--color-muted)]">{quote.exchange}</span>
          </div>
          <div className="mt-0.5 truncate text-sm text-[var(--color-muted-foreground)]">
            {quote.shortName}
          </div>
        </div>

        {/* 중: 가격 + 등락률 (가운데 정렬) */}
        <div className="flex items-baseline justify-start gap-3 sm:justify-center">
          <span className="font-mono text-3xl font-semibold tabular-nums">
            ${quote.price.toFixed(2)}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-medium tabular-nums",
              up ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400",
            )}
          >
            <Arrow className="h-3.5 w-3.5" />
            {formatPercent(quote.changePercent)} ({up ? "+" : ""}
            {quote.change.toFixed(2)})
          </span>
        </div>

        {/* 우: 시총 + 거래량 */}
        <div className="flex justify-start gap-6 text-sm sm:justify-end">
          <Stat
            label="시총"
            value={quote.marketCap ? formatCompactUSD(quote.marketCap) : "—"}
          />
          <Stat
            label="거래량"
            value={quote.volume ? formatNumber(quote.volume) : "—"}
          />
        </div>
      </div>

      {/* 출처 / 기준 캡션 */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-[var(--color-border-subtle)] px-5 py-2 text-[11px] text-[var(--color-muted)]">
        <span className="flex items-center gap-1.5">
          <Info className="h-3 w-3" />
          시세 출처: <span className="text-foreground/70">Yahoo Finance</span>
          <span className="opacity-60">(무료 비공식 API · 약 15~20분 지연 가능)</span>
        </span>
        <span>
          등락률 기준:{" "}
          <span className="text-foreground/70">정규장 종가 기준 직전 거래일 대비</span>
          {fetchedLabel && (
            <>
              {" · "}
              조회: <span className="text-foreground/70">{fetchedLabel}</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{label}</div>
      <div className="mt-0.5 font-mono tabular-nums">{value}</div>
    </div>
  );
}

function formatFetchedAt(iso: string): string | null {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  } catch {
    return null;
  }
}
