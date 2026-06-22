import { AlertTriangle, CalendarDays, Landmark, ShieldCheck, WalletCards } from "lucide-react";
import type { ReactNode } from "react";
import {
  formatCurrency,
  formatPercent,
  getDaysUntil,
  getHoldingMetrics,
  getPortfolioSummary
} from "@/lib/calculations";
import type { AppState } from "@/types";
import { StatusPill } from "./StatusPill";

export function Dashboard({ state }: { state: AppState }) {
  const summary = getPortfolioSummary(state);
  const holdings = getHoldingMetrics(state.holdings);
  const biggest = [...holdings].sort((a, b) => b.marketValue - a.marketValue)[0];
  const daysUntilContribution = getDaysUntil(state.settings.nextContributionDate);

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-forest/20 bg-forest/10 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
          <p className="text-sm font-semibold leading-6 text-ink">
            Your edge is not constant trading. Your edge is consistent contributions, good stock selection, and not
            interrupting compounding.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="label">Portfolio health</p>
          <h2 className="text-2xl font-bold text-ink">{summary.health}</h2>
        </div>
        <StatusPill status={summary.health} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<WalletCards className="h-5 w-5" aria-hidden="true" />}
          label="Total account value"
          value={formatCurrency(summary.totalAccountValue)}
          note="Holdings plus cash and other value, minus margin used."
        />
        <MetricCard label="Gross holdings value" value={formatCurrency(summary.holdingsValue)} />
        <MetricCard label="Cash" value={formatCurrency(state.settings.cash)} />
        <MetricCard label="Options / other" value={formatCurrency(summary.optionsAndOtherValue)} />
        <MetricCard label="Margin used" value={formatCurrency(state.settings.marginUsed)} tone="risk" />
        <MetricCard label="Net investable cash" value={formatCurrency(summary.netInvestableCash)} />
        <MetricCard
          icon={<Landmark className="h-5 w-5" aria-hidden="true" />}
          label="Buying power"
          value={formatCurrency(state.settings.buyingPower)}
          note="Buying power may include margin. Borrowed money is not cash."
          tone="warning"
        />
        <MetricCard label="Monthly contribution" value={formatCurrency(state.settings.monthlyContribution)} />
        <MetricCard
          icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
          label="Next rental contribution"
          value={`${daysUntilContribution} day${daysUntilContribution === 1 ? "" : "s"}`}
          note={state.settings.nextContributionDate}
        />
        <MetricCard label="YTD performance" value={formatPercent(summary.ytdPerformance)} />
      </div>

      {summary.speculativeAboveTarget ? (
        <div className="rounded-lg border border-orange-300 bg-orange-100 p-4 text-sm font-semibold text-ember">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Speculative exposure is above target. Do not add to high-risk speculative positions.</span>
          </div>
        </div>
      ) : null}

      <div className="surface p-4">
        <p className="label">Largest position</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-ink">{biggest?.ticker ?? "No holdings"}</h3>
            <p className="text-sm text-sage">{biggest?.companyName ?? "Add a holding to begin."}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{biggest ? formatCurrency(biggest.marketValue) : "$0"}</p>
            <p className="text-xs text-sage">{biggest ? formatPercent(biggest.portfolioPercent) : "0.0%"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon,
  tone = "normal"
}: {
  label: string;
  value: string;
  note?: string;
  icon?: ReactNode;
  tone?: "normal" | "warning" | "risk";
}) {
  const toneClass =
    tone === "risk" ? "border-danger/20" : tone === "warning" ? "border-yellow-300 bg-yellow-50" : "border-black/10";

  return (
    <div className={`rounded-lg border bg-white p-4 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="label">{label}</p>
        <span className="text-sage">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
      {note ? <p className="mt-2 text-xs font-semibold leading-5 text-sage">{note}</p> : null}
    </div>
  );
}
