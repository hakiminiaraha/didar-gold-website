import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthContext } from "./AuthContext";
import {
  isValidIranianMobile,
  normalizeMobile,
  toEnglishDigits,
} from "../utils/authValidation";

const API_ROOT = import.meta.env.VITE_AUTH_API_URL || "/api/auth";
const DEMO_AUTH = import.meta.env.DEV && import.meta.env.VITE_AUTH_DEMO === "true";
const DEMO_SESSION_KEY = "didar-demo-auth-session";

async function readError(response) {
  try {
    const body = await response.json();
    return body.message || body.error || "Authentication request failed";
  } catch {
    return "Authentication request failed";
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (DEMO_AUTH) {
      try {
        const session = JSON.parse(window.sessionStorage.getItem(DEMO_SESSION_KEY) || "null");
        setUser(session);
        return session;
      } catch {
        window.sessionStorage.removeItem(DEMO_SESSION_KEY);
        setUser(null);
        return null;
      }
    }

    try {
      const response = await fetch(`${API_ROOT}/me`, { credentials: "include" });
      const currentUser = response.ok ? await response.json() : null;
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      await refreshUser();
      if (active) setLoading(false);
    };
    restoreSession();
    return () => { active = false; };
  }, [refreshUser]);

  const requestOtp = async ({ mobile }) => {
    const normalizedMobile = normalizeMobile(mobile);
    if (!isValidIranianMobile(normalizedMobile)) throw new Error("INVALID_MOBILE");

    if (DEMO_AUTH) {
      return { challengeId: `demo-${Date.now()}`, mobile: normalizedMobile, demo: true };
    }

    const response = await fetch(`${API_ROOT}/request-otp`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: normalizedMobile }),
    });
    if (!response.ok) throw new Error(await readError(response));
    return response.json();
  };

  const verifyOtp = async ({ mobile, challengeId, code }) => {
    const normalizedCode = toEnglishDigits(code).replace(/\D/g, "");
    if (!/^\d{6}$/.test(normalizedCode)) throw new Error("INVALID_OTP");

    if (DEMO_AUTH) {
      if (normalizedCode !== "123456") throw new Error("INVALID_OTP");
      const demoUser = {
        id: `demo-${mobile.slice(-4)}`,
        mobileMasked: `${mobile.slice(0, 4)}***${mobile.slice(-4)}`,
        demo: true,
      };
      window.sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
      return demoUser;
    }

    const response = await fetch(`${API_ROOT}/verify-otp`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, challengeId, code: normalizedCode }),
    });
    if (!response.ok) throw new Error(await readError(response));
    const authenticatedUser = await response.json();
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const logout = async () => {
    if (DEMO_AUTH) {
      window.sessionStorage.removeItem(DEMO_SESSION_KEY);
    } else {
      try {
        await fetch(`${API_ROOT}/logout`, { method: "POST", credentials: "include" });
      } catch {
        // Local state still closes when the network is unavailable.
      }
    }
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    isDemo: DEMO_AUTH,
    requestOtp,
    verifyOtp,
    logout,
    refreshUser,
  }), [loading, refreshUser, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
