export const bucketOptions = [
  "Core Growth",
  "ETF / Broad Exposure",
  "Speculative Future Tech",
  "Watch Only",
  "Cash"
] as const;

export type Bucket = (typeof bucketOptions)[number];

export type MarginStatus = "Green" | "Yellow" | "Orange" | "Red";

export type Holding = {
  id: string;
  ticker: string;
  companyName: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  bucket: Bucket;
  thesis: string;
  convictionScore: number;
  sellRules: string;
  addRules: string;
  lastReviewedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type PortfolioSettings = {
  monthlyContribution: number;
  nextContributionDate: string;
  optionsLockEnabled: boolean;
  startingYearValue: number;
  buyingPower: number;
  cash: number;
  marginUsed: number;
  lastPriceRefreshAt?: string;
};

export type ChecklistAnswers = {
  inPlan: boolean;
  usingMargin: boolean;
  coreOrSpeculative: "Core holding" | "Speculative holding" | "ETF / Broad Exposure" | "Cash";
  fomo: boolean;
  thesisImproved: boolean;
  preferExistingCore: boolean;
  insideTargetRanges: boolean;
};

export type BuyChecklistEntry = {
  id: string;
  ticker: string;
  bucketIntent: Bucket;
  answers: ChecklistAnswers;
  notes: string;
  guardrailWarning?: string;
  createdAt: string;
};

export type AppState = {
  schemaVersion: 1;
  holdings: Holding[];
  settings: PortfolioSettings;
  buyChecklistLog: BuyChecklistEntry[];
};

export type MarketQuote = {
  symbol: string;
  price: number;
  currency?: string;
  marketState?: string;
  sourceName?: string;
};

export type HoldingWithMetrics = Holding & {
  marketValue: number;
  costBasis: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  portfolioPercent: number;
};

export type BucketAllocation = {
  bucket: Bucket;
  value: number;
  percent: number;
  target?: {
    min: number;
    max: number;
  };
};
