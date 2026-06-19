import { formatCurrency, formatPercent, getBucketAllocations } from "@/lib/calculations";
import type { Holding } from "@/types";

const bucketColors: Record<string, string> = {
  "Core Growth": "bg-forest",
  "ETF / Broad Exposure": "bg-sage",
  "Speculative Future Tech": "bg-ember",
  "Watch Only": "bg-ink",
  Cash: "bg-caution"
};

export function AllocationChart({ holdings }: { holdings: Holding[] }) {
  const allocations = getBucketAllocations(holdings);

  return (
    <section className="surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="label">Portfolio buckets</p>
          <h2 className="text-xl font-bold text-ink">Allocation</h2>
        </div>
      </div>

      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-mist" aria-hidden="true">
        {allocations.map((allocation) => (
          <div
            key={allocation.bucket}
            className={bucketColors[allocation.bucket]}
            style={{ width: `${Math.max(allocation.percent, 1)}%` }}
          />
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {allocations.map((allocation) => {
          const outsideTarget =
            allocation.target &&
            allocation.bucket !== "Watch Only" &&
            (allocation.percent < allocation.target.min || allocation.percent > allocation.target.max);

          return (
            <div key={allocation.bucket} className="rounded-md border border-black/10 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{allocation.bucket}</p>
                  <p className="text-xs text-sage">
                    {allocation.target
                      ? `Target ${allocation.target.min}-${allocation.target.max}%`
                      : "No target range"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-ink">{formatPercent(allocation.percent)}</p>
                  <p className="text-xs text-sage">{formatCurrency(allocation.value)}</p>
                </div>
              </div>
              {outsideTarget ? (
                <p className="mt-2 text-xs font-semibold text-ember">Outside written target range.</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
