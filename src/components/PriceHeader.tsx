"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
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

  return (
    <div className="grid grid-cols-1 items-center gap-4 rounded-xl border bg-[var(--color-surface)]/60 px-5 py-4 backdrop-blur sm:grid-cols-3 sm:gap-6">
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
