"use client";

import { BarChart3, Flag, Home, ListChecks, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { AllocationChart } from "@/components/AllocationChart";
import { BuyChecklist } from "@/components/BuyChecklist";
import { Dashboard } from "@/components/Dashboard";
import { GoalsDashboard } from "@/components/GoalsDashboard";
import { HoldingForm } from "@/components/HoldingForm";
import { HoldingsTable } from "@/components/HoldingsTable";
import { MarginGuardrail } from "@/components/MarginGuardrail";
import { MonthlyPlanner } from "@/components/MonthlyPlanner";
import { PriceRefreshPanel } from "@/components/PriceRefreshPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { usePortfolioState } from "@/hooks/usePortfolioState";
import type { Holding } from "@/types";

type Tab = "Dashboard" | "Goals" | "Holdings" | "Guardrails" | "Settings";

const tabs: Array<{ label: Tab; icon: ReactNode }> = [
  { label: "Dashboard", icon: <Home className="h-5 w-5" aria-hidden="true" /> },
  { label: "Goals", icon: <Flag className="h-5 w-5" aria-hidden="true" /> },
  { label: "Holdings", icon: <BarChart3 className="h-5 w-5" aria-hidden="true" /> },
  { label: "Guardrails", icon: <ListChecks className="h-5 w-5" aria-hidden="true" /> },
  { label: "Settings", icon: <Settings className="h-5 w-5" aria-hidden="true" /> }
];

export default function HomePage() {
  const { state, loaded, actions } = usePortfolioState();
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [editingHolding, setEditingHolding] = useState<Holding | undefined>();

  const saveHolding = (holding: Holding) => {
    actions.upsertHolding(holding);
    setEditingHolding(undefined);
  };

  const deleteHolding = (id: string) => {
    if (window.confirm("Delete this holding from your local plan?")) {
      actions.deleteHolding(id);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:pb-10">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="label">Manual discipline dashboard</p>
          <h1 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Long Game Portfolio Guard</h1>
        </div>
        <div className="hidden rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-bold text-sage sm:block">
          No broker connection
        </div>
      </header>

      {!loaded ? (
        <div className="surface p-6 text-sm font-semibold text-sage">Loading your local portfolio plan...</div>
      ) : (
        <div className="space-y-5">
          <div className="hidden rounded-lg border border-black/10 bg-white p-1 lg:flex">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition ${
                  activeTab === tab.label ? "bg-ink text-white" : "text-sage hover:bg-mist"
                }`}
                type="button"
                onClick={() => setActiveTab(tab.label)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "Dashboard" ? (
            <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
              <Dashboard state={state} />
              <div className="space-y-5">
                <PriceRefreshPanel
                  holdings={state.holdings}
                  lastPriceRefreshAt={state.settings.lastPriceRefreshAt}
                  onPrices={actions.updateHoldingPrices}
                />
                <MarginGuardrail marginUsed={state.settings.marginUsed} />
                <AllocationChart holdings={state.holdings} />
              </div>
            </div>
          ) : null}

          {activeTab === "Goals" ? (
            <GoalsDashboard state={state} onSettingsChange={actions.updateSettings} />
          ) : null}

          {activeTab === "Holdings" ? (
            <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
              <HoldingForm holding={editingHolding} onSave={saveHolding} onCancel={editingHolding ? () => setEditingHolding(undefined) : undefined} />
              <div className="space-y-5">
                <PriceRefreshPanel
                  holdings={state.holdings}
                  lastPriceRefreshAt={state.settings.lastPriceRefreshAt}
                  onPrices={actions.updateHoldingPrices}
                />
                <AllocationChart holdings={state.holdings} />
                <HoldingsTable holdings={state.holdings} onEdit={setEditingHolding} onDelete={deleteHolding} />
              </div>
            </div>
          ) : null}

          {activeTab === "Guardrails" ? (
            <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
              <div className="space-y-5">
                <MarginGuardrail marginUsed={state.settings.marginUsed} />
                <MonthlyPlanner monthlyContribution={state.settings.monthlyContribution} marginUsed={state.settings.marginUsed} />
              </div>
              <BuyChecklist marginUsed={state.settings.marginUsed} entries={state.buyChecklistLog} onSave={actions.addChecklistEntry} />
            </div>
          ) : null}

          {activeTab === "Settings" ? (
            <SettingsPanel
              state={state}
              onSettingsChange={actions.updateSettings}
              onImport={actions.importState}
              onReset={actions.resetSampleData}
            />
          ) : null}
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white/95 px-3 pb-3 pt-2 shadow-[0_-12px_35px_rgba(24,33,31,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-[10px] font-bold transition ${
                activeTab === tab.label ? "bg-ink text-white" : "text-sage hover:bg-mist"
              }`}
              type="button"
              onClick={() => setActiveTab(tab.label)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
