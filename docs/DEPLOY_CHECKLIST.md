# 🚀 Checklist de Deploy Completo

Use este checklist para garantir que seu app está 100% pronto para produção.

## 📋 Pré-Deploy

### ✅ Configuração Base
- [ ] `config/app.config.json` configurado corretamente
- [ ] `.env` criado a partir do template
- [ ] Todas as chaves de API configuradas
- [ ] `package.json` atualizado com nome/descrição corretos
- [ ] Scripts de build/start funcionando

### ✅ Banco de Dados
- [ ] DATABASE_URL configurada
- [ ] Migrações executadas (`pnpm run db:migrate`)
- [ ] Conexão testada (`pnpm run db:studio`)
- [ ] Backup criado (se app existente)

### ✅ Autenticação
- [ ] BETTER_AUTH_SECRET gerado (32+ chars)
- [ ] BETTER_AUTH_URL configurada corretamente
- [ ] Providers OAuth configurados (Google)
- [ ] Teste de login/logout funcionando

### ✅ Processamento IA
- [ ] GEMINI_API_KEY válida
- [ ] Cota da API suficiente
- [ ] Teste de processamento funcionando
- [ ] Prompts personalizados implementados

### ✅ Pagamentos (Stripe)
- [ ] Chaves de API configuradas (test/live)
- [ ] Webhook endpoint configurado
- [ ] Eventos de webhook testados
- [ ] Produtos/preços criados no Stripe
- [ ] Teste de compra com cartão teste

---

## 🧪 Testes Locais

### ✅ Funcionalidades Core
- [ ] Página inicial carrega sem erros
- [ ] Upload de imagens funciona
- [ ] Processamento de IA retorna resultado
- [ ] Download de resultado funciona
- [ ] Sistema de créditos funciona
- [ ] Compra de créditos funciona

### ✅ Autenticação
- [ ] Login com Google funciona
- [ ] Logout funciona
- [ ] Redirecionamento após login funciona
- [ ] Proteção de rotas funciona

### ✅ Build e Performance
- [ ] `pnpm run build` sem erros
- [ ] `pnpm run start` funciona
- [ ] `pnpm run typecheck` sem erros
- [ ] `pnpm run lint` sem erros
- [ ] Performance aceitável (< 3s load)

---

## 🌐 Configuração de Serviços

### ✅ Hospedagem (Vercel/Railway)
- [ ] Projeto criado na plataforma
- [ ] Repositório conectado
- [ ] Variáveis de ambiente configuradas
- [ ] Build automático funcionando
- [ ] Deploy de teste realizado

### ✅ Domínio
- [ ] Domínio registrado
- [ ] DNS configurado para apontar para hospedagem
- [ ] SSL/TLS configurado
- [ ] Redirecionamento www configurado (opcional)

### ✅ Monitoramento
- [ ] Google Analytics configurado (opcional)
- [ ] Vercel Analytics habilitado (opcional)
- [ ] Error tracking configurado (Sentry opcional)

---

## 🚀 Deploy em Produção

### ✅ Variáveis de Ambiente Produção
```bash
# Confirme que estão configuradas:
- DATABASE_URL (produção)
- BETTER_AUTH_SECRET (forte)
- BETTER_AUTH_URL (domínio correto)
- GEMINI_API_KEY (produção)
- STRIPE_SECRET_KEY (live)
- STRIPE_PUBLISHABLE_KEY (live)
- STRIPE_WEBHOOK_SECRET (live)
- NEXT_PUBLIC_APP_URL (domínio correto)
```

### ✅ Stripe Produção
- [ ] Conta Stripe ativada
- [ ] Chaves live configuradas
- [ ] Webhook em produção configurado
- [ ] Teste com cartão real (pequeno valor)

### ✅ Security
- [ ] Secrets não expostos no código
- [ ] HTTPS forçado
- [ ] Headers de segurança configurados
- [ ] Rate limiting implementado (se necessário)

---

## ✅ Pós-Deploy

### ✅ Validação Funcional
- [ ] Site acessível via domínio
- [ ] Login funciona
- [ ] Upload funciona
- [ ] Processamento funciona
- [ ] Pagamento funciona
- [ ] Webhook Stripe funciona

### ✅ Performance
- [ ] Core Web Vitals aceitáveis
- [ ] Lighthouse Score > 80
- [ ] Mobile responsivo
- [ ] Carregamento < 3 segundos

### ✅ SEO
- [ ] Meta tags corretas
- [ ] Sitemap acessível (`/sitemap.xml`)
- [ ] Robots.txt configurado (`/robots.txt`)
- [ ] Schema markup implementado
- [ ] Google Search Console configurado

### ✅ Analytics
- [ ] Google Analytics rastreando
- [ ] Conversion tracking configurado
- [ ] Error monitoring funcionando

---

## 📊 Métricas de Sucesso

### Performance Targets
- [ ] **First Contentful Paint**: < 1.5s
- [ ] **Largest Contentful Paint**: < 2.5s
- [ ] **Cumulative Layout Shift**: < 0.1
- [ ] **First Input Delay**: < 100ms

### Funcionalidade
- [ ] **Uptime**: > 99.9%
- [ ] **Error Rate**: < 1%
- [ ] **Conversion Rate**: Tracking implementado

---

## 🆘 Rollback Plan

### Se algo der errado:
1. **Identifique o problema**
   - [ ] Verifique logs da aplicação
   - [ ] Teste funcionalidades críticas
   - [ ] Verifique métricas

2. **Rollback rápido**
   - [ ] Reverta deploy na plataforma
   - [ ] Confirme que versão anterior funciona
   - [ ] Comunique stakeholders

3. **Análise pós-incidente**
   - [ ] Identifique causa raiz
   - [ ] Documente lições aprendidas
   - [ ] Implemente melhorias

---

## 📝 Documentação Final

### ✅ Documentação Atualizada
- [ ] README.md atualizado
- [ ] API documentation (se aplicável)
- [ ] Deployment instructions
- [ ] Troubleshooting guide

### ✅ Handover
- [ ] Credenciais organizadas
- [ ] Acesso às plataformas documentado
- [ ] Contatos de emergência definidos
- [ ] Procedimentos de manutenção documentados

---

## 🎯 Script de Validação Automática

Execute antes do deploy:

```bash
# Validação completa
./scripts/validate-deployment.sh

# Se todos os checks passarem, você está pronto!
```

---

## 📞 Contatos de Emergência

### Serviços Críticos
- **Hospedagem**: [Plataforma] Support
- **Domínio**: [Registrar] Support
- **Pagamentos**: Stripe Support
- **IA**: Google Cloud Support

### Checklist Rápido de Emergência
- [ ] Site está no ar?
- [ ] Login funciona?
- [ ] Processamento funciona?
- [ ] Pagamentos funcionam?

---

**🎉 Parabéns! Se todos os itens foram checados, seu app está pronto para conquistar o mundo!**

> **Dica**: Salve este checklist como template para futuros deploys.