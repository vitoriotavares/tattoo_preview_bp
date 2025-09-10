"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft, Zap } from "lucide-react";
import { useCredits } from "@/hooks/use-credits";
import { AuthGuard } from "@/components/auth/auth-guard";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshCredits, credits, isLoading } = useCredits();
  const [isRefreshing, setIsRefreshing] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refresh credits when the page loads
    const refreshData = async () => {
      if (sessionId) {
        // Wait longer to ensure webhook has processed and try multiple times
        let attempts = 0;
        const maxAttempts = 5;
        
        const tryRefresh = async () => {
          attempts++;
          console.log(`Refreshing credits - attempt ${attempts}/${maxAttempts}`);
          
          refreshCredits();
          
          // If we've tried less than max attempts, wait and try again
          if (attempts < maxAttempts) {
            setTimeout(tryRefresh, 2000); // Wait 2 seconds between attempts
          } else {
            setIsRefreshing(false);
          }
        };
        
        // Start first attempt after 3 seconds
        setTimeout(tryRefresh, 3000);
      } else {
        setIsRefreshing(false);
      }
    };

    refreshData();
  }, [sessionId, refreshCredits]);

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
            <div className="mx-auto mb-4 p-3 rounded-full bg-green-100 dark:bg-green-900/20 w-fit">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
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
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-800 dark:text-green-200">
                      {credits.availableCredits} créditos disponíveis
                    </span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
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