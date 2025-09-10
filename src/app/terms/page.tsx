import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold">Termos de Serviço</h1>
          <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Aceitação dos Termos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ao acessar e usar o TattooPreview (&quot;Serviço&quot;), você concorda em cumprir e estar 
              vinculado a estes Termos de Serviço. Se você não concorda com qualquer parte 
              destes termos, não deve usar nosso serviço.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Descrição do Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              O TattooPreview é uma plataforma que utiliza inteligência artificial para:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Adicionar tatuagens virtuais a fotos de corpo</li>
              <li>• Remover tatuagens existentes de imagens</li>
              <li>• Retocar e melhorar tatuagens em fotos</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              O serviço opera baseado em um sistema de créditos que são consumidos a cada processamento.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Contas de Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Criação de Conta</h4>
              <p className="text-sm text-muted-foreground">
                Para usar nosso serviço, você deve criar uma conta usando Google OAuth. 
                Você é responsável por manter a confidencialidade de sua conta.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Elegibilidade</h4>
              <p className="text-sm text-muted-foreground">
                Você deve ter pelo menos 18 anos para usar este serviço. Ao criar uma conta, 
                você declara que tem idade legal para formar um contrato vinculativo.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Sistema de Créditos e Pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Créditos Gratuitos</h4>
              <p className="text-sm text-muted-foreground">
                Novos usuários recebem 3 créditos gratuitos para experimentar o serviço.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Compra de Créditos</h4>
              <p className="text-sm text-muted-foreground">
                Créditos adicionais podem ser adquiridos através de pacotes pagos. 
                Os pagamentos são processados de forma segura através do Stripe.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Reembolsos</h4>
              <p className="text-sm text-muted-foreground">
                Créditos consumidos em processamentos bem-sucedidos não são reembolsáveis. 
                Em caso de falha técnica, os créditos serão restaurados automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Uso Aceitável</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Você concorda em NÃO usar nosso serviço para:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Fazer upload de imagens de nudez explícita ou conteúdo pornográfico</li>
              <li>• Processar imagens de menores de idade</li>
              <li>• Criar conteúdo ofensivo, discriminatório ou ilegal</li>
              <li>• Fazer upload de imagens sem permissão dos indivíduos retratados</li>
              <li>• Usar o serviço para fins comerciais sem autorização</li>
              <li>• Tentar burlar ou hackear o sistema</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Propriedade Intelectual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Você mantém os direitos sobre as imagens que faz upload. Ao usar nosso serviço, 
              você nos concede uma licença temporária para processar essas imagens através 
              de nossa IA. As imagens processadas são de sua propriedade e são deletadas 
              de nossos servidores imediatamente após o processamento.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Privacidade e Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Levamos sua privacidade a sério. As imagens enviadas são:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Processadas de forma segura através do Google Gemini AI</li>
              <li>• Armazenadas temporariamente apenas durante o processamento</li>
              <li>• Automaticamente deletadas após o uso</li>
              <li>• Nunca compartilhadas com terceiros para outros fins</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Limitações e Garantias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              O serviço é fornecido &quot;como está&quot;. Não garantimos resultados perfeitos, 
              pois a qualidade depende de vários fatores incluindo qualidade da imagem 
              original. Fazemos nosso melhor esforço para fornecer resultados de alta qualidade, 
              mas não podemos garantir resultados específicos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Limitação de Responsabilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Em nenhum caso seremos responsáveis por danos indiretos, incidentais, 
              especiais ou consequenciais decorrentes do uso de nosso serviço. 
              Nossa responsabilidade total não excederá o valor pago pelo serviço 
              nos últimos 12 meses.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Suspensão e Encerramento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Reservamos o direito de suspender ou encerrar contas que violem estes termos. 
              Você pode encerrar sua conta a qualquer momento através das configurações 
              da conta. Créditos não utilizados em contas encerradas não serão reembolsados.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Alterações nos Termos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Podemos modificar estes termos a qualquer momento. Mudanças significativas 
              serão notificadas através de email ou aviso no serviço. O uso continuado 
              após mudanças constitui aceitação dos novos termos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Lei Aplicável</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Estes termos são regidos pelas leis do Brasil. Qualquer disputa será 
              resolvida nos tribunais competentes do Brasil.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>13. Contato</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Para questões sobre estes termos, entre em contato conosco em{" "}
              <a href="mailto:legal@tattoopreview.app" className="text-primary underline">
                legal@tattoopreview.app
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}