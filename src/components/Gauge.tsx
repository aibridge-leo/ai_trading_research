"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ModelIcon } from "./ModelIcon";
import type { ModelMeta, Position } from "@/lib/types";

interface Props {
  model: ModelMeta;
  // -100 (강한 숏) ~ +100 (강한 롱)
  strength: number | null;
  // 0~100
  confidence: number | null;
  position: Position | null;
  loading?: boolean;
  disabled?: boolean;
  // 0~100, 라운드 진행률 (분석 중 시각화용)
  progress?: number;
}

const SIZE = 200;
const RADIUS = 78;
const STROKE = 14;
const CY = SIZE / 2 + 4;
const CX = SIZE / 2;

// 0-100 사이 값을 부드럽게 카운트업
function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const start = fromRef.current;
    const end = target;
    if (start === end) return;
    const startTime = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = start + (end - start) * eased;
      setValue(v);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = end;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

export function Gauge({
  model,
  strength,
  confidence,
  position,
  loading,
  disabled,
  progress,
}: Props) {
  const hasData = strength !== null && confidence !== null && position !== null;
  const s = hasData ? Math.max(-100, Math.min(100, strength!)) : 0;

  // 진행률 (0~100). 분석 중이며 아직 100% 미만일 때 카운트업 표시.
  const progressPct = progress ?? (hasData ? 100 : 0);
  const isAnalyzing = !!loading && !disabled && progressPct < 100;
  const animatedProgress = useCountUp(progressPct);

  // 진행률을 호 길이에 매핑 (0~100 → 0~PI*RADIUS)
  const arcLen = Math.PI * RADIUS;
  const progressOffset = arcLen * (1 - animatedProgress / 100);

  // -100~100 → -90deg~90deg
  const needleAngle = (s / 100) * 90;

  const color = !hasData
    ? "#3a3a44"
    : position === "롱"
      ? "#10b981"
      : position === "숏"
        ? "#ef4444"
        : "#f59e0b";

  // 진행 중일 땐 게이지 색상을 모델 액센트로
  const progressColor = isAnalyzing ? model.accent : color;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-[var(--color-surface)]/60 p-5 backdrop-blur transition-opacity",
        disabled && "opacity-40",
      )}
    >
      {/* 헤더 */}
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <ModelIcon model={model} size={22} disabled={disabled} />
          <span className="text-sm font-semibold">{model.label}</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
          {model.provider.split("·")[1]?.trim() ?? ""}
        </span>
      </div>

      {/* 게이지 */}
      <div className="relative flex justify-center" style={{ height: SIZE / 2 + 36 }}>
        <svg
          width={SIZE}
          height={SIZE / 2 + 28}
          viewBox={`0 0 ${SIZE} ${SIZE / 2 + 28}`}
        >
          <defs>
            <linearGradient id={`grad-${model.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          {/* 배경 호 */}
          <path
            d={describeArc(CX, CY, RADIUS, -90, 90)}
            fill="none"
            stroke={isAnalyzing ? "#1f1f26" : `url(#grad-${model.id})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
            opacity={hasData || isAnalyzing ? 0.9 : 0.35}
          />

          {/* 진행률 호 (분석 중일 때 모델 색상으로 채워짐) */}
          {isAnalyzing && (
            <motion.path
              d={describeArc(CX, CY, RADIUS, -90, 90)}
              fill="none"
              stroke={progressColor}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={arcLen}
              strokeDashoffset={progressOffset}
              style={{
                filter: `drop-shadow(0 0 6px ${progressColor}80)`,
              }}
              initial={false}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {/* 눈금 (분석 완료 후에만) */}
          {!isAnalyzing &&
            [-100, -50, 0, 50, 100].map((v) => {
              const angle = (v / 100) * 90;
              const inner = polarToCartesian(CX, CY, RADIUS - STROKE / 2 - 2, angle);
              const outer = polarToCartesian(CX, CY, RADIUS + STROKE / 2 + 2, angle);
              return (
                <line
                  key={v}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={v === 0 ? "#71717a" : "#3a3a44"}
                  strokeWidth={v === 0 ? 1.8 : 1}
                />
              );
            })}

          {/* 바늘 (분석 완료 후) */}
          {hasData && !isAnalyzing && (
            <motion.g
              initial={{ rotate: 0 }}
              animate={{ rotate: needleAngle }}
              transition={{ type: "spring", stiffness: 60, damping: 12 }}
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            >
              <line
                x1={CX}
                y1={CY}
                x2={CX}
                y2={CY - RADIUS - 2}
                stroke={color}
                strokeWidth={3}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
              />
              <circle cx={CX} cy={CY} r={6} fill={color} />
              <circle cx={CX} cy={CY} r={3} fill="#0a0a0b" />
            </motion.g>
          )}
        </svg>

        {/* 분석 중: 가운데 큰 % */}
        {isAnalyzing && (
          <div
            className="pointer-events-none absolute inset-x-0 flex flex-col items-center justify-center"
            style={{ top: SIZE / 2 - 36 }}
          >
            <div
              className="font-mono text-3xl font-bold tabular-nums"
              style={{ color: progressColor, textShadow: `0 0 12px ${progressColor}60` }}
            >
              {String(Math.round(animatedProgress)).padStart(2, "0")}
              <span className="text-xl">%</span>
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
              분석 중
            </div>
          </div>
        )}

        {/* 양 끝 + 중앙 라벨 (분석 완료 후) */}
        {!isAnalyzing && (
          <>
            <div
              className="pointer-events-none absolute left-3 text-[10px] font-medium text-red-400/80"
              style={{ top: SIZE / 2 + 8 }}
            >
              강한 숏
            </div>
            <div
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[10px] font-medium text-amber-400/80"
              style={{ top: SIZE / 2 + 8 }}
            >
              중립
            </div>
            <div
              className="pointer-events-none absolute right-3 text-[10px] font-medium text-emerald-400/80"
              style={{ top: SIZE / 2 + 8 }}
            >
              강한 롱
            </div>
          </>
        )}
      </div>

      {/* 통계 */}
      <div className="space-y-2.5 border-t border-[var(--color-border-subtle)] pt-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
            포지션
          </span>
          <span
            className={cn("text-sm font-semibold", !hasData && "text-[var(--color-muted)]")}
            style={{ color: hasData ? color : undefined }}
          >
            {disabled
              ? "비활성"
              : isAnalyzing
                ? `${Math.ceil(animatedProgress / 33.34)}/3 라운드`
                : hasData
                  ? position
                  : "—"}
          </span>
        </div>

        <StatBar
          label="강도"
          value={hasData ? s : null}
          min={-100}
          max={100}
          color={color}
          format={(v) => `${v > 0 ? "+" : ""}${v}`}
          shimmer={isAnalyzing}
        />

        <StatBar
          label="신뢰도"
          value={hasData ? confidence! : null}
          min={0}
          max={100}
          color="#a1a1aa"
          format={(v) => `${v}%`}
          shimmer={isAnalyzing}
        />
      </div>
    </div>
  );
}

interface StatBarProps {
  label: string;
  value: number | null;
  min: number;
  max: number;
  color: string;
  format: (v: number) => string;
  shimmer?: boolean;
}

function StatBar({ label, value, min, max, color, format, shimmer }: StatBarProps) {
  const isSigned = min < 0;
  const range = max - min;
  const pct = value === null ? 0 : ((value - min) / range) * 100;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
          {label}
        </span>
        <span className="font-mono text-xs tabular-nums text-[var(--color-foreground)]/90">
          {value === null ? (shimmer ? "··" : "—") : format(value)}
        </span>
      </div>
      <div
        className={cn(
          "relative h-1.5 overflow-hidden rounded-full bg-[var(--color-border-subtle)]",
          shimmer && value === null && "shimmer-bar",
        )}
      >
        {isSigned && (
          <div className="absolute left-1/2 top-0 h-full w-px bg-[var(--color-muted)]/40" />
        )}
        {value !== null && (
          <motion.div
            initial={{ width: 0 }}
            animate={
              isSigned
                ? value >= 0
                  ? { left: "50%", width: `${(value / max) * 50}%` }
                  : {
                      left: `${50 + (value / Math.abs(min)) * 50}%`,
                      width: `${(Math.abs(value) / Math.abs(min)) * 50}%`,
                    }
                : { left: 0, width: `${pct}%` }
            }
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-0 h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
      </div>
    </div>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}
