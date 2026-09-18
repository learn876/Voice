"use client";

import React from "react";
import { AppointmentItem } from "@/hooks/useRealtimeDashboard";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Wrench,
  AlertCircle,
  Car,
} from "lucide-react";

interface AppointmentsViewProps {
  appointments: AppointmentItem[];
  loading?: boolean;
}

export function AppointmentsView({ appointments, loading }: AppointmentsViewProps) {
  const getStatusBadge = (status: string | null) => {
    const s = status?.toLowerCase() || "pending";
    if (s === "confirmed") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium font-mono text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Confirmed
        </span>
      );
    }
    if (s === "completed") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded bg-zinc-800 border border-white/[0.08] px-2 py-0.5 text-[10px] font-medium font-mono text-zinc-300">
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium font-mono text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        {status || "Pending"}
      </span>
    );
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "N/A";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-36 animate-pulse rounded-xl bg-[#111114] border border-white/[0.06] p-4"
          />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-[#111114] border border-white/[0.08] p-12 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-400 mb-3">
          <Calendar className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-semibold text-zinc-100">No Appointments Recorded</h4>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm">
          Appointments booked via voice AI will automatically synchronize in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {appointments.map((appt) => (
        <div
          key={appt.id}
          className="group relative overflow-hidden rounded-xl bg-[#111114] p-4 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all duration-150 hover:border-white/[0.16] hover:bg-[#15151a]"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-300">
                <Car className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-zinc-100">
                  {appt.service_requested || "Auto Detailing"}
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono">
                  {formatDate(appt.created_at)}
                </p>
              </div>
            </div>

            {getStatusBadge(appt.status)}
          </div>

          <div className="mt-3.5 rounded-lg bg-[#0c0c0e] p-3 border border-white/[0.04] space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-zinc-400" /> Booking Slot:
              </span>
              <span className="font-semibold text-zinc-200 font-mono">
                {appt.booking_time || "Not specified"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
