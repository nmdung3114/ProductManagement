"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthResponse } from "@/types";
import { apiFetch } from "@/lib/api";
import { hasPermission, hasRole, hasAnyRole, isStaffRole, Role } from "@/lib/permissions";
import { GoogleOAuthProvider } from "@react-oauth/google";


interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Danh sách roles của user hiện tại. */
  userRoles: string[];
  /** Kiểm tra user có role cụ thể không. */
  hasRole: (role: Role) => boolean;
  /** Kiểm tra user có permission cụ thể không. */
  hasPermission: (permission: string) => boolean;
  /** Kiểm tra user có ít nhất một trong các role cho trước không. */
  hasAnyRole: (...roles: Role[]) => boolean;
  /** Kiểm tra user có phải Staff role không (Admin/InventoryManager/SalesStaff/Auditor). */
  isStaff: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void> | void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);

    // Lắng nghe sự kiện token được làm mới ngầm từ apiFetch
    const handleTokenRefreshed = (e: Event) => {
      const customEvent = e as CustomEvent<{ token: string }>;
      if (customEvent.detail?.token) {
        setToken(customEvent.detail.token);
      }
    };

    window.addEventListener("token-refreshed", handleTokenRefreshed);
    return () => {
      window.removeEventListener("token-refreshed", handleTokenRefreshed);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("token", res.token);
      if (res.refreshToken) {
        localStorage.setItem("refreshToken", res.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(res.user));
    }
  };
    const loginWithGoogle = async (idToken: string) => {
    const res = await apiFetch<AuthResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });

    if (res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("token", res.token);
      if (res.refreshToken) {
        localStorage.setItem("refreshToken", res.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(res.user));
    }
  };


  const register = async (fullName: string, email: string, password: string) => {
    await apiFetch<{ message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    });
  };

  const logout = async () => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (storedRefreshToken) {
      try {
        await apiFetch("/api/auth/revoke-token", {
          method: "POST",
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });
      } catch (err) {
        console.warn("Could not revoke token on backend", err);
      }
    }

    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const userRoles = user?.roles ?? [];

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthContext.Provider
        value={{
          user,
          token,
          isAuthenticated: !!token,
          isLoading,
          userRoles,
          hasRole:       (role: Role) => hasRole(userRoles, role),
          hasPermission: (permission: string) => hasPermission(userRoles, permission),
          hasAnyRole:    (...roles: Role[]) => hasAnyRole(userRoles, ...roles),
          isStaff:       isStaffRole(userRoles),
          login,
          register,
          loginWithGoogle, // <-- Expose ra UI
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );

}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
