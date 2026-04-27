"use client";

import { Power } from "lucide-react";
import { ModelIcon } from "./ModelIcon";
import { MODELS, type ModelId } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  disabledModels: Set<ModelId>;
  onToggleModel: (id: ModelId) => void;
  locked?: boolean;
}

export function ModelToggleBar({ disabledModels, onToggleModel, locked }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {MODELS.map((m) => {
        const disabled = disabledModels.has(m.id);
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => !locked && onToggleModel(m.id)}
            disabled={locked}
            aria-pressed={!disabled}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl border bg-[var(--color-surface)]/40 px-4 py-3 text-left transition-all",
              !locked &&
                "hover:bg-[var(--color-surface)]/70 cursor-pointer",
              locked && "cursor-not-allowed",
              disabled && "border-dashed",
            )}
            style={!disabled ? { borderColor: `${m.accent}40` } : undefined}
          >
            <ModelIcon model={m} size={32} disabled={disabled} />
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold transition",
                  disabled && "text-[var(--color-muted)]",
                )}
              >
                {m.label}
                {disabled && (
                  <span className="rounded bg-[var(--color-border)] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
                    비활성
                  </span>
                )}
              </div>
              <div
                className={cn(
                  "truncate text-[11px] text-[var(--color-muted)]",
                  disabled && "opacity-60",
                )}
              >
                {m.provider}
              </div>
            </div>
            <Power
              className={cn(
                "h-4 w-4 shrink-0 transition",
                disabled ? "text-[var(--color-muted)]" : "text-emerald-400",
                !locked && "group-hover:scale-110",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
