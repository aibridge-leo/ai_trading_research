"use client";

import { useState } from "react";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { OpinionCard } from "./OpinionCard";
import { ModelIcon } from "./ModelIcon";
import { MODELS, type ModelOpinion } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  opinions: ModelOpinion[];
  currentRound: 1 | 2 | 3 | null;
}

const ROUNDS: (1 | 2 | 3)[] = [1, 2, 3];

export function DiscussionGrid({ opinions, currentRound }: Props) {
  // 일괄 펼침/접기 신호 (nonce 패턴으로 자식 카드 강제 동기화)
  const [bulkSignal, setBulkSignal] = useState<{ value: boolean; nonce: number } | null>(null);
  const hasOpinions = opinions.length > 0;

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

      {/* 일괄 펼침/접기 */}
      {hasOpinions && (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() =>
              setBulkSignal({ value: true, nonce: (bulkSignal?.nonce ?? 0) + 1 })
            }
            className="flex items-center gap-1 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/40 px-2.5 py-1 text-[11px] text-[var(--color-muted-foreground)] transition hover:border-[var(--color-border)] hover:text-foreground"
          >
            <ChevronsDown className="h-3 w-3" />
            전체 펼치기
          </button>
          <button
            type="button"
            onClick={() =>
              setBulkSignal({ value: false, nonce: (bulkSignal?.nonce ?? 0) + 1 })
            }
            className="flex items-center gap-1 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/40 px-2.5 py-1 text-[11px] text-[var(--color-muted-foreground)] transition hover:border-[var(--color-border)] hover:text-foreground"
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
        return (
          <div key={round} className="relative">
            <div className="absolute -left-3 top-3 z-10">
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
            </div>
            <div className="grid grid-cols-2 gap-4 pl-2">
              {MODELS.map((m) => {
                const op = opinions.find((o) => o.modelId === m.id && o.round === round) ?? null;
                return (
                  <OpinionCard
                    key={`${m.id}-${round}-${bulkSignal?.nonce ?? 0}`}
                    opinion={op}
                    round={round}
                    loading={isCurrent && !op}
                    accent={m.accent}
                    forceExpanded={bulkSignal?.value ?? null}
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
