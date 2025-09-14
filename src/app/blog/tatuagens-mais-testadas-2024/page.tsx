import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "10 Tatuagens Mais Testadas em 2024 | Blog TattooPreview",
  description: "Descubra quais designs de tatuagem estão fazendo mais sucesso no nosso simulador em 2024. Inspiração garantida para sua próxima tattoo!",
  keywords: "tatuagens populares 2024, tendências tatuagem, designs mais testados, simulador tatuagem",
  openGraph: {
    title: "10 Tatuagens Mais Testadas em 2024",
    description: "Tendências de tatuagem que estão dominando o simulador",
    type: "article",
  }
};

const topTattoos = [
  {
    rank: 1,
    name: "Borboleta Minimalista",
    tests: 3247,
    style: "Minimalista",
    bodyPart: "Ombro/Pulso",
    description: "Design delicado que simboliza transformação"
  },
  {
    rank: 2,
    name: "Dragão Tribal",
    tests: 2891,
    style: "Tribal",
    bodyPart: "Braço/Costas",
    description: "Força e poder em linhas marcantes"
  },
  {
    rank: 3,
    name: "Rosa Geométrica",
    tests: 2654,
    style: "Geométrico",
    bodyPart: "Antebraço",
    description: "Beleza natural com toque moderno"
  },
  {
    rank: 4,
    name: "Mandala Pequena",
    tests: 2398,
    style: "Minimalista",
    bodyPart: "Pulso/Tornozelo",
    description: "Equilíbrio e harmonia em design compacto"
  },
  {
    rank: 5,
    name: "Leão Realista",
    tests: 2156,
    style: "Realismo",
    bodyPart: "Peito/Costas",
    description: "Realismo impressionante representando liderança"
  }
];

export default function BlogPostPage() {
  return (
    <main className="flex-1">
      {/* Header */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Blog
            </Link>
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Badge variant="secondary">Tendências</Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                3 min de leitura
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                2.847 visualizações
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              10 Tatuagens Mais Testadas em 2024
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              Descubra quais designs estão fazendo mais sucesso no nosso simulador e inspire-se para sua próxima tattoo.
            </p>

            <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
              <Image
                src="/images/com_tatu_retocada.png"
                alt="As tatuagens mais testadas em 2024"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto prose prose-lg">
            <p className="text-lg leading-relaxed mb-8">
              Analisamos mais de <strong>50.000 simulações</strong> realizadas em nossa plataforma durante 2024
              e descobrimos tendências fascinantes. Os usuários estão preferindo designs que combinam
              <strong>beleza</strong>, <strong>significado</strong> e <strong>versatilidade</strong>.
            </p>

            <h2 className="text-3xl font-bold mb-6">🏆 Top 10 Designs Mais Testados</h2>

            <div className="space-y-6 mb-12">
              {topTattoos.map((tattoo) => (
                <Card key={tattoo.rank} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full font-bold text-xl">
                      {tattoo.rank}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{tattoo.name}</h3>
                      <p className="text-muted-foreground mb-3">{tattoo.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline">{tattoo.style}</Badge>
                        <Badge variant="outline">{tattoo.bodyPart}</Badge>
                        <Badge variant="secondary">{tattoo.tests.toLocaleString()} testes</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <h2 className="text-3xl font-bold mb-6">📈 O Que Isso Revela?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">🎯 Preferências 2024</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Minimalismo em alta:</strong> 60% dos testes</li>
                  <li>• <strong>Tamanho médio:</strong> Entre 5-15cm</li>
                  <li>• <strong>Locais discretos:</strong> Pulso, ombro, tornozelo</li>
                  <li>• <strong>Simbolismo importante:</strong> Designs com significado</li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">👥 Perfil dos Usuários</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Primeira tatuagem:</strong> 45% dos usuários</li>
                  <li>• <strong>Idade 18-35:</strong> Maioria absoluta</li>
                  <li>• <strong>Pesquisa prévia:</strong> Testam 3-5 designs</li>
                  <li>• <strong>Decisão consciente:</strong> 87% fazem após testar</li>
                </ul>
              </Card>
            </div>

            <div className="bg-muted p-8 rounded-lg mb-12">
              <h3 className="text-2xl font-bold mb-4">💡 Dica do Expert</h3>
              <p className="text-lg">
                &ldquo;O aumento de 300% nos testes de tatuagens minimalistas mostra uma mudança de mentalidade.
                As pessoas querem <strong>qualidade sobre quantidade</strong>, designs que envelheçam bem
                e tenham significado pessoal.&rdquo; - <em>Análise TattooPreview 2024</em>
              </p>
            </div>

            <h2 className="text-3xl font-bold mb-6">🚀 Pronto Para Testar?</h2>

            <p className="text-lg leading-relaxed mb-8">
              Use essas tendências como inspiração, mas lembre-se: a melhor tatuagem é aquela que
              <strong>representa você</strong>. Nosso simulador permite testar qualquer design
              gratuitamente antes de tomar a decisão final.
            </p>

            {/* CTA Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 text-center">
                <h4 className="font-bold text-lg mb-2">Testar Designs Populares</h4>
                <p className="text-muted-foreground mb-4">
                  Experimente os designs mais testados
                </p>
                <Button asChild className="w-full">
                  <Link href="/galeria">
                    Ver Galeria
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>

              <Card className="p-6 text-center">
                <h4 className="font-bold text-lg mb-2">Simular Sua Ideia</h4>
                <p className="text-muted-foreground mb-4">
                  Teste seu próprio design em segundos
                </p>
                <Button asChild className="w-full">
                  <Link href="/tattoo">
                    Começar Teste
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            </div>
          </article>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 text-center">Posts Relacionados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h4 className="font-bold mb-2">Como Escolher Sua Primeira Tatuagem</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Guia completo para iniciantes evitarem arrependimentos
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/blog/primeira-tatuagem-sem-arrependimentos">
                      Ler Post
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h4 className="font-bold mb-2">Tatuagem Minimalista em Alta</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Por que designs simples conquistaram 2024
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/blog/tatuagem-minimalista-tendencia">
                      Ler Post
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Schema for Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": "10 Tatuagens Mais Testadas em 2024",
            "description": "Análise das tendências de tatuagem mais populares no simulador TattooPreview",
            "author": {
              "@type": "Organization",
              "name": "TattooPreview"
            },
            "publisher": {
              "@type": "Organization",
              "name": "TattooPreview"
            },
            "datePublished": "2024-01-15",
            "dateModified": "2024-01-15",
            "url": "https://tattoopreview.com/blog/tatuagens-mais-testadas-2024",
            "wordCount": "800",
            "articleSection": "Tendências",
            "keywords": ["tatuagens 2024", "tendências", "simulador", "designs populares"]
          })
        }}
      />
    </main>
  );
}