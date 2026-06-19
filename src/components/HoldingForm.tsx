"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { bucketOptions, type Holding } from "@/types";
import { createEmptyHolding } from "@/hooks/usePortfolioState";

export function HoldingForm({
  holding,
  onSave,
  onCancel
}: {
  holding?: Holding;
  onSave: (holding: Holding) => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState<Holding>(holding ?? createEmptyHolding());

  useEffect(() => {
    setDraft(holding ?? createEmptyHolding());
  }, [holding]);

  const update = <K extends keyof Holding>(key: K, value: Holding[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const save = () => {
    if (!draft.ticker.trim() || !draft.companyName.trim()) return;
    onSave({
      ...draft,
      shares: Number(draft.shares),
      averageCost: Number(draft.averageCost),
      currentPrice: Number(draft.currentPrice),
      convictionScore: Number(draft.convictionScore)
    });
    if (!holding) {
      setDraft(createEmptyHolding());
    }
  };

  return (
    <section className="surface p-4">
      <div className="mb-4">
        <p className="label">{holding ? "Edit holding" : "Add holding"}</p>
        <h2 className="text-xl font-bold text-ink">{holding ? holding.ticker : "Manual entry"}</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Ticker" value={draft.ticker} onChange={(value) => update("ticker", value.toUpperCase())} />
        <TextField label="Company" value={draft.companyName} onChange={(value) => update("companyName", value)} />
        <NumberField label="Shares" value={draft.shares} onChange={(value) => update("shares", value)} />
        <NumberField label="Average cost" value={draft.averageCost} onChange={(value) => update("averageCost", value)} />
        <NumberField label="Current price" value={draft.currentPrice} onChange={(value) => update("currentPrice", value)} />
        <label className="block">
          <span className="label">Bucket</span>
          <select className="field mt-1" value={draft.bucket} onChange={(event) => update("bucket", event.target.value as Holding["bucket"])}>
            {bucketOptions.map((bucket) => (
              <option key={bucket} value={bucket}>
                {bucket}
              </option>
            ))}
          </select>
        </label>
        <NumberField
          label="Conviction score"
          value={draft.convictionScore}
          min={1}
          max={5}
          onChange={(value) => update("convictionScore", value)}
        />
        <label className="block">
          <span className="label">Last reviewed</span>
          <input
            className="field mt-1"
            type="date"
            value={draft.lastReviewedAt}
            onChange={(event) => update("lastReviewedAt", event.target.value)}
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3">
        <TextArea label="Why I own it" value={draft.thesis} onChange={(value) => update("thesis", value)} />
        <TextArea label="What would make me add" value={draft.addRules} onChange={(value) => update("addRules", value)} />
        <TextArea label="What would make me trim or sell" value={draft.sellRules} onChange={(value) => update("sellRules", value)} />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button className="primary-button" type="button" onClick={save} disabled={!draft.ticker.trim() || !draft.companyName.trim()}>
          <Save className="h-4 w-4" aria-hidden="true" />
          Save holding
        </button>
        {onCancel ? (
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="field mt-1" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        className="field mt-1"
        type="number"
        min={min}
        max={max}
        step="0.01"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea className="field mt-1 min-h-24 resize-y" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
