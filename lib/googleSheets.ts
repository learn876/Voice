import { CallLogItem, AppointmentItem, WalletItem } from "@/types/dashboard";

/**
 * Fetch all CRM dashboard data directly from a tenant's Google Sheet
 * Maps column headers dynamically to match Omnidimension's exact schema.
 */
export async function getTenantSheetData(sheetId: string) {
  if (!sheetId || sheetId.startsWith("1DynamicDetailingSheetIdPlaceholder")) {
    return getFallbackMockData();
  }

  try {
    // 1. Fetch live Google Sheet via Google Visualization JSON API
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&headers=1`;
    const res = await fetch(url, { cache: "no-store" });
    
    if (!res.ok) {
      console.warn(`Google Sheet fetch returned status ${res.status}, using mock fallback.`);
      return getFallbackMockData();
    }

    const text = await res.text();
    // Parse Google Visualization JSON wrapper
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
    if (!match || !match[1]) {
      return getFallbackMockData();
    }

    const json = JSON.parse(match[1]);
    const rawRows = json.table?.rows || [];
    const cols = json.table?.cols || [];

    if (rawRows.length === 0) {
      // Empty sheet -> return fallback mock data
      return getFallbackMockData();
    }

    // Headers are defined in table.cols in Google Visualization JSON
    const headerMap: Record<string, number> = {};
    cols.forEach((col: any, i: number) => {
      // The header label sometimes includes trailing data in gviz, but we try to match the first word or exact label.
      // Often the first word of the label is the true column name if it contains spaces (like "bot_name DynamicDetailing...").
      if (col && col.label) {
        const fullLabel = String(col.label).trim().toLowerCase();
        // Since Omnidimension appends the first row's data into the label if there are no explicit headers,
        // we'll split by space and take the first part as the real header (e.g. "customer_name Atif" -> "customer_name").
        // Or if col.id exists (like 'A', 'B'), we could use that, but label prefix is safer.
        const actualHeader = fullLabel.split(" ")[0]; 
        headerMap[actualHeader] = i;
      }
    });

    // Data rows are all rows
    const dataRows = rawRows;

    const calls: CallLogItem[] = dataRows.map((r: any, idx: number) => {
      const c = r.c || [];
      const getField = (...keys: string[]) => {
        for (const k of keys) {
          const colIdx = headerMap[k.toLowerCase()];
          if (colIdx !== undefined && c[colIdx] !== undefined && c[colIdx] !== null) {
            // Use formatted string (f) first if available (handles gviz numbers/dates), then raw value (v)
            const raw = c[colIdx]?.f ?? c[colIdx]?.v;
            if (raw === undefined || raw === null) continue;
            const val = String(raw).trim();
            if (val !== "" && val.toUpperCase() !== "NULL" && val.toUpperCase() !== "NA") {
              return val;
            }
          }
        }
        return null;
      };

      const customerName = getField("customer_name", "name", "caller_name");
      const phoneNumber = getField("phone_number", "from_number", "number") || "Web Call";
      const serviceRequested = getField("service_requested", "service");
      const bookingTime = getField("preferred_date_time", "booking_time", "date_time");
      const summary = getField("summary", "call_summary");
      const sentiment = getField("sentiment", "call_sentiment");
      const transcript = getField("full_conversation", "transcript") || "";
      const complaintDetails = getField("complaint_details");
      const durationStr = getField("call_duration_in_minutes", "duration") || "";
      const createdAt = getField("created_at", "call_date", "timestamp", "create_date") || new Date().toISOString();
      const callId = getField("call_id") || `call-${idx + 1}`;

      const isTestStr = getField("is_test");
      const isTest = (isTestStr && isTestStr.toLowerCase() === "true") || phoneNumber.startsWith("SIM-");
      
      const channel = (durationStr.toLowerCase().includes("text") || durationStr.toLowerCase().includes("chat")) ? "text" : "voice";
      
      const scenarioCategory = getField("scenario_category") || (isTest ? "Automated Test" : undefined);
      
      let handoffReason = undefined;
      if ((summary || "").includes("HANDOFF") || complaintDetails) {
        handoffReason = complaintDetails || "User requested human escalation";
      }

      const combinedText = `${summary || ""} ${serviceRequested || ""}`.toLowerCase();
      const isHighTicket = combinedText.includes("ppf") || combinedText.includes("ceramic") || combinedText.includes("full detail");

      return {
        id: callId,
        customer_id: `cust-${phoneNumber}-${idx}`,
        customer_name: customerName,
        phone_number: phoneNumber,
        service_requested: serviceRequested,
        booking_time: bookingTime,
        summary: summary,
        sentiment: sentiment,
        transcript: transcript,
        complaint_details: complaintDetails,
        created_at: createdAt,
        channel,
        is_test: isTest,
        scenario_category: scenarioCategory,
        handoff_reason: handoffReason,
        is_high_ticket: isHighTicket,
      };
    });

    const appointments: AppointmentItem[] = calls
      .filter((c) => c.booking_time && c.booking_time !== "Pending" && c.booking_time !== "NA")
      .map((c, idx) => ({
        id: `sheet-appt-${idx + 1}`,
        customer_id: c.customer_id || null,
        service_requested: c.service_requested || "PPF",
        booking_time: c.booking_time || null,
        status: "confirmed",
        created_at: c.created_at || new Date().toISOString(),
      }));

    const wallet: WalletItem = {
      id: "sheet-wallet-live",
      balance_inr: Math.max(0, 2500.0 - calls.length * 7.0),
      rate_per_min_inr: 7.0,
      total_calls_handled: calls.length,
      total_minutes_consumed: Math.round(calls.length * 1.0 * 10) / 10,
      updated_at: new Date().toISOString(),
    };

    return { calls, appointments, wallet };
  } catch (error) {
    console.error("Google Sheets fetch error:", error);
    return getFallbackMockData();
  }
}

function getFallbackMockData() {
  const calls: CallLogItem[] = [
    {
      id: "call-101",
      customer_id: "c-1",
      customer_name: "Atif",
      phone_number: "7893686581",
      summary: "The User requested to book a PPF appointment at 2 PM on September 7. The Agent confirmed the booking and collected the User's name, Atif.",
      sentiment: "Positive",
      transcript: "Bot: హలో.. DynamicDetailing Studio నుంచి Siri మాట్లాడుతున్నా. | User: నాకు 2:00 PM కి PPF కి స్లాట్ బుక్ చేయండి. | Bot: September 7, 2 PM కి ఆతిఫ్ గారి PPF appointment confirm అయ్యింది.",
      complaint_details: null,
      created_at: new Date().toISOString(),
      channel: "voice",
      is_test: false,
      scenario_category: undefined,
      handoff_reason: undefined,
      is_high_ticket: true,
    }
  ];

  const appointments: AppointmentItem[] = [
    {
      id: "appt-101",
      customer_id: "c-1",
      service_requested: "PPF",
      booking_time: "September 7, 2 PM",
      status: "confirmed",
      created_at: new Date().toISOString(),
    }
  ];

  const wallet: WalletItem = {
    id: "wallet-main",
    balance_inr: 2493.0,
    rate_per_min_inr: 7.0,
    total_calls_handled: 1,
    total_minutes_consumed: 1.0,
    updated_at: new Date().toISOString(),
  };

  return { calls, appointments, wallet };
}
