import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function SecurityVerificationPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Verificação de Segurança</h1>
          <p className="text-muted-foreground">Informações sobre a segurança do TattooPreview</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              Site Legítimo e Seguro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-primary">
              O TattooPreview é uma aplicação legítima de edição de imagens com inteligência artificial,
              desenvolvida para ajudar usuários a visualizar tatuagens de forma segura e privada.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-primary">Propósito Legítimo</h4>
                  <p className="text-sm text-muted-foreground">
                    Aplicação de edição de imagens usando Google Gemini AI para adicionar, remover ou retocar tatuagens
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-primary">Privacidade Protegida</h4>
                  <p className="text-sm text-muted-foreground">
                    Imagens são processadas temporariamente e deletadas imediatamente após o uso
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-primary">Tecnologias Confiáveis</h4>
                  <p className="text-sm text-muted-foreground">
                    Hospedado na Vercel, autenticação Google OAuth, pagamentos Stripe
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-primary">Código Aberto Disponível</h4>
                  <p className="text-sm text-muted-foreground">
                    Implementação transparente disponível para análise
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Sobre Avisos de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Se você recebeu um aviso de &quot;site perigoso&quot; ao acessar nosso domínio, isso pode ser um falso positivo.
              Nosso site não contém malware, não coleta dados maliciosamente nem representa riscos de segurança.
            </p>

            <div className="space-y-3">
              <h4 className="font-medium">Medidas de Segurança Implementadas:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• HTTPS/TLS em todas as conexões</li>
                <li>• Autenticação segura via Google OAuth</li>
                <li>• Processamento de imagens temporário e criptografado</li>
                <li>• Políticas de privacidade e termos de serviço transparentes</li>
                <li>• Pagamentos processados via Stripe (certificado PCI DSS)</li>
                <li>• Sem downloads ou instalações de software</li>
                <li>• Sem coleta de dados sensíveis além do necessário</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Técnicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Domínio:</strong> tattoopreview.app
              </div>
              <div>
                <strong>Hospedagem:</strong> Vercel
              </div>
              <div>
                <strong>SSL/TLS:</strong> Certificado válido
              </div>
              <div>
                <strong>Framework:</strong> Next.js 15
              </div>
              <div>
                <strong>AI Provider:</strong> Google Gemini
              </div>
              <div>
                <strong>Autenticação:</strong> Google OAuth
              </div>
              <div>
                <strong>Pagamentos:</strong> Stripe
              </div>
              <div>
                <strong>Database:</strong> PostgreSQL (Neon)
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contato para Questões de Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Se você tiver preocupações sobre a segurança de nosso site ou precisar relatar uma vulnerabilidade:
            </p>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Email de Segurança:</strong>{" "}
                <a href="mailto:security@tattoopreview.app" className="text-primary underline">
                  security@tattoopreview.app
                </a>
              </div>
              <div>
                <strong>Suporte Geral:</strong>{" "}
                <a href="mailto:support@tattoopreview.app" className="text-primary underline">
                  support@tattoopreview.app
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}