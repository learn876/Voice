"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

export type CallLogItem = {
  id: string;
  customer_id: string | null;
  customer_name: string;
  phone_number: string;
  service_requested?: string | null;
  booking_time?: string | null;
  summary: string | null;
  sentiment: string | null;
  transcript: string | null;
  complaint_details: string | null;
  created_at: string | null;
  channel?: "voice" | "text";
  is_test?: boolean;
  scenario_category?: string;
  handoff_reason?: string;
  is_high_ticket?: boolean;
};

export type AppointmentItem = Database["public"]["Tables"]["appointments"]["Row"];

export type WalletItem = {
  id: string;
  balance_inr: number;
  rate_per_min_inr: number;
  total_calls_handled: number;
  total_minutes_consumed: number;
  updated_at: string | null;
};

export function useRealtimeDashboard() {
  const [calls, setCalls] = useState<CallLogItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [wallet, setWallet] = useState<WalletItem>({
    id: "",
    balance_inr: 2500.0,
    rate_per_min_inr: 7.0,
    total_calls_handled: 0,
    total_minutes_consumed: 0,
    updated_at: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Fetch full initial dashboard data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Calls with Customer details
      const { data: callsData, error: callsError } = await supabase
        .from("calls")
        .select(`
          id,
          customer_id,
          summary,
          sentiment,
          transcript,
          complaint_details,
          created_at,
          customers (
            id,
            name,
            phone
          )
        `)
        .order("created_at", { ascending: false });

      if (callsError) throw callsError;

      // Map raw query result to clean typed items
      const formattedCalls: CallLogItem[] = (callsData || []).map((row: any) => ({
        id: row.id,
        customer_id: row.customer_id,
        customer_name: row.customers?.name || "Unknown",
        phone_number: row.customers?.phone || "N/A",
        summary: row.summary,
        sentiment: row.sentiment,
        transcript: row.transcript,
        complaint_details: row.complaint_details,
        created_at: row.created_at,
      }));

      // 2. Fetch Appointments
      const { data: apptsData, error: apptsError } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      if (apptsError) throw apptsError;

      // 3. Fetch Account Wallet Balance
      const { data: walletData } = await supabase
        .from("account_wallet")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (walletData) {
        setWallet({
          id: walletData.id,
          balance_inr: Number(walletData.balance_inr) || 0,
          rate_per_min_inr: Number(walletData.rate_per_min_inr) || 7.0,
          total_calls_handled: Number(walletData.total_calls_handled) || 0,
          total_minutes_consumed: Number(walletData.total_minutes_consumed) || 0,
          updated_at: walletData.updated_at,
        });
      }

      setCalls(formattedCalls);
      setAppointments(apptsData || []);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWalletBalance = async (newBalanceInr: number) => {
    try {
      if (wallet.id) {
        await supabase
          .from("account_wallet")
          .update({
            balance_inr: newBalanceInr,
            updated_at: new Date().toISOString(),
          })
          .eq("id", wallet.id);
      } else {
        await supabase.from("account_wallet").insert({
          balance_inr: newBalanceInr,
          rate_per_min_inr: 7.0,
        });
      }
      fetchData();
    } catch (e) {
      console.error("Failed to update wallet balance:", e);
    }
  };

  useEffect(() => {
    fetchData();

    // 4. Realtime Channel for instant live updates
    const channel = supabase
      .channel("realtime-dashboard")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "calls" },
        async (payload) => {
          const newCall = payload.new as Database["public"]["Tables"]["calls"]["Row"];

          // Fetch customer info for the newly inserted call
          let customerName = "Unknown";
          let customerPhone = "N/A";

          if (newCall.customer_id) {
            const { data: cust } = await supabase
              .from("customers")
              .select("name, phone")
              .eq("id", newCall.customer_id)
              .maybeSingle();

            if (cust) {
              customerName = cust.name || "Unknown";
              customerPhone = cust.phone || "N/A";
            }
          }

          const callItem: CallLogItem = {
            id: newCall.id,
            customer_id: newCall.customer_id,
            customer_name: customerName,
            phone_number: customerPhone,
            summary: newCall.summary,
            sentiment: newCall.sentiment,
            transcript: newCall.transcript,
            complaint_details: newCall.complaint_details,
            created_at: newCall.created_at,
          };

          setCalls((prev) => [callItem, ...prev.filter((c) => c.id !== callItem.id)]);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "appointments" },
        (payload) => {
          const newAppt = payload.new as AppointmentItem;
          setAppointments((prev) => [newAppt, ...prev.filter((a) => a.id !== newAppt.id)]);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "account_wallet" },
        (payload) => {
          if (payload.new && typeof payload.new === "object") {
            const updated = payload.new as any;
            setWallet({
              id: updated.id,
              balance_inr: Number(updated.balance_inr) || 0,
              rate_per_min_inr: Number(updated.rate_per_min_inr) || 7.0,
              total_calls_handled: Number(updated.total_calls_handled) || 0,
              total_minutes_consumed: Number(updated.total_minutes_consumed) || 0,
              updated_at: updated.updated_at,
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "calls" },
        () => {
          fetchData();
        }
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Derived KPI metrics
  const totalCalls = calls.length;
  const upcomingAppointments = appointments.filter(
    (a) => a.status?.toLowerCase() === "confirmed" || a.status?.toLowerCase() === "scheduled"
  ).length;
  const uniqueCustomers = new Set(calls.map((c) => c.phone_number)).size;
  const positiveSentimentCount = calls.filter(
    (c) => c.sentiment?.toLowerCase() === "positive"
  ).length;

  return {
    calls,
    appointments,
    wallet,
    updateWalletBalance,
    loading,
    error,
    isLive,
    kpis: {
      totalCalls,
      upcomingAppointments,
      uniqueCustomers,
      positiveSentimentCount,
    },
    refetch: fetchData,
  };
}
