"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginView } from "@/components/auth/LoginView";
import { useGoogleSheetsDashboard } from "@/hooks/useGoogleSheetsDashboard";
import { CallLogItem } from "@/hooks/useRealtimeDashboard";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { CallDrawer } from "@/components/ui/call-drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  ChevronDown,
  Phone,
  Eye,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  MessageCircle,
  Filter,
  Star,
  AlertTriangle,
  FlaskConical,
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading, signOut, switchTenant } = useAuth();
  const [activeView, setActiveView] = useState("crm");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showHighTicketOnly, setShowHighTicketOnly] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallLogItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    calls,
    appointments,
    wallet,
    tenant,
    loading: dataLoading,
    isLive,
    kpis,
    refetch,
    updateWalletBalance,
  } = useGoogleSheetsDashboard(user?.currentTenantId, user?.email);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-xs font-medium">Loading workspace session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  // Filter calls by search term and sentiment status
  const escalationCalls = calls.filter((c) => c.handoff_reason);

  const filteredCalls = calls.filter((call) => {
    if (showHighTicketOnly && !call.is_high_ticket) return false;

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (call.customer_name || "").toLowerCase().includes(term) ||
      (call.phone_number || "").toLowerCase().includes(term) ||
      (call.summary || "").toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (statusFilter === "positive") {
      return (call.sentiment || "").toLowerCase().includes("pos");
    }
    if (statusFilter === "negative") {
      return (call.sentiment || "").toLowerCase().includes("neg");
    }
    if (statusFilter === "pending") {
      const s = (call.sentiment || "").toLowerCase();
      return !s || s.includes("pending") || s.includes("neutral");
    }
    return true;
  });

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (sentiment: string | null) => {
    if (!sentiment) {
      return (
        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600 border border-amber-200">
          Pending
        </span>
      );
    }
    const lower = sentiment.toLowerCase();
    if (lower.includes("pos") || lower.includes("good")) {
      return (
        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 border border-emerald-200">
          Approved / Positive
        </span>
      );
    }
    if (lower.includes("neg") || lower.includes("bad")) {
      return (
        <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600 border border-rose-200">
          Flagged / Negative
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">
        Neutral
      </span>
    );
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-600 text-white",
      "bg-emerald-600 text-white",
      "bg-amber-600 text-white",
      "bg-purple-600 text-white",
      "bg-indigo-600 text-white",
    ];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  // Service distribution breakdown
  const serviceCounts: Record<string, number> = {};
  calls.forEach((c) => {
    const text = ((c.summary || "") + " " + (c.transcript || "")).toLowerCase();
    if (text.includes("ppf")) serviceCounts["PPF & Paint Protection"] = (serviceCounts["PPF & Paint Protection"] || 0) + 1;
    if (text.includes("ceramic")) serviceCounts["Ceramic Coating"] = (serviceCounts["Ceramic Coating"] || 0) + 1;
    if (text.includes("wash") || text.includes("exterior")) serviceCounts["Exterior Wash & Care"] = (serviceCounts["Exterior Wash & Care"] || 0) + 1;
    if (text.includes("interior") || text.includes("cleaning")) serviceCounts["Interior Detailing"] = (serviceCounts["Interior Detailing"] || 0) + 1;
    if (text.includes("membership") || text.includes("training") || text.includes("crossfit")) serviceCounts["Memberships & Training"] = (serviceCounts["Memberships & Training"] || 0) + 1;
    if (text.includes("hair") || text.includes("facial") || text.includes("spa")) serviceCounts["Hair & Spa Luxe"] = (serviceCounts["Hair & Spa Luxe"] || 0) + 1;
  });

  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const conversionRate = kpis.totalCalls > 0
    ? Math.round((kpis.confirmedAppointments / kpis.totalCalls) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800">
      {/* Sidebar with Workspace Isolation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        selectedTenantId={user.currentTenantId}
        onSelectTenant={switchTenant}
        user={user}
        onSignOut={signOut}
      />

      {/* Main Content Area */}
      <div className="pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          isLive={isLive}
          loading={dataLoading}
          wallet={wallet}
          tenant={tenant}
          user={user}
          onRefresh={refetch}
          onSignOut={signOut}
          onUpdateBalance={updateWalletBalance}
        />

        {/* Main Content */}
        <main className="flex-1 p-8 space-y-6">
          {/* Active View 1: CRM Overview */}
          {activeView === "crm" && (
            <>
              {/* Clean KPI Cards */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {/* Card 1: Total Voice Calls */}
                <div className="rounded-xl bg-white p-6 shadow-xs border border-slate-200/70 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total AI Interactions
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Phone className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {calls.length}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="inline-flex items-center text-emerald-600 font-semibold text-xs">
                        <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
                        {calls.filter(c => c.channel === 'voice').length} Voice | {calls.filter(c => c.channel === 'text').length} Text
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Google Sheets auto-synced</span>
                    <span className="font-semibold text-slate-600">Omnidimension AI</span>
                  </div>
                </div>

                {/* Card 2: Booked Appointments */}
                <div className="rounded-xl bg-white p-6 shadow-xs border border-slate-200/70 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Appointments Booked
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Calendar className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {kpis.confirmedAppointments}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="inline-flex items-center text-emerald-600 font-semibold text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-0.5" />
                        {conversionRate}% Booking rate
                      </span>
                      <span>• Calendar verified</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Target slot hours: 9 AM - 4:30 PM</span>
                    <span className="font-semibold text-emerald-600">Confirmed</span>
                  </div>
                </div>

                {/* Card 3: Top Services Requested */}
                <div className="rounded-xl bg-white p-6 shadow-xs border border-slate-200/70 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      In-Demand Services
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {topServices.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">No specific services categorized yet.</p>
                    ) : (
                      topServices.map(([name, count]) => (
                        <div key={name} className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 truncate max-w-[180px]">{name}</span>
                          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {count} enquiries
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                    Extracted from AI voice transcripts
                  </div>
                </div>
              </div>

              {/* Call Logs & Leads Table Card */}
              <div className="rounded-xl bg-white p-6 shadow-xs border border-slate-200/70 space-y-4">
                {/* Header with Search & Sentiment Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Caller Records & Lead Inquiries
                    </h3>
                    <p className="text-xs text-slate-400">
                      Showing records for <span className="font-semibold text-slate-700">{tenant.name}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search name, phone, summary..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 w-56 rounded-lg border border-slate-200 bg-slate-50/70 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Functional Sentiment Filter */}
                    <div className="relative flex items-center">
                      <Filter className="absolute left-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-8 rounded-lg border border-slate-200 bg-white pl-7 pr-6 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="all">All Sentiments</option>
                        <option value="positive">Approved / Positive</option>
                        <option value="pending">Pending / Neutral</option>
                        <option value="negative">Flagged / Negative</option>
                      </select>
                    </div>

                    {/* High-Ticket Filter Button */}
                    <button
                      onClick={() => setShowHighTicketOnly(!showHighTicketOnly)}
                      className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${
                        showHighTicketOnly
                          ? "border-amber-300 bg-amber-50 text-amber-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Star className={`h-3.5 w-3.5 ${showHighTicketOnly ? "fill-amber-500 text-amber-500 animate-pulse" : "text-slate-400"}`} />
                      VIP Leads
                    </button>
                  </div>
                </div>

                {/* Table Data */}
                <div className="overflow-hidden rounded-lg border border-slate-200/70">
                  <Table>
                    <TableHeader className="bg-slate-50/90 border-b border-slate-200/70">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-slate-600 font-semibold text-xs py-3">
                          Customer
                        </TableHead>
                        <TableHead className="text-slate-600 font-semibold text-xs">
                          Phone Number
                        </TableHead>
                        <TableHead className="text-slate-600 font-semibold text-xs">
                          Sentiment
                        </TableHead>
                        <TableHead className="text-slate-600 font-semibold text-xs">
                          Date
                        </TableHead>
                        <TableHead className="text-slate-600 font-semibold text-xs text-right pr-4">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataLoading && calls.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-xs text-slate-400">
                            Loading callers for {tenant.name}...
                          </TableCell>
                        </TableRow>
                      ) : filteredCalls.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-xs text-slate-400">
                            No caller records found matching your filter.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCalls.map((call) => (
                          <TableRow
                            key={call.id}
                            className={`border-b border-slate-100 transition-colors ${
                              call.is_high_ticket ? "bg-amber-50/50 hover:bg-amber-100/50" : "hover:bg-slate-50/70"
                            }`}
                          >
                            {/* Customer Avatar & Name */}
                            <TableCell className="py-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getAvatarColor(
                                    call.customer_name || "C"
                                  )}`}
                                >
                                  {(call.customer_name || "C").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-xs text-slate-900">
                                      {call.customer_name || "Caller"}
                                    </p>
                                    {call.is_high_ticket && (
                                      <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> VIP
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    {call.channel === "text" ? (
                                      <MessageCircle className="h-3 w-3 text-emerald-500" />
                                    ) : (
                                      <Phone className="h-3 w-3 text-blue-500" />
                                    )}
                                    <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                                      {call.summary || "Inquiry"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            {/* Phone */}
                            <TableCell className="text-xs text-slate-600 font-mono">
                              {call.phone_number || "Web Call"}
                            </TableCell>

                            {/* Sentiment Badge */}
                            <TableCell>{getStatusBadge(call.sentiment)}</TableCell>

                            {/* Date */}
                            <TableCell className="text-xs text-slate-500">
                              {call.created_at ? new Date(call.created_at).toLocaleDateString() : "Recent"}
                            </TableCell>

                            {/* Action Buttons */}
                            <TableCell className="text-right pr-4">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Copy Number */}
                                {call.phone_number && call.phone_number !== "Web Call" && (
                                  <button
                                    onClick={() => handleCopyPhone(call.phone_number, call.id)}
                                    title="Copy Phone Number"
                                    className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                  >
                                    {copiedId === call.id ? (
                                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                )}

                                {/* WhatsApp Link */}
                                {call.phone_number && call.phone_number !== "Web Call" && (
                                  <a
                                    href={`https://wa.me/${call.phone_number.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Message on WhatsApp"
                                    className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                  </a>
                                )}

                                {/* View Transcript Button */}
                                <button
                                  onClick={() => setSelectedCall(call)}
                                  className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>Transcript</span>
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}

          {/* Active View 2: Call Logs Only */}
          {activeView === "calls" && (
            <div className="rounded-xl bg-white p-6 shadow-xs border border-slate-200/70 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                All Voice Agent Interactions
              </h3>
              <div className="space-y-3">
                {calls.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{c.customer_name || "Caller"}</span>
                        <span className="text-xs font-mono text-slate-500">{c.phone_number}</span>
                      </div>
                      {getStatusBadge(c.sentiment)}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.summary || "No summary recorded."}</p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setSelectedCall(c)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Transcript Dialogue</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active View 3: Booked Appointments */}
          {activeView === "appointments" && (
            <div className="rounded-xl bg-white p-6 shadow-xs border border-slate-200/70 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Scheduled Appointments & Slots
              </h3>
              {appointments.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No appointments scheduled yet for this workspace.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {appointments.map((a) => (
                    <div key={a.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-900">
                          {a.service_requested || "General Detailing"}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          {a.status || "Confirmed"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{a.booking_time || "Scheduled Slot"}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate">ID: {a.id}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active View 4: Escalations & Alerts */}
          {activeView === "escalations" && (
            <div className="rounded-xl bg-white p-6 shadow-xs border border-slate-200/70 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                Escalations & Human Handoffs
              </h3>
              {escalationCalls.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No escalations or complaints recorded! 🎉
                </div>
              ) : (
                <div className="space-y-3">
                  {escalationCalls.map((c) => (
                    <div key={c.id} className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900">{c.customer_name || "Caller"}</span>
                          <span className="text-xs font-mono text-slate-500">{c.phone_number}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                          Handoff Required
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-rose-100/60 shadow-xs">
                        <p className="text-xs font-semibold text-rose-700 mb-1">Issue Category / Reason:</p>
                        <p className="text-xs text-slate-700 leading-relaxed">{c.handoff_reason}</p>
                      </div>
                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedCall(c)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                        >
                          <Eye className="h-3 w-3" />
                          View Transcript
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Slide-over Call Transcript Drawer */}
      <CallDrawer call={selectedCall} onClose={() => setSelectedCall(null)} />
    </div>
  );
}
