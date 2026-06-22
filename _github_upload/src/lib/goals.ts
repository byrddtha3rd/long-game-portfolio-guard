export const portfolioMilestones = [5000, 10000, 15000, 20000, 25000];
export const portfolioGoal = 25000;
export const mrvlShareGoal = 25;
export const projectionModes = [
  { label: "Deposits only", annualReturn: 0 },
  { label: "Conservative", annualReturn: 5 },
  { label: "Moderate", annualReturn: 7 },
  { label: "S&P-style estimate", annualReturn: 10 }
] as const;

export function getGoalProgress(currentValue: number, targetValue = portfolioGoal) {
  const safeCurrent = Math.max(0, currentValue);
  const effectiveTarget = Math.max(1, targetValue);
  const milestones = getMilestonesForTarget(effectiveTarget);
  const nextMilestone = milestones.find((milestone) => safeCurrent < milestone) ?? effectiveTarget;
  const previousMilestone =
    nextMilestone === milestones[0]
      ? 0
      : milestones[milestones.indexOf(nextMilestone) - 1] ?? effectiveTarget;
  const milestoneSpan = Math.max(1, nextMilestone - previousMilestone);
  const progressToNext =
    safeCurrent >= effectiveTarget ? 100 : Math.min(100, ((safeCurrent - previousMilestone) / milestoneSpan) * 100);

  return {
    currentValue: safeCurrent,
    nextMilestone,
    remainingToNext: Math.max(0, nextMilestone - safeCurrent),
    progressToNext,
    overallProgress: Math.min(100, (safeCurrent / effectiveTarget) * 100),
    remainingToTarget: Math.max(0, effectiveTarget - safeCurrent)
  };
}

export function getMrvlGoalProgress(currentShares: number) {
  const safeShares = Math.max(0, currentShares);

  return {
    currentShares: safeShares,
    remainingShares: Math.max(0, mrvlShareGoal - safeShares),
    progress: Math.min(100, (safeShares / mrvlShareGoal) * 100)
  };
}

export function getMilestonesForTarget(targetValue: number) {
  const effectiveTarget = Math.max(1, targetValue);
  const baseMilestones = portfolioMilestones.filter((milestone) => milestone < effectiveTarget);
  return [...baseMilestones, effectiveTarget].filter((milestone, index, list) => list.indexOf(milestone) === index);
}

export function estimateMonthsToTarget({
  currentValue,
  monthlyDeposit,
  annualReturn,
  targetValue
}: {
  currentValue: number;
  monthlyDeposit: number;
  annualReturn: number;
  targetValue: number;
}) {
  const safeCurrent = Math.max(0, currentValue);
  const safeDeposit = Math.max(0, monthlyDeposit);
  const safeTarget = Math.max(0, targetValue);

  if (safeCurrent >= safeTarget) return 0;
  if (safeDeposit === 0 && annualReturn <= 0) return null;

  const monthlyRate = annualReturn <= -100 ? -1 : Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  let value = safeCurrent;

  for (let month = 1; month <= 600; month += 1) {
    value = value * (1 + monthlyRate) + safeDeposit;
    if (value >= safeTarget) {
      return month;
    }
  }

  return null;
}

export function addMonthsToDate(startDate: Date, months: number) {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + months);
  return date;
}

export function getProjectionRows({
  currentValue,
  monthlyDeposit,
  annualReturn,
  targetValue,
  startDate = new Date()
}: {
  currentValue: number;
  monthlyDeposit: number;
  annualReturn: number;
  targetValue: number;
  startDate?: Date;
}) {
  return getMilestonesForTarget(targetValue).map((milestone) => {
    const months = estimateMonthsToTarget({
      currentValue,
      monthlyDeposit,
      annualReturn,
      targetValue: milestone
    });

    return {
      milestone,
      remaining: Math.max(0, milestone - Math.max(0, currentValue)),
      months,
      date: months === null ? null : addMonthsToDate(startDate, months)
    };
  });
}
