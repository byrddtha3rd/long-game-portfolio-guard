"use client";

import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import type { Holding, MarketQuote } from "@/types";

type QuoteResponse = {
  quotes: MarketQuote[];
  failures: string[];
  source?: string;
  note?: string;
};

const manualOnlySymbols = new Set(["CASH", "MARGIN", "SPACEX"]);

export function PriceRefreshPanel({
  holdings,
  lastPriceRefreshAt,
  onPrices
}: {
  holdings: Holding[];
  lastPriceRefreshAt?: string;
  onPrices: (quotes: MarketQuote[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const symbols = useMemo(
    () =>
      [...new Set(holdings.map((holding) => holding.ticker.toUpperCase()))].filter(
        (symbol) => symbol && !manualOnlySymbols.has(symbol)
      ),
    [holdings]
  );

  const refreshPrices = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/quotes?symbols=${encodeURIComponent(symbols.join(","))}`);
      if (!response.ok) {
        throw new Error("Price refresh failed.");
      }

      const data = (await response.json()) as QuoteResponse;
      if (data.quotes.length > 0) {
        onPrices(data.quotes);
      }

      const failureText =
        data.failures.length > 0 ? ` ${data.failures.join(", ")} stayed manual.` : " All public symbols updated.";
      setMessage(`Updated ${data.quotes.length} price${data.quotes.length === 1 ? "" : "s"}.${failureText}`);
    } catch {
      setError("Could not refresh prices right now. Manual prices are still available.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label">Market price refresh</p>
          <h2 className="text-xl font-bold text-ink">Public tickers only</h2>
        </div>
        <button className="secondary-button min-h-10 px-3" type="button" onClick={refreshPrices} disabled={loading || symbols.length === 0}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      <p className="mt-3 text-sm leading-6 text-sage">
        Updates current prices for listed tickers. Private or unsupported holdings stay manual. This app still does not
        connect to Robinhood or place trades.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {symbols.map((symbol) => (
          <span key={symbol} className="rounded-full bg-mist px-2.5 py-1 text-xs font-bold text-sage">
            {symbol}
          </span>
        ))}
      </div>

      {lastPriceRefreshAt ? (
        <p className="mt-3 text-xs font-semibold text-sage">
          Last refreshed {new Date(lastPriceRefreshAt).toLocaleString()}
        </p>
      ) : null}

      {message ? <p className="mt-3 text-sm font-semibold text-forest">{message}</p> : null}
      {error ? <p className="mt-3 text-sm font-semibold text-danger">{error}</p> : null}
    </section>
  );
}
