import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive = true,
  loading = false,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-[#111114] p-5 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_16px_-4px_rgba(0,0,0,0.6)] transition-all duration-200 hover:border-white/[0.16] hover:bg-[#15151a]">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium tracking-wider uppercase text-zinc-400">
            {title}
          </p>
          <div className="text-2xl font-bold tracking-tight text-zinc-100 font-mono">
            {loading ? (
              <span className="inline-block h-7 w-16 animate-pulse rounded bg-zinc-800" />
            ) : (
              value
            )}
          </div>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-white/[0.06] text-zinc-300">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-3 text-[11px] text-zinc-400">
        <span className="truncate">{subtitle}</span>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-1 font-medium font-mono text-[10px] px-1.5 py-0.5 rounded",
              trendPositive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            )}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
