import React from "react";
import { Phone } from "lucide-react";

interface DonutChartProps {
  totalCalls: number;
  answeredPercent?: number;
  missedPercent?: number;
  voicemailPercent?: number;
}

export function DonutChart({
  totalCalls,
  answeredPercent = 65.0,
  missedPercent = 25.0,
  voicemailPercent = 10.0,
}: DonutChartProps) {
  // Calculations for SVG stroke-dasharray (circumference of r=38 is ~238.76)
  const c = 2 * Math.PI * 38;
  const answeredDash = (answeredPercent / 100) * c;
  const missedDash = (missedPercent / 100) * c;
  const voicemailDash = (voicemailPercent / 100) * c;

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Title */}
      <div className="flex items-center gap-2 pb-2">
        <Phone className="h-4 w-4 text-blue-500" />
        <h3 className="text-sm font-bold text-slate-800">Phone Calls</h3>
      </div>

      {/* SVG Donut */}
      <div className="relative flex items-center justify-center my-3">
        <svg className="h-44 w-44 transform -rotate-90" viewBox="0 0 100 100">
          {/* Blue - Answered (65%) */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="transparent"
            stroke="#3B82F6"
            strokeWidth="18"
            strokeDasharray={`${answeredDash} ${c}`}
            strokeDashoffset="0"
          />
          {/* Amber - Booked/Missed (25%) */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="transparent"
            stroke="#D97706"
            strokeWidth="18"
            strokeDasharray={`${missedDash} ${c}`}
            strokeDashoffset={-answeredDash}
          />
          {/* Red-Orange - Voicemail/Other (10%) */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="transparent"
            stroke="#DC2626"
            strokeWidth="18"
            strokeDasharray={`${voicemailDash} ${c}`}
            strokeDashoffset={-(answeredDash + missedDash)}
          />
        </svg>

        {/* Inner Label Overlay */}
        <div className="absolute text-center">
          <span className="text-xs font-semibold text-slate-400">Calls</span>
          <p className="text-xl font-bold text-slate-800">{totalCalls}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-600 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
          <span>Voicemail</span>
        </div>
      </div>
    </div>
  );
}
