"use client";

import { Gauge } from "./Gauge";
import { MODELS, type ModelOpinion } from "@/lib/types";

interface Props {
  opinions: ModelOpinion[];
  loading: boolean;
}

export function GaugePanel({ opinions, loading }: Props) {
  // 각 모델의 최종(3차) 의견을 사용. 없으면 가장 최근 라운드.
  const latestByModel = (modelId: string) => {
    const r3 = opinions.find((o) => o.modelId === modelId && o.round === 3);
    if (r3) return r3;
    const r2 = opinions.find((o) => o.modelId === modelId && o.round === 2);
    if (r2) return r2;
    return opinions.find((o) => o.modelId === modelId && o.round === 1) ?? null;
  };

  const completedRoundsFor = (modelId: string) =>
    opinions.filter((o) => o.modelId === modelId).length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {MODELS.map((m) => {
        const op = latestByModel(m.id);
        const completed = completedRoundsFor(m.id);
        const progress = (completed / 3) * 100; // 0, 33.33, 66.66, 100
        const allDone = completed === 3;
        return (
          <Gauge
            key={m.id}
            model={m}
            // 분석 진행 중에는 최종 데이터처럼 표시하지 않고 진행률만 보여줌
            strength={loading && !allDone ? null : (op?.strength ?? null)}
            confidence={loading && !allDone ? null : (op?.confidence ?? null)}
            position={loading && !allDone ? null : (op?.position ?? null)}
            loading={loading}
            progress={loading ? progress : allDone ? 100 : undefined}
          />
        );
      })}
    </div>
  );
}
