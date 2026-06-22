"use client";

import { Download, RefreshCcw, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { AppState, PortfolioSettings } from "@/types";

export function SettingsPanel({
  state,
  onSettingsChange,
  onImport,
  onReset
}: {
  state: AppState;
  onSettingsChange: (settings: PortfolioSettings) => void;
  onImport: (state: AppState) => void;
  onReset: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState("");

  const update = <K extends keyof PortfolioSettings>(key: K, value: PortfolioSettings[K]) => {
    onSettingsChange({ ...state.settings, [key]: value });
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "long-game-portfolio-guard-backup.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file?: File) => {
    setImportError("");
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as AppState;
      if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.holdings) || !parsed.settings) {
        throw new Error("Invalid backup format.");
      }
      onImport(parsed);
    } catch {
      setImportError("That file does not look like a Long Game Portfolio Guard backup.");
    }
  };

  return (
    <section className="space-y-4">
      <div className="surface p-4">
        <p className="label">Settings</p>
        <h2 className="text-xl font-bold text-ink">Plan inputs</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <NumberField label="Monthly contribution" value={state.settings.monthlyContribution} onChange={(value) => update("monthlyContribution", value)} />
          <label>
            <span className="label">Next contribution date</span>
            <input className="field mt-1" type="date" value={state.settings.nextContributionDate} onChange={(event) => update("nextContributionDate", event.target.value)} />
          </label>
          <NumberField label="Starting year value" value={state.settings.startingYearValue} onChange={(value) => update("startingYearValue", value)} />
          <NumberField
            label="Goal account value"
            value={state.settings.goalAccountValue ?? 4424}
            onChange={(value) => update("goalAccountValue", value)}
          />
          <NumberField
            label="Goal monthly deposit"
            value={state.settings.goalMonthlyDeposit ?? 500}
            onChange={(value) => update("goalMonthlyDeposit", value)}
          />
          <NumberField
            label="Goal target value"
            value={state.settings.goalTargetValue ?? 25000}
            onChange={(value) => update("goalTargetValue", value)}
          />
          <NumberField
            label="Goal annual return %"
            value={state.settings.goalAnnualReturn ?? 10}
            onChange={(value) => update("goalAnnualReturn", value)}
          />
          <NumberField
            label="MRVL current shares"
            value={state.settings.mrvlGoalCurrentShares ?? 0}
            onChange={(value) => update("mrvlGoalCurrentShares", value)}
          />
          <NumberField label="Cash" value={state.settings.cash} onChange={(value) => update("cash", value)} />
          <NumberField
            label="Options / other value"
            value={state.settings.optionsAndOtherValue ?? 0}
            onChange={(value) => update("optionsAndOtherValue", value)}
          />
          <NumberField label="Margin used" value={state.settings.marginUsed} onChange={(value) => update("marginUsed", value)} />
          <NumberField label="Buying power" value={state.settings.buyingPower} onChange={(value) => update("buyingPower", value)} />
        </div>

        <p className="mt-3 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm font-semibold text-caution">
          Buying power may include margin. Borrowed money is not cash.
        </p>

        <label className="mt-4 flex items-start gap-3 rounded-md border border-black/10 bg-white p-3">
          <input
            className="mt-1 h-4 w-4 accent-forest"
            type="checkbox"
            checked={state.settings.optionsLockEnabled}
            onChange={(event) => update("optionsLockEnabled", event.target.checked)}
          />
          <span>
            <span className="block font-bold text-ink">Options Lock</span>
            <span className="mt-1 block text-sm leading-6 text-sage">
              Options are disabled by plan. Your stock selection has been stronger than your options performance.
            </span>
          </span>
        </label>
      </div>

      <div className="surface p-4">
        <p className="label">Backup</p>
        <h2 className="text-xl font-bold text-ink">Export and import JSON</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button className="secondary-button" type="button" onClick={exportJson}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
          </button>
          <button className="secondary-button" type="button" onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden="true" />
            Import
          </button>
          <button
            className="danger-button"
            type="button"
            onClick={() => {
              if (window.confirm("Reset to sample data? This replaces your current local data.")) {
                onReset();
              }
            }}
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept="application/json"
          onChange={(event) => importJson(event.target.files?.[0])}
        />
        {importError ? <p className="mt-3 text-sm font-semibold text-danger">{importError}</p> : null}
      </div>
    </section>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
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
    <label>
      <span className="label">{label}</span>
      <input
        className="field mt-1"
        type="number"
        step="0.01"
        value={textValue}
        onChange={(event) => setTextValue(event.target.value)}
        onBlur={(event) => commitValue(event.target.value)}
      />
    </label>
  );
}
