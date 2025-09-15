# 🔄 App Duplication System

Sistema completo para transformar este app de tatuagem em qualquer outro app de processamento de imagens.

## 🚀 Quick Start

```bash
# 1. Configure seu app
cp config/app.config.template.json config/app.config.json
# Edite config/app.config.json com suas configurações

# 2. Execute a duplicação
./scripts/duplicate-app.sh

# 3. Configure ambiente
cp .env.template .env
# Configure suas chaves de API no .env

# 4. Teste localmente
pnpm install
pnpm run db:migrate
pnpm run dev

# 5. Valide antes do deploy
./scripts/validate-deployment.sh

# 6. Deploy!
```

## 📁 Estrutura dos Arquivos

```
scripts/
├── duplicate-app.sh          # Script principal de duplicação
├── refactor-domain.js        # Refatoração automática de código
├── setup-new-repo.sh         # Configuração de novo Git repo
└── validate-deployment.sh    # Validação pré-deploy

config/
├── app.config.template.json  # Template de configuração
└── domain-mappings.json      # Mapeamentos de domínio

docs/
├── DUPLICATION_GUIDE.md      # Guia completo passo a passo
└── DEPLOY_CHECKLIST.md       # Checklist de deploy
```

## 🎯 Tipos de App Suportados

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `photo-restoration` | Restauração de fotos | Reparar fotos antigas |
| `object-removal` | Remoção de objetos | Limpar fotos |
| `background-removal` | Remoção de fundo | Cortar pessoas/objetos |
| `face-enhancement` | Melhoria facial | Retocar retratos |
| `art-generation` | Geração de arte | Fotos → Arte |

## 🔧 Personalização

### Configuração Básica (app.config.json)

```json
{
  "appName": "seu-app",
  "displayName": "Seu App Incrível",
  "description": "Descrição do seu app",
  "domain": "seudominio.com",
  "processingType": "photo-restoration"
}
```

### Prompts Personalizados

```json
{
  "prompts": {
    "restore": "Seu prompt personalizado para restauração",
    "enhance": "Seu prompt para melhoramento"
  }
}
```

## 📚 Documentação

- **[Guia Completo](docs/DUPLICATION_GUIDE.md)** - Tutorial passo a passo
- **[Checklist de Deploy](docs/DEPLOY_CHECKLIST.md)** - Validação pré-produção

## ⚡ Features

- ✅ **Substituição automática** de termos específicos
- ✅ **Configuração por arquivo** JSON
- ✅ **Scripts de validação** automática
- ✅ **Backup automático** antes de mudanças
- ✅ **Suporte multi-domínio**
- ✅ **Deploy em múltiplas plataformas**

## 🛠 Tecnologias Mantidas

- **Framework**: Next.js 15 + TypeScript
- **Autenticação**: Better Auth
- **Banco**: PostgreSQL + Drizzle ORM
- **Pagamentos**: Stripe
- **IA**: Google Gemini
- **Styles**: Tailwind CSS + shadcn/ui

## 🎨 Exemplos de Transformação

### Antes (Tattoo App)
```
/tattoo/editor → Interface de tatuagem
TattooProcessor → Classe específica
"Adicionar Tatuagem" → Texto específico
```

### Depois (Photo Restoration)
```
/restore/editor → Interface de restauração
PhotoRestorationProcessor → Classe genérica
"Restaurar Foto" → Texto personalizado
```

## 🔒 Segurança

- ✅ Secrets não commitados
- ✅ Validação de entrada
- ✅ Rate limiting
- ✅ Headers de segurança

## 📊 Monitoramento

- Analytics integrado
- Error tracking
- Performance monitoring
- Usage metrics

## 🚀 Deploy Suportado

- **Vercel** (recomendado)
- **Railway**
- **Netlify**
- **AWS/GCP** (configuração manual)

## 💡 Exemplos de Uso

### 1. App de Restauração de Fotos
```bash
# Configure para restauração
vim config/app.config.json
# processingType: "photo-restoration"
./scripts/duplicate-app.sh
```

### 2. App de Remoção de Objetos
```bash
# Configure para remoção
vim config/app.config.json
# processingType: "object-removal"
./scripts/duplicate-app.sh
```

## 🆘 Suporte

1. **Primeiro**: Leia [DUPLICATION_GUIDE.md](docs/DUPLICATION_GUIDE.md)
2. **Validação**: Execute `./scripts/validate-deployment.sh`
3. **Troubleshooting**: Confira logs específicos
4. **Issues**: Abra issue no repositório

## 📈 Roadmap

- [ ] Suporte a mais tipos de processamento
- [ ] Integração com outras APIs de IA
- [ ] Dashboard de analytics
- [ ] A/B testing framework
- [ ] Multi-language support

---

**🎯 Objetivo**: Transformar 1 app em 10+ apps diferentes em minutos, não semanas.**