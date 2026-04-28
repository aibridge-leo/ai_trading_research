"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ModelMeta } from "@/lib/types";

interface Props {
  model: Pick<ModelMeta, "icon" | "label" | "invertOnDark" | "accent">;
  size?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * 모델 아이콘. 이미지 로드 실패 시(404 등) 자동으로 모델 액센트 색상의
 * 원형 배지(이니셜)로 폴백. 따라서 public/icons/ 의 PNG가 없어도 앱은 정상 동작.
 */
export function ModelIcon({ model, size = 24, disabled, className }: Props) {
  const [errored, setErrored] = useState(false);

  if (errored || !model.icon) {
    const initial = model.label.charAt(0).toUpperCase();
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm transition-all duration-300",
          disabled && "opacity-25 grayscale",
          className,
        )}
        style={{
          width: size,
          height: size,
          backgroundColor: model.accent,
          fontSize: Math.max(10, size * 0.45),
          lineHeight: 1,
        }}
        aria-label={model.label}
      >
        {initial}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={model.icon}
      alt={model.label}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className={cn(
        "shrink-0 transition-all duration-300",
        model.invertOnDark && "invert brightness-200 contrast-100",
        disabled && "opacity-25 grayscale",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
