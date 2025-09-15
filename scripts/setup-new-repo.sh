#!/bin/bash

# 🔧 New Repository Setup Script
# Configura um novo repositório Git para o app duplicado

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${PURPLE}[STEP]${NC} $1"
}

# Get app configuration
get_app_info() {
    if [ -f "config/app.config.json" ]; then
        APP_NAME=$(node -pe "JSON.parse(require('fs').readFileSync('config/app.config.json', 'utf8')).appName")
        DISPLAY_NAME=$(node -pe "JSON.parse(require('fs').readFileSync('config/app.config.json', 'utf8')).displayName")
        DESCRIPTION=$(node -pe "JSON.parse(require('fs').readFileSync('config/app.config.json', 'utf8')).description")
    else
        log_error "Arquivo config/app.config.json não encontrado"
        exit 1
    fi
}

# Setup new Git repository
setup_git_repo() {
    log_step "Configurando novo repositório Git..."

    # Remove existing git history
    if [ -d ".git" ]; then
        log_warning "Removendo histórico Git existente..."
        rm -rf .git
    fi

    # Initialize new repository
    git init
    log_success "Novo repositório Git inicializado"

    # Create .gitignore if not exists
    if [ ! -f ".gitignore" ]; then
        cat > .gitignore << EOF
# Dependencies
node_modules/
.pnpm-debug.log*

# Next.js
.next/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Vercel
.vercel

# Build artifacts
dist/
build/

# Backups
backups/
*.backup
EOF
        log_success ".gitignore criado"
    fi

    # Add all files
    git add .

    # Create initial commit
    git commit -m "🎉 Initial commit for $DISPLAY_NAME

App: $APP_NAME
Description: $DESCRIPTION
Created from tattoo-preview template

Features:
- ✅ Authentication system
- ✅ Credit system
- ✅ Payment integration
- ✅ Image processing with AI
- ✅ Responsive design
- ✅ SEO optimized"

    log_success "Commit inicial criado"
}

# Setup GitHub repository
setup_github_repo() {
    log_step "Configurando repositório GitHub..."

    # Check if GitHub CLI is available
    if command -v gh &> /dev/null; then
        log_info "GitHub CLI detectado"

        read -p "Deseja criar repositório no GitHub? (y/n): " -n 1 -r
        echo

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Get repository details
            read -p "Nome do repositório [$APP_NAME]: " REPO_NAME
            REPO_NAME=${REPO_NAME:-$APP_NAME}

            read -p "Repositório público? (y/n) [n]: " -n 1 -r
            echo
            VISIBILITY="private"
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                VISIBILITY="public"
            fi

            # Create repository
            log_info "Criando repositório $REPO_NAME ($VISIBILITY)..."

            gh repo create "$REPO_NAME" \
                --description "$DESCRIPTION" \
                --$VISIBILITY \
                --source=. \
                --remote=origin \
                --push

            log_success "Repositório GitHub criado e configurado"

            # Get repository URL
            REPO_URL=$(gh repo view --json url -q .url)
            log_info "URL do repositório: $REPO_URL"

        else
            setup_remote_manually
        fi
    else
        log_warning "GitHub CLI não encontrado"
        setup_remote_manually
    fi
}

# Setup remote manually
setup_remote_manually() {
    log_step "Configuração manual do remote..."

    read -p "URL do repositório remoto (opcional): " REMOTE_URL

    if [ ! -z "$REMOTE_URL" ]; then
        git remote add origin "$REMOTE_URL"
        log_success "Remote adicionado: $REMOTE_URL"

        read -p "Fazer push inicial? (y/n): " -n 1 -r
        echo

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git branch -M main
            git push -u origin main
            log_success "Push inicial realizado"
        fi
    else
        log_info "Remote não configurado. Configure manualmente depois:"
        log_info "  git remote add origin <URL>"
        log_info "  git branch -M main"
        log_info "  git push -u origin main"
    fi
}

# Configure branch protection (if GitHub CLI available)
setup_branch_protection() {
    if command -v gh &> /dev/null && git remote get-url origin &> /dev/null; then
        read -p "Configurar proteção de branch main? (y/n): " -n 1 -r
        echo

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_step "Configurando proteção de branch..."

            gh api repos/{owner}/{repo}/branches/main/protection \
                --method PUT \
                --field required_status_checks='{"strict":true,"contexts":[]}' \
                --field enforce_admins=true \
                --field required_pull_request_reviews='{"required_approving_review_count":1}' \
                --field restrictions=null \
                2>/dev/null || log_warning "Não foi possível configurar proteção de branch"

            log_success "Proteção de branch configurada"
        fi
    fi
}

# Setup development branches
setup_dev_branches() {
    read -p "Criar branches de desenvolvimento? (y/n): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_step "Criando branches de desenvolvimento..."

        # Create and push development branch
        git checkout -b development
        git push -u origin development

        # Create and push staging branch
        git checkout -b staging
        git push -u origin staging

        # Return to main
        git checkout main

        log_success "Branches criadas: development, staging"
    fi
}

# Create issue templates
create_issue_templates() {
    read -p "Criar templates de issues? (y/n): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_step "Criando templates de issues..."

        mkdir -p .github/ISSUE_TEMPLATE

        # Bug report template
        cat > .github/ISSUE_TEMPLATE/bug_report.md << 'EOF'
---
name: Bug Report
about: Relate um bug
title: '[BUG] '
labels: bug
assignees: ''
---

## Descrição do Bug
Descrição clara e concisa do que aconteceu.

## Como Reproduzir
Passos para reproduzir o comportamento:
1. Vá para '...'
2. Clique em '...'
3. Role para baixo até '...'
4. Veja o erro

## Comportamento Esperado
Descrição clara do que você esperava que acontecesse.

## Screenshots
Se aplicável, adicione screenshots para ajudar a explicar o problema.

## Ambiente
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

## Contexto Adicional
Adicione qualquer outro contexto sobre o problema aqui.
EOF

        # Feature request template
        cat > .github/ISSUE_TEMPLATE/feature_request.md << 'EOF'
---
name: Feature Request
about: Sugira uma nova funcionalidade
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## Descrição da Funcionalidade
Descrição clara e concisa da funcionalidade desejada.

## Problema que Resolve
Que problema esta funcionalidade resolveria?

## Solução Proposta
Descrição clara da solução que você gostaria.

## Alternativas Consideradas
Descrição de soluções alternativas que você considerou.

## Contexto Adicional
Adicione qualquer outro contexto ou screenshots sobre a solução aqui.
EOF

        git add .github/
        git commit -m "📝 Add issue templates"

        if git remote get-url origin &> /dev/null; then
            git push
        fi

        log_success "Templates de issues criados"
    fi
}

# Main execution
main() {
    echo -e "${PURPLE}"
    echo "╔════════════════════════════════════════╗"
    echo "║       NEW REPOSITORY SETUP             ║"
    echo "║     Configure seu novo repositório     ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}\n"

    get_app_info

    log_info "App: $DISPLAY_NAME"
    log_info "Nome: $APP_NAME"
    log_info "Descrição: $DESCRIPTION"

    setup_git_repo
    setup_github_repo
    setup_dev_branches
    create_issue_templates

    echo -e "\n${GREEN}✅ REPOSITÓRIO CONFIGURADO COM SUCESSO!${NC}\n"

    echo -e "${BLUE}📋 Próximos passos:${NC}"
    echo -e "  1. Configure variáveis de ambiente"
    echo -e "  2. Configure CI/CD (GitHub Actions)"
    echo -e "  3. Configure deploy automático"
    echo -e "  4. Adicione colaboradores se necessário"

    echo -e "\n${PURPLE}🎉 Repositório pronto para desenvolvimento!${NC}\n"
}

# Run main function
main "$@"