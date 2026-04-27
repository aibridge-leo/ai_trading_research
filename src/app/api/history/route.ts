import { listAnalyses } from "@/lib/data/history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const records = await listAnalyses(20);
  // 응답 크기 제한: 본문은 잘라서
  const slim = records.map((r) => ({
    id: r.id,
    ticker: r.ticker,
    startedAt: r.startedAt,
    finishedAt: r.finishedAt,
    quote: r.quote,
    consensus: r.synthesis?.consensus ?? null,
  }));
  return Response.json({ records: slim });
}
