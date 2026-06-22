"use client";

import { CalendarDays, CheckCircle2, Circle, Flag, ShieldCheck, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency, formatPercent, getPortfolioSummary } from "@/lib/calculations";
import {
  getGoalProgress,
  getMrvlGoalProgress,
  getProjectionRows,
  mrvlShareGoal,
  projectionModes
} from "@/lib/goals";
import type { AppState, PortfolioSettings } from "@/types";

export function GoalsDashboard({
  state,
  onSettingsChange
}: {
  state: AppState;
  onSettingsChange: (settings: PortfolioSettings) => void;
}) {
  const summary = getPortfolioSummary(state);
  const accountValue = state.settings.goalAccountValue ?? 4424;
  const monthlyDeposit = state.settings.goalMonthlyDeposit ?? 500;
  const targetValue = state.settings.goalTargetValue ?? 25000;
  const annualReturn = state.settings.goalAnnualReturn ?? 10;
  const mrvlShares = state.settings.mrvlGoalCurrentShares ?? 0;
  const goalProgress = getGoalProgress(accountValue, targetValue);
  const projectionRows = useMemo(
    () =>
      getProjectionRows({
        currentValue: accountValue,
        monthlyDeposit,
        annualReturn,
        targetValue
      }),
    [accountValue, monthlyDeposit, annualReturn, targetValue]
  );
  const nextProjection = projectionRows.find((row) => row.milestone === goalProgress.nextMilestone);
  const targetProjection = projectionRows[projectionRows.length - 1];
  const mrvlProgress = getMrvlGoalProgress(mrvlShares);
  const nextAction = getNextBestAction(state);

  const updateSetting = <K extends keyof PortfolioSettings>(key: K, value: PortfolioSettings[K]) => {
    onSettingsChange({ ...state.settings, [key]: value });
  };

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-forest/20 bg-forest/10 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
          <p className="text-sm font-semibold leading-6 text-ink">
            Goals are here to slow the decision down. Build wealth steadily, protect the plan, and let contributions do
            their work.
          </p>
        </div>
      </div>

      <section className="surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="label">Goals & Milestones</p>
            <h2 className="text-2xl font-bold text-ink">Next Milestone: {formatCurrency(goalProgress.nextMilestone)}</h2>
          </div>
          <Flag className="h-6 w-6 shrink-0 text-forest" aria-hidden="true" />
        </div>

        <div className="mt-4 rounded-lg border border-forest/20 bg-forest/10 p-4">
          <p className="label">Amount remaining</p>
          <p className="mt-1 text-4xl font-black text-ink">{formatCurrency(goalProgress.remainingToNext)}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-sage">
            {formatCurrency(accountValue)} current value toward the next checkpoint.
          </p>

          <div className="mt-4">
            <div className="flex justify-between gap-3 text-sm">
              <span className="font-semibold text-ink">Progress toward next milestone</span>
              <span className="text-sage">{formatPercent(goalProgress.progressToNext)}</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-forest" style={{ width: `${goalProgress.progressToNext}%` }} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <EstimateCard label="Estimated months" value={formatMonths(nextProjection?.months)} />
            <EstimateCard label="Estimated date" value={formatProjectionDate(nextProjection?.date)} />
          </div>
        </div>

        <div className="mt-5">
          <div className="flex justify-between gap-3 text-sm">
            <span className="font-semibold text-ink">Full target path: {formatCurrency(targetValue)}</span>
            <span className="text-sage">{formatPercent(goalProgress.overallProgress)}</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-mist">
            <div className="h-full rounded-full bg-forest" style={{ width: `${goalProgress.overallProgress}%` }} />
          </div>
          <p className="mt-2 text-sm text-sage">{formatCurrency(goalProgress.remainingToTarget)} remaining to the full target.</p>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-5">
          {projectionRows.map((row) => {
            const reached = accountValue >= row.milestone;
            return (
              <div
                key={row.milestone}
                className={`rounded-md border p-3 text-center ${
                  reached ? "border-forest/30 bg-forest/10 text-forest" : "border-black/10 bg-white text-sage"
                }`}
              >
                <div className="flex justify-center">
                  {reached ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : <Circle className="h-5 w-5" aria-hidden="true" />}
                </div>
                <p className="mt-2 text-sm font-bold">{formatCurrency(row.milestone)}</p>
                <p className="mt-1 text-xs">{formatProjectionDate(row.date)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="label">Projection Planner</p>
            <h2 className="text-xl font-bold text-ink">Estimate the path</h2>
          </div>
          <CalendarDays className="h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
        </div>

        <p className="mt-3 text-sm leading-6 text-sage">
          These dates are estimates only, not promises. Actual results will move with deposits, prices, margin, and
          behavior.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <GoalNumberInput label="Current account value" value={accountValue} onChange={(value) => updateSetting("goalAccountValue", value)} />
          <GoalNumberInput label="Monthly deposit" value={monthlyDeposit} onChange={(value) => updateSetting("goalMonthlyDeposit", value)} />
          <GoalNumberInput label="Target account value" value={targetValue} onChange={(value) => updateSetting("goalTargetValue", value)} />
          <GoalNumberInput
            label="Annual return %"
            value={annualReturn}
            step="0.1"
            onChange={(value) => updateSetting("goalAnnualReturn", value)}
          />
          <GoalNumberInput
            label="Current MRVL shares"
            value={mrvlShares}
            step="0.01"
            onChange={(value) => updateSetting("mrvlGoalCurrentShares", value)}
          />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {projectionModes.map((mode) => (
            <button
              key={mode.label}
              className={`min-h-11 rounded-md border px-3 py-2 text-sm font-bold transition ${
                annualReturn === mode.annualReturn
                  ? "border-forest bg-forest text-white"
                  : "border-black/10 bg-white text-sage hover:bg-mist"
              }`}
              type="button"
              onClick={() => updateSetting("goalAnnualReturn", mode.annualReturn)}
            >
              {mode.label}
              <span className="block text-xs opacity-80">{mode.annualReturn}%</span>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <EstimateCard label="Next milestone estimate" value={`${formatMonths(nextProjection?.months)} · ${formatProjectionDate(nextProjection?.date)}`} />
          <EstimateCard label="Full target estimate" value={`${formatMonths(targetProjection?.months)} · ${formatProjectionDate(targetProjection?.date)}`} />
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-5">
          {projectionRows.map((row) => (
            <article key={row.milestone} className="rounded-lg border border-black/10 bg-white p-3">
              <p className="text-lg font-bold text-ink">{formatCurrency(row.milestone)}</p>
              <p className="mt-2 text-sm text-sage">{formatMonths(row.months)} · {formatProjectionDate(row.date)}</p>
              <p className="mt-2 text-xs font-semibold text-sage">{formatCurrency(row.remaining)} remaining</p>
              <p className="mt-3 text-xs font-semibold leading-5 text-forest">{getMilestoneMessage(row.remaining)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="label">MRVL share goal</p>
              <h2 className="text-2xl font-bold text-ink">{mrvlShares.toFixed(2)} of {mrvlShareGoal} shares</h2>
            </div>
            <Target className="h-6 w-6 shrink-0 text-forest" aria-hidden="true" />
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-mist">
            <div className="h-full rounded-full bg-forest" style={{ width: `${mrvlProgress.progress}%` }} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <EstimateCard label="Progress" value={formatPercent(mrvlProgress.progress)} />
            <EstimateCard label="Shares needed" value={mrvlProgress.remainingShares.toFixed(2)} />
          </div>

          <p className="mt-4 rounded-md border border-forest/20 bg-forest/10 p-3 text-sm font-semibold leading-6 text-ink">
            Accumulate patiently. Add shares only when margin, cash, and allocation rules say the buy fits the plan.
          </p>
        </div>

        <div className="space-y-5">
          <section className="surface p-4">
            <p className="label">Mission Focus</p>
            <h2 className="mt-1 text-xl font-bold text-ink">Build long-term wealth</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-sage">
              <li>Keep adding steadily.</li>
              <li>Pay attention to margin.</li>
              <li>Avoid impulsive trades.</li>
              <li>Do not chase.</li>
              <li>Stay disciplined.</li>
            </ul>
          </section>

          <section className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
            <p className="label">Next Best Action</p>
            <h2 className="mt-1 text-xl font-bold text-ink">{nextAction.title}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-sage">{nextAction.detail}</p>
          </section>
        </div>
      </section>
    </section>
  );
}

function getNextBestAction(state: AppState) {
  const summary = getPortfolioSummary(state);

  if (state.settings.marginUsed > 500) {
    return {
      title: "Pay down margin",
      detail: "Margin is elevated. Let new money reduce risk before adding exposure."
    };
  }

  if (state.settings.marginUsed > 0) {
    return {
      title: "Pay down margin",
      detail: "Margin is active. Keep the account moving toward cleaner compounding."
    };
  }

  if (summary.speculativeAboveTarget) {
    return {
      title: "Review goals before buying anything new",
      detail: "Speculative exposure is above target. Re-center on the written plan before adding risk."
    };
  }

  if (state.settings.cash <= 0) {
    return {
      title: "Add cash",
      detail: "A stronger cash base gives the plan more patience and fewer forced decisions."
    };
  }

  if (state.settings.buyingPower > state.settings.cash) {
    return {
      title: "Wait for a better setup",
      detail: "Buying power can include borrowed money. Let cash and the written plan lead the next decision."
    };
  }

  return {
    title: "Hold current positions",
    detail: "No urgent action is required. Let the plan breathe and review before making a new buy."
  };
}

function EstimateCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-black/10 bg-white p-3">
      <p className="label">{label}</p>
      <p className="mt-1 text-lg font-bold text-ink">{value}</p>
    </div>
  );
}

function getMilestoneMessage(remaining: number) {
  if (remaining <= 0) return "Reached. Keep protecting the process.";
  if (remaining < 1000) return "Close enough to stay patient and precise.";
  if (remaining < 5000) return "Consistency matters more than urgency.";
  return "Keep the contribution habit steady.";
}

function formatMonths(months?: number | null) {
  if (months === undefined || months === null) return "No estimate";
  if (months === 0) return "Now";
  return `${months} month${months === 1 ? "" : "s"}`;
}

function formatProjectionDate(date?: Date | null) {
  if (!date) return "No estimate";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric"
  }).format(date);
}

function GoalNumberInput({
  label,
  value,
  onChange,
  step = "1"
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
}) {
  const [textValue, setTextValue] = useState(String(value));

  useEffect(() => {
    setTextValue(String(value));
  }, [value]);

  const commitValue = (nextValue: string) => {
    if (nextValue.trim() === "") {
      setTextValue("0");
      onChange(0);
      return;
    }

    const parsed = Number(nextValue);
    if (Number.isFinite(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        className="field mt-1"
        type="number"
        step={step}
        value={textValue}
        onChange={(event) => setTextValue(event.target.value)}
        onBlur={(event) => commitValue(event.target.value)}
      />
    </label>
  );
}
