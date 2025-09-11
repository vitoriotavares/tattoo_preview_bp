# Configuração do Stripe para TattooPreview

Este documento descreve como configurar o Stripe para pagamentos de créditos no TattooPreview.

## 1. Configuração Inicial

### 1.1 Criar Conta no Stripe
1. Acesse [stripe.com](https://stripe.com) e crie uma conta
2. Ative o modo de teste para desenvolvimento

### 1.2 Obter Chaves da API
1. No dashboard do Stripe, vá para **Developers > API keys**
2. Copie as seguintes chaves:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

### 1.3 Configurar Webhook
1. Vá para **Developers > Webhooks**
2. Clique em **Add endpoint**
3. URL do endpoint: `https://seudominio.com/api/stripe/webhook` (ou `http://localhost:3000/api/stripe/webhook` para dev)
4. Eventos para escutar:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copie o **Webhook signing secret** (whsec_...)

## 2. Configuração das Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env`:

```env
# Stripe Payment Integration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 3. Inicializar Produtos no Stripe

Após configurar as variáveis de ambiente, execute:

```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Em outro terminal, crie os produtos no Stripe
npm run stripe:setup
```

Este comando criará automaticamente os produtos e preços no Stripe baseados nos pacotes configurados no banco de dados.

## 4. Estrutura dos Pacotes de Créditos

Os seguintes pacotes são criados automaticamente:

- **Starter**: 10 créditos por R$ 14,90
- **Popular**: 30 créditos por R$ 34,90
- **Pro**: 75 créditos por R$ 69,90
- **Studio**: 200 créditos por R$ 149,90

## 5. Fluxo de Pagamento

1. **Usuário clica em "Comprar Agora"** → Cria sessão de checkout
2. **Usuário completa pagamento** → Stripe envia webhook
3. **Webhook processa pagamento** → Créditos são adicionados à conta
4. **Usuário é redirecionado** → Página de sucesso com créditos atualizados

## 6. Testando Pagamentos

Use os cartões de teste do Stripe:

- **Sucesso**: 4242 4242 4242 4242
- **Falha**: 4000 0000 0000 0002
- **3D Secure**: 4000 0027 6000 3184

**CVV**: Qualquer 3 dígitos  
**Data**: Qualquer data futura

## 7. Logs e Monitoramento

- Verifique logs no console do servidor para webhooks
- Use o dashboard do Stripe para monitorar pagamentos
- Logs de erro são salvos no console com `console.error`

## 8. Produção

Para produção:

1. Substitua as chaves de teste pelas chaves de produção
2. Configure webhook para o domínio de produção
3. Teste completamente o fluxo de pagamento
4. Monitore logs de webhook para garantir processamento correto

## 9. Solução de Problemas

### Webhook não está funcionando
- Verifique se o endpoint está acessível publicamente
- Confirme se o signing secret está correto
- Use ngrok para testar localmente

### Produtos não criados
- Verifique se as variáveis de ambiente estão corretas
- Execute `npm run stripe:setup` novamente
- Verifique logs no console

### Pagamento não processado
- Verifique logs do webhook
- Confirme se os metadados da sessão estão corretos
- Verifique se o usuário existe no banco de dados