# 🎨 **TattooPreview** - AI-Powered Tattoo Visualization

> Experimente tatuagens virtualmente com qualidade fotorrealista usando Google Gemini 2.5 Flash Image Preview

TattooPreview é uma aplicação web que permite aos usuários visualizar como tatuagens ficariam em seus corpos usando IA avançada, oferecendo uma experiência realista antes de tomar a decisão de tatuar.

## 🚀 Funcionalidades Principais

- 🎯 **Adicionar Tatuagem**: Aplique designs de tatuagem em fotos do corpo com realismo fotográfico
- 🔄 **Remover Tatuagem**: Remova digitalmente tatuagens existentes reconstruindo a pele natural  
- ✨ **Retocar Tatuagem**: Melhore a qualidade, cores e nitidez de tatuagens existentes
- 💳 **Sistema de Créditos**: Monetização com 3 créditos grátis + pacotes pagos via Stripe
- 🔐 **Autenticação Google**: Login seguro via Google OAuth com Better Auth
- 📱 **Mobile First**: Interface responsiva otimizada para dispositivos móveis
- 🤖 **Google Gemini AI**: Powered by Gemini 2.5 Flash Image Preview (nano-banana)

## 🎥 Video Tutorial

Watch the complete walkthrough of this agentic coding template:

[![Agentic Coding Boilerplate Tutorial](https://img.youtube.com/vi/T0zFZsr_d0Q/maxresdefault.jpg)](https://youtu.be/T0zFZsr_d0Q)

<a href="https://youtu.be/T0zFZsr_d0Q" target="_blank" rel="noopener noreferrer">🔗 Watch on YouTube</a>

## ☕ Support This Project

If this boilerplate helped you build something awesome, consider buying me a coffee!

[![Buy me a coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/leonvanzyl)

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js**: Version 18.0 or higher (<a href="https://nodejs.org/" target="_blank">Download here</a>)
- **Git**: For cloning the repository (<a href="https://git-scm.com/" target="_blank">Download here</a>)
- **PostgreSQL**: Either locally installed or access to a hosted service like Vercel Postgres

## 🛠️ Quick Setup

### 1. Clone or Download the Repository

**Option A: Clone with Git**

```bash
git clone https://github.com/leonvanzyl/agentic-coding-starter-kit.git
cd agentic-coding-starter-kit
```

**Option B: Download ZIP**
Download the repository as a ZIP file and extract it to your desired location.

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp env.example .env
```

Fill in your environment variables in the `.env` file:

```env
# Database
POSTGRES_URL="postgresql://username:password@localhost:5432/your_database_name"

# Authentication - Better Auth
BETTER_AUTH_SECRET="your-random-32-character-secret-key-here"

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Integration (Optional - for chat functionality)
OPENAI_API_KEY="sk-your-openai-api-key-here"
OPENAI_MODEL="gpt-5-mini"

# App URL (for production deployments)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup

Generate and run database migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start the Development Server

```bash
npm run dev
```

Your application will be available at [http://localhost:3000](http://localhost:3000)

## ⚙️ Service Configuration

### PostgreSQL Database on Vercel

1. Go to <a href="https://vercel.com/dashboard" target="_blank">Vercel Dashboard</a>
2. Navigate to the **Storage** tab
3. Click **Create** → **Postgres**
4. Choose your database name and region
5. Copy the `POSTGRES_URL` from the `.env.local` tab
6. Add it to your `.env` file

### Google OAuth Credentials

1. Go to <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a>
2. Create a new project or select an existing one
3. Navigate to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. Set application type to **Web application**
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy the **Client ID** and **Client Secret** to your `.env` file

### OpenAI API Key

1. Go to <a href="https://platform.openai.com/dashboard" target="_blank">OpenAI Platform</a>
2. Navigate to **API Keys** in the sidebar
3. Click **Create new secret key**
4. Give it a name and copy the key
5. Add it to your `.env` file as `OPENAI_API_KEY`

## 🗂️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── chat/          # AI chat endpoint
│   ├── chat/              # AI chat page
│   ├── dashboard/         # User dashboard
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── ui/               # shadcn/ui components
└── lib/                  # Utilities and configurations
    ├── auth.ts           # Better Auth configuration
    ├── auth-client.ts    # Client-side auth utilities
    ├── db.ts             # Database connection
    ├── schema.ts         # Database schema
    └── utils.ts          # General utilities
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio (database GUI)
npm run db:dev       # Push schema for development
npm run db:reset     # Reset database (drop all tables)
```

## 📖 Pages Overview

- **Home (`/`)**: Landing page with setup instructions and features overview
- **Dashboard (`/dashboard`)**: Protected user dashboard with profile information
- **Chat (`/chat`)**: AI-powered chat interface using OpenAI (requires authentication)

## 🚀 Deploy na Vercel

### 1. Preparar Repositório

```bash
git add .
git commit -m "prepare for vercel deployment"
git push origin master
```

### 2. Deploy to Vercel (Recommended)

1. **Conectar no Vercel**: Importe o projeto do GitHub na Vercel
2. **Configure Environment Variables**:

```env
# Database
POSTGRES_URL=postgresql://username:password@host:5432/database?sslmode=require

# Authentication - Better Auth
BETTER_AUTH_SECRET=your-secure-random-32-character-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Stripe Payment Integration
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 3. Configurar Webhook do Stripe

**IMPORTANTE**: Após o deploy, configure o webhook no Stripe Dashboard:

1. **Acesse**: [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. **Clique**: "Add endpoint"
3. **Configure**:
   - **URL**: `https://your-domain.vercel.app/api/stripe/webhook`
   - **Events**: Selecione `checkout.session.completed`
   - **Description**: "TattooPreview - Credits Purchase"
4. **Copy signing secret** e adicione como `STRIPE_WEBHOOK_SECRET` na Vercel

### 4. Inicializar Sistema

Após o primeiro deploy, acesse:
- `https://your-domain.vercel.app/api/stripe/setup` - Criar produtos no Stripe

### 5. Teste o Sistema

1. **Faça login** com sua conta Google
2. **Compre créditos** usando um cartão de teste do Stripe
3. **Verifique** se os créditos são adicionados corretamente após o pagamento

## 💳 Sistema de Créditos

- **Gratuitos**: 3 créditos por usuário novo
- **Pacotes Pagos**:
  - Starter: 5 créditos - $9.90
  - Popular: 15 créditos - $24.90  
  - Pro: 40 créditos - $49.90
  - Studio: 100 créditos - $99.90

## 🔧 API Routes

- `POST /api/stripe/checkout` - Criar sessão de pagamento
- `POST /api/stripe/webhook` - Webhook do Stripe (produção)
- `POST /api/stripe/setup` - Inicializar produtos no Stripe
- `POST /api/tattoo/process` - Processar imagem com IA
- `GET /api/credits` - Obter créditos do usuário
- `GET /api/debug/session` - Debug de sessão (desenvolvimento)

## 🎥 Tutorial Video

Watch my comprehensive tutorial on how to use this agentic coding boilerplate to build AI-powered applications:

<a href="https://youtu.be/T0zFZsr_d0Q" target="_blank" rel="noopener noreferrer">📺 YouTube Tutorial - Building with Agentic Coding Boilerplate</a>

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Need Help?

If you encounter any issues:

1. Check the [Issues](https://github.com/leonvanzyl/agentic-coding-starter-kit/issues) section
2. Review the documentation above
3. Create a new issue with detailed information about your problem

---

**Happy coding! 🚀**
