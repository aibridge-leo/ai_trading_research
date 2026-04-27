import { NextRequest } from "next/server";
import { searchTickers } from "@/lib/data/tickers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  return Response.json({ results: searchTickers(q) });
}
