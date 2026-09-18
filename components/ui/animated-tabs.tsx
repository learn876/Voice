"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function AnimatedTabs({
  tabs,
  activeTab,
  onChange,
  className,
}: AnimatedTabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-[#111114] p-1 border border-white/[0.08]",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 select-none",
              isActive
                ? "bg-zinc-800 text-zinc-100 shadow-[0_1px_3px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)] border border-white/[0.06]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
            )}
          >
            {tab.icon && (
              <span className={cn("transition-colors", isActive ? "text-zinc-200" : "text-zinc-500")}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "font-mono text-[10px] px-1.5 py-0.2 rounded transition-colors",
                  isActive
                    ? "bg-zinc-700/80 text-zinc-200"
                    : "bg-zinc-900 text-zinc-500"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
