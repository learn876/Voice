"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  Wallet,
  LogOut,
  Building2,
  Shield,
  User,
} from "lucide-react";
import { WalletItem } from "@/types/dashboard";
import { AuthUser } from "@/context/AuthContext";
import { Tenant } from "@/lib/tenantConfig";

interface HeaderProps {
  isLive: boolean;
  loading: boolean;
  wallet?: WalletItem;
  tenant: {
    id: string;
    name: string;
    category: string;
  };
  user: AuthUser | null;
  onRefresh: () => void;
  onSignOut: () => void;
  onUpdateBalance?: (newBalanceInr: number) => Promise<void>;
}

export function Header({
  isLive,
  loading,
  wallet,
  tenant,
  user,
  onRefresh,
  onSignOut,
  onUpdateBalance,
}: HeaderProps) {
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const balanceInr = wallet?.balance_inr ?? 2500.0;
  const ratePerMin = wallet?.rate_per_min_inr ?? 7.0;
  const minsRemaining = Math.max(0, Math.floor(balanceInr / (ratePerMin || 7.0)));

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(topupAmount);
    if (isNaN(val) || val <= 0 || !onUpdateBalance) return;
    setIsUpdating(true);
    await onUpdateBalance(val);
    setIsUpdating(false);
    setShowTopupModal(false);
    setTopupAmount("");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-8 shadow-xs">
      {/* Left: Active Business Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">{tenant.name}</h2>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
            {tenant.category}
          </span>
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-3">
        {/* Real-time Live INR Balance Badge */}
        <div
          onClick={() => setShowTopupModal(true)}
          className="group relative flex cursor-pointer items-center gap-2.5 rounded-lg border border-indigo-100 bg-indigo-50/70 px-3 py-1.5 text-xs text-indigo-950 shadow-2xs transition-all hover:bg-indigo-100/80"
          title="Click to sync or update Omnidimension wallet balance"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white font-bold text-xs shadow-xs">
            ₹
          </div>
          <div className="flex flex-col text-left leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-xs">
                ₹{balanceInr.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`text-[10px] font-semibold px-1 py-0.2 rounded ${
                  balanceInr > 300
                    ? "text-emerald-700 bg-emerald-100/80"
                    : "text-rose-700 bg-rose-100/80"
                }`}
              >
                {balanceInr > 300 ? "Active" : "Low"}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              ~{minsRemaining} Mins left
            </span>
          </div>
        </div>

        {/* Realtime Live Sync Pill */}
        <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          <span className="relative flex h-2 w-2">
            {isLive && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                isLive ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
          </span>
          <span className="text-[11px]">{isLive ? "Live Connected" : "Connecting"}</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs ring-2 ring-blue-500/20 hover:ring-blue-500/40 transition-all"
          >
            {initials}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-2 shadow-xl border border-slate-100 space-y-1 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{user?.email}</p>
                <div className="mt-1">
                  {user?.isAdmin ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      <Shield className="h-2.5 w-2.5" /> Super Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Business Owner
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onSignOut();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Topup Modal */}
      {showTopupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Sync Omnidimension Wallet
                </h3>
              </div>
              <button
                onClick={() => setShowTopupModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Enter the current balance (in INR ₹) from your Omnidimension billing dashboard.
            </p>

            <form onSubmit={handleTopup} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Current Wallet Balance (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 2500"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="h-9 w-full rounded-lg bg-slate-50 pl-7 pr-3 text-xs text-slate-900 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTopupModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !topupAmount}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Save Balance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
