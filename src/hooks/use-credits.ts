"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface UserCreditsInfo {
  id: string;
  userId: string;
  totalCredits: number;
  usedCredits: number;
  freeCreditsUsed: number;
  availableCredits: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: string;
  stripePriceId?: string;
  active: boolean;
}

export function useCredits() {
  const queryClient = useQueryClient();

  const {
    data: credits,
    isLoading: isLoadingCredits,
    error: creditsError,
  } = useQuery<UserCreditsInfo>({
    queryKey: ["user-credits"],
    queryFn: async () => {
      const response = await fetch("/api/credits");
      if (!response.ok) {
        throw new Error("Failed to fetch credits");
      }
      return response.json();
    },
  });

  const {
    data: packages,
    isLoading: isLoadingPackages,
  } = useQuery<CreditPackage[]>({
    queryKey: ["credit-packages"],
    queryFn: async () => {
      const response = await fetch("/api/credits/packages");
      if (!response.ok) {
        throw new Error("Failed to fetch packages");
      }
      return response.json();
    },
  });

  const consumeCreditMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/credits/consume", {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to consume credit");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-credits"] });
    },
  });

  const createCheckoutMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packageId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create checkout session");
      }
      return response.json();
    },
  });

  return {
    // Data
    credits,
    packages,
    
    // Loading states
    isLoadingCredits,
    isLoadingPackages,
    isLoading: isLoadingCredits || isLoadingPackages,
    
    // Errors
    creditsError,
    
    // Computed values
    hasCredits: credits ? credits.availableCredits > 0 : false,
    availableCredits: credits?.availableCredits || 0,
    hasUsedFreeCredits: credits ? credits.freeCreditsUsed > 0 : false,
    
    // Mutations
    consumeCredit: consumeCreditMutation.mutateAsync,
    isConsumingCredit: consumeCreditMutation.isPending,
    
    createCheckoutSession: createCheckoutMutation.mutateAsync,
    isCreatingCheckout: createCheckoutMutation.isPending,
    
    // Utilities
    formatPrice: (priceInCents: string) => {
      const price = parseFloat(priceInCents) / 100;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'USD',
      }).format(price);
    },
    
    refreshCredits: () => {
      queryClient.invalidateQueries({ queryKey: ["user-credits"] });
    },
  };
}