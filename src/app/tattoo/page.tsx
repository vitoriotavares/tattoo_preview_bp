"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImagePlus, Eraser, Sparkles, Upload, ArrowRight } from "lucide-react";
import { useCredits } from "@/hooks/use-credits";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/hooks/use-session";
import { signIn } from "@/lib/auth-client";
import { Compare } from "@/components/ui/compare";

type TattooMode = 'add' | 'remove' | 'enhance';

const modes = [
  {
    id: 'add' as TattooMode,
    title: 'Adicionar Tatuagem',
    description: 'Aplique designs de tatuagem em fotos do corpo com realismo fotográfico',
    icon: <ImagePlus className="h-6 w-6" />,
    color: 'bg-accent/50 border-accent',
    features: [
      'Qualidade fotorrealista',
      'Ajuste automático de perspectiva',
      'Preservação da textura da pele',
      'Controles de posição e tamanho'
    ]
  },
  {
    id: 'remove' as TattooMode,
    title: 'Remover Tatuagem',
    description: 'Remova digitalmente tatuagens existentes reconstruindo a pele natural',
    icon: <Eraser className="h-6 w-6" />,
    color: 'bg-secondary/50 border-secondary',
    features: [
      'Reconstrução realista da pele',
      'Preservação de marcas naturais',
      'Iluminação consistente',
      'Resultado natural'
    ]
  },
  {
    id: 'enhance' as TattooMode,
    title: 'Retocar Tatuagem',
    description: 'Melhore a qualidade, cores e nitidez de tatuagens existentes',
    icon: <Sparkles className="h-6 w-6" />,
    color: 'bg-muted/50 border-muted-foreground/20',
    features: [
      'Aumento da saturação',
      'Definição de contornos',
      'Restauração de cores',
      'Qualidade profissional'
    ]
  }
];

export default function TattooPage() {
  const [selectedMode, setSelectedMode] = useState<TattooMode>('add');
  const { isAuthenticated } = useSession();
  const { hasCredits, availableCredits, isLoading: creditsLoading, refreshCredits } = useCredits();
  const router = useRouter();

  const handleStartEditing = async (mode: TattooMode) => {
    // First check if user is authenticated
    if (!isAuthenticated) {
      await signIn.social({ 
        provider: "google",
        callbackURL: "/tattoo"
      });
      return;
    }
    
    // Then check credits
    if (!hasCredits && !creditsLoading) {
      router.push('/credits');
      return;
    }
    
    // Finally, proceed to editor
    router.push(`/tattoo/editor?mode=${mode}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
          TattooPreview Studio
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Visualize tatuagens com qualidade fotorrealista usando IA avançada
        </p>
        
        {/* Credits Display - only show if authenticated */}
        {isAuthenticated && (
          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge 
              variant={hasCredits ? "default" : "destructive"} 
              className="text-sm px-3 py-1 transition-all duration-200"
            >
              {creditsLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-current border-r-transparent rounded-full animate-spin"></div>
                  Carregando...
                </div>
              ) : (
                `${availableCredits} créditos disponíveis`
              )}
            </Badge>
            
            {!hasCredits && !creditsLoading && (
              <Button asChild size="sm">
                <Link href="/credits">
                  Comprar Créditos
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Mode Selection */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Escolha seu modo de edição</h2>
        
        <Tabs value={selectedMode} onValueChange={(value) => setSelectedMode(value as TattooMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {modes.map((mode) => (
              <TabsTrigger 
                key={mode.id} 
                value={mode.id}
                className="flex items-center gap-2"
              >
                {mode.icon}
                <span className="hidden sm:inline">{mode.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {modes.map((mode) => (
            <TabsContent key={mode.id} value={mode.id} className="mt-0">
              <Card className={`transition-all duration-200 ${mode.color}`}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-background/80 w-fit">
                    {mode.icon}
                  </div>
                  <CardTitle className="text-2xl">{mode.title}</CardTitle>
                  <CardDescription className="text-base">
                    {mode.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mode.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Requirements */}
                  <div className="bg-background/60 rounded-lg p-4 border">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Requisitos de Imagem
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {mode.id === 'add' && (
                        <>
                          <p>• Foto do corpo (onde aplicar a tatuagem)</p>
                          <p>• Imagem da tatuagem de referência</p>
                          <p>• Formatos: JPG, PNG (até 10MB cada)</p>
                        </>
                      )}
                      {(mode.id === 'remove' || mode.id === 'enhance') && (
                        <>
                          <p>• Foto com a tatuagem existente</p>
                          <p>• Formatos: JPG, PNG (até 10MB)</p>
                          <p>• Boa iluminação e resolução</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center pt-4">
                    <Button 
                      size="lg" 
                      onClick={() => handleStartEditing(mode.id)}
                      disabled={creditsLoading}
                      className="min-w-[200px]"
                    >
                      {creditsLoading ? (
                        "Carregando..."
                      ) : !isAuthenticated ? (
                        "Fazer Login e Começar"
                      ) : !hasCredits ? (
                        "Comprar Créditos"
                      ) : (
                        <>
                          Começar Edição
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Quick Examples */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4">Exemplos de Resultados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Exemplo Adicionar Tatuagem */}
          <div className="relative group">
            <Card className="overflow-hidden">
              <div className="relative">
                <Badge className="absolute top-2 left-2 text-xs z-10">
                  Adicionar Tatuagem
                </Badge>
                <Compare
                  firstImage="/images/mulher1_clear.png"
                  secondImage="/images/mulher1_pb.png"
                  className="w-full h-48 rounded-none"
                  firstImageClassName="object-cover"
                  secondImageClassname="object-cover"
                  slideMode="hover"
                  showHandlebar={true}
                  autoplay={true}
                />
              </div>
            </Card>
          </div>

          {/* Exemplo Remover Tatuagem */}
          <div className="relative group">
            <Card className="overflow-hidden">
              <div className="relative">
                <Badge className="absolute top-2 left-2 text-xs z-10">
                  Remover Tatuagem
                </Badge>
                <Compare
                  firstImage="/images/mulher2_pb.png"
                  secondImage="/images/mulher2_clear.png"
                  className="w-full h-48 rounded-none"
                  firstImageClassName="object-cover"
                  secondImageClassname="object-cover"
                  slideMode="hover"
                  showHandlebar={true}
                  autoplay={true}
                />
              </div>
            </Card>
          </div>

          {/* Exemplo Retocar Tatuagem */}
          <div className="relative group">
            <Card className="overflow-hidden">
              <div className="relative">
                <Badge className="absolute top-2 left-2 text-xs z-10">
                  Retocar Tatuagem
                </Badge>
                <Compare
                  firstImage="/images/mulher1_pb.png"
                  secondImage="/images/mulher1_color.png"
                  className="w-full h-48 rounded-none"
                  firstImageClassName="object-cover"
                  secondImageClassname="object-cover"
                  slideMode="hover"
                  showHandlebar={true}
                  autoplay={true}
                />
              </div>
            </Card>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Resultados com qualidade fotorrealista em poucos segundos
        </p>
      </div>
    </div>
  );
}