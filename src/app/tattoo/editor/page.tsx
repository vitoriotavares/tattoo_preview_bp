"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Wand2, Loader2, Download, AlertCircle } from "lucide-react";
import { ImageUploader } from "@/components/tattoo/image-uploader";
import { useCredits } from "@/hooks/use-credits";
import { AuthGuard } from "@/components/auth/auth-guard";
import Link from "next/link";

type TattooMode = 'add' | 'remove' | 'enhance';

interface UploadedImage {
  file: File;
  preview: string;
}

function TattooEditorContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') as TattooMode) || 'add';
  
  const { 
    hasCredits, 
    availableCredits, 
    isLoading: creditsLoading,
    startPolling,
    stopPolling,
    refreshCredits
  } = useCredits();
  
  const [bodyImage, setBodyImage] = useState<UploadedImage | null>(null);
  const [tattooImage, setTattooImage] = useState<UploadedImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const modeConfig = {
    add: {
      title: "Adicionar Tatuagem",
      description: "Adicione uma tatuagem realista à foto do corpo",
      needsTattooImage: true,
      color: "bg-blue-50 border-blue-200 dark:bg-blue-950/20"
    },
    remove: {
      title: "Remover Tatuagem", 
      description: "Remova uma tatuagem existente da foto",
      needsTattooImage: false,
      color: "bg-red-50 border-red-200 dark:bg-red-950/20"
    },
    enhance: {
      title: "Retocar Tatuagem",
      description: "Melhore a qualidade de uma tatuagem existente",
      needsTattooImage: false,
      color: "bg-green-50 border-green-200 dark:bg-green-950/20"
    }
  };

  const config = modeConfig[mode];

  const handleBodyImageSelect = useCallback((file: File, preview: string) => {
    setBodyImage({ file, preview });
  }, []);

  const handleTattooImageSelect = useCallback((file: File, preview: string) => {
    setTattooImage({ file, preview });
  }, []);

  const handleBodyImageRemove = useCallback(() => {
    setBodyImage(null);
  }, []);

  const handleTattooImageRemove = useCallback(() => {
    setTattooImage(null);
  }, []);

  const canProcess = () => {
    if (!bodyImage) return false;
    if (config.needsTattooImage && !tattooImage) return false;
    return hasCredits && !isProcessing;
  };

  const handleProcess = async () => {
    if (!canProcess()) return;

    setIsProcessing(true);
    setProcessingError(null);
    
    // Start polling for real-time credit updates
    startPolling(1500);
    
    try {
      const formData = new FormData();
      formData.append('mode', mode);
      formData.append('bodyImage', bodyImage!.file);
      
      if (tattooImage) {
        formData.append('tattooImage', tattooImage.file);
      }

      const response = await fetch('/api/tattoo/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 413) {
          // Request Entity Too Large
          try {
            const errorData = await response.json();
            setProcessingError(
              errorData.error || 'Imagem muito grande. Tente usar uma foto menor ou com menos qualidade.'
            );
          } catch {
            setProcessingError('Imagem muito grande. Tente usar uma foto menor - as fotos são comprimidas automaticamente ao fazer upload.');
          }
        } else if (response.status === 429) {
          // Rate limit error
          try {
            const errorData = await response.json();
            const retryAfter = errorData.retryAfter || 60;
            setProcessingError(
              `Cota da API temporariamente excedida. Tente novamente em ${retryAfter} segundos.`
            );
          } catch {
            setProcessingError('Cota da API excedida. Aguarde alguns minutos antes de tentar novamente.');
          }
        } else {
          try {
            const errorData = await response.json();
            setProcessingError(errorData.error || 'Erro no processamento da imagem');
          } catch {
            setProcessingError('Erro no processamento da imagem');
          }
        }
        return;
      }

      const resultBlob = await response.blob();
      const resultUrl = URL.createObjectURL(resultBlob);
      setResult(resultUrl);
      
      // Force refresh credits after successful processing
      refreshCredits();
      
    } catch (error) {
      console.error('Erro no processamento:', error);
      setProcessingError('Erro na conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsProcessing(false);
      // Stop polling when processing is done
      stopPolling();
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const link = document.createElement('a');
    link.href = result;
    link.download = `tattoo-${mode}-result-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNewEdit = () => {
    setBodyImage(null);
    setTattooImage(null);
    setResult(null);
    setProcessingError(null);
  };

  return (
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
          <h1 className="text-3xl font-bold">{config.title}</h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
      </div>

      {/* Credits Status */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <Badge 
          variant={hasCredits ? "default" : "destructive"}
          className={`transition-all duration-200 ${isProcessing ? 'animate-pulse' : ''}`}
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
        
        {isProcessing && (
          <Badge variant="secondary" className="animate-pulse">
            Processando... Crédito será consumido ao finalizar
          </Badge>
        )}
        
        {!hasCredits && !creditsLoading && (
          <Button asChild size="sm">
            <Link href="/credits">
              Comprar Créditos
            </Link>
          </Button>
        )}
      </div>

      {result ? (
        // Result View
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Resultado Pronto!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative rounded-lg overflow-hidden border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result}
                alt="Resultado processado"
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleDownload} className="flex-1 sm:flex-initial">
                <Download className="h-4 w-4 mr-2" />
                Baixar Resultado
              </Button>
              <Button variant="outline" onClick={handleNewEdit} className="flex-1 sm:flex-initial">
                Nova Edição
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Editor View
        <div className="space-y-8">
          {/* Upload Section */}
          <Card className={config.color}>
            <CardHeader>
              <CardTitle>Upload de Imagens</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="body" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="body">
                    Foto do Corpo
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tattoo" 
                    disabled={!config.needsTattooImage}
                  >
                    {config.needsTattooImage ? "Tatuagem" : "Não Necessário"}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="body" className="mt-4">
                  <ImageUploader
                    label="Foto do Corpo"
                    description={
                      mode === 'add' 
                        ? "Faça upload da foto onde deseja aplicar a tatuagem"
                        : "Faça upload da foto com a tatuagem existente"
                    }
                    onImageSelect={handleBodyImageSelect}
                    onImageRemove={handleBodyImageRemove}
                    currentImage={bodyImage?.preview}
                    required
                  />
                </TabsContent>
                
                {config.needsTattooImage && (
                  <TabsContent value="tattoo" className="mt-4">
                    <ImageUploader
                      label="Design da Tatuagem"
                      description="Faça upload do design que deseja aplicar na foto do corpo"
                      onImageSelect={handleTattooImageSelect}
                      onImageRemove={handleTattooImageRemove}
                      currentImage={tattooImage?.preview}
                      required
                    />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>

          {/* Error Display */}
          {processingError && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-destructive mb-1">Erro no Processamento</h4>
                    <p className="text-sm text-destructive/80">
                      {processingError}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Process Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Processar com IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-muted-foreground mb-6">
                  Utilizamos o Google Gemini 2.5 Flash Image Preview para resultados fotorrealistas
                </p>
                
                <Button 
                  size="lg" 
                  onClick={handleProcess}
                  disabled={!canProcess()}
                  className="min-w-[200px]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : !hasCredits ? (
                    "Sem Créditos"
                  ) : !bodyImage ? (
                    "Adicione Foto do Corpo"
                  ) : config.needsTattooImage && !tattooImage ? (
                    "Adicione Design da Tatuagem"
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Processar Imagem (1 crédito)
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              <div className="text-center space-y-2">
                <h4 className="font-medium text-sm">
                  {isProcessing ? "Status do Processamento" : "Informações do Processamento"}
                </h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  {isProcessing ? (
                    <>
                      <p className="text-blue-600 font-medium">🔄 Processando sua imagem...</p>
                      <p>🔒 Crédito protegido - só será consumido após sucesso</p>
                      <p>📊 Seus créditos estão sendo atualizados em tempo real</p>
                    </>
                  ) : (
                    <>
                      <p>• Tempo estimado: 5-10 segundos</p>
                      <p>• Qualidade: Fotorrealista com IA avançada</p>
                      <p>• Custo: 1 crédito por processamento</p>
                      <p className="text-green-600">🛡️ Sistema seguro - sem perdas de créditos</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function TattooEditorPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando editor...</p>
            </CardContent>
          </Card>
        </div>
      }>
        <TattooEditorContent />
      </Suspense>
    </AuthGuard>
  );
}