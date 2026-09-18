"use client";

import React from "react";
import { CallLogItem } from "@/hooks/useRealtimeDashboard";
import { SentimentPill } from "./sentiment-pill";
import {
  X,
  User,
  Phone,
  Clock,
  MessageSquare,
  FileText,
  AlertTriangle,
  Sparkles,
  Bot,
  Copy,
  Check,
  Calendar,
  Hash,
} from "lucide-react";

interface CallDrawerProps {
  call: CallLogItem | null;
  onClose: () => void;
}

export function CallDrawer({ call, onClose }: CallDrawerProps) {
  const [copied, setCopied] = React.useState(false);

  if (!call) return null;

  const handleCopyTranscript = () => {
    if (call.transcript) {
      navigator.clipboard.writeText(call.transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "N/A";
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  // Helper to format transcript lines if they contain Agent/User turns
  const formatTranscriptLines = (raw: string | null) => {
    if (!raw) return [];
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  const transcriptLines = formatTranscriptLines(call.transcript);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-all duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over Panel */}
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col bg-[#111114] border-l border-white/[0.08] shadow-2xl transition-transform duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0c0c0e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-300">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">
                  {call.customer_name}
                </h3>
                <SentimentPill sentiment={call.sentiment} />
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                {call.phone_number}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6 text-xs text-zinc-300">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#0c0c0e] p-3.5 border border-white/[0.06]">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                Call ID
              </span>
              <p className="font-mono text-[11px] text-zinc-300 truncate mt-0.5">
                {call.id}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                Timestamp
              </span>
              <p className="text-[11px] text-zinc-300 mt-0.5">
                {formatDate(call.created_at)}
              </p>
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              Call Summary
            </label>
            <div className="rounded-lg bg-[#0c0c0e] p-3.5 text-zinc-200 leading-relaxed border border-white/[0.06]">
              {call.summary || "No summary recorded for this call."}
            </div>
          </div>

          {/* Customer Complaint Details */}
          {call.complaint_details && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Customer Complaint / Flag
              </label>
              <div className="rounded-lg bg-rose-950/20 border border-rose-500/20 p-3 text-rose-300">
                {call.complaint_details}
              </div>
            </div>
          )}

          {/* Transcript Dialogue */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                Dialogue Transcript
              </label>
              {call.transcript && (
                <button
                  onClick={handleCopyTranscript}
                  className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="rounded-lg bg-[#0c0c0e] p-4 border border-white/[0.06] max-h-80 overflow-y-auto space-y-2.5 font-mono text-[11px]">
              {transcriptLines.length === 0 ? (
                <p className="text-zinc-500 italic font-sans">No transcript text available.</p>
              ) : (
                transcriptLines.map((line, idx) => {
                  const isAgent =
                    line.toLowerCase().startsWith("agent:") ||
                    line.toLowerCase().startsWith("bot:") ||
                    line.toLowerCase().startsWith("ai:");
                  const isUser =
                    line.toLowerCase().startsWith("user:") ||
                    line.toLowerCase().startsWith("customer:") ||
                    line.toLowerCase().startsWith("caller:");

                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded leading-relaxed ${
                        isAgent
                          ? "bg-zinc-900/90 text-zinc-200 border-l-2 border-blue-500"
                          : isUser
                          ? "bg-zinc-900/40 text-zinc-300 border-l-2 border-emerald-500"
                          : "text-zinc-400"
                      }`}
                    >
                      {line}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.08] bg-[#0c0c0e] px-6 py-3 flex items-center justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
