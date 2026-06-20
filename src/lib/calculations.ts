import type {
  AppState,
  Bucket,
  BucketAllocation,
  Holding,
  HoldingWithMetrics,
  MarginStatus,
  PortfolioSettings
} from "@/types";

export const targetRanges: Partial<Record<Bucket, { min: number; max: number }>> = {
  "Core Growth": { min: 45, max: 60 },
  "ETF / Broad Exposure": { min: 20, max: 35 },
  "Speculative Future Tech": { min: 5, max: 15 },
  Cash: { min: 5, max: 15 }
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function getHoldingMarketValue(holding: Pick<Holding, "shares" | "currentPrice">) {
  return safeNumber(holding.shares) * safeNumber(holding.currentPrice);
}

export function getHoldingCostBasis(holding: Pick<Holding, "shares" | "averageCost">) {
  return safeNumber(holding.shares) * safeNumber(holding.averageCost);
}

export function getHoldingsValue(holdings: Holding[]) {
  return holdings.reduce((total, holding) => total + getHoldingMarketValue(holding), 0);
}

export function getHoldingMetrics(holdings: Holding[]): HoldingWithMetrics[] {
  const holdingsValue = getHoldingsValue(holdings);

  return holdings.map((holding) => {
    const marketValue = getHoldingMarketValue(holding);
    const costBasis = getHoldingCostBasis(holding);
    const unrealizedGainLoss = marketValue - costBasis;
    const unrealizedGainLossPercent = costBasis === 0 ? 0 : (unrealizedGainLoss / costBasis) * 100;

    return {
      ...holding,
      marketValue,
      costBasis,
      unrealizedGainLoss,
      unrealizedGainLossPercent,
      portfolioPercent: holdingsValue === 0 ? 0 : (marketValue / holdingsValue) * 100
    };
  });
}

export function getBucketAllocations(holdings: Holding[]): BucketAllocation[] {
  const holdingsValue = getHoldingsValue(holdings);
  const buckets = holdings.reduce<Record<string, number>>((totals, holding) => {
    totals[holding.bucket] = (totals[holding.bucket] ?? 0) + getHoldingMarketValue(holding);
    return totals;
  }, {});

  return Object.entries(buckets)
    .map(([bucket, value]) => ({
      bucket: bucket as Bucket,
      value,
      percent: holdingsValue === 0 ? 0 : (value / holdingsValue) * 100,
      target: targetRanges[bucket as Bucket]
    }))
    .sort((a, b) => b.value - a.value);
}

export function getPortfolioSummary(state: AppState) {
  const holdingsValue = getHoldingsValue(state.holdings);
  const optionsAndOtherValue = safeNumber(state.settings.optionsAndOtherValue ?? 0);
  const totalAccountValue =
    holdingsValue + safeNumber(state.settings.cash) + optionsAndOtherValue - safeNumber(state.settings.marginUsed);
  const netInvestableCash = safeNumber(state.settings.cash) - safeNumber(state.settings.marginUsed);
  const ytdPerformance =
    state.settings.startingYearValue === 0
      ? 0
      : ((totalAccountValue - state.settings.startingYearValue) / state.settings.startingYearValue) * 100;
  const margin = getMarginStatus(state.settings.marginUsed);
  const allocations = getBucketAllocations(state.holdings);
  const speculative = allocations.find((allocation) => allocation.bucket === "Speculative Future Tech");

  return {
    holdingsValue,
    optionsAndOtherValue,
    totalAccountValue,
    netInvestableCash,
    ytdPerformance,
    margin,
    allocations,
    speculativeAboveTarget: (speculative?.percent ?? 0) > 15,
    health: getPortfolioHealth(margin.status, speculative?.percent ?? 0)
  };
}

export function getMarginStatus(marginUsed: number): {
  status: MarginStatus;
  guidance: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
} {
  if (marginUsed <= 0) {
    return {
      status: "Green",
      guidance: "You can follow normal monthly allocation.",
      colorClass: "text-forest",
      bgClass: "bg-forest/10",
      borderClass: "border-forest/30"
    };
  }

  if (marginUsed <= 500) {
    return {
      status: "Yellow",
      guidance: "Be careful. Consider paying down margin before new buys.",
      colorClass: "text-caution",
      bgClass: "bg-yellow-100",
      borderClass: "border-yellow-300"
    };
  }

  if (marginUsed <= 1000) {
    return {
      status: "Orange",
      guidance: "No new speculative positions. Prioritize margin reduction.",
      colorClass: "text-ember",
      bgClass: "bg-orange-100",
      borderClass: "border-orange-300"
    };
  }

  return {
    status: "Red",
    guidance: "Stop buying. Rental income should go toward margin first.",
    colorClass: "text-danger",
    bgClass: "bg-red-100",
    borderClass: "border-red-300"
  };
}

export function getPortfolioHealth(marginStatus: MarginStatus, speculativePercent: number): MarginStatus {
  if (marginStatus === "Red" || speculativePercent > 20) return "Red";
  if (marginStatus === "Orange" || speculativePercent > 15) return "Orange";
  if (marginStatus === "Yellow") return "Yellow";
  return "Green";
}

export function getDaysUntil(date: string) {
  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export function getContributionPlan(marginUsed: number, monthlyContribution: number) {
  if (marginUsed > 1000) {
    return [
      { label: "Margin paydown", percent: 80, value: monthlyContribution * 0.8 },
      { label: "Core holdings", percent: 20, value: monthlyContribution * 0.2 }
    ];
  }

  if (marginUsed > 500) {
    return [
      { label: "Margin paydown", percent: 60, value: monthlyContribution * 0.6 },
      { label: "Core holdings", percent: 30, value: monthlyContribution * 0.3 },
      { label: "Cash", percent: 10, value: monthlyContribution * 0.1 }
    ];
  }

  if (marginUsed > 0) {
    return [
      { label: "Margin paydown", percent: 40, value: monthlyContribution * 0.4 },
      { label: "Core holdings", percent: 40, value: monthlyContribution * 0.4 },
      { label: "Cash", percent: 20, value: monthlyContribution * 0.2 }
    ];
  }

  return [
    { label: "Core holdings", percent: 50, value: monthlyContribution * 0.5 },
    { label: "ETFs", percent: 25, value: monthlyContribution * 0.25 },
    { label: "Speculative", percent: 15, value: monthlyContribution * 0.15 },
    { label: "Cash", percent: 10, value: monthlyContribution * 0.1 }
  ];
}

export function normalizeSettings(settings: PortfolioSettings): PortfolioSettings {
  return {
    ...settings,
    monthlyContribution: safeNumber(settings.monthlyContribution),
    startingYearValue: safeNumber(settings.startingYearValue),
    buyingPower: safeNumber(settings.buyingPower),
    cash: safeNumber(settings.cash),
    marginUsed: safeNumber(settings.marginUsed),
    optionsAndOtherValue: safeNumber(settings.optionsAndOtherValue ?? 0)
  };
}

export function safeNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}
