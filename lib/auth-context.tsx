"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  useUserQuery, 
  useLoginMutation, 
  useSignupMutation, 
  useLogoutMutation,
  type User,
  type LoginPayload,
  type SignupPayload 
} from "./auth";

type AuthContextType = {
  user: User | null;
  login: (payload: LoginPayload) => Promise<any>;
  signup: (payload: SignupPayload) => Promise<any>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user = null, isLoading } = useUserQuery();
  const { mutateAsync: loginMutation } = useLoginMutation();
  const { mutateAsync: signupMutation } = useSignupMutation();
  const { mutateAsync: logoutMutation } = useLogoutMutation();
  const router = useRouter();
  const pathname = usePathname();

  // Handle protected routes redirect
  useEffect(() => {
    const isDashboardRoute = pathname?.startsWith("/dashboard");
    const isAuthRoute = pathname === "/login" || pathname === "/signup";

    if (isDashboardRoute && !isLoading && !user) {
      router.replace("/login");
    }

    if (isAuthRoute && !isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, pathname, router]);

  const login = async (payload: LoginPayload) => {
    return loginMutation(payload);
  };

  const signup = async (payload: SignupPayload) => {
    return signupMutation(payload);
  };

  const logout = async () => {
    await logoutMutation();
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
