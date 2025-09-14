import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Eye, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Blog TattooPreview - Dicas, Tendências e Inspiração | Tatuagem Virtual",
  description: "Descubra dicas sobre tatuagem, tendências 2024, inspirações de design e como usar nosso simulador para testar antes de tatuar. Conteúdo atualizado semanalmente.",
  keywords: "blog tatuagem, dicas tatuagem, tendências tatuagem 2024, inspiração tattoo, simulador dicas",
  openGraph: {
    title: "Blog TattooPreview - Tatuagem e Tecnologia",
    description: "Dicas, tendências e inspirações sobre tatuagem e simulação virtual",
  }
};

// Mock blog posts - Em produção virá do CMS/API
const blogPosts = [
  {
    id: 1,
    title: "10 Tatuagens Mais Testadas em 2024",
    excerpt: "Descubra quais designs estão fazendo mais sucesso no nosso simulador e inspire-se para sua próxima tattoo.",
    category: "Tendências",
    readTime: 3,
    views: 2847,
    date: "2024-01-15",
    image: "/images/com_tatu_retocada.png",
    featured: true,
    slug: "tatuagens-mais-testadas-2024"
  },
  {
    id: 2,
    title: "Como Escolher Sua Primeira Tatuagem Sem Arrependimentos",
    excerpt: "Guia completo com 5 passos essenciais para quem nunca fez tatuagem. Use a simulação para garantir a escolha perfeita.",
    category: "Guias",
    readTime: 5,
    views: 1923,
    date: "2024-01-12",
    image: "/images/sem_tatu_fundo_branco.png",
    featured: false,
    slug: "primeira-tatuagem-sem-arrependimentos"
  },
  {
    id: 3,
    title: "Tatuagem Minimalista: Por Que É Tendência?",
    excerpt: "O movimento minimalista conquistou o mundo das tatuagens. Entenda por que designs simples estão em alta.",
    category: "Estilos",
    readTime: 4,
    views: 1456,
    date: "2024-01-10",
    image: "/images/com_tatu_retocada.png",
    featured: false,
    slug: "tatuagem-minimalista-tendencia"
  },
  {
    id: 4,
    title: "Antes de Tatuar: 5 Testes Essenciais",
    excerpt: "Checklist completo do que testar virtualmente antes de ir ao estúdio. Economize tempo e dinheiro.",
    category: "Dicas",
    readTime: 6,
    views: 3201,
    date: "2024-01-08",
    image: "/images/sem_tatu_fundo_branco.png",
    featured: true,
    slug: "testes-essenciais-antes-tatuar"
  }
];

const categories = ["Todos", "Tendências", "Guias", "Estilos", "Dicas"];

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <main className="flex-1">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Blog TattooPreview
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Tudo sobre tatuagem, tendências e como aproveitar melhor nosso simulador virtual
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Atualizado semanalmente
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                +10k visualizações/mês
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground px-4 py-2"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">✨ Posts em Destaque</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative aspect-video">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                      ✨ Destaque
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {post.readTime} min
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {post.views}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/blog/${post.slug}`}>
                        Ler Post Completo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular Posts */}
      <section className="py-12 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Todos os Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {regularPosts.map((post) => (
              <Card key={post.id} className="group overflow-hidden hover:shadow-md transition-all duration-300">
                <div className="relative aspect-video">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {post.readTime} min
                    </span>
                  </div>
                  <h3 className="font-bold group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {post.views}
                    </span>
                    <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-primary/10">
                      <Link href={`/blog/${post.slug}`}>
                        Ler mais
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Inspirado? Teste Sua Tatuagem!
            </h2>
            <p className="text-muted-foreground mb-8">
              Use nossas dicas e teste virtualmente como sua tatuagem ficaria
            </p>
            <Button asChild size="lg" className="min-w-[250px]">
              <Link href="/tattoo">
                <TrendingUp className="mr-2 h-4 w-4" />
                Simular Tatuagem Grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Schema for Blog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Blog TattooPreview",
            "description": "Blog sobre tatuagem, tendências e simulação virtual",
            "url": "https://tattoopreview.com/blog",
            "blogPost": blogPosts.map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt,
              "url": `https://tattoopreview.com/blog/${post.slug}`,
              "datePublished": post.date,
              "author": {
                "@type": "Organization",
                "name": "TattooPreview"
              },
              "publisher": {
                "@type": "Organization",
                "name": "TattooPreview"
              }
            }))
          })
        }}
      />
    </main>
  );
}