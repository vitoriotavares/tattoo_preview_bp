"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImagePlus, Eraser, Sparkles, Play, Star, Zap, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { Modal, ModalTrigger, ModalBody, ModalContent } from "@/components/ui/animated-modal";

export default function LandingPage() {
  const features = [
    {
      icon: <ImagePlus className="h-6 w-6" />,
      title: "Adicionar Tatuagem",
      description: "Aplique designs realistas em fotos do seu corpo",
      color: "bg-blue-50 border-blue-200 dark:bg-blue-950/20"
    },
    {
      icon: <Eraser className="h-6 w-6" />,
      title: "Remover Tatuagem", 
      description: "Remova tatuagens com reconstrução natural da pele",
      color: "bg-red-50 border-red-200 dark:bg-red-950/20"
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Retocar Tatuagem",
      description: "Melhore cores, nitidez e qualidade",
      color: "bg-green-50 border-green-200 dark:bg-green-950/20"
    }
  ];

  const benefits = [
    "Qualidade fotorrealista com IA avançada",
    "Processamento rápido em menos de 10 segundos", 
    "3 créditos gratuitos para experimentar",
    "Preservação natural da textura da pele",
    "Interface intuitiva e fácil de usar",
    "Resultados em alta resolução"
  ];

  const examples = [
    {
      type: "Adicionar",
      before: "Braço sem tatuagem",
      after: "Tatuagem de dragão aplicada",
      tag: "Realista"
    },
    {
      type: "Remover", 
      before: "Braço com tatuagem antiga",
      after: "Pele natural reconstruída",
      tag: "Natural"
    },
    {
      type: "Retocar",
      before: "Tatuagem desbotada",
      after: "Cores vibrantes restauradas", 
      tag: "Vibrante"
    }
  ];

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Tecnologia Google Gemini 2.5 Flash
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
              Visualize Tatuagens com IA
            </h1>
            
            <h2 className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Experimente tatuagens virtualmente com qualidade fotorrealista antes de torná-las permanentes
            </h2>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link href="/tattoo">
                Começar Grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Modal>
              <ModalTrigger className="min-w-[200px] px-6 py-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium flex items-center justify-center">
                <Play className="mr-2 h-4 w-4" />
                Ver Demonstração
              </ModalTrigger>
              <ModalBody>
                <ModalContent>
                  <h2 className="text-2xl font-bold mb-6">Demonstração TattooPreview</h2>
                  
                  <div className="space-y-6">
                    <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Play className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Video demonstrativo em breve</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <ImagePlus className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                          <h4 className="font-semibold text-sm">Adicionar</h4>
                          <p className="text-xs text-muted-foreground">Aplique tatuagens realistas</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                          <Eraser className="h-8 w-8 mx-auto mb-2 text-red-600" />
                          <h4 className="font-semibold text-sm">Remover</h4>
                          <p className="text-xs text-muted-foreground">Remova com reconstrução natural</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <Sparkles className="h-8 w-8 mx-auto mb-2 text-green-600" />
                          <h4 className="font-semibold text-sm">Retocar</h4>
                          <p className="text-xs text-muted-foreground">Melhore cores e qualidade</p>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button asChild className="w-full">
                          <Link href="/tattoo">
                            Experimentar Agora Grátis
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </ModalContent>
              </ModalBody>
            </Modal>
          </div>

          <p className="text-sm text-muted-foreground">
            ✨ 3 créditos gratuitos • Sem cartão de crédito necessário
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Como Funciona</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nossa IA avançada cria resultados fotorrealistas em segundos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className={`transition-all duration-200 hover:scale-105 ${feature.color}`}>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-background/80 w-fit">
                    {feature.icon}
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Gallery */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Galeria de Exemplos</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Veja a qualidade fotorrealista dos nossos resultados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {examples.map((example, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
                  <Badge className="absolute top-3 left-3 text-xs">
                    {example.tag}
                  </Badge>
                  <div className="text-center">
                    <p className="text-sm font-medium">{example.type}</p>
                    <p className="text-xs text-muted-foreground mt-1">Exemplo</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-destructive rounded-full"></div>
                      <span className="text-muted-foreground">Antes: {example.before}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-muted-foreground">Depois: {example.after}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Por que Escolher TattooPreview?</h3>
              <p className="text-muted-foreground">
                A tecnologia mais avançada para visualização de tatuagens
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-3xl font-bold">
              Pronto para Ver Sua Tatuagem?
            </h3>
            <p className="text-muted-foreground">
              Comece gratuitamente com 3 créditos. Não é necessário cartão de crédito.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="min-w-[200px]">
                <Link href="/tattoo">
                  <Star className="mr-2 h-4 w-4" />
                  Experimentar Grátis
                </Link>
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Seguro e privado
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
