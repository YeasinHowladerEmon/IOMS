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
      showAlert({
        title: "Login Failed",
        message: error.message || "Invalid email or password. Please try again.",
        type: "danger",
        confirmText: "Try Again"
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
      showAlert({
        title: "Registration Failed",
        message: error.message || "Could not create your account. Please try again.",
        type: "danger",
        confirmText: "Back to Sign Up"
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
