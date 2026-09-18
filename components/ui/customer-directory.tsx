"use client";

import React from "react";
import { CallLogItem } from "@/hooks/useRealtimeDashboard";
import { Users, Phone, MessageSquare, ChevronRight } from "lucide-react";
import { SentimentPill } from "./sentiment-pill";

interface CustomerDirectoryProps {
  calls: CallLogItem[];
  onSelectCall: (call: CallLogItem) => void;
}

export function CustomerDirectory({ calls, onSelectCall }: CustomerDirectoryProps) {
  const customerMap = new Map<string, CallLogItem[]>();
  calls.forEach((call) => {
    const list = customerMap.get(call.phone_number) || [];
    list.push(call);
    customerMap.set(call.phone_number, list);
  });

  const customerList = Array.from(customerMap.entries()).map(([phone, customerCalls]) => {
    const latestCall = customerCalls[0];
    const customerName =
      customerCalls.find((c) => c.customer_name !== "Unknown")?.customer_name ||
      latestCall.customer_name ||
      "Unknown";

    return {
      phone,
      name: customerName,
      totalCalls: customerCalls.length,
      latestCall,
    };
  });

  if (customerList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-[#111114] border border-white/[0.08] p-12 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-400 mb-3">
          <Users className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-semibold text-zinc-100">No Customers in Directory</h4>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm">
          Callers will automatically be saved and organized with contact details.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {customerList.map((cust) => (
        <div
          key={cust.phone}
          onClick={() => onSelectCall(cust.latestCall)}
          className="group relative cursor-pointer overflow-hidden rounded-xl bg-[#111114] p-4 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all duration-150 hover:border-white/[0.16] hover:bg-[#15151a]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-white/[0.08] text-xs font-semibold text-zinc-200 font-mono">
                {cust.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-white transition-colors">
                  {cust.name}
                </h4>
                <p className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                  <Phone className="h-3 w-3 text-zinc-400" /> {cust.phone}
                </p>
              </div>
            </div>

            <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="mt-3.5 flex items-center justify-between rounded-lg bg-[#0c0c0e] p-2.5 border border-white/[0.04] text-[11px]">
            <span className="flex items-center gap-1.5 text-zinc-400 font-mono">
              <MessageSquare className="h-3 w-3 text-zinc-400" />
              {cust.totalCalls} {cust.totalCalls === 1 ? "call" : "calls"}
            </span>

            <SentimentPill sentiment={cust.latestCall.sentiment} />
          </div>
        </div>
      ))}
    </div>
  );
}
