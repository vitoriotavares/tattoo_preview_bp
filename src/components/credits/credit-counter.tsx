"use client";

import { useCredits } from "@/hooks/use-credits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Plus } from "lucide-react";
import Link from "next/link";

export function CreditCounter() {
  const { credits, availableCredits, isLoading, hasCredits } = useCredits();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-muted animate-pulse" />
        <div className="w-8 h-4 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <Coins className="h-4 w-4 text-primary" />
        <Badge 
          variant={hasCredits ? "default" : "destructive"}
          className="font-mono text-xs"
        >
          {availableCredits}
        </Badge>
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {availableCredits === 1 ? "crédito" : "créditos"}
        </span>
      </div>

      {!hasCredits && (
        <Button size="sm" asChild className="h-7 px-2">
          <Link href="/credits">
            <Plus className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Comprar</span>
          </Link>
        </Button>
      )}
    </div>
  );
}