const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const getMarginStatus = (marginUsed) => {
  if (marginUsed <= 0) return "Green";
  if (marginUsed <= 500) return "Yellow";
  if (marginUsed <= 1000) return "Orange";
  return "Red";
};

const holdings = [
  { shares: 2, averageCost: 10, currentPrice: 15, bucket: "Core Growth" },
  { shares: 1, averageCost: 20, currentPrice: 30, bucket: "Speculative Future Tech" }
];

const holdingsValue = holdings.reduce((total, holding) => total + holding.shares * holding.currentPrice, 0);
const cash = 100;
const marginUsed = 50;
const optionsAndOtherValue = 5;
const totalAccountValue = holdingsValue + cash + optionsAndOtherValue - marginUsed;
const netInvestableCash = cash - marginUsed;
const ytd = ((totalAccountValue - 120) / 120) * 100;

assert(holdingsValue === 60, "holdings value should equal shares times current price");
assert(totalAccountValue === 115, "total account value should include cash and other value, then subtract margin");
assert(netInvestableCash === 50, "net investable cash should subtract margin used from cash");
assert(Math.round(ytd * 100) / 100 === -4.17, "YTD performance should be calculated from starting year value");
assert(getMarginStatus(0) === "Green", "zero margin should be Green");
assert(getMarginStatus(500) === "Yellow", "margin up to 500 should be Yellow");
assert(getMarginStatus(1000) === "Orange", "margin up to 1000 should be Orange");
assert(getMarginStatus(1001) === "Red", "margin above 1000 should be Red");

const currentGoalValue = 4424;
const nextMilestone = 5000;
const remainingToNext = nextMilestone - currentGoalValue;
const progressToNext = (currentGoalValue / nextMilestone) * 100;
const mrvlCurrentShares = 9.25;
const mrvlShareGoal = 25;

const estimateMonthsToTarget = (currentValue, monthlyDeposit, annualReturn, targetValue) => {
  if (currentValue >= targetValue) return 0;
  if (monthlyDeposit === 0 && annualReturn <= 0) return null;
  const monthlyRate = annualReturn <= -100 ? -1 : Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  let projectedValue = currentValue;

  for (let month = 1; month <= 600; month += 1) {
    projectedValue = projectedValue * (1 + monthlyRate) + monthlyDeposit;
    if (projectedValue >= targetValue) return month;
  }

  return null;
};

const addMonthsToDate = (startDate, months) => {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + months);
  return date;
};

assert(remainingToNext === 576, "goal tracker should calculate dollars remaining to next milestone");
assert(Math.round(progressToNext * 10) / 10 === 88.5, "goal tracker should calculate progress to next milestone");
assert(mrvlShareGoal - mrvlCurrentShares === 15.75, "MRVL tracker should calculate remaining shares");
assert(estimateMonthsToTarget(4424, 500, 10, 5000) === 2, "projection should estimate months to next milestone");
assert(estimateMonthsToTarget(4424, 500, 10, 25000) === 34, "projection should estimate months to full target");
assert(estimateMonthsToTarget(4424, 500, 0, 25000) === 42, "deposits-only mode should ignore returns");
assert(
  addMonthsToDate(new Date("2026-06-21T00:00:00"), 2).getMonth() === 7,
  "projection date should move when estimated months change"
);

console.log("Calculation verification passed.");
