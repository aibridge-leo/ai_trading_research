import { ShieldAlert } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="mt-12 flex gap-3 rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 text-xs text-amber-200/80">
      <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
      <p className="leading-relaxed">
        <strong className="text-amber-200">투자 자문이 아닌 정보 제공 목적</strong>으로 제공되는
        AI 분석 결과입니다. 본 서비스는 한국 자본시장법상 투자자문업·투자권유에 해당하지 않으며,
        모든 투자 결정과 손익에 대한 책임은 사용자 본인에게 있습니다. AI 모델은 잘못된 정보나
        환각을 생성할 수 있으니 반드시 추가 리서치와 본인 판단을 거쳐 의사결정하세요.
      </p>
    </div>
  );
}
