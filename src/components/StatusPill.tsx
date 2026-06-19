import type { MarginStatus } from "@/types";

const classes: Record<MarginStatus, string> = {
  Green: "border-forest/30 bg-forest/10 text-forest",
  Yellow: "border-yellow-300 bg-yellow-100 text-caution",
  Orange: "border-orange-300 bg-orange-100 text-ember",
  Red: "border-red-300 bg-red-100 text-danger"
};

export function StatusPill({ status, label }: { status: MarginStatus; label?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${classes[status]}`}>
      {label ?? status}
    </span>
  );
}
