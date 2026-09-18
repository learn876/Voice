import React from "react";
import { cn } from "@/lib/utils";

interface SentimentPillProps {
  sentiment: string | null;
  className?: string;
}

export function SentimentPill({ sentiment, className }: SentimentPillProps) {
  if (!sentiment) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md bg-zinc-900 border border-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-zinc-400 font-mono",
          className
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
        Unrated
      </span>
    );
  }

  const lower = sentiment.toLowerCase();

  if (lower.includes("pos") || lower.includes("good") || lower.includes("happy") || lower.includes("great")) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-400 font-mono",
          className
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
        Positive
      </span>
    );
  }

  if (lower.includes("neg") || lower.includes("angry") || lower.includes("bad") || lower.includes("frustrat")) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md bg-rose-950/40 border border-rose-500/20 px-2 py-0.5 text-[11px] font-medium text-rose-400 font-mono",
          className
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.6)]" />
        Negative
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-400 font-mono",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
    </span>
  );
}
