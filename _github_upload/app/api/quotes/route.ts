import { NextResponse } from "next/server";
import type { MarketQuote } from "@/types";

export const dynamic = "force-dynamic";

const manualOnlySymbols = new Set(["CASH", "MARGIN", "SPACEX"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = (searchParams.get("symbols") ?? "")
    .split(",")
    .map((symbol) => normalizeSymbol(symbol))
    .filter((symbol) => symbol && !manualOnlySymbols.has(symbol));

  const uniqueSymbols = [...new Set(symbols)];

  if (uniqueSymbols.length === 0) {
    return NextResponse.json({
      quotes: [],
      failures: [],
      note: "No public ticker symbols were provided."
    });
  }

  const settled = await Promise.allSettled(uniqueSymbols.map((symbol) => fetchYahooChartQuote(symbol)));
  const quotes: MarketQuote[] = [];
  const failures: string[] = [];

  settled.forEach((result, index) => {
    if (result.status === "fulfilled") {
      quotes.push(result.value);
    } else {
      failures.push(uniqueSymbols[index]);
    }
  });

  return NextResponse.json({
    quotes,
    failures,
    source: "Yahoo Finance chart data",
    note: "Market prices are informational and may be delayed. Manual prices remain editable."
  });
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase().replace(/[^A-Z0-9.-]/g, "");
}

async function fetchYahooChartQuote(symbol: string): Promise<MarketQuote> {
  const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1m`, {
    headers: {
      "User-Agent": "Long Game Portfolio Guard"
    },
    next: {
      revalidate: 60
    }
  });

  if (!response.ok) {
    throw new Error(`Quote request failed for ${symbol}`);
  }

  const payload = (await response.json()) as YahooChartResponse;
  const result = payload.chart?.result?.[0];
  const meta = result?.meta;
  const price = meta?.regularMarketPrice ?? result?.indicators?.quote?.[0]?.close?.findLast((value) => typeof value === "number");

  if (!meta || typeof price !== "number" || !Number.isFinite(price)) {
    throw new Error(`No usable quote for ${symbol}`);
  }

  return {
    symbol,
    price,
    currency: meta.currency,
    marketState: meta.marketState,
    sourceName: meta.exchangeName
  };
}

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        currency?: string;
        exchangeName?: string;
        marketState?: string;
        regularMarketPrice?: number;
      };
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
        }>;
      };
    }>;
  };
};
