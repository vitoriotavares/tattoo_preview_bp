#!/bin/bash

# 🔄 Clone and Duplicate Script
# Cria uma cópia externa do projeto e transforma

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

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$SOURCE_DIR/config/app.config.json"

# Parse command line arguments
NEW_APP_DIR=""
CONFIG_ONLY=false

show_help() {
    echo -e "${PURPLE}Usage:${NC} $0 [OPTIONS] <target_directory>"
    echo ""
    echo -e "${BLUE}Arguments:${NC}"
    echo "  target_directory    Diretório onde criar o novo app"
    echo ""
    echo -e "${BLUE}Options:${NC}"
    echo "  -c, --config-only   Apenas copiar e não executar transformação"
    echo "  -h, --help          Mostrar esta ajuda"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  $0 ../photo-restoration-app"
    echo "  $0 /path/to/new-app"
    echo "  $0 --config-only ../my-new-app"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--config-only)
            CONFIG_ONLY=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        -*)
            log_error "Opção desconhecida: $1"
            show_help
            exit 1
            ;;
        *)
            if [ -z "$NEW_APP_DIR" ]; then
                NEW_APP_DIR="$1"
            else
                log_error "Múltiplos diretórios especificados"
                show_help
                exit 1
            fi
            shift
            ;;
    esac
done

# Validate arguments
if [ -z "$NEW_APP_DIR" ]; then
    log_error "Diretório de destino é obrigatório"
    show_help
    exit 1
fi

# Convert to absolute path (create parent if needed for realpath)
mkdir -p "$(dirname "$NEW_APP_DIR")"
NEW_APP_DIR=$(realpath "$NEW_APP_DIR" 2>/dev/null || echo "$NEW_APP_DIR")

# Get app configuration
get_app_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        log_error "Arquivo de configuração não encontrado: $CONFIG_FILE"
        log_info "Execute: cp config/app.config.template.json config/app.config.json"
        exit 1
    fi

    APP_NAME=$(node -pe "JSON.parse(require('fs').readFileSync('$CONFIG_FILE', 'utf8')).appName")
    DISPLAY_NAME=$(node -pe "JSON.parse(require('fs').readFileSync('$CONFIG_FILE', 'utf8')).displayName")
    DOMAIN=$(node -pe "JSON.parse(require('fs').readFileSync('$CONFIG_FILE', 'utf8')).domain")
}

# Create project copy
create_project_copy() {
    log_step "Criando cópia do projeto..."

    # Check if target directory exists
    if [ -d "$NEW_APP_DIR" ]; then
        read -p "Diretório '$NEW_APP_DIR' já existe. Sobrescrever? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Operação cancelada"
            exit 1
        fi
        rm -rf "$NEW_APP_DIR"
    fi

    # Create parent directory if needed
    mkdir -p "$(dirname "$NEW_APP_DIR")"

    # Copy project (excluding specific directories)
    log_info "Copiando arquivos..."
    rsync -av \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='.git' \
        --exclude='dist' \
        --exclude='build' \
        --exclude='.env' \
        --exclude='.env.local' \
        --exclude='*.log' \
        --exclude='.vercel' \
        "$SOURCE_DIR/" "$NEW_APP_DIR/"

    log_success "Projeto copiado para: $NEW_APP_DIR"
}

# Update project configuration
update_project_config() {
    cd "$NEW_APP_DIR"

    log_step "Atualizando configuração do projeto..."

    # Update package.json
    if [ -f "package.json" ]; then
        node -e "
            const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
            pkg.name = '$APP_NAME';
            pkg.description = '$DISPLAY_NAME';
            require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        "
        log_success "package.json atualizado"
    fi

    # Create .env from template
    if [ -f ".env.template" ]; then
        cp .env.template .env

        # Update domain references in .env
        sed -i.bak "s/yourdomain\.com/$DOMAIN/g" .env
        sed -i.bak "s/Your App Name/$DISPLAY_NAME/g" .env
        rm .env.bak

        log_success ".env criado a partir do template"
    fi
}

# Run transformation
run_transformation() {
    if [ "$CONFIG_ONLY" = true ]; then
        log_warning "Modo --config-only: pulando transformação"
        return
    fi

    log_step "Executando transformação..."

    cd "$NEW_APP_DIR"

    # Run the refactoring script
    if [ -f "scripts/refactor-domain.js" ]; then
        node scripts/refactor-domain.js
        log_success "Transformação de domínio concluída"
    else
        log_warning "Script de refatoração não encontrado"
    fi
}

# Initialize new git repository
init_git_repo() {
    cd "$NEW_APP_DIR"

    log_step "Inicializando novo repositório Git..."

    # Remove any existing git history
    rm -rf .git

    # Initialize new repository
    git init
    git add .
    git commit -m "🎉 Initial commit for $DISPLAY_NAME

Created from tattoo-preview template
Domain: $DOMAIN
App: $APP_NAME

Features:
- ✅ Authentication system
- ✅ Credit system
- ✅ Payment integration
- ✅ Image processing with AI
- ✅ Responsive design
- ✅ SEO optimized"

    log_success "Novo repositório Git inicializado"
}

# Show instructions
show_next_steps() {
    log_step "Próximos passos"

    echo -e "\n${GREEN}✅ CÓPIA CRIADA COM SUCESSO!${NC}\n"

    echo -e "${BLUE}📍 Localização:${NC} $NEW_APP_DIR"
    echo -e "${BLUE}📊 App:${NC} $DISPLAY_NAME"
    echo -e "${BLUE}🌐 Domínio:${NC} $DOMAIN"

    echo -e "\n${YELLOW}📋 Próximos passos:${NC}"
    echo -e "  1. ${BLUE}cd $NEW_APP_DIR${NC}"
    echo -e "  2. Configure o .env com suas chaves de API"
    echo -e "  3. ${BLUE}pnpm install${NC}"
    echo -e "  4. ${BLUE}pnpm run db:migrate${NC}"
    echo -e "  5. ${BLUE}pnpm run dev${NC}"
    echo -e "  6. Valide: ${BLUE}./scripts/validate-deployment.sh${NC}"

    if [ "$CONFIG_ONLY" = true ]; then
        echo -e "\n${YELLOW}⚠️  Modo config-only ativo${NC}"
        echo -e "  Execute a transformação manualmente:"
        echo -e "  ${BLUE}node scripts/refactor-domain.js${NC}"
    fi

    echo -e "\n${PURPLE}📚 Documentação:${NC} docs/DUPLICATION_GUIDE.md"
    echo -e "\n${GREEN}🎉 Seu novo app está pronto!${NC}\n"
}

# Main execution
main() {
    echo -e "${PURPLE}"
    echo "╔════════════════════════════════════════╗"
    echo "║        CLONE & DUPLICATE SCRIPT        ║"
    echo "║       Crie uma cópia externa           ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}\n"

    # Validate prerequisites
    if ! command -v node &> /dev/null; then
        log_error "Node.js não está instalado"
        exit 1
    fi

    if ! command -v git &> /dev/null; then
        log_error "Git não está instalado"
        exit 1
    fi

    # Get configuration
    get_app_config

    log_info "Configuração carregada:"
    log_info "  App: $DISPLAY_NAME"
    log_info "  Nome: $APP_NAME"
    log_info "  Domínio: $DOMAIN"
    log_info "  Destino: $NEW_APP_DIR"

    # Execute steps
    create_project_copy
    update_project_config
    run_transformation
    init_git_repo
    show_next_steps
}

# Handle interruption
trap 'log_error "Script interrompido"; exit 1' INT

# Run main function
main "$@"