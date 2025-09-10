Vou refinar e estruturar melhor esse prompt para o aplicativo TattooPreview:

## 📱 **TattooPreview - Especificação Técnica**

### **Visão Geral**
Aplicativo web de visualização e edição de tatuagens usando IA, permitindo aos usuários experimentar virtualmente tatuagens em seus corpos através de processamento avançado de imagens.

### **Funcionalidades Principais**

#### 1. **Modos de Operação**
- **Adicionar Tatuagem**: 
  - Upload de foto do corpo + imagem de referência da tatuagem
  - Extração inteligente da tatuagem da imagem de referência
  - Posicionamento e ajuste automático no corpo do usuário
  
- **Remover Tatuagem**: 
  - Upload de foto com tatuagem existente
  - Remoção realista com reconstrução da pele
  
- **Retocar Tatuagem**: 
  - Upload de foto com tatuagem existente
  - Ajustes de cor, nitidez, contraste e definição

#### 2. **Sistema de Autenticação**
- Login via Google OAuth 2.0
- Usuários novos recebem 3 créditos gratuitos
- Perfil simplificado com contador de créditos

#### 3. **Sistema de Créditos**
- 1 crédito = 1 processamento de imagem
- Pacotes de créditos disponíveis para compra
- Integração com gateway de pagamento (Stripe/MercadoPago)

### **Arquitetura Técnica**

#### **Stack Tecnológico**
```
Frontend:
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui
- React Query

Backend:
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Supabase)
- NextAuth.js

IA/Processamento:
- Google Gemini API (Imagen/Edit)
- Sharp (pré-processamento)
- Canvas API (ajustes finos)

Infraestrutura:
- Vercel (deployment)
- Cloudinary (CDN temporário)
- Stripe/MercadoPago (pagamentos)
```

### **Fluxo de Usuário Detalhado**

1. **Landing Page**
   - Hero section com demonstração ao vivo
   - CTA para login/registro
   - Galeria de exemplos

2. **Dashboard Principal**
   - Seletor de modo (Adicionar/Remover/Retocar)
   - Upload de imagens com drag-and-drop
   - Preview em tempo real
   - Contador de créditos visível

3. **Editor de Tatuagem**
   - Controles de ajuste (tamanho, rotação, opacidade)
   - Seletor de parte do corpo
   - Preview antes/depois
   - Botão de processar

4. **Resultado**
   - Imagem processada em alta resolução
   - Opções: Download, Novo Design, Compartilhar
   - Sugestão de compra de créditos (se esgotados)

### **Prompts de IA Especializados**

#### **Para Adicionar Tatuagem:**
```
"Apply this tattoo design to the person's body with photorealistic quality. 
Considerations:
- Natural skin texture and lighting
- Proper perspective and body contours
- Realistic ink saturation and aging
- Shadow and highlight integration
- Skin tone matching
Position: [specified_body_part]
Style preservation: maintain original tattoo artistic style"
```

#### **Para Remover Tatuagem:**
```
"Remove the tattoo from this image while preserving natural skin appearance.
Requirements:
- Reconstruct underlying skin texture
- Match surrounding skin tone and patterns
- Preserve natural body marks (moles, freckles)
- Maintain consistent lighting
- No visible artifacts or blur"
```

#### **Para Retocar Tatuagem:**
```
"Enhance and restore this existing tattoo.
Adjustments needed:
- Sharpen line work
- Restore color vibrancy
- Fix fading or blur
- Enhance contrast
- Preserve original design intent
- Professional tattoo photography quality"
```

### **Considerações de UX/UI**

- **Design minimalista** com foco na imagem
- **Onboarding** rápido (3 passos máximo)
- **Feedback visual** durante processamento
- **Responsivo** mobile-first
- **Dark mode** por padrão
- **Tutoriais** em tooltip contextual

### **Modelo de Monetização**

```
Pacotes de Créditos:
- Starter: 5 créditos - R$ 9,90
- Popular: 15 créditos - R$ 24,90
- Pro: 40 créditos - R$ 49,90
- Studio: 100 créditos - R$ 99,90
```

**Melhorias**
- Editor avançado de posicionamento
- Múltiplos estilos de processamento
- Gateway de pagamento
- Analytics básico

**Expansão**
- Galeria de usuários (opcional)
- Biblioteca de designs
- API para parceiros
- App mobile nativo

### **Métricas de Sucesso**
- Taxa de conversão free-to-paid > 15%
- Retenção D7 > 40%
- NPS > 8
- Tempo médio de processamento < 10s

### **Compliance e Segurança**
- LGPD/GDPR compliance
- Termos de uso claros sobre direitos de imagem
- Processamento server-side (sem exposição de API keys)
- Rate limiting por usuário
- Validação de conteúdo (NSFW filter)