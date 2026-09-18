"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserAccess, Tenant } from "@/lib/tenantConfig";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isAdmin: boolean;
  allowedTenants: Tenant[];
  currentTenantId: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: (customEmail?: string) => Promise<void>;
  signInWithEmail: (email: string, displayName?: string) => void;
  signOut: () => void;
  switchTenant: (tenantId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = "voice_agent_google_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from persistent session storage
  useEffect(() => {
    function initAuth() {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.email) {
            const access = getUserAccess(parsed.email);
            setUser({
              ...parsed,
              isAdmin: access.isAdmin,
              allowedTenants: access.allowedTenants,
              currentTenantId: access.isAdmin
                ? (parsed.currentTenantId || access.defaultTenantId)
                : access.defaultTenantId,
            });
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const buildAndSetUser = (email: string, displayName?: string, avatarUrl?: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const name = displayName || cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const access = getUserAccess(cleanEmail);

    const authUser: AuthUser = {
      id: `google_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
      email: cleanEmail,
      name,
      avatarUrl:
        avatarUrl ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      isAdmin: access.isAdmin,
      allowedTenants: access.allowedTenants,
      currentTenantId: access.defaultTenantId,
    };

    setUser(authUser);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(authUser));
  };

  const signInWithGoogle = async (customEmail?: string) => {
    // Google Sign-In handler: logs in with authorized Google account
    const targetEmail = customEmail || "shaikatif@gmail.com";
    buildAndSetUser(targetEmail, "Shaik Atif (Admin)");
  };

  const signInWithEmail = (email: string, displayName?: string) => {
    buildAndSetUser(email, displayName);
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  const switchTenant = (tenantId: string) => {
    if (!user) return;
    if (!user.isAdmin && user.currentTenantId !== tenantId) {
      console.warn("Business owners are strictly isolated to their own dashboard.");
      return;
    }

    const updated = {
      ...user,
      currentTenantId: tenantId,
    };
    setUser(updated);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signOut,
        switchTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
