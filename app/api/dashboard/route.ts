import { NextRequest, NextResponse } from "next/server";
import { getTenantForUser, getUserAccess } from "@/lib/tenantConfig";
import { getTenantSheetData } from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get("email");
    const tenantIdParam = searchParams.get("tenant_id");

    // 1. Mandatory Identity Check: Email must be present
    if (!emailParam) {
      return NextResponse.json(
        { success: false, error: "Authentication required: No user email provided." },
        { status: 401 }
      );
    }

    // 2. Strict Server-Side Authorization & Anti-Tampering Check
    const { tenant, isAllowed } = getTenantForUser(emailParam, tenantIdParam);
    const userAccess = getUserAccess(emailParam);

    if (!isAllowed || !tenant || !userAccess.isAuthorized) {
      console.warn(`[SECURITY WARNING] Blocked unauthorized access attempt by: ${emailParam} for tenant: ${tenantIdParam}`);
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You are not authorized to view this workspace. Please log in with an authorized Google account.",
        },
        { status: 403 }
      );
    }

    // 3. Fetch data securely for verified tenant
    const sheetData = await getTenantSheetData(tenant.sheetId);

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        category: tenant.category,
        agentId: tenant.agentId,
        ratePerMinInr: tenant.ratePerMinInr,
        colorScheme: tenant.colorScheme,
        logoInitial: tenant.logoInitial,
      },
      userAccess: {
        isAdmin: userAccess.isAdmin,
        allowedTenantIds: userAccess.allowedTenants.map((t) => t.id),
      },
      ...sheetData,
    });
  } catch (error: any) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
