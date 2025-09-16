"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft, Zap } from "lucide-react";
import { useCredits } from "@/hooks/use-credits";
import { AuthGuard } from "@/components/auth/auth-guard";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { refreshCredits, credits, isLoading } = useCredits();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const hasStartedRef = useRef(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Prevent multiple runs on component re-renders
    if (!sessionId || hasStartedRef.current) {
      if (!sessionId) setIsRefreshing(false);
      return;
    }

    hasStartedRef.current = true;

    // Refresh credits when the page loads
    const refreshData = async () => {
      console.log('Waiting for webhook processing...');

      // Initial delay to allow webhook processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      let attempts = 0;
      const maxAttempts = 8;

      const tryRefresh = async (): Promise<void> => {
        attempts++;
        console.log(`Refreshing credits - attempt ${attempts}/${maxAttempts}`);

        // Trigger refresh
        refreshCredits();

        // Wait for the query to settle
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if credits were loaded and have a positive balance
        if (credits && credits.availableCredits > 0) {
          console.log('Credits successfully loaded:', credits.availableCredits);
          setIsRefreshing(false);
          return;
        }

        // If we've tried less than max attempts, try again
        if (attempts < maxAttempts) {
          await tryRefresh();
        } else {
          console.log('Max attempts reached, stopping refresh');
          setIsRefreshing(false);
        }
      };

      await tryRefresh();
    };

    refreshData();
  }, [sessionId, refreshCredits, credits]);

  if (!sessionId) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="text-center">
            <CardContent className="p-8">
              <h1 className="text-2xl font-bold text-destructive mb-4">
                Sessão de Pagamento Inválida
              </h1>
              <p className="text-muted-foreground mb-6">
                Não foi possível confirmar seu pagamento. Verifique seu histórico de pedidos ou tente novamente.
              </p>
              <Button asChild>
                <Link href="/credits">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Créditos
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-primary">
              Pagamento Realizado com Sucesso!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-4">
                Seu pagamento foi processado com sucesso e seus créditos foram adicionados à sua conta.
              </p>
              
              {isRefreshing || isLoading ? (
                <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Atualizando seus créditos...</span>
                </div>
              ) : credits && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary">
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-primary">
                      {credits.availableCredits} créditos disponíveis
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total: {credits.totalCredits} | Usados: {credits.usedCredits}
                  </p>
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                <strong>ID da Sessão:</strong> {sessionId}
              </p>
              <p>
                Você receberá um email de confirmação em breve com os detalhes da sua compra.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button asChild size="lg">
                <Link href="/tattoo">
                  <Zap className="mr-2 h-4 w-4" />
                  Usar Créditos Agora
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/credits">
                  Ver Histórico
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <AuthGuard>
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando informações do pagamento...</p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}