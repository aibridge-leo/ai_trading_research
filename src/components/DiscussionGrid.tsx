"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { OpinionCard } from "./OpinionCard";
import { ModelIcon } from "./ModelIcon";
import { ModelToggleBar } from "./ModelToggleBar";
import { MODELS, type ModelId, type ModelOpinion } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  opinions: ModelOpinion[];
  currentRound: 1 | 2 | 3 | null;
  disabledModels: Set<ModelId>;
  onToggleModel: (id: ModelId) => void;
  toggleLocked: boolean;
}

const ROUNDS: (1 | 2 | 3)[] = [1, 2, 3];

export function DiscussionGrid({
  opinions,
  currentRound,
  disabledModels,
  onToggleModel,
  toggleLocked,
}: Props) {
  // 일괄 펼침/접기 신호. null이면 카드 자체 상태 유지.
  // 토글 클릭마다 [true, null, false, null, true, ...]가 아니라 단순히 true/false를 새 객체로 보내서
  // 자식이 다시 렌더 트리거되도록 nonce를 함께 사용.
  const [bulkSignal, setBulkSignal] = useState<{ value: boolean; nonce: number } | null>(null);
  const hasOpinions = opinions.length > 0;

  return (
    <div className="space-y-4">
      {/* 모델 헤더 + 토글 */}
      <ModelToggleBar
        disabledModels={disabledModels}
        onToggleModel={onToggleModel}
        locked={toggleLocked}
      />

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
            <div className="grid grid-cols-3 gap-4 pl-2">
              {MODELS.map((m) => {
                const disabled = disabledModels.has(m.id);
                if (disabled) {
                  return (
                    <motion.div
                      key={`${m.id}-${round}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-[var(--color-surface)]/20 p-4"
                    >
                      <ModelIcon model={m} size={36} disabled />
                      <span className="text-xs text-[var(--color-muted)]">
                        {m.label} 비활성화됨
                      </span>
                    </motion.div>
                  );
                }
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
