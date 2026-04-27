"use client";

import { cn } from "@/lib/utils";
import type { ModelMeta } from "@/lib/types";

interface Props {
  model: Pick<ModelMeta, "icon" | "label" | "invertOnDark">;
  size?: number;
  disabled?: boolean;
  className?: string;
}

export function ModelIcon({ model, size = 24, disabled, className }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={model.icon}
      alt={model.label}
      width={size}
      height={size}
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
