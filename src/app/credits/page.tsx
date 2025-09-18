"use client";

import { PackageCards } from "@/components/credits/package-cards";
import { useCredits } from "@/hooks/use-credits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Coins, Zap, Shield, Clock } from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function CreditsPage() {
  const { credits, availableCredits, isLoading, hasUsedFreeCredits } = useCredits();

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tattoo">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Créditos TattooPreview</h1>
          <p className="text-muted-foreground">
            Escolha o pacote ideal para suas necessidades
          </p>
        </div>
      </div>

      {/* Current Credits Display */}
      {!isLoading && credits && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Seus Créditos Atuais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={availableCredits > 0 ? "default" : "secondary"} className="text-lg px-3 py-1">
                    {availableCredits} disponíveis
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    de {credits.totalCredits} total
                  </span>
                </div>
                {hasUsedFreeCredits && (
                  <p className="text-xs text-muted-foreground">
                    ✅ Você já utilizou {credits.freeCreditsUsed} créditos gratuitos
                  </p>
                )}
              </div>
              
              {availableCredits > 0 && (
                <Button asChild>
                  <Link href="/tattoo">
                    Usar Créditos
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Escolha seu Pacote de Créditos
        </h2>
        <PackageCards />
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm">Processamento Rápido</h3>
            <p className="text-xs text-muted-foreground">Resultados em poucos segundos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm">Qualidade Garantida</h3>
            <p className="text-xs text-muted-foreground">IA de última geração</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm">Sem Expiração</h3>
            <p className="text-xs text-muted-foreground">Use quando quiser</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Coins className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm">Melhor Custo</h3>
            <p className="text-xs text-muted-foreground">Pacotes econômicos</p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">O que são créditos?</h4>
            <p className="text-sm text-muted-foreground">
              Cada crédito permite processar uma imagem (adicionar, remover ou retocar tatuagem).
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Os créditos expiram?</h4>
            <p className="text-sm text-muted-foreground">
              Não! Seus créditos nunca expiram. Use quando quiser.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Posso cancelar minha compra?</h4>
            <p className="text-sm text-muted-foreground">
              Os créditos são processados instantaneamente. Entre em contato para casos especiais.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Qual a qualidade dos resultados?</h4>
            <p className="text-sm text-muted-foreground">
              Utilizamos IA de ultima geração para resultados fotorrealistas.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </AuthGuard>
  );
}