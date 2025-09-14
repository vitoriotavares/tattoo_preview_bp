"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, Zap, ArrowRight } from "lucide-react";
import { Compare } from "@/components/ui/compare";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { SeoFaq } from "@/components/seo-faq";

export default function LandingPage() {


  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-16 text-center overflow-hidden">
        <BackgroundBeams className="absolute inset-0 z-0" />
        <div className="relative max-w-4xl mx-auto space-y-8 z-10">
          <div className="space-y-4">
            <button className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block mb-4">
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
              <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                <Zap className="h-3 w-3" />
                <span>Tecnologia Google Gemini 2.5 Flash</span>
              </div>
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
            </button>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
              Teste Sua Tatuagem em Poucos Segundos
            </h1>

            <h2 className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              3 testes grátis • Resultado fotorrealista • Sem cadastro
            </h2>
          </div>

          {/* CTA Button */}
          <div className="flex items-center justify-center pt-6">
            <Button asChild size="lg" className="min-w-[240px] text-base">
              <Link href="/tattoo">
                Testar Agora (3 Grátis)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            ✨ Teste gratuito • Sem cartão necessário
          </p>
        </div>
      </section>

      {/* Interactive Example - Maximum Prominence */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Exemplo Interativo
            </h3>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Veja o resultado incrível em tempo real
            </p>
          </div>

          <div className="flex justify-center max-w-5xl mx-auto">
            <Card className="overflow-hidden w-full shadow-2xl">
              <div className="relative">
                <Badge className="absolute top-4 left-4 text-sm z-50 bg-primary text-primary-foreground px-3 py-1">
                  ✨ Passe o mouse aqui
                </Badge>
                <Compare
                  firstImage="/images/com_tatu_retocada.png"
                  secondImage="/images/sem_tatu_fundo_branco.png"
                  className="w-full h-96 md:h-[500px] rounded-none"
                  firstImageClassName="object-cover"
                  secondImageClassname="object-cover"
                  slideMode="hover"
                  showHandlebar={true}
                />
              </div>
              <CardContent className="p-8">
                <div className="space-y-6 text-center">
                  <div className="space-y-3">
                    <h4 className="text-2xl font-bold">Resultado que impressiona</h4>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Nossa IA reconstrói a pele com perfeição. É impossível identificar onde estava a tatuagem original.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-8 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-destructive rounded-full"></div>
                      <span className="font-medium">Antes: Com tatuagem</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded-full"></div>
                      <span className="font-medium">Depois: Pele natural</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button asChild size="lg" className="min-w-[300px] text-lg">
                      <Link href="/tattoo">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Experimente Você Mesmo
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <p className="text-sm text-muted-foreground mt-3">
                      Teste gratuito • Resultado em poucos segundos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <SeoFaq />

      {/* Final CTA - Simplified */}
      <section className="py-16 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold">
              Pronto para Testar Sua Tatuagem?
            </h3>
            <p className="text-muted-foreground text-lg">
              3 testes gratuitos • Resultado em poucos segundos
            </p>

            <Button asChild size="lg" className="min-w-[280px] text-lg">
              <Link href="/tattoo">
                <Star className="mr-2 h-5 w-5" />
                Começar Agora (Grátis)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
