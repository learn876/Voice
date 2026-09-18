"use client";

import React from "react";
import {
  LayoutDashboard,
  PhoneCall,
  Calendar,
  LogOut,
  Shield,
  Building2,
  Lock,
  AlertTriangle,
  FlaskConical,
} from "lucide-react";
import { Tenant } from "@/lib/tenantConfig";
import { AuthUser } from "@/context/AuthContext";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  selectedTenantId: string;
  onSelectTenant: (tenantId: string) => void;
  user: AuthUser | null;
  onSignOut: () => void;
}

export function Sidebar({
  activeView,
  setActiveView,
  selectedTenantId,
  onSelectTenant,
  user,
  onSignOut,
}: SidebarProps) {
  const allowedTenants: Tenant[] = user?.allowedTenants || [];
  const currentTenant =
    allowedTenants.find((t) => t.id === selectedTenantId) ||
    allowedTenants[0];

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#1b2434] text-slate-300">
      {/* Brand & Workspace Area */}
      <div className="p-4 border-b border-slate-800/60 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active Workspace
          </span>
          {user?.isAdmin ? (
            <span className="flex items-center gap-1 rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-blue-400 border border-blue-500/30">
              <Shield className="h-2.5 w-2.5" />
              Admin
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400 border border-emerald-500/30">
              <Lock className="h-2.5 w-2.5" />
              Owner Locked
            </span>
          )}
        </div>

        {/* Multi-Tenant Switcher: Visible ONLY for Admin */}
        {user?.isAdmin ? (
          <div className="space-y-1">
            <select
              value={selectedTenantId}
              onChange={(e) => onSelectTenant(e.target.value)}
              className="w-full rounded-lg bg-slate-800/90 px-3 py-2 text-xs font-semibold text-white border border-slate-700/80 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {allowedTenants.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          /* Business Owner: Locked to their specific space */
          <div className="flex items-center gap-2.5 rounded-lg bg-slate-800/60 p-2.5 border border-slate-700/40">
            <div className={`flex h-7 w-7 items-center justify-center rounded-md font-bold text-white text-xs ${currentTenant?.accentColor || "bg-indigo-600"}`}>
              {currentTenant?.logoInitial || "DD"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {currentTenant?.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentTenant?.category}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Clean Navigation Links */}
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 text-xs">
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            CRM Dashboard
          </p>

          <button
            onClick={() => setActiveView("crm")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
              activeView === "crm"
                ? "bg-blue-600 text-white shadow-xs font-semibold"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveView("calls")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
              activeView === "calls"
                ? "bg-blue-600 text-white shadow-xs font-semibold"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            <PhoneCall className="h-4 w-4" />
            <span>Call Logs & Recordings</span>
          </button>

          <button
            onClick={() => setActiveView("appointments")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
              activeView === "appointments"
                ? "bg-blue-600 text-white shadow-xs font-semibold"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Booked Appointments</span>
          </button>

          <button
            onClick={() => setActiveView("escalations")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
              activeView === "escalations"
                ? "bg-rose-600 text-white shadow-xs font-semibold"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-rose-400"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Escalations & Alerts</span>
          </button>
        </div>
      </div>

      {/* Authenticated User Profile at Bottom with Sign Out */}
      <div className="flex items-center justify-between border-t border-slate-800/80 p-4 bg-[#161e2c]">
        <div className="flex items-center gap-2.5 truncate">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs ring-2 ring-blue-500/20">
            {initials}
          </div>
          <div className="truncate text-left leading-tight">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
