"use client";

import { useSession } from "@/hooks/use-session";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import Link from "next/link";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { session, isLoading, isAuthenticated } = useSession();
  const router = useRouter();

  const handleSignIn = () => {
    signIn.social({ 
      provider: "google",
      callbackURL: "/tattoo"
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  // Show fallback or default unauthorized message
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-6">
              Você precisa estar logado para acessar esta página.
            </p>
            <Button onClick={handleSignIn} className="w-full">
              Fazer Login com Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}