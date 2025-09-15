# 🚀 Guia Completo de Duplicação de App

Este guia te levará através do processo completo de transformar o TattooPreview em qualquer outro app de processamento de imagens.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Configuração Inicial](#configuração-inicial)
4. [Processo de Duplicação](#processo-de-duplicação)
5. [Configuração de Serviços](#configuração-de-serviços)
6. [Deploy](#deploy)
7. [Validação](#validação)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

### O que este processo faz?

- ✅ Duplica completamente o código base
- ✅ Substitui automaticamente termos específicos de tatuagem
- ✅ Configura novo repositório Git
- ✅ Prepara ambiente para novo domínio
- ✅ Mantém toda infraestrutura (auth, pagamentos, créditos)

### Tempo estimado: 30-60 minutos

---

## 🔧 Pré-requisitos

### Software Necessário

```bash
# Node.js (v18+)
node --version

# Git
git --version

# pnpm (recomendado) ou npm
pnpm --version

# GitHub CLI (opcional, mas recomendado)
gh --version
```

### Contas Necessárias

- [ ] GitHub (para repositório)
- [ ] Google Cloud (para Gemini API)
- [ ] Stripe (para pagamentos)
- [ ] Vercel/Railway (para deploy)
- [ ] Domínio registrado

---

## ⚙️ Configuração Inicial

### 1. Preparar Configuração

```bash
# 1. Copie o template de configuração
cp config/app.config.template.json config/app.config.json

# 2. Edite a configuração para seu app
nano config/app.config.json
```

### 2. Configurar app.config.json

```json
{
  "appName": "photo-restoration-ai",
  "displayName": "Photo Restoration AI",
  "description": "Restaure fotos antigas com IA avançada",
  "domain": "photorestoration.ai",
  "oldDomain": "tattoopreview.com",
  "processingType": "photo-restoration",

  // ... configure outros campos conforme necessário
}
```

### 3. Tipos de App Pré-configurados

Escolha um dos tipos ou crie o seu próprio:

| Tipo | Descrição | Uso Principal |
|------|-----------|---------------|
| `photo-restoration` | Restauração de fotos antigas | Reparar danos, melhorar qualidade |
| `object-removal` | Remoção de objetos | Limpar objetos indesejados |
| `background-removal` | Remoção de fundo | Cortar pessoas/objetos |
| `face-enhancement` | Melhoria facial | Retocar retratos |
| `art-generation` | Geração de arte | Transformar fotos em arte |

---

## 🔄 Processo de Duplicação

### 1. Execute o Script Principal

```bash
# Execute o script de duplicação
./scripts/duplicate-app.sh
```

O script irá:
- ✅ Validar pré-requisitos
- ✅ Criar backup automático
- ✅ Aplicar todas as substituições
- ✅ Renomear arquivos e classes
- ✅ Configurar novo repositório Git

### 2. Configurar Ambiente

```bash
# 1. Copie template de variáveis
cp .env.template .env

# 2. Configure suas chaves
nano .env
```

### 3. Instalar Dependências

```bash
# Instale dependências
pnpm install

# Execute migrações do banco
pnpm run db:migrate

# Teste localmente
pnpm run dev
```

---

## 🔑 Configuração de Serviços

### 1. Google Gemini API

```bash
# 1. Acesse: https://aistudio.google.com
# 2. Crie projeto ou use existente
# 3. Gere API key
# 4. Adicione ao .env:
GEMINI_API_KEY="sua_chave_aqui"
```

### 2. Stripe

```bash
# 1. Acesse: https://dashboard.stripe.com
# 2. Crie conta ou use existente
# 3. Obtenha chaves de API
# 4. Configure webhook endpoint
```

#### Configurar Webhook Stripe

1. **Endpoint URL**: `https://seudominio.com/api/stripe/webhook`
2. **Eventos para escutar**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### 3. Banco de Dados

#### Opção A: Vercel Postgres (Recomendado)

```bash
# 1. Acesse Vercel Dashboard
# 2. Crie projeto
# 3. Adicione Postgres
# 4. Copie DATABASE_URL
```

#### Opção B: Railway

```bash
# 1. Acesse railway.app
# 2. Crie projeto
# 3. Adicione PostgreSQL
# 4. Copie connection string
```

### 4. Autenticação

```bash
# Gere secret para autenticação
openssl rand -base64 32

# Adicione ao .env:
BETTER_AUTH_SECRET="secret_gerado"
BETTER_AUTH_URL="https://seudominio.com"
```

---

## 🚀 Deploy

### Opção A: Vercel (Recomendado)

```bash
# 1. Instale Vercel CLI
npm i -g vercel

# 2. Faça login
vercel login

# 3. Deploy
vercel --prod

# 4. Configure domínio customizado no dashboard
```

### Opção B: Railway

```bash
# 1. Instale Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway up
```

### Configuração de Variáveis no Deploy

No painel da plataforma, configure:

```bash
DATABASE_URL=sua_string_conexao
BETTER_AUTH_SECRET=seu_secret
BETTER_AUTH_URL=https://seudominio.com
GEMINI_API_KEY=sua_chave_gemini
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://seudominio.com
NEXT_PUBLIC_APP_NAME="Seu App"
```

---

## ✅ Validação

### 1. Execute Validador Automático

```bash
# Valide tudo antes do deploy
./scripts/validate-deployment.sh
```

### 2. Checklist Manual

#### Funcionalidades Básicas
- [ ] Página inicial carrega
- [ ] Autenticação funciona (Google)
- [ ] Sistema de créditos funciona
- [ ] Upload de imagens funciona
- [ ] Processamento de IA funciona
- [ ] Download de resultados funciona

#### Pagamentos
- [ ] Stripe conectado
- [ ] Webhooks configurados
- [ ] Compra de créditos funciona
- [ ] Teste com cartão de teste

#### SEO e Performance
- [ ] Meta tags corretas
- [ ] Sitemap acessível
- [ ] Performance boa (Lighthouse)
- [ ] Mobile responsivo

---

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro "GEMINI_API_KEY not found"

```bash
# Solução: Verifique se a chave está no .env
echo $GEMINI_API_KEY
```

#### 2. Erro de conexão com banco

```bash
# Verifique string de conexão
echo $DATABASE_URL

# Teste conexão
pnpm run db:studio
```

#### 3. Webhook Stripe não funciona

```bash
# 1. Verifique endpoint configurado
# 2. Teste com Stripe CLI:
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

#### 4. Build falha

```bash
# Verifique erros TypeScript
pnpm run typecheck

# Verifique lint
pnpm run lint
```

### Scripts de Diagnóstico

```bash
# Validação completa
./scripts/validate-deployment.sh

# Teste de build
pnpm run build

# Verificar dependências
pnpm audit
```

---

## 📚 Recursos Adicionais

### Documentação

- [Next.js 15](https://nextjs.org/docs)
- [Better Auth](https://www.better-auth.com/docs)
- [Stripe](https://stripe.com/docs)
- [Google Gemini](https://ai.google.dev/docs)
- [Drizzle ORM](https://orm.drizzle.team)

### Templates de Configuração

- [Exemplos de app.config.json](config/domain-mappings.json)
- [Template de .env](.env.template)
- [GitHub Actions](.github/workflows/)

### Suporte

Se encontrar problemas:

1. ✅ Verifique este guia primeiro
2. ✅ Execute `./scripts/validate-deployment.sh`
3. ✅ Consulte logs de erro específicos
4. ✅ Teste com valores padrão

---

## 🎉 Próximos Passos

Após deploy bem-sucedido:

1. **Marketing**
   - Configure Google Analytics
   - Prepare landing page
   - Configure SEO

2. **Monitoramento**
   - Configure alertas
   - Monitor performance
   - Acompanhe uso de APIs

3. **Expansão**
   - Adicione novos tipos de processamento
   - Integre outras APIs de IA
   - Implemente novos recursos

---

**🚀 Parabéns! Seu novo app está pronto para conquistar o mundo!**