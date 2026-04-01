/* ─────────────────────────────────────────
   lib/auth.ts
───────────────────────────────────────── */
"use client";

import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { api } from "./api";
import { useOverlay } from "./overlay-context";

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface SignupPayload {
  email: string;
  name: string;
  password?: string;
}

export const authApi = {
  getMe: () => api.get<User>("/auth/me"),
  login: (payload: LoginPayload) => api.post<{ user: User; token: string }>("/auth/login", payload),
  signup: (payload: SignupPayload) => api.post<{ user: User; token: string }>("/auth/register", payload),
  logout: () => api.post<void>("/auth/logout", {}),
};



export const authUserOptions = queryOptions({
  queryKey: ["auth-user"],
  queryFn: authApi.getMe,
  retry: false,
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false, // Don't re-check on focus
  refetchOnReconnect: false,   // Don't re-check on reconnect
});

export function useUserQuery() {
  return useQuery({
    ...authUserOptions,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const { showToast, showAlert } = useOverlay();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(["auth-user"], data.user);
      const userName = data.user?.name || 'User';
      showToast(`Welcome back, ${userName}!`, "success");
    },
    onError: (error: any) => {
      const isNotFound = error.message?.toLowerCase().includes("not found") || error.message?.toLowerCase().includes("not exist");
      showAlert({
        title: isNotFound ? "Account Not Found" : "Login Failed",
        message: isNotFound 
          ? "We couldn't find an account with that email address. Please check your spelling or sign up."
          : (error.message || "Invalid credentials. Please try again or reset your password."),
        type: "danger",
        confirmText: isNotFound ? "Sign Up Instead" : "Try Again"
      });
    }
  });
}

export function useSignupMutation() {
  const queryClient = useQueryClient();
  const { showToast, showAlert } = useOverlay();
  return useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      queryClient.setQueryData(["auth-user"], data.user);
      const userName = data.user?.name || 'User';
      showToast(`Account created successfully. Welcome, ${userName}!`, "success");
    },
    onError: (error: any) => {
      const isDuplicate = error.message?.toLowerCase().includes("already exists") || error.message?.toLowerCase().includes("registered");
      showAlert({
        title: isDuplicate ? "Email Already Registered" : "Registration Error",
        message: isDuplicate 
          ? "An account with this email already exists. Would you like to log in instead?"
          : (error.message || "We encountered an issue creating your account. Please try again."),
        type: "danger",
        confirmText: isDuplicate ? "Go to Login" : "Try Again"
      });
    }
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const { showToast } = useOverlay();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(["auth-user"], null);
      queryClient.clear();
      showToast("Signed out successfully", "info");
    },
  });
}
