"use client";

import useSWR from "swr";
import { useCallback } from "react";
import { CallLogItem, AppointmentItem, WalletItem } from "@/types/dashboard";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useGoogleSheetsDashboard(tenantId?: string, userEmail?: string) {
  const effectiveTenantId = tenantId || "dynamic-detailing";
  const effectiveEmail = userEmail || "shaikatif@gmail.com";

  // SWR automatically polls every 5 seconds for instant real-time updates as calls finish
  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard?tenant_id=${effectiveTenantId}&email=${encodeURIComponent(effectiveEmail)}`,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  const calls: CallLogItem[] = data?.calls || [];
  const appointments: AppointmentItem[] = data?.appointments || [];
  const wallet: WalletItem = data?.wallet || {
    id: "wallet-default",
    balance_inr: 2500.0,
    rate_per_min_inr: 7.0,
    total_calls_handled: calls.length,
    total_minutes_consumed: 0,
    updated_at: new Date().toISOString(),
  };

  const tenant = data?.tenant || {
    id: effectiveTenantId,
    name: "DynamicDetailing Studio",
    category: "Auto Detailing & Ceramic Studio",
    ratePerMinInr: 7.0,
  };

  // Derived KPI metrics
  const totalCalls = calls.length;
  const confirmedAppointments = appointments.filter(
    (a) => a.status?.toLowerCase() === "confirmed" || a.status?.toLowerCase() === "scheduled"
  ).length;
  const uniqueCustomers = new Set(calls.map((c) => c.phone_number)).size;
  const positiveSentimentCount = calls.filter(
    (c) => c.sentiment?.toLowerCase() === "positive"
  ).length;
  const pendingCount = calls.filter(
    (c) => !c.sentiment || c.sentiment.toLowerCase() === "pending" || c.sentiment.toLowerCase() === "neutral"
  ).length;

  const updateWalletBalance = useCallback(
    async (newBalanceInr: number) => {
      mutate(
        {
          ...data,
          wallet: {
            ...wallet,
            balance_inr: newBalanceInr,
          },
        },
        false
      );
    },
    [data, mutate, wallet]
  );

  return {
    calls,
    appointments,
    wallet,
    tenant,
    loading: isLoading,
    error: error ? error.message : null,
    isLive: !error && !isLoading,
    kpis: {
      totalCalls,
      confirmedAppointments,
      uniqueCustomers,
      positiveSentimentCount,
      pendingCount,
    },
    refetch: () => mutate(),
    updateWalletBalance,
  };
}
