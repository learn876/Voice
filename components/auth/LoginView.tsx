"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, ArrowRight, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

export function LoginView() {
  const { signInWithGoogle, signInWithEmail, loading } = useAuth();
  const [emailInput, setEmailInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setErrorMessage(null);
      setIsConnectingGoogle(true);
      await signInWithGoogle();
    } catch (err: any) {
      setIsConnectingGoogle(false);
      setErrorMessage(err.message || "Failed to sign in with Google.");
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    signInWithEmail(emailInput.trim());
  };

  const quickProfiles = [
    {
      role: "Super Admin",
      name: "Shaik Atif",
      email: "shaikatif@gmail.com",
      badge: "Access All 3 Spaces",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      icon: "🛡️",
    },
    {
      role: "Business Owner",
      name: "DynamicDetailing",
      email: "owner@dynamicdetailing.com",
      badge: "Car Detailing CRM",
      badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
      icon: "🚗",
    },
    {
      role: "Business Owner",
      name: "Vave Salon Luxe",
      email: "salonowner@gmail.com",
      badge: "Hair & Beauty CRM",
      badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
      icon: "💇",
    },
    {
      role: "Business Owner",
      name: "SteelArm Fitness",
      email: "gymowner@gmail.com",
      badge: "Gym & CrossFit CRM",
      badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
      icon: "🏋️",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900/90 rounded-2xl border border-slate-800 p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 mb-1">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Client Portal Authentication
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Sign in with your authorized Google Account / Gmail ID to access your dedicated Voice AI call logs and analytics.
          </p>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Primary Action: Sign In with Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={isConnectingGoogle || loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 px-4 text-xs transition-all shadow-md active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {isConnectingGoogle ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-slate-800" />
          ) : (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Sign In with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-800" />
          <span className="bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Or Sign In with Business Gmail ID
          </span>
        </div>

        {/* Email Direct Input */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              placeholder="e.g. owner@dynamicdetailing.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 text-xs transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Continue to Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* One-Click Quick Test Accounts */}
        <div className="pt-2 border-t border-slate-800 space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Quick Test As:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickProfiles.map((p) => (
              <button
                key={p.email}
                onClick={() => signInWithEmail(p.email, p.name)}
                className="flex flex-col text-left p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-all hover:border-slate-600 group cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-sm">{p.icon}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${p.badgeColor}`}>
                    {p.role}
                  </span>
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {p.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono truncate">
                  {p.email}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
