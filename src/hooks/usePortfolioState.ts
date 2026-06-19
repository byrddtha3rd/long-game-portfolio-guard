"use client";

import { useEffect, useMemo, useState } from "react";
import { sampleState } from "@/data/sampleData";
import { normalizeSettings } from "@/lib/calculations";
import type { AppState, BuyChecklistEntry, Holding, PortfolioSettings } from "@/types";

export const STORAGE_KEY = "long-game-portfolio-guard:v1";

function cloneSampleState(): AppState {
  return JSON.parse(JSON.stringify(sampleState)) as AppState;
}

function readStoredState(): AppState {
  if (typeof window === "undefined") {
    return cloneSampleState();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return cloneSampleState();
  }

  try {
    const parsed = JSON.parse(stored) as AppState;
    if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.holdings)) {
      return cloneSampleState();
    }

    return {
      ...cloneSampleState(),
      ...parsed,
      settings: normalizeSettings({
        ...cloneSampleState().settings,
        ...parsed.settings
      })
    };
  } catch {
    return cloneSampleState();
  }
}

export function usePortfolioState() {
  const [state, setState] = useState<AppState>(() => cloneSampleState());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setState(readStoredState());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [loaded, state]);

  const actions = useMemo(
    () => ({
      upsertHolding(holding: Holding) {
        setState((current) => {
          const exists = current.holdings.some((item) => item.id === holding.id);
          const updatedHolding = {
            ...holding,
            ticker: holding.ticker.trim().toUpperCase(),
            companyName: holding.companyName.trim(),
            updatedAt: new Date().toISOString().slice(0, 10)
          };

          return {
            ...current,
            holdings: exists
              ? current.holdings.map((item) => (item.id === holding.id ? updatedHolding : item))
              : [updatedHolding, ...current.holdings]
          };
        });
      },
      deleteHolding(id: string) {
        setState((current) => ({
          ...current,
          holdings: current.holdings.filter((holding) => holding.id !== id)
        }));
      },
      updateSettings(settings: PortfolioSettings) {
        setState((current) => ({
          ...current,
          settings: normalizeSettings(settings)
        }));
      },
      addChecklistEntry(entry: BuyChecklistEntry) {
        setState((current) => ({
          ...current,
          buyChecklistLog: [entry, ...current.buyChecklistLog]
        }));
      },
      importState(nextState: AppState) {
        setState({
          ...cloneSampleState(),
          ...nextState,
          settings: normalizeSettings({
            ...cloneSampleState().settings,
            ...nextState.settings
          }),
          schemaVersion: 1
        });
      },
      resetSampleData() {
        setState(cloneSampleState());
      }
    }),
    []
  );

  return {
    state,
    loaded,
    actions
  };
}

export function createEmptyHolding(): Holding {
  const today = new Date().toISOString().slice(0, 10);
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `holding-${Date.now()}`;

  return {
    id,
    ticker: "",
    companyName: "",
    shares: 0,
    averageCost: 0,
    currentPrice: 0,
    bucket: "Watch Only",
    thesis: "",
    convictionScore: 3,
    sellRules: "",
    addRules: "",
    lastReviewedAt: today,
    createdAt: today,
    updatedAt: today
  };
}
