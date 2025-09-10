"use client";

import { useSession as useBetterAuthSession } from "@/lib/auth-client";

export function useSession() {
  const { data: session, isPending: isLoading, error } = useBetterAuthSession();

  return {
    session,
    isLoading,
    error,
    isAuthenticated: !!session?.user,
  };
}