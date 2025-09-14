import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, Filter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Galeria de Simulações - Veja Como Tatuagens Ficam | TattooPreview",
  description: "Explore centenas de simulações reais de tatuagem. Inspire-se e veja como diferentes estilos ficam em diversos tipos de corpo. Galeria atualizada diariamente.",
  keywords: "galeria tatuagem virtual, exemplos simulação, antes depois tatuagem, inspiração tatuagem",
  openGraph: {
    title: "Galeria de Simulações de Tatuagem",
    description: "Centenas de exemplos reais de simulação de tatuagem com IA",
  }
};

// Mock data - Em produção virá da API
const galleryItems = [
  {
    id: 1,
    style: "Tribal",
    bodyPart: "Braço",
    beforeImage: "/images/com_tatu_retocada.png",
    afterImage: "/images/sem_tatu_fundo_branco.png",
    views: 1247,
    featured: true
  },
  {
    id: 2,
    style: "Realismo",
    bodyPart: "Costas",
    beforeImage: "/images/com_tatu_retocada.png",
    afterImage: "/images/sem_tatu_fundo_branco.png",
    views: 892,
    featured: false
  },
  {
    id: 3,
    style: "Minimalista",
    bodyPart: "Pulso",
    beforeImage: "/images/com_tatu_retocada.png",
    afterImage: "/images/sem_tatu_fundo_branco.png",
    views: 2156,
    featured: true
  },
  {
    id: 4,
    style: "Old School",
    bodyPart: "Perna",
    beforeImage: "/images/com_tatu_retocada.png",
    afterImage: "/images/sem_tatu_fundo_branco.png",
    views: 756,
    featured: false
  },
  {
    id: 5,
    style: "Geométrico",
    bodyPart: "Peito",
    beforeImage: "/images/com_tatu_retocada.png",
    afterImage: "/images/sem_tatu_fundo_branco.png",
    views: 1433,
    featured: true
  },
  {
    id: 6,
    style: "Floral",
    bodyPart: "Ombro",
    beforeImage: "/images/com_tatu_retocada.png",
    afterImage: "/images/sem_tatu_fundo_branco.png",
    views: 987,
    featured: false
  }
];

const styles = ["Todos", "Tribal", "Realismo", "Minimalista", "Old School", "Geométrico", "Floral"];
const bodyParts = ["Todos", "Braço", "Costas", "Perna", "Peito", "Ombro", "Pulso"];

export default function GaleriaPage() {
  return (
    <main className="flex-1">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Galeria de Simulações de Tatuagem
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Inspire-se com centenas de simulações reais. Veja como diferentes estilos ficam em diversos tipos de corpo.
            </p>
            <Button asChild size="lg">
              <Link href="/tattoo">
                <ArrowRight className="mr-2 h-4 w-4" />
                Testar Minha Tatuagem
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Filtrar por:</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">Estilo:</h3>
              <div className="flex flex-wrap gap-2">
                {styles.map((style) => (
                  <Badge key={style} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    {style}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">Parte do Corpo:</h3>
              <div className="flex flex-wrap gap-2">
                {bodyParts.map((part) => (
                  <Badge key={part} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    {part}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square">
                  <Image
                    src={item.beforeImage}
                    alt={`Simulação de tatuagem ${item.style.toLowerCase()} no ${item.bodyPart.toLowerCase()}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {item.featured && (
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                      ✨ Destaque
                    </Badge>
                  )}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    <Eye className="h-3 w-3" />
                    {item.views}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{item.style}</h3>
                      <p className="text-sm text-muted-foreground">{item.bodyPart}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Pronto Para Criar Sua Simulação?
            </h2>
            <p className="text-muted-foreground mb-8">
              Teste gratuitamente como sua tatuagem ficaria em você
            </p>
            <Button asChild size="lg" className="min-w-[250px]">
              <Link href="/tattoo">
                Começar Simulação Gratuita
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Schema for Gallery */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "name": "Galeria de Simulações de Tatuagem",
            "description": "Galeria com exemplos reais de simulação de tatuagem usando inteligência artificial",
            "url": "https://tattoopreview.com/galeria",
            "image": galleryItems.map(item => ({
              "@type": "ImageObject",
              "contentUrl": item.beforeImage,
              "name": `Simulação ${item.style} no ${item.bodyPart}`,
              "description": `Exemplo de tatuagem estilo ${item.style} simulada no ${item.bodyPart.toLowerCase()}`
            }))
          })
        }}
      />
    </main>
  );
}