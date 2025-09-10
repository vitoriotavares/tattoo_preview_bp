import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold">Política de Privacidade</h1>
          <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Informações que Coletamos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Informações de Conta</h4>
              <p className="text-sm text-muted-foreground">
                Coletamos informações quando você cria uma conta através do Google OAuth, incluindo:
                nome, endereço de email e foto de perfil.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Imagens Enviadas</h4>
              <p className="text-sm text-muted-foreground">
                As imagens que você faz upload para processamento são temporariamente armazenadas 
                apenas durante o processamento e são automaticamente deletadas após o uso.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Dados de Uso</h4>
              <p className="text-sm text-muted-foreground">
                Coletamos informações sobre como você usa nosso serviço, incluindo número de 
                processamentos, tipo de operações realizadas e dados de pagamento.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Como Usamos suas Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Fornecer e manter nosso serviço de edição de imagens com IA</li>
              <li>• Processar pagamentos e gerenciar créditos de usuário</li>
              <li>• Comunicar sobre atualizações do serviço</li>
              <li>• Melhorar nossa experiência do usuário</li>
              <li>• Cumprir obrigações legais</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Compartilhamento de Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
              exceto conforme descrito nesta política ou com seu consentimento explícito.
              Podemos compartilhar dados com provedores de serviços como:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Google (autenticação OAuth)</li>
              <li>• Stripe (processamento de pagamentos)</li>
              <li>• Google Gemini AI (processamento de imagens)</li>
              <li>• Vercel (hospedagem)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Segurança dos Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Implementamos medidas de segurança técnicas e organizacionais apropriadas para 
              proteger suas informações contra acesso não autorizado, alteração, divulgação 
              ou destruição. As imagens são processadas de forma segura e deletadas 
              imediatamente após o processamento.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Seus Direitos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Você tem os seguintes direitos em relação aos seus dados:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Acessar suas informações pessoais</li>
              <li>• Corrigir informações incorretas</li>
              <li>• Solicitar a exclusão de sua conta</li>
              <li>• Retirar consentimento para processamento</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Retenção de Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Mantemos suas informações de conta enquanto sua conta estiver ativa. 
              As imagens enviadas são deletadas imediatamente após o processamento. 
              Dados de uso podem ser mantidos por até 2 anos para fins analíticos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Alterações nesta Política</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças 
              significativas através de email ou aviso em nosso serviço. O uso continuado 
              após mudanças constitui aceitação da nova política.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Contato</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Para questões sobre esta política ou seus dados, entre em contato conosco em{" "}
              <a href="mailto:privacy@tattoopreview.app" className="text-primary underline">
                privacy@tattoopreview.app
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}