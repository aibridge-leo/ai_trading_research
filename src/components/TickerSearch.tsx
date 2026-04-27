"use client";

import { useEffect, useRef, useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TickerEntry } from "@/lib/data/tickers";

interface Props {
  onSubmit: (ticker: string) => void;
  disabled?: boolean;
}

export function TickerSearch({ onSubmit, disabled }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TickerEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const ac = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tickers?q=${encodeURIComponent(query)}`, {
          signal: ac.signal,
        });
        const data = (await res.json()) as { results: TickerEntry[] };
        setResults(data.results);
        setHighlight(0);
      } catch {
        /* aborted */
      }
    }, 80);
    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(symbol?: string) {
    const t = (symbol ?? query).toUpperCase().trim();
    if (!t) return;
    setOpen(false);
    onSubmit(t);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div
        className={cn(
          "relative flex items-center gap-3 rounded-2xl border bg-[var(--color-surface)]/80 backdrop-blur-md transition",
          "focus-within:border-emerald-500/60 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]",
          disabled && "opacity-60",
        )}
      >
        <Search className="ml-4 h-4 w-4 text-[var(--color-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((h) => Math.min(results.length - 1, h + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(0, h - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (open && results[highlight]) {
                submit(results[highlight].symbol);
              } else {
                submit();
              }
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="종목 티커 또는 회사명 (예: AAPL, Tesla)"
          disabled={disabled}
          className="flex-1 bg-transparent py-4 text-base outline-none placeholder:text-[var(--color-muted)] disabled:cursor-not-allowed"
        />
        <button
          onClick={() => submit()}
          disabled={disabled || !query.trim()}
          className={cn(
            "mr-2 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
            "bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20",
            "hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
          )}
        >
          <TrendingUp className="h-4 w-4" />
          분석 시작
        </button>
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border bg-[var(--color-surface-elevated)] shadow-2xl">
          {results.map((r, i) => (
            <button
              key={r.symbol}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => submit(r.symbol)}
              className={cn(
                "flex w-full items-center justify-between px-4 py-3 text-left transition",
                i === highlight ? "bg-[var(--color-surface)]" : "hover:bg-[var(--color-surface)]",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-emerald-400">
                  {r.symbol}
                </span>
                <span className="text-sm text-[var(--color-muted-foreground)]">{r.name}</span>
              </div>
              <span className="text-xs text-[var(--color-muted)]">{r.exchange}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
