import { BookOpenCheck } from "lucide-react";
import type { HoldingWithMetrics } from "@/types";

export function ThesisCard({ holding }: { holding: HoldingWithMetrics }) {
  return (
    <article className="rounded-lg border border-black/10 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label">{holding.bucket}</p>
          <h3 className="text-lg font-bold text-ink">{holding.ticker}</h3>
          <p className="text-sm text-sage">{holding.companyName}</p>
        </div>
        <BookOpenCheck className="h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
      </div>

      <div className="mt-4 space-y-3 text-sm leading-6">
        <TextBlock label="Why I own it" text={holding.thesis} />
        <TextBlock label="What would make me add" text={holding.addRules} />
        <TextBlock label="What would make me sell" text={holding.sellRules} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-sage">
        <span className="rounded-full bg-mist px-2.5 py-1">Conviction {holding.convictionScore}/5</span>
        <span className="rounded-full bg-mist px-2.5 py-1">Reviewed {holding.lastReviewedAt}</span>
      </div>
    </article>
  );
}

function TextBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-normal text-sage">{label}</p>
      <p className="mt-1 text-ink">{text || "Not written yet."}</p>
    </div>
  );
}
