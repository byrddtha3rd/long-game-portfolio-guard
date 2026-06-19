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
const totalAccountValue = holdingsValue + cash;
const netInvestableCash = cash - marginUsed;
const ytd = ((totalAccountValue - 120) / 120) * 100;

assert(holdingsValue === 60, "holdings value should equal shares times current price");
assert(totalAccountValue === 160, "total account value should include cash");
assert(netInvestableCash === 50, "net investable cash should subtract margin used from cash");
assert(Math.round(ytd * 100) / 100 === 33.33, "YTD performance should be calculated from starting year value");
assert(getMarginStatus(0) === "Green", "zero margin should be Green");
assert(getMarginStatus(500) === "Yellow", "margin up to 500 should be Yellow");
assert(getMarginStatus(1000) === "Orange", "margin up to 1000 should be Orange");
assert(getMarginStatus(1001) === "Red", "margin above 1000 should be Red");

console.log("Calculation verification passed.");
