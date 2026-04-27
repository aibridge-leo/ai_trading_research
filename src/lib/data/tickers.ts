// 미국 주식 주요 종목 (S&P 500 + NASDAQ 100 핵심 + 인기 종목)
// 자동완성용. 부족하면 추후 Finnhub API로 확장 가능.
export interface TickerEntry {
  symbol: string;
  name: string;
  exchange: "NASDAQ" | "NYSE";
  sector?: string;
}

export const TICKERS: TickerEntry[] = [
  // Mega-cap tech
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc. Class A", exchange: "NASDAQ", sector: "Communication" },
  { symbol: "GOOG", name: "Alphabet Inc. Class C", exchange: "NASDAQ", sector: "Communication" },
  { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", sector: "Consumer Discretionary" },
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ", sector: "Communication" },
  { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", sector: "Consumer Discretionary" },
  { symbol: "AVGO", name: "Broadcom Inc.", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "ORCL", name: "Oracle Corporation", exchange: "NYSE", sector: "Technology" },

  // Semiconductors
  { symbol: "TSM", name: "Taiwan Semiconductor Manufacturing", exchange: "NYSE", sector: "Technology" },
  { symbol: "AMD", name: "Advanced Micro Devices Inc.", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "INTC", name: "Intel Corporation", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "QCOM", name: "QUALCOMM Incorporated", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "MU", name: "Micron Technology Inc.", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "ASML", name: "ASML Holding N.V.", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "ARM", name: "Arm Holdings plc", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "MRVL", name: "Marvell Technology Inc.", exchange: "NASDAQ", sector: "Technology" },

  // Software / Cloud
  { symbol: "CRM", name: "Salesforce Inc.", exchange: "NYSE", sector: "Technology" },
  { symbol: "ADBE", name: "Adobe Inc.", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "NOW", name: "ServiceNow Inc.", exchange: "NYSE", sector: "Technology" },
  { symbol: "INTU", name: "Intuit Inc.", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "SNOW", name: "Snowflake Inc.", exchange: "NYSE", sector: "Technology" },
  { symbol: "PLTR", name: "Palantir Technologies Inc.", exchange: "NASDAQ", sector: "Technology" },
  { symbol: "SHOP", name: "Shopify Inc.", exchange: "NYSE", sector: "Technology" },
  { symbol: "SQ", name: "Block Inc.", exchange: "NYSE", sector: "Technology" },
  { symbol: "PYPL", name: "PayPal Holdings Inc.", exchange: "NASDAQ", sector: "Financials" },
  { symbol: "UBER", name: "Uber Technologies Inc.", exchange: "NYSE", sector: "Industrials" },
  { symbol: "ABNB", name: "Airbnb Inc.", exchange: "NASDAQ", sector: "Consumer Discretionary" },
  { symbol: "NFLX", name: "Netflix Inc.", exchange: "NASDAQ", sector: "Communication" },
  { symbol: "DIS", name: "The Walt Disney Company", exchange: "NYSE", sector: "Communication" },
  { symbol: "SPOT", name: "Spotify Technology S.A.", exchange: "NYSE", sector: "Communication" },
  { symbol: "ROKU", name: "Roku Inc.", exchange: "NASDAQ", sector: "Communication" },
  { symbol: "COIN", name: "Coinbase Global Inc.", exchange: "NASDAQ", sector: "Financials" },
  { symbol: "MSTR", name: "MicroStrategy Incorporated", exchange: "NASDAQ", sector: "Technology" },

  // EV / Auto
  { symbol: "F", name: "Ford Motor Company", exchange: "NYSE", sector: "Consumer Discretionary" },
  { symbol: "GM", name: "General Motors Company", exchange: "NYSE", sector: "Consumer Discretionary" },
  { symbol: "RIVN", name: "Rivian Automotive Inc.", exchange: "NASDAQ", sector: "Consumer Discretionary" },
  { symbol: "LCID", name: "Lucid Group Inc.", exchange: "NASDAQ", sector: "Consumer Discretionary" },
  { symbol: "NIO", name: "NIO Inc.", exchange: "NYSE", sector: "Consumer Discretionary" },
  { symbol: "XPEV", name: "XPeng Inc.", exchange: "NYSE", sector: "Consumer Discretionary" },

  // Financials / Banks
  { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE", sector: "Financials" },
  { symbol: "BAC", name: "Bank of America Corporation", exchange: "NYSE", sector: "Financials" },
  { symbol: "WFC", name: "Wells Fargo & Company", exchange: "NYSE", sector: "Financials" },
  { symbol: "GS", name: "The Goldman Sachs Group Inc.", exchange: "NYSE", sector: "Financials" },
  { symbol: "MS", name: "Morgan Stanley", exchange: "NYSE", sector: "Financials" },
  { symbol: "C", name: "Citigroup Inc.", exchange: "NYSE", sector: "Financials" },
  { symbol: "V", name: "Visa Inc.", exchange: "NYSE", sector: "Financials" },
  { symbol: "MA", name: "Mastercard Incorporated", exchange: "NYSE", sector: "Financials" },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", exchange: "NYSE", sector: "Financials" },
  { symbol: "BLK", name: "BlackRock Inc.", exchange: "NYSE", sector: "Financials" },
  { symbol: "SCHW", name: "The Charles Schwab Corporation", exchange: "NYSE", sector: "Financials" },

  // Healthcare / Pharma
  { symbol: "UNH", name: "UnitedHealth Group Incorporated", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "JNJ", name: "Johnson & Johnson", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "LLY", name: "Eli Lilly and Company", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "PFE", name: "Pfizer Inc.", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "MRK", name: "Merck & Co. Inc.", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "ABBV", name: "AbbVie Inc.", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "TMO", name: "Thermo Fisher Scientific Inc.", exchange: "NYSE", sector: "Healthcare" },
  { symbol: "NVO", name: "Novo Nordisk A/S", exchange: "NYSE", sector: "Healthcare" },

  // Consumer
  { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE", sector: "Consumer Staples" },
  { symbol: "COST", name: "Costco Wholesale Corporation", exchange: "NASDAQ", sector: "Consumer Staples" },
  { symbol: "KO", name: "The Coca-Cola Company", exchange: "NYSE", sector: "Consumer Staples" },
  { symbol: "PEP", name: "PepsiCo Inc.", exchange: "NASDAQ", sector: "Consumer Staples" },
  { symbol: "PG", name: "The Procter & Gamble Company", exchange: "NYSE", sector: "Consumer Staples" },
  { symbol: "MCD", name: "McDonald's Corporation", exchange: "NYSE", sector: "Consumer Discretionary" },
  { symbol: "SBUX", name: "Starbucks Corporation", exchange: "NASDAQ", sector: "Consumer Discretionary" },
  { symbol: "NKE", name: "NIKE Inc.", exchange: "NYSE", sector: "Consumer Discretionary" },
  { symbol: "HD", name: "The Home Depot Inc.", exchange: "NYSE", sector: "Consumer Discretionary" },
  { symbol: "LOW", name: "Lowe's Companies Inc.", exchange: "NYSE", sector: "Consumer Discretionary" },
  { symbol: "TGT", name: "Target Corporation", exchange: "NYSE", sector: "Consumer Discretionary" },

  // Energy
  { symbol: "XOM", name: "Exxon Mobil Corporation", exchange: "NYSE", sector: "Energy" },
  { symbol: "CVX", name: "Chevron Corporation", exchange: "NYSE", sector: "Energy" },
  { symbol: "COP", name: "ConocoPhillips", exchange: "NYSE", sector: "Energy" },
  { symbol: "OXY", name: "Occidental Petroleum Corporation", exchange: "NYSE", sector: "Energy" },

  // Industrials
  { symbol: "BA", name: "The Boeing Company", exchange: "NYSE", sector: "Industrials" },
  { symbol: "CAT", name: "Caterpillar Inc.", exchange: "NYSE", sector: "Industrials" },
  { symbol: "GE", name: "GE Aerospace", exchange: "NYSE", sector: "Industrials" },
  { symbol: "HON", name: "Honeywell International Inc.", exchange: "NASDAQ", sector: "Industrials" },
  { symbol: "RTX", name: "RTX Corporation", exchange: "NYSE", sector: "Industrials" },
  { symbol: "LMT", name: "Lockheed Martin Corporation", exchange: "NYSE", sector: "Industrials" },

  // ETF / 인덱스
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", exchange: "NYSE", sector: "ETF" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", exchange: "NASDAQ", sector: "ETF" },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", exchange: "NYSE", sector: "ETF" },
  { symbol: "DIA", name: "SPDR Dow Jones Industrial Average ETF", exchange: "NYSE", sector: "ETF" },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", exchange: "NYSE", sector: "ETF" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", exchange: "NYSE", sector: "ETF" },
  { symbol: "ARKK", name: "ARK Innovation ETF", exchange: "NYSE", sector: "ETF" },
  { symbol: "SOXL", name: "Direxion Daily Semiconductor Bull 3X Shares", exchange: "NYSE", sector: "ETF" },
  { symbol: "TQQQ", name: "ProShares UltraPro QQQ", exchange: "NASDAQ", sector: "ETF" },
];

export function searchTickers(query: string, limit = 8): TickerEntry[] {
  const q = query.trim().toUpperCase();
  if (!q) return [];

  // 정확 매칭 (티커) > 티커 prefix > 회사명 부분 매칭
  const exact: TickerEntry[] = [];
  const prefix: TickerEntry[] = [];
  const nameMatch: TickerEntry[] = [];

  for (const t of TICKERS) {
    if (t.symbol === q) {
      exact.push(t);
    } else if (t.symbol.startsWith(q)) {
      prefix.push(t);
    } else if (t.name.toUpperCase().includes(q)) {
      nameMatch.push(t);
    }
  }

  return [...exact, ...prefix, ...nameMatch].slice(0, limit);
}
