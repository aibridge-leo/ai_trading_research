import { NextRequest } from "next/server";
import { fetchQuote } from "@/lib/data/quote";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim();
  if (!symbol) {
    return Response.json({ error: "symbol 파라미터 필요" }, { status: 400 });
  }
  const quote = await fetchQuote(symbol);
  if (!quote) {
    return Response.json({ error: "시세를 가져올 수 없습니다." }, { status: 404 });
  }
  return Response.json(quote);
}
