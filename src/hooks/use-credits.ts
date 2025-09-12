"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useEffect } from "react";

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
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // New secure transaction mutations
  const reserveCreditMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/credits/reserve", {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reserve credit");
      }
      return response.json();
    },
    onSuccess: () => {
      // Don't invalidate here - credit isn't actually consumed yet
    },
  });

  const confirmCreditMutation = useMutation({
    mutationFn: async (reservationId: string) => {
      const response = await fetch("/api/credits/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reservationId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to confirm credit consumption");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-credits"] });
    },
  });

  const rollbackCreditMutation = useMutation({
    mutationFn: async (reservationId: string) => {
      const response = await fetch("/api/credits/rollback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reservationId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to rollback credit reservation");
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

  const hookReturn = {
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
    
    // New secure transaction methods
    reserveCredit: reserveCreditMutation.mutateAsync,
    isReservingCredit: reserveCreditMutation.isPending,
    
    confirmCredit: confirmCreditMutation.mutateAsync,
    isConfirmingCredit: confirmCreditMutation.isPending,
    
    rollbackCredit: rollbackCreditMutation.mutateAsync,
    isRollingBackCredit: rollbackCreditMutation.isPending,
    
    createCheckoutSession: createCheckoutMutation.mutateAsync,
    isCreatingCheckout: createCheckoutMutation.isPending,
    
    // Utilities
    formatPrice: (priceInCents: string) => {
      const price = parseFloat(priceInCents) / 100;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(price);
    },
    
    refreshCredits: () => {
      queryClient.invalidateQueries({ queryKey: ["user-credits"] });
    },

    // Real-time polling methods
    startPolling: useCallback((intervalMs: number = 2000) => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      pollingIntervalRef.current = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["user-credits"] });
      }, intervalMs);
    }, [queryClient]),

    stopPolling: useCallback(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }, []),

    // Enhanced transaction workflow
    processWithSecureCredits: useCallback(async (processCallback: () => Promise<unknown>) => {
      try {
        // Step 1: Reserve credit
        const reservation = await reserveCreditMutation.mutateAsync();
        
        try {
          // Step 2: Execute the process
          const result = await processCallback();
          
          // Step 3: Confirm credit consumption on success
          await confirmCreditMutation.mutateAsync(reservation.reservationId);
          
          return result;
        } catch (processError) {
          // Step 3b: Rollback credit on failure
          await rollbackCreditMutation.mutateAsync(reservation.reservationId);
          throw processError;
        }
      } catch (reservationError) {
        throw reservationError;
      }
    }, [reserveCreditMutation, confirmCreditMutation, rollbackCreditMutation]),
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return hookReturn;
}