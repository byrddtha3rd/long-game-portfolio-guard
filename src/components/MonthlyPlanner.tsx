import { PiggyBank } from "lucide-react";
import { formatCurrency, getContributionPlan } from "@/lib/calculations";

export function MonthlyPlanner({
  monthlyContribution,
  marginUsed
}: {
  monthlyContribution: number;
  marginUsed: number;
}) {
  const plan = getContributionPlan(marginUsed, monthlyContribution);

  return (
    <section className="surface p-4">
      <div className="flex items-start gap-3">
        <PiggyBank className="mt-1 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
        <div>
          <p className="label">Monthly contribution planner</p>
          <h2 className="text-xl font-bold text-ink">{formatCurrency(monthlyContribution)} allocation</h2>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {plan.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between gap-3 text-sm">
              <span className="font-semibold text-ink">{item.label}</span>
              <span className="text-sage">
                {item.percent}% · {formatCurrency(item.value)}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-mist">
              <div className="h-2 rounded-full bg-forest" style={{ width: `${item.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
