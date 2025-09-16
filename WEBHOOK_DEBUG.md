# Webhook Debug Guide

## Problema Identificado

O webhook do Stripe não está chegando ao nosso servidor. Logs da Vercel mostram apenas requests para `/api/stripe/checkout` mas nenhum para `/api/stripe/webhook`.

## Verificação Rápida

### 1. Teste se o endpoint está ativo:
```bash
curl https://www.tattoopreview.app/api/stripe/webhook
```

Deve retornar:
```json
{
  "status": "Webhook endpoint is live",
  "timestamp": "...",
  "environment": "production",
  "version": "2.0"
}
```

### 2. Teste o endpoint de debug:
```bash
curl https://www.tattoopreview.app/api/stripe/webhook-test
```

## Configuração do Webhook no Stripe

### Passo 1: Acessar Stripe Dashboard
1. Vá para: https://dashboard.stripe.com/webhooks
2. Verifique se existe um webhook para o domínio `www.tattoopreview.app`

### Passo 2: Verificar/Criar Webhook
**URL deve ser exatamente:**
```
https://www.tattoopreview.app/api/stripe/webhook
```

**Eventos que devem estar selecionados:**
- ✅ `checkout.session.completed`
- ✅ `payment_intent.succeeded`
- ✅ `charge.updated`

### Passo 3: Verificar Secret
1. Clique no webhook criado
2. Copie o "Signing secret" (começa com `whsec_...`)
3. Verifique se está configurado na Vercel como `STRIPE_WEBHOOK_SECRET`

### Passo 4: Testar Webhook
1. No Stripe Dashboard, vá na aba "Tentativas"
2. Clique em "Enviar evento de teste"
3. Selecione `checkout.session.completed`
4. Clique em "Enviar evento de teste"

## Possíveis Problemas

### 1. URL Incorreta
- ❌ `http://` (deve ser `https://`)
- ❌ `tattoopreview.app` (deve ser `www.tattoopreview.app`)
- ❌ `/webhook` (deve ser `/api/stripe/webhook`)

### 2. Eventos Não Configurados
Se apenas `charge.updated` está configurado, adicione:
- `checkout.session.completed` (principal)
- `payment_intent.succeeded` (backup)

### 3. Secret Incorreto
Verifique se `STRIPE_WEBHOOK_SECRET` na Vercel corresponde ao secret do webhook.

### 4. Webhook Não Existe
Se não existe webhook no Stripe Dashboard, criar um novo com:
- URL: `https://www.tattoopreview.app/api/stripe/webhook`
- Eventos: `checkout.session.completed`, `payment_intent.succeeded`, `charge.updated`

## Debug Commands

```bash
# Verificar logs da Vercel
vercel logs --app=tattoopreview

# Testar endpoint local
curl http://localhost:3000/api/stripe/webhook

# Verificar variáveis de ambiente na Vercel
vercel env ls
```

## Logs para Verificar

Após configurar corretamente, você deve ver nos logs da Vercel:
```
=== WEBHOOK START [wh_xxxxx] ===
Request URL: https://www.tattoopreview.app/api/stripe/webhook
Has signature: true
Processing event type: checkout.session.completed
✅ Successfully processed payment for session: cs_xxxxx
```