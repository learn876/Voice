export interface Tenant {
  id: string;
  name: string;
  category: string;
  agentId: number;
  sheetId: string;
  authorizedEmails: string[];
  ratePerMinInr: number;
  logoInitial: string;
  colorScheme: string;
  accentColor: string;
}

// Support reading whitelist from private server environment variables
const parseEnvList = (envVar?: string, defaults: string[] = []): string[] => {
  if (!envVar) return defaults;
  return envVar.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
};

export const ADMIN_EMAILS = parseEnvList(process.env.AUTHORIZED_ADMIN_EMAILS, [
  "shaikatif@gmail.com",
  "admin@voiceagent.com",
  "atif@example.com",
]);

export const TENANTS: Record<string, Tenant> = {
  "dynamic-detailing": {
    id: "dynamic-detailing",
    name: "DynamicDetailing Studio",
    category: "Auto Detailing & Ceramic Studio",
    agentId: 249198,
    sheetId: process.env.GOOGLE_SHEET_ID_DETAILING || "1AqiavwsMmv_GCW0Cvr57lieFMOgOhoNLi77tiXPGDso",
    authorizedEmails: parseEnvList(process.env.AUTHORIZED_DETAILING_EMAILS, [
      "owner@dynamicdetailing.com",
      "detailing@gmail.com",
      "siddharth@gmail.com",
    ]),
    ratePerMinInr: 7.0,
    logoInitial: "DD",
    colorScheme: "indigo",
    accentColor: "bg-indigo-600",
  },
  "vave-salon": {
    id: "vave-salon",
    name: "Vave Salon Luxe",
    category: "Luxury Hair & Beauty Salon",
    agentId: 249200,
    sheetId: process.env.GOOGLE_SHEET_ID_SALON || "1AqiavwsMmv_GCW0Cvr57lieFMOgOhoNLi77tiXPGDso",
    authorizedEmails: parseEnvList(process.env.AUTHORIZED_SALON_EMAILS, [
      "salonowner@gmail.com",
      "vavesalon@gmail.com",
      "booking@vavesalon.com",
    ]),
    ratePerMinInr: 7.0,
    logoInitial: "VS",
    colorScheme: "rose",
    accentColor: "bg-rose-600",
  },
  "steel-arm-fitness": {
    id: "steel-arm-fitness",
    name: "SteelArm Fitness Gym",
    category: "Premium Gym & CrossFit Hub",
    agentId: 249205,
    sheetId: process.env.GOOGLE_SHEET_ID_GYM || "1AqiavwsMmv_GCW0Cvr57lieFMOgOhoNLi77tiXPGDso",
    authorizedEmails: parseEnvList(process.env.AUTHORIZED_GYM_EMAILS, [
      "gymowner@gmail.com",
      "steelarm@gmail.com",
      "manager@steelarmfitness.com",
    ]),
    ratePerMinInr: 7.0,
    logoInitial: "SA",
    colorScheme: "amber",
    accentColor: "bg-amber-600",
  },
};

export interface UserAccessInfo {
  email: string;
  isAuthorized: boolean;
  isAdmin: boolean;
  allowedTenants: Tenant[];
  defaultTenantId: string;
}

/**
 * Strict Server-Side Identity & Tenant Resolution
 */
export function getUserAccess(email: string | null | undefined): UserAccessInfo {
  if (!email) {
    return {
      email: "",
      isAuthorized: false,
      isAdmin: false,
      allowedTenants: [],
      defaultTenantId: "",
    };
  }

  const cleanEmail = email.toLowerCase().trim();

  // 1. Is Super Admin (Shaik Atif) - Can switch and view all 3 client businesses
  if (ADMIN_EMAILS.some((adm) => adm.toLowerCase() === cleanEmail)) {
    return {
      email: cleanEmail,
      isAuthorized: true,
      isAdmin: true,
      allowedTenants: Object.values(TENANTS),
      defaultTenantId: "dynamic-detailing",
    };
  }

  // 2. Is specific Business Owner
  for (const tenant of Object.values(TENANTS)) {
    if (tenant.authorizedEmails.some((e) => e.toLowerCase() === cleanEmail)) {
      return {
        email: cleanEmail,
        isAuthorized: true,
        isAdmin: false,
        allowedTenants: [tenant],
        defaultTenantId: tenant.id,
      };
    }
  }

  // 3. Unauthorized stranger / unmapped email
  return {
    email: cleanEmail,
    isAuthorized: false,
    isAdmin: false,
    allowedTenants: [],
    defaultTenantId: "",
  };
}

/**
 * Strict resolution with cross-tenant tampering protection
 */
export function getTenantForUser(
  email: string | null | undefined,
  requestedTenantId?: string | null
): { tenant: Tenant | null; isAllowed: boolean } {
  const access = getUserAccess(email);

  if (!access.isAuthorized) {
    return { tenant: null, isAllowed: false };
  }

  if (access.isAdmin) {
    const target = requestedTenantId ? TENANTS[requestedTenantId] : null;
    return {
      tenant: target || TENANTS[access.defaultTenantId],
      isAllowed: true,
    };
  }

  // Non-admins CANNOT request another tenant
  if (requestedTenantId && requestedTenantId !== access.defaultTenantId) {
    return { tenant: null, isAllowed: false };
  }

  return {
    tenant: access.allowedTenants[0] || null,
    isAllowed: true,
  };
}
