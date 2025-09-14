import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Estilos de Tatuagem para Testar - Explore e Simule | TattooPreview",
  description: "Descubra todos os estilos de tatuagem disponíveis para testar: Tribal, Realismo, Minimalista, Old School e mais. Simule gratuitamente em poucos segundos.",
  keywords: "estilos tatuagem, tipos tatuagem testar, tribal realismo minimalista, simulador estilos",
  openGraph: {
    title: "Estilos de Tatuagem para Simular",
    description: "Explore e teste todos os estilos de tatuagem com IA",
  }
};

const tattooStyles = [
  {
    id: 1,
    name: "Tribal",
    description: "Linhas grossas e formas geométricas inspiradas em culturas ancestrais",
    popularity: "🔥 Muito Popular",
    difficulty: "Iniciante",
    image: "/images/com_tatu_retocada.png",
    examples: 156,
    trending: false,
    characteristics: ["Linhas grossas", "Alto contraste", "Formas simbólicas"]
  },
  {
    id: 2,
    name: "Realismo",
    description: "Reprodução fotográfica de rostos, animais ou objetos",
    popularity: "⭐ Popular",
    difficulty: "Avançado",
    image: "/images/com_tatu_retocada.png",
    examples: 89,
    trending: true,
    characteristics: ["Detalhes precisos", "Sombreamento", "Dimensão"]
  },
  {
    id: 3,
    name: "Minimalista",
    description: "Designs simples e elegantes com traços finos",
    popularity: "🔥 Muito Popular",
    difficulty: "Iniciante",
    image: "/images/com_tatu_retocada.png",
    examples: 234,
    trending: true,
    characteristics: ["Linhas finas", "Simplicidade", "Elegância"]
  },
  {
    id: 4,
    name: "Old School",
    description: "Estilo clássico americano com cores vibrantes",
    popularity: "⭐ Popular",
    difficulty: "Intermediário",
    image: "/images/com_tatu_retocada.png",
    examples: 127,
    trending: false,
    characteristics: ["Cores sólidas", "Contornos grossos", "Símbolos clássicos"]
  },
  {
    id: 5,
    name: "Geométrico",
    description: "Formas geométricas e padrões matemáticos",
    popularity: "🔥 Muito Popular",
    difficulty: "Intermediário",
    image: "/images/com_tatu_retocada.png",
    examples: 198,
    trending: true,
    characteristics: ["Simetria", "Precisão", "Padrões"]
  },
  {
    id: 6,
    name: "Floral",
    description: "Flores e elementos da natureza com delicadeza",
    popularity: "⭐ Popular",
    difficulty: "Intermediário",
    image: "/images/com_tatu_retocada.png",
    examples: 176,
    trending: false,
    characteristics: ["Curvas suaves", "Natureza", "Feminilidade"]
  },
  {
    id: 7,
    name: "Aquarela",
    description: "Efeito de tinta aquarela com cores que se misturam",
    popularity: "🆕 Tendência",
    difficulty: "Avançado",
    image: "/images/com_tatu_retocada.png",
    examples: 67,
    trending: true,
    characteristics: ["Cores fluidas", "Sem contorno", "Artistico"]
  },
  {
    id: 8,
    name: "Blackwork",
    description: "Uso predominante de tinta preta com sombreamentos",
    popularity: "⭐ Popular",
    difficulty: "Intermediário",
    image: "/images/com_tatu_retocada.png",
    examples: 143,
    trending: false,
    characteristics: ["Apenas preto", "Contraste alto", "Boldness"]
  }
];

export default function EstilosPage() {
  return (
    <main className="flex-1">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Estilos de Tatuagem para Testar
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Explore todos os estilos disponíveis e simule como ficariam em você. Cada estilo tem sua personalidade única.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                8 estilos diferentes
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Sempre atualizado
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Styles Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tattooStyles.map((style) => (
              <Card key={style.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative aspect-square">
                  <Image
                    src={style.image}
                    alt={`Exemplo de tatuagem estilo ${style.name.toLowerCase()}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {style.trending && (
                    <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                      🔥 Trending
                    </Badge>
                  )}
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {style.examples} exemplos
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{style.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {style.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{style.popularity}</span>
                      <Badge variant="outline" className="text-xs">
                        {style.difficulty}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                        Características:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {style.characteristics.map((char, index) => (
                          <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full mt-4" variant="outline" asChild>
                      <Link href={`/tattoo?style=${style.name.toLowerCase()}`}>
                        Testar Este Estilo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Combinations */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Combinações Mais Testadas</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Veja as combinações de estilo + local do corpo que mais fazem sucesso
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center p-6">
              <h3 className="font-semibold mb-2">Minimalista + Pulso</h3>
              <p className="text-sm text-muted-foreground mb-4">Elegante e discreto</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/tattoo?style=minimalista&location=pulso">
                  Testar Combinação
                </Link>
              </Button>
            </Card>

            <Card className="text-center p-6">
              <h3 className="font-semibold mb-2">Tribal + Braço</h3>
              <p className="text-sm text-muted-foreground mb-4">Clássico e marcante</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/tattoo?style=tribal&location=braco">
                  Testar Combinação
                </Link>
              </Button>
            </Card>

            <Card className="text-center p-6">
              <h3 className="font-semibold mb-2">Floral + Ombro</h3>
              <p className="text-sm text-muted-foreground mb-4">Delicado e feminino</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/tattoo?style=floral&location=ombro">
                  Testar Combinação
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Encontrou Seu Estilo Ideal?
            </h2>
            <p className="text-muted-foreground mb-8">
              Teste qualquer estilo gratuitamente e veja como ficaria em você
            </p>
            <Button asChild size="lg" className="min-w-[250px]">
              <Link href="/tattoo">
                <Sparkles className="mr-2 h-4 w-4" />
                Começar Simulação (3 Grátis)
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Schema for Styles */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Estilos de Tatuagem Disponíveis",
            "description": "Lista completa de estilos de tatuagem disponíveis para simulação",
            "numberOfItems": tattooStyles.length,
            "itemListElement": tattooStyles.map((style, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": style.name,
              "description": style.description,
              "url": `https://tattoopreview.com/tattoo?style=${style.name.toLowerCase()}`
            }))
          })
        }}
      />
    </main>
  );
}