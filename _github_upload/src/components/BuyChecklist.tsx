"use client";

import { ClipboardCheck, Save } from "lucide-react";
import { useState } from "react";
import { bucketOptions, type Bucket, type BuyChecklistEntry, type ChecklistAnswers } from "@/types";

const initialAnswers: ChecklistAnswers = {
  inPlan: false,
  usingMargin: false,
  coreOrSpeculative: "Core holding",
  fomo: false,
  thesisImproved: false,
  preferExistingCore: false,
  insideTargetRanges: false
};

export function BuyChecklist({
  marginUsed,
  onSave,
  entries
}: {
  marginUsed: number;
  onSave: (entry: BuyChecklistEntry) => void;
  entries: BuyChecklistEntry[];
}) {
  const [ticker, setTicker] = useState("");
  const [bucketIntent, setBucketIntent] = useState<Bucket>("Core Growth");
  const [answers, setAnswers] = useState<ChecklistAnswers>(initialAnswers);
  const [notes, setNotes] = useState("");
  const guardrailWarning =
    marginUsed > 500 && bucketIntent === "Speculative Future Tech"
      ? "Guardrail active: margin is above $500. New speculative buys are disabled."
      : undefined;

  const save = () => {
    if (!ticker.trim()) return;
    onSave({
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `checklist-${Date.now()}`,
      ticker: ticker.trim().toUpperCase(),
      bucketIntent,
      answers,
      notes,
      guardrailWarning,
      createdAt: new Date().toISOString()
    });
    setTicker("");
    setBucketIntent("Core Growth");
    setAnswers(initialAnswers);
    setNotes("");
  };

  return (
    <section className="surface p-4">
      <div className="flex items-start gap-3">
        <ClipboardCheck className="mt-1 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
        <div>
          <p className="label">Buy decision checklist</p>
          <h2 className="text-xl font-bold text-ink">Write it before acting</h2>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label>
          <span className="label">Ticker</span>
          <input className="field mt-1" value={ticker} onChange={(event) => setTicker(event.target.value.toUpperCase())} />
        </label>
        <label>
          <span className="label">Bucket intent</span>
          <select className="field mt-1" value={bucketIntent} onChange={(event) => setBucketIntent(event.target.value as Bucket)}>
            {bucketOptions.map((bucket) => (
              <option key={bucket} value={bucket}>
                {bucket}
              </option>
            ))}
          </select>
        </label>
      </div>

      {guardrailWarning ? (
        <div className="mt-4 rounded-lg border border-orange-300 bg-orange-100 p-3 text-sm font-semibold text-ember">
          {guardrailWarning}
        </div>
      ) : null}

      <div className="mt-4 grid gap-2">
        <CheckRow label="Is this ticker already in my plan?" checked={answers.inPlan} onChange={(value) => setAnswers({ ...answers, inPlan: value })} />
        <CheckRow label="Am I using margin right now?" checked={answers.usingMargin} onChange={(value) => setAnswers({ ...answers, usingMargin: value })} />
        <CheckRow label="Am I buying because of FOMO?" checked={answers.fomo} onChange={(value) => setAnswers({ ...answers, fomo: value })} />
        <CheckRow label="Did the thesis improve, not just the price?" checked={answers.thesisImproved} onChange={(value) => setAnswers({ ...answers, thesisImproved: value })} />
        <CheckRow label="Would I rather add to MRVL, QQQM, or cash instead?" checked={answers.preferExistingCore} onChange={(value) => setAnswers({ ...answers, preferExistingCore: value })} />
        <CheckRow label="Will this keep allocation inside target ranges?" checked={answers.insideTargetRanges} onChange={(value) => setAnswers({ ...answers, insideTargetRanges: value })} />
      </div>

      <label className="mt-4 block">
        <span className="label">Core or speculative?</span>
        <select
          className="field mt-1"
          value={answers.coreOrSpeculative}
          onChange={(event) => setAnswers({ ...answers, coreOrSpeculative: event.target.value as ChecklistAnswers["coreOrSpeculative"] })}
        >
          <option>Core holding</option>
          <option>Speculative holding</option>
          <option>ETF / Broad Exposure</option>
          <option>Cash</option>
        </select>
      </label>

      <label className="mt-4 block">
        <span className="label">Notes</span>
        <textarea className="field mt-1 min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>

      <button className="primary-button mt-4 w-full sm:w-auto" type="button" onClick={save} disabled={!ticker.trim()}>
        <Save className="h-4 w-4" aria-hidden="true" />
        Log checklist
      </button>

      {entries.length > 0 ? (
        <div className="mt-5 space-y-2">
          <p className="label">Recent checklist logs</p>
          {entries.slice(0, 3).map((entry) => (
            <div key={entry.id} className="rounded-md border border-black/10 bg-white p-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="font-bold text-ink">{entry.ticker}</span>
                <span className="text-xs text-sage">{new Date(entry.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-1 text-sage">{entry.bucketIntent}</p>
              {entry.guardrailWarning ? <p className="mt-2 font-semibold text-ember">{entry.guardrailWarning}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex min-h-11 items-start gap-3 rounded-md border border-black/10 bg-white p-3 text-sm">
      <input className="mt-1 h-4 w-4 accent-forest" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="font-semibold leading-6 text-ink">{label}</span>
    </label>
  );
}
