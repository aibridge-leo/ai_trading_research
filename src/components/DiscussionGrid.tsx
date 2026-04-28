"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, ChevronsDown, ChevronsUp } from "lucide-react";
import { OpinionCard } from "./OpinionCard";
import { ModelIcon } from "./ModelIcon";
import { MODELS, type ModelOpinion } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  opinions: ModelOpinion[];
  currentRound: 1 | 2 | 3 | null;
}

const ROUNDS: (1 | 2 | 3)[] = [1, 2, 3];

type RoundExpandState = Record<1 | 2 | 3, boolean>;

export function DiscussionGrid({ opinions, currentRound }: Props) {
  // 라운드별 expand 상태. 같은 라운드의 모든 모델 카드 본문이 함께 토글됨.
  const [roundExpanded, setRoundExpanded] = useState<RoundExpandState>({
    1: false,
    2: false,
    3: false,
  });

  const toggleRound = (r: 1 | 2 | 3) =>
    setRoundExpanded((s) => ({ ...s, [r]: !s[r] }));
  const expandAll = () =>
    setRoundExpanded({ 1: true, 2: true, 3: true });
  const collapseAll = () =>
    setRoundExpanded({ 1: false, 2: false, 3: false });

  const hasOpinions = opinions.length > 0;
  const allExpanded = ROUNDS.every((r) => roundExpanded[r]);
  const allCollapsed = ROUNDS.every((r) => !roundExpanded[r]);

  return (
    <div className="space-y-4">
      {/* 모델 헤더 (토글 없는 단순 표시) */}
      <div className="grid grid-cols-2 gap-4">
        {MODELS.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-xl border bg-[var(--color-surface)]/40 px-4 py-3"
            style={{ borderColor: `${m.accent}40` }}
          >
            <ModelIcon model={m} size={32} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{m.label}</div>
              <div className="truncate text-[11px] text-[var(--color-muted)]">
                {m.provider}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 일괄 펼침/접기 (모든 라운드) */}
      {hasOpinions && (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={expandAll}
            disabled={allExpanded}
            className="flex items-center gap-1 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/40 px-2.5 py-1 text-[11px] text-[var(--color-muted-foreground)] transition hover:border-[var(--color-border)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronsDown className="h-3 w-3" />
            전체 펼치기
          </button>
          <button
            type="button"
            onClick={collapseAll}
            disabled={allCollapsed}
            className="flex items-center gap-1 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/40 px-2.5 py-1 text-[11px] text-[var(--color-muted-foreground)] transition hover:border-[var(--color-border)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronsUp className="h-3 w-3" />
            전체 접기
          </button>
        </div>
      )}

      {/* 라운드 행 */}
      {ROUNDS.map((round) => {
        const isCurrent = currentRound === round;
        const isPast = currentRound !== null && round < currentRound;
        const roundOpinions = opinions.filter((o) => o.round === round);
        const isExpanded = roundExpanded[round];
        const totalChars = roundOpinions.reduce(
          (sum, o) => sum + (o.body?.length ?? 0),
          0,
        );
        const hasAnyBody = totalChars > 0;

        return (
          <div key={round} className="space-y-2">
            {/* 라운드 헤더: 번호 + 라벨 + 본문 토글 */}
            <div className="flex items-center justify-between gap-2 pl-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border bg-[var(--color-surface-elevated)] text-[10px] font-bold tabular-nums",
                    isCurrent && "border-emerald-500/60 text-emerald-400 animate-pulse-ring",
                    isPast && "border-[var(--color-border)] text-[var(--color-muted-foreground)]",
                    !isCurrent && !isPast && "text-[var(--color-muted)]",
                  )}
                >
                  {round}
                </span>
                <span className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
                  {round}차 의견
                </span>
              </div>

              {/* 라운드 단위 본문 토글 (이 라운드에 본문이 있을 때만) */}
              {hasAnyBody && (
                <button
                  type="button"
                  onClick={() => toggleRound(round)}
                  className="flex items-center gap-1 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/40 px-2.5 py-1 text-[11px] text-[var(--color-muted-foreground)] transition hover:border-[var(--color-border)] hover:text-foreground"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      본문 접기
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      본문 보기 (총 {totalChars.toLocaleString()}자)
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 카드 그리드 */}
            <div className="grid grid-cols-2 gap-4 pl-2">
              {MODELS.map((m) => {
                const op =
                  opinions.find((o) => o.modelId === m.id && o.round === round) ?? null;
                return (
                  <OpinionCard
                    key={`${m.id}-${round}`}
                    opinion={op}
                    round={round}
                    loading={isCurrent && !op}
                    accent={m.accent}
                    expanded={isExpanded}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
