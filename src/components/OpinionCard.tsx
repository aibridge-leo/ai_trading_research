"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModelOpinion, Position } from "@/lib/types";

interface Props {
  opinion: ModelOpinion | null;
  round: 1 | 2 | 3;
  loading: boolean;
  accent: string;
  // 외부에서 일괄 펼침/접기 제어
  forceExpanded?: boolean | null;
}

const POSITION_STYLE: Record<Position, { color: string; bg: string; Icon: typeof TrendingUp }> = {
  롱: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", Icon: TrendingUp },
  숏: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", Icon: TrendingDown },
  관망: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", Icon: Minus },
};

// 모델 응답 평균 ~12-20초로 예상. 점근적으로 ~95%까지 차오르고 실제 완료 시 100%로 스냅.
function useAsymptoticProgress(active: boolean): { pct: number; elapsedSec: number } {
  const [pct, setPct] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setPct(0);
      setElapsedSec(0);
      startRef.current = null;
      return;
    }
    startRef.current = performance.now();
    const tick = () => {
      if (startRef.current === null) return;
      const elapsed = (performance.now() - startRef.current) / 1000;
      // 점근 곡선: 95% * (1 - exp(-elapsed / 8))
      // 8s ~63%, 15s ~82%, 25s ~92%, ∞ ~95%
      const p = 95 * (1 - Math.exp(-elapsed / 8));
      setPct(p);
      setElapsedSec(elapsed);
    };
    tick();
    const id = window.setInterval(tick, 120);
    return () => window.clearInterval(id);
  }, [active]);

  return { pct, elapsedSec };
}

export function OpinionCard({ opinion, round, loading, accent, forceExpanded }: Props) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const { pct, elapsedSec } = useAsymptoticProgress(loading && !opinion);

  useEffect(() => {
    if (forceExpanded !== null && forceExpanded !== undefined) {
      setExpanded(forceExpanded);
    }
  }, [forceExpanded]);

  if (!opinion) {
    const showProgress = loading;
    const pctStr = String(Math.floor(pct)).padStart(2, "0");
    return (
      <div
        className={cn(
          "flex min-h-[140px] flex-col rounded-xl border border-dashed bg-[var(--color-surface)]/30 p-4",
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
            {round}차 의견
          </span>
          {showProgress && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] tabular-nums text-[var(--color-muted)]">
                {elapsedSec.toFixed(0)}s
              </span>
              <span
                className="h-2 w-2 animate-pulse-ring rounded-full"
                style={{ backgroundColor: accent }}
              />
            </div>
          )}
        </div>

        {showProgress ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-3">
            <div
              className="font-mono text-3xl font-bold tabular-nums"
              style={{ color: accent, textShadow: `0 0 10px ${accent}55` }}
            >
              {pctStr}
              <span className="text-xl">%</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
              분석 진행 중
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border-subtle)]">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: accent,
                  boxShadow: `0 0 8px ${accent}80`,
                }}
                animate={{ width: `${pct}%`, opacity: [0.7, 1, 0.7] }}
                transition={{
                  width: { duration: 0.3, ease: "linear" },
                  opacity: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
                }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-6 text-sm text-[var(--color-muted)]">대기 중</div>
        )}
      </div>
    );
  }

  const style = POSITION_STYLE[opinion.position];
  const Icon = style.Icon;
  const isError = opinion.confidence === 0 && opinion.key_reasons[0]?.startsWith("오류");
  const body = opinion.body ?? "";
  const hasDetails = body.length > 0 || opinion.key_reasons.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex flex-col rounded-xl border bg-[var(--color-surface)]/60 p-4 backdrop-blur",
        isError && "border-red-500/30",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
          {round}차 의견
        </span>
        {isError ? (
          <span className="flex items-center gap-1 text-[10px] text-red-400">
            <AlertCircle className="h-3 w-3" />
            오류
          </span>
        ) : (
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
              style.bg,
              style.color,
            )}
          >
            <Icon className="h-3 w-3" />
            {opinion.position}
          </div>
        )}
      </div>

      {!isError && (
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-[var(--color-muted-foreground)]">
          <span>
            신뢰도{" "}
            <span className="font-mono font-semibold text-foreground">
              {opinion.confidence}%
            </span>
          </span>
          <span>
            강도{" "}
            <span className="font-mono font-semibold text-foreground">
              {opinion.strength > 0 ? "+" : ""}
              {opinion.strength}
            </span>
          </span>
          {opinion.target_price && (
            <span>
              목표{" "}
              <span className="font-mono font-semibold text-emerald-400">
                ${opinion.target_price}
              </span>
            </span>
          )}
          {opinion.stop_loss && (
            <span>
              손절{" "}
              <span className="font-mono font-semibold text-red-400">
                ${opinion.stop_loss}
              </span>
            </span>
          )}
        </div>
      )}

      {/* 본문 + 핵심 근거: 펼친 상태에서만 노출 */}
      {expanded && !isError && (
        <>
          {body && (
            <div className="mt-3 max-h-[600px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-foreground)]/90">
              {body}
            </div>
          )}
          {opinion.key_reasons.length > 0 && (
            <div className="mt-3 border-t border-[var(--color-border-subtle)] pt-2">
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
                핵심 근거
              </div>
              <ul className="mt-1 space-y-0.5 text-xs text-[var(--color-muted-foreground)]">
                {opinion.key_reasons.map((r, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="text-[var(--color-muted)]">·</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {hasDetails && !isError && (
        <button
          type="button"
          onClick={() => setExpanded((x) => !x)}
          className="mt-3 flex items-center gap-1 self-start rounded-md border border-[var(--color-border-subtle)] px-2 py-0.5 text-[11px] text-[var(--color-muted-foreground)] transition hover:border-[var(--color-border)] hover:text-foreground"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              본문 접기
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              본문 보기{body.length > 0 ? ` (${body.length.toLocaleString()}자)` : ""}
            </>
          )}
        </button>
      )}
    </motion.div>
  );
}
