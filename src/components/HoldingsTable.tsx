"use client";

import { Edit3, Trash2 } from "lucide-react";
import { formatCurrency, formatPercent, getHoldingMetrics } from "@/lib/calculations";
import type { Holding } from "@/types";
import { ThesisCard } from "./ThesisCard";

export function HoldingsTable({
  holdings,
  onEdit,
  onDelete
}: {
  holdings: Holding[];
  onEdit: (holding: Holding) => void;
  onDelete: (id: string) => void;
}) {
  const metrics = getHoldingMetrics(holdings);

  return (
    <section className="space-y-4">
      <div className="surface overflow-hidden">
        <div className="border-b border-black/10 p-4">
          <p className="label">Manual holdings</p>
          <h2 className="text-xl font-bold text-ink">Positions</h2>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-mist/70 text-xs font-bold uppercase tracking-normal text-sage">
              <tr>
                <th className="px-4 py-3">Ticker</th>
                <th className="px-4 py-3">Bucket</th>
                <th className="px-4 py-3 text-right">Value</th>
                <th className="px-4 py-3 text-right">Gain/Loss</th>
                <th className="px-4 py-3 text-right">Portfolio</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {metrics.map((holding) => (
                <tr key={holding.id}>
                  <td className="px-4 py-3">
                    <p className="font-bold text-ink">{holding.ticker}</p>
                    <p className="text-xs text-sage">{holding.companyName}</p>
                  </td>
                  <td className="px-4 py-3 text-sage">{holding.bucket}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(holding.marketValue)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${holding.unrealizedGainLoss >= 0 ? "text-forest" : "text-danger"}`}>
                    {formatCurrency(holding.unrealizedGainLoss)}
                  </td>
                  <td className="px-4 py-3 text-right">{formatPercent(holding.portfolioPercent)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="secondary-button min-h-9 px-3" type="button" onClick={() => onEdit(holding)} aria-label={`Edit ${holding.ticker}`}>
                        <Edit3 className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button className="danger-button min-h-9 px-3" type="button" onClick={() => onDelete(holding.id)} aria-label={`Delete ${holding.ticker}`}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-black/10 lg:hidden">
          {metrics.map((holding) => (
            <article key={holding.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-bold text-ink">{holding.ticker}</p>
                  <p className="text-sm text-sage">{holding.companyName}</p>
                  <p className="mt-1 text-xs font-semibold text-sage">{holding.bucket}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-ink">{formatCurrency(holding.marketValue)}</p>
                  <p className="text-xs text-sage">{formatPercent(holding.portfolioPercent)}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-mist/60 p-2">
                  <p className="label">Shares</p>
                  <p className="font-semibold">{holding.shares}</p>
                </div>
                <div className="rounded-md bg-mist/60 p-2">
                  <p className="label">Gain/Loss</p>
                  <p className={`font-semibold ${holding.unrealizedGainLoss >= 0 ? "text-forest" : "text-danger"}`}>
                    {formatCurrency(holding.unrealizedGainLoss)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button className="secondary-button flex-1" type="button" onClick={() => onEdit(holding)}>
                  <Edit3 className="h-4 w-4" aria-hidden="true" />
                  Edit
                </button>
                <button className="danger-button" type="button" onClick={() => onDelete(holding.id)} aria-label={`Delete ${holding.ticker}`}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <section className="grid gap-3 xl:grid-cols-2">
        {metrics.map((holding) => (
          <ThesisCard key={holding.id} holding={holding} />
        ))}
      </section>
    </section>
  );
}
