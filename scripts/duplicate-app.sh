#!/bin/bash

# 🚀 App Duplication Script
# Duplica e transforma o app para um novo domínio

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$PROJECT_ROOT/config/app.config.json"
BACKUP_DIR="$HOME/app-backups/$(date +%Y%m%d_%H%M%S)"

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

# Validate prerequisites
validate_prerequisites() {
    log_step "Validando pré-requisitos..."

    # Check if git is available
    if ! command -v git &> /dev/null; then
        log_error "Git não está instalado"
        exit 1
    fi

    # Check if node is available
    if ! command -v node &> /dev/null; then
        log_error "Node.js não está instalado"
        exit 1
    fi

    # Check if we're in git repo
    if ! git rev-parse --git-dir &> /dev/null; then
        log_error "Não está em um repositório Git"
        exit 1
    fi

    # Check if config file exists
    if [ ! -f "$CONFIG_FILE" ]; then
        log_error "Arquivo de configuração não encontrado: $CONFIG_FILE"
        log_info "Execute: cp config/app.config.template.json config/app.config.json"
        exit 1
    fi

    log_success "Pré-requisitos validados"
}

# Create backup
create_backup() {
    log_step "Criando backup do projeto atual..."

    mkdir -p "$BACKUP_DIR"

    # Copy entire project (excluding node_modules and .git)
    rsync -av --exclude='node_modules' --exclude='.git' --exclude='.next' "$PROJECT_ROOT/" "$BACKUP_DIR/"

    log_success "Backup criado em: $BACKUP_DIR"
}

# Parse configuration
parse_config() {
    log_step "Lendo configuração..."

    # Extract config values using node
    export NEW_APP_NAME=$(node -pe "JSON.parse(require('fs').readFileSync('$CONFIG_FILE', 'utf8')).appName")
    export NEW_DOMAIN=$(node -pe "JSON.parse(require('fs').readFileSync('$CONFIG_FILE', 'utf8')).domain")
    export NEW_DESCRIPTION=$(node -pe "JSON.parse(require('fs').readFileSync('$CONFIG_FILE', 'utf8')).description")
    export OLD_DOMAIN=$(node -pe "JSON.parse(require('fs').readFileSync('$CONFIG_FILE', 'utf8')).oldDomain")
    export PROCESSING_TYPE=$(node -pe "JSON.parse(require('fs').readFileSync('$CONFIG_FILE', 'utf8')).processingType")

    log_info "App: $NEW_APP_NAME"
    log_info "Domínio: $NEW_DOMAIN"
    log_info "Tipo: $PROCESSING_TYPE"
    log_success "Configuração carregada"
}

# Update package.json
update_package_json() {
    log_step "Atualizando package.json..."

    # Create backup
    cp package.json package.json.backup

    # Update name and description
    node -e "
        const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
        pkg.name = '$NEW_APP_NAME';
        pkg.description = '$NEW_DESCRIPTION';
        require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "

    log_success "package.json atualizado"
}

# Run domain refactoring
run_refactoring() {
    log_step "Executando refatoração de domínio..."

    if [ -f "$SCRIPT_DIR/refactor-domain.js" ]; then
        node "$SCRIPT_DIR/refactor-domain.js"
        log_success "Refatoração concluída"
    else
        log_warning "Script de refatoração não encontrado"
    fi
}

# Create new git repository
setup_new_git() {
    log_step "Configurando novo repositório Git..."

    read -p "Deseja criar um novo repositório Git? (y/n): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Remove existing git history
        rm -rf .git

        # Initialize new repository
        git init
        git add .
        git commit -m "🎉 Initial commit for $NEW_APP_NAME

Created from tattoo-preview template
Domain: $NEW_DOMAIN
Type: $PROCESSING_TYPE"

        log_success "Novo repositório Git criado"

        # Add remote if provided
        read -p "URL do repositório remoto (opcional): " REMOTE_URL
        if [ ! -z "$REMOTE_URL" ]; then
            git remote add origin "$REMOTE_URL"
            log_success "Remote adicionado: $REMOTE_URL"
        fi
    fi
}

# Create environment template
create_env_template() {
    log_step "Criando template de variáveis de ambiente..."

    cat > .env.template << EOF
# ================================
# $NEW_APP_NAME - Environment Variables
# ================================

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/$NEW_APP_NAME"

# Authentication
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="https://$NEW_DOMAIN"

# Google AI (Gemini)
GEMINI_API_KEY="your-gemini-api-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App Configuration
NEXT_PUBLIC_APP_URL="https://$NEW_DOMAIN"
NEXT_PUBLIC_APP_NAME="$NEW_APP_NAME"

# Optional: Analytics
NEXT_PUBLIC_GA_ID=""
VERCEL_ANALYTICS_ID=""
EOF

    log_success "Template .env.template criado"
}

# Summary and next steps
show_summary() {
    log_step "Resumo da duplicação"

    echo -e "\n${GREEN}✅ DUPLICAÇÃO CONCLUÍDA!${NC}\n"

    echo -e "${BLUE}📊 Detalhes:${NC}"
    echo -e "  • App: ${GREEN}$NEW_APP_NAME${NC}"
    echo -e "  • Domínio: ${GREEN}$NEW_DOMAIN${NC}"
    echo -e "  • Tipo: ${GREEN}$PROCESSING_TYPE${NC}"
    echo -e "  • Backup: ${GREEN}$BACKUP_DIR${NC}"

    echo -e "\n${YELLOW}📋 Próximos passos:${NC}"
    echo -e "  1. Configure .env baseado em .env.template"
    echo -e "  2. Instale dependências: ${BLUE}pnpm install${NC}"
    echo -e "  3. Configure banco de dados: ${BLUE}pnpm run db:migrate${NC}"
    echo -e "  4. Teste localmente: ${BLUE}pnpm run dev${NC}"
    echo -e "  5. Configure deploy (Vercel/Railway)"
    echo -e "  6. Configure domínio customizado"
    echo -e "  7. Configure webhooks do Stripe"

    echo -e "\n${PURPLE}📚 Documentação:${NC} docs/DUPLICATION_GUIDE.md"
    echo -e "\n${GREEN}🎉 Boa sorte com seu novo app!${NC}\n"
}

# Main execution
main() {
    echo -e "${PURPLE}"
    echo "╔════════════════════════════════════════╗"
    echo "║        APP DUPLICATION SCRIPT          ║"
    echo "║     Transforme seu app facilmente      ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}\n"

    validate_prerequisites
    parse_config
    create_backup
    update_package_json
    run_refactoring
    create_env_template
    setup_new_git
    show_summary
}

# Handle interruption
trap 'log_error "Script interrompido. Restaure o backup se necessário: $BACKUP_DIR"; exit 1' INT

# Run main function
main "$@"