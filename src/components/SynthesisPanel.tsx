"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  AlertTriangle,
  Loader2,
  Target,
  Shield,
  Crosshair,
  MessageSquareQuote,
  Sparkles,
  Scale,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelIcon } from "./ModelIcon";
import { PERPLEXITY_META, type Position, type SynthesisPayload } from "@/lib/types";

interface Props {
  synthesis: SynthesisPayload | null;
  loading: boolean;
  partialText?: string;
}

const CONSENSUS_STYLE: Record<
  Position,
  { label: string; color: string; bg: string }
> = {
  롱: {
    label: "롱 (매수 우위)",
    color: "text-emerald-300",
    bg: "from-emerald-500/20 to-cyan-500/10 border-emerald-500/30",
  },
  숏: {
    label: "숏 (매도 우위)",
    color: "text-red-300",
    bg: "from-red-500/20 to-orange-500/10 border-red-500/30",
  },
  관망: {
    label: "관망 (의견 분분)",
    color: "text-amber-300",
    bg: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
  },
};

const SUMMARY_PREVIEW_CHARS = 180;

export function SynthesisPanel({ synthesis, loading, partialText }: Props) {
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  if (!loading && !synthesis) return null;

  const style = synthesis ? CONSENSUS_STYLE[synthesis.consensus] : null;
  const summary = synthesis?.summary ?? "";
  const summaryIsLong = summary.length > SUMMARY_PREVIEW_CHARS;
  const summaryToShow =
    summaryIsLong && !summaryExpanded
      ? summary.slice(0, SUMMARY_PREVIEW_CHARS).trimEnd() + "…"
      : summary;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-6",
        style?.bg ?? "from-cyan-500/10 to-blue-500/5 border-cyan-500/20",
      )}
    >
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-perplexity)]/15">
            <ModelIcon model={PERPLEXITY_META} size={26} />
          </div>
          <div>
            <div className="text-sm font-semibold">{PERPLEXITY_META.label} 종합 판단</div>
            <div className="text-xs text-[var(--color-muted)]">
              {PERPLEXITY_META.provider} · 실시간 웹 검색 보강
            </div>
          </div>
        </div>
        {synthesis && style && (
          <div
            className={cn(
              "rounded-lg border bg-black/20 px-3 py-1.5 text-sm font-semibold",
              style.color,
            )}
          >
            {style.label}
          </div>
        )}
        {loading && !synthesis && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            종합 분석 중...
          </div>
        )}
      </div>

      {/* 가격 가이드 스트립 */}
      {synthesis &&
        (synthesis.target_price !== null ||
          synthesis.stop_loss !== null ||
          synthesis.entry_zone) && (
          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <PriceCell
              icon={<Target className="h-4 w-4" />}
              label="목표가"
              value={
                synthesis.target_price !== null
                  ? `$${formatPrice(synthesis.target_price)}`
                  : null
              }
              tone="long"
            />
            <PriceCell
              icon={<Shield className="h-4 w-4" />}
              label="손절가"
              value={
                synthesis.stop_loss !== null ? `$${formatPrice(synthesis.stop_loss)}` : null
              }
              tone="short"
            />
            <PriceCell
              icon={<Crosshair className="h-4 w-4" />}
              label="진입 권장 구간"
              value={synthesis.entry_zone}
              tone="neutral"
            />
          </div>
        )}

      {/* 핵심 결론 블록 */}
      <div className="mt-5 rounded-xl border border-white/5 bg-black/25 p-4">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
          <MessageSquareQuote className="h-3 w-3" />
          핵심 결론
        </div>
        <div className="mt-2">
          {synthesis ? (
            <p className="text-[15px] leading-relaxed text-[var(--color-foreground)]/95">
              {summaryToShow}
            </p>
          ) : partialText ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              {partialText}
            </p>
          ) : (
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-[var(--color-border)]" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-[var(--color-border)]" />
            </div>
          )}
        </div>
        {summaryIsLong && (
          <button
            type="button"
            onClick={() => setSummaryExpanded((x) => !x)}
            className="mt-2 flex items-center gap-1 rounded-md border border-[var(--color-border-subtle)] px-2 py-0.5 text-[11px] text-[var(--color-muted-foreground)] transition hover:border-[var(--color-border)] hover:text-foreground"
          >
            {summaryExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> 줄여 보기
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> 전체 보기 ({summary.length.toLocaleString()}자)
              </>
            )}
          </button>
        )}
      </div>

      {/* 보강 정보 + 대립 포인트: 2단 그리드 */}
      {synthesis &&
        (synthesis.fresh_insights.length > 0 ||
          synthesis.notable_disagreements.length > 0) && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <InsightBlock
              icon={<Sparkles className="h-3.5 w-3.5" />}
              title="실시간 보강 정보"
              accent="text-cyan-400"
              dot="bg-cyan-400"
              items={synthesis.fresh_insights}
            />
            <InsightBlock
              icon={<Scale className="h-3.5 w-3.5" />}
              title="모델 간 대립"
              accent="text-amber-400"
              dot="bg-amber-400"
              items={synthesis.notable_disagreements}
            />
          </div>
        )}

      {/* 경고 */}
      {synthesis?.warning && (
        <div className="mt-4 flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{synthesis.warning}</span>
        </div>
      )}

      {/* 출처 */}
      {synthesis && synthesis.citations.length > 0 && (
        <div className="mt-5 border-t border-white/5 pt-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            출처 ({synthesis.citations.length})
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {synthesis.citations.map((c, i) => (
              <a
                key={i}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-md border bg-black/20 px-2 py-1 text-xs text-[var(--color-muted-foreground)] transition hover:border-cyan-500/40 hover:text-cyan-300"
              >
                <span className="max-w-[200px] truncate">
                  {c.title || safeHostname(c.url)}
                </span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}

interface PriceCellProps {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  tone: "long" | "short" | "neutral";
}

const TONE_COLORS = {
  long: { text: "text-emerald-300", icon: "text-emerald-400", border: "border-emerald-500/20" },
  short: { text: "text-red-300", icon: "text-red-400", border: "border-red-500/20" },
  neutral: { text: "text-amber-200", icon: "text-amber-400", border: "border-amber-500/20" },
};

function PriceCell({ icon, label, value, tone }: PriceCellProps) {
  const c = TONE_COLORS[tone];
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-black/30 px-3 py-2.5",
        value ? c.border : "border-[var(--color-border-subtle)] opacity-60",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-black/40",
          value && c.icon,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
          {label}
        </div>
        <div
          className={cn(
            "truncate font-mono text-sm font-semibold tabular-nums",
            value ? c.text : "text-[var(--color-muted)]",
          )}
        >
          {value ?? "제시 안함"}
        </div>
      </div>
    </div>
  );
}

interface InsightBlockProps {
  icon: React.ReactNode;
  title: string;
  accent: string;
  dot: string;
  items: string[];
}

function InsightBlock({ icon, title, accent, dot, items }: InsightBlockProps) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-lg border border-white/5 bg-black/25 p-4">
      <div
        className={cn(
          "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider",
          accent,
        )}
      >
        {icon}
        {title}
      </div>
      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
        {items.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className={cn("mt-1.5 h-1 w-1 shrink-0 rounded-full", dot)} />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatPrice(n: number): string {
  if (Math.abs(n - Math.round(n)) < 0.005) return Math.round(n).toLocaleString();
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
