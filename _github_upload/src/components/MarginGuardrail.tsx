import { ShieldAlert } from "lucide-react";
import { formatCurrency, getMarginStatus } from "@/lib/calculations";

export function MarginGuardrail({ marginUsed }: { marginUsed: number }) {
  const margin = getMarginStatus(marginUsed);

  return (
    <section className={`rounded-lg border p-4 ${margin.bgClass} ${margin.borderClass}`}>
      <div className="flex items-start gap-3">
        <ShieldAlert className={`mt-0.5 h-5 w-5 shrink-0 ${margin.colorClass}`} aria-hidden="true" />
        <div>
          <p className="label">Margin guardrail</p>
          <h2 className={`mt-1 text-2xl font-bold ${margin.colorClass}`}>{margin.status}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-ink">{margin.guidance}</p>
          <p className="mt-3 text-sm text-sage">Current margin used: {formatCurrency(marginUsed)}</p>
        </div>
      </div>
    </section>
  );
}
