"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  keywords?: string[];
}

const faqItems: FAQItem[] = [
  {
    question: "Quantos testes grátis posso fazer?",
    answer: "3 testes completamente grátis! Sem necessidade de cartão ou cadastro.",
    keywords: ["testes grátis", "gratuito"]
  },
  {
    question: "Quanto tempo demora para ver o resultado?",
    answer: "Poucos segundos! Nossa IA processa instantaneamente.",
    keywords: ["tempo", "rápido", "poucos segundos"]
  },
  {
    question: "Preciso me cadastrar para testar?",
    answer: "Não! Use direto sem cadastro, sem cartão, sem dados pessoais.",
    keywords: ["cadastro", "sem registro"]
  },
  {
    question: "Como funciona o simulador de tatuagem?",
    answer: "Upload sua foto → Escolha ou envie design → Resultado em poucos segundos.",
    keywords: ["como funciona", "simulador"]
  },
  {
    question: "O resultado é realista?",
    answer: "Sim! Tecnologia de IA fotorrealista que simula exatamente como ficará.",
    keywords: ["realista", "qualidade"]
  },
  {
    question: "Posso testar qualquer tipo de tatuagem?",
    answer: "Sim! Todos os estilos: tribal, realismo, old school, minimalista, etc.",
    keywords: ["estilos", "tipos"]
  },
  {
    question: "Funciona em qualquer parte do corpo?",
    answer: "Sim! Braço, perna, costas, peito, qualquer área visível na foto.",
    keywords: ["corpo", "onde"]
  },
  {
    question: "A qualidade da foto influencia?",
    answer: "Sim. Fotos bem iluminadas e nítidas geram melhores resultados.",
    keywords: ["foto", "qualidade"]
  },
  {
    question: "É seguro? Meus dados ficam privados?",
    answer: "100% seguro! Não salvamos suas fotos, tudo é processado e deletado.",
    keywords: ["seguro", "privacidade"]
  },
  {
    question: "Posso salvar o resultado?",
    answer: "Sim! Faça download da sua simulação em alta qualidade.",
    keywords: ["salvar", "download"]
  },
  {
    question: "O que acontece após os 3 testes grátis?",
    answer: "Você pode comprar créditos extras de forma simples e rápida.",
    keywords: ["créditos", "após grátis"]
  },
  {
    question: "Posso testar antes de fazer minha primeira tatuagem?",
    answer: "Excelente ideia! Evite arrependimentos testando virtualmente antes.",
    keywords: ["primeira tatuagem", "arrependimento"]
  },
  {
    question: "Artistas podem usar para mostrar trabalhos?",
    answer: "Sim! Ferramenta perfeita para mostrar como ficará no cliente.",
    keywords: ["artistas", "profissionais"]
  },
  {
    question: "Funciona no celular?",
    answer: "Perfeitamente! Interface responsiva otimizada para mobile.",
    keywords: ["celular", "mobile"]
  },
  {
    question: "Posso comparar diferentes designs?",
    answer: "Sim! Teste vários designs no mesmo local para comparar.",
    keywords: ["comparar", "designs"]
  }
];

export function SeoFaq() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0, 1, 2])); // Primeiras 3 abertas por padrão

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas Frequentes sobre Simulação de Tatuagem
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa saber sobre nosso simulador de tatuagem com IA
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader
                className="pb-4 cursor-pointer"
                onClick={() => toggleItem(index)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-left pr-4">
                    {item.question}
                  </CardTitle>
                  {openItems.has(index) ? (
                    <Minus className="h-5 w-5 text-muted-foreground shrink-0" />
                  ) : (
                    <Plus className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </div>
              </CardHeader>
              {openItems.has(index) && (
                <CardContent className="pt-0 pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Schema.org structured data for FAQs */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqItems.map(item => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": item.answer
                }
              }))
            })
          }}
        />
      </div>
    </section>
  );
}