// Dashboard-level types used across UI, hooks, and lib.
// Previously lived in hooks/useRealtimeDashboard.ts + types/supabase.ts,
// both removed on 2026-09-19 (Supabase stack dropped).

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

export type AppointmentItem = {
  id: string;
  customer_id: string | null;
  service_requested: string | null;
  booking_time: string | null;
  status: string | null;
  created_at: string | null;
};

export type WalletItem = {
  id: string;
  balance_inr: number;
  rate_per_min_inr: number;
  total_calls_handled: number;
  total_minutes_consumed: number;
  updated_at: string | null;
};
