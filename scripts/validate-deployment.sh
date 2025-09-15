#!/bin/bash

# 🔍 Deployment Validation Script
# Valida configurações antes do deploy

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

# Validation results
VALIDATION_RESULTS=()
ERROR_COUNT=0
WARNING_COUNT=0

add_result() {
    local status=$1
    local message=$2

    VALIDATION_RESULTS+=("$status:$message")

    if [ "$status" = "ERROR" ]; then
        ((ERROR_COUNT++))
        log_error "$message"
    elif [ "$status" = "WARNING" ]; then
        ((WARNING_COUNT++))
        log_warning "$message"
    else
        log_success "$message"
    fi
}

# Check if file exists
check_file() {
    local file=$1
    local description=$2
    local required=${3:-true}

    if [ -f "$file" ]; then
        add_result "SUCCESS" "$description encontrado"
    else
        if [ "$required" = "true" ]; then
            add_result "ERROR" "$description não encontrado: $file"
        else
            add_result "WARNING" "$description não encontrado (opcional): $file"
        fi
    fi
}

# Check environment variables in .env
check_env_vars() {
    log_step "Validando variáveis de ambiente..."

    if [ ! -f ".env" ]; then
        add_result "ERROR" "Arquivo .env não encontrado"
        return
    fi

    # Required variables
    local required_vars=(
        "DATABASE_URL"
        "BETTER_AUTH_SECRET"
        "BETTER_AUTH_URL"
        "GEMINI_API_KEY"
        "STRIPE_SECRET_KEY"
        "STRIPE_PUBLISHABLE_KEY"
    )

    # Optional variables
    local optional_vars=(
        "STRIPE_WEBHOOK_SECRET"
        "NEXT_PUBLIC_GA_ID"
        "VERCEL_ANALYTICS_ID"
    )

    # Check required variables
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env && ! grep -q "^$var=$" .env; then
            add_result "SUCCESS" "Variável $var configurada"
        else
            add_result "ERROR" "Variável $var não configurada ou vazia"
        fi
    done

    # Check optional variables
    for var in "${optional_vars[@]}"; do
        if grep -q "^$var=" .env && ! grep -q "^$var=$" .env; then
            add_result "SUCCESS" "Variável opcional $var configurada"
        else
            add_result "WARNING" "Variável opcional $var não configurada"
        fi
    done
}

# Check configuration files
check_config_files() {
    log_step "Validando arquivos de configuração..."

    check_file "package.json" "Package.json"
    check_file "next.config.js" "Next.js config" false
    check_file "tailwind.config.js" "Tailwind config"
    check_file "drizzle.config.ts" "Drizzle config"
    check_file "config/app.config.json" "App config"

    # Check package.json structure
    if [ -f "package.json" ]; then
        if node -pe "JSON.parse(require('fs').readFileSync('package.json', 'utf8')).name" &>/dev/null; then
            add_result "SUCCESS" "Package.json válido"
        else
            add_result "ERROR" "Package.json inválido"
        fi
    fi
}

# Check dependencies
check_dependencies() {
    log_step "Validando dependências..."

    if [ -f "package.json" ]; then
        # Check if node_modules exists
        if [ -d "node_modules" ]; then
            add_result "SUCCESS" "Node modules instalados"
        else
            add_result "WARNING" "Node modules não encontrados - execute: pnpm install"
        fi

        # Check critical dependencies
        local critical_deps=(
            "next"
            "react"
            "drizzle-orm"
            "better-auth"
            "stripe"
            "@google/genai"
        )

        for dep in "${critical_deps[@]}"; do
            if node -pe "JSON.parse(require('fs').readFileSync('package.json', 'utf8')).dependencies['$dep']" &>/dev/null; then
                add_result "SUCCESS" "Dependência $dep encontrada"
            else
                add_result "ERROR" "Dependência crítica $dep não encontrada"
            fi
        done
    fi
}

# Check build
check_build() {
    log_step "Validando build..."

    if [ -d "node_modules" ]; then
        log_info "Tentando build..."

        if npm run build &>/dev/null; then
            add_result "SUCCESS" "Build executado com sucesso"
        else
            add_result "ERROR" "Build falhou - execute: npm run build"
        fi
    else
        add_result "WARNING" "Não é possível testar build - instale dependências primeiro"
    fi
}

# Check TypeScript
check_typescript() {
    log_step "Validando TypeScript..."

    if [ -f "tsconfig.json" ]; then
        add_result "SUCCESS" "tsconfig.json encontrado"

        if command -v tsc &> /dev/null || [ -f "node_modules/.bin/tsc" ]; then
            if npx tsc --noEmit &>/dev/null; then
                add_result "SUCCESS" "TypeScript compilou sem erros"
            else
                add_result "ERROR" "Erros de TypeScript encontrados - execute: npm run typecheck"
            fi
        else
            add_result "WARNING" "TypeScript não disponível para validação"
        fi
    else
        add_result "WARNING" "tsconfig.json não encontrado"
    fi
}

# Check database
check_database() {
    log_step "Validando configuração do banco..."

    check_file "drizzle.config.ts" "Configuração Drizzle"
    check_file "src/lib/db.ts" "Conexão com banco"
    check_file "src/lib/schema.ts" "Schema do banco"

    # Check migrations
    if [ -d "drizzle" ]; then
        local migration_count=$(find drizzle -name "*.sql" | wc -l)
        if [ "$migration_count" -gt 0 ]; then
            add_result "SUCCESS" "Migrações encontradas ($migration_count arquivos)"
        else
            add_result "WARNING" "Nenhuma migração encontrada"
        fi
    else
        add_result "WARNING" "Diretório de migrações não encontrado"
    fi
}

# Check API routes
check_api_routes() {
    log_step "Validando rotas da API..."

    # Check critical API routes
    local api_routes=(
        "src/app/api/auth"
        "src/app/api/credits"
        "src/app/api/stripe"
    )

    for route in "${api_routes[@]}"; do
        if [ -d "$route" ]; then
            add_result "SUCCESS" "Rota API $route encontrada"
        else
            add_result "ERROR" "Rota API crítica não encontrada: $route"
        fi
    done

    # Check processor route
    if [ -f "src/app/api/tattoo/process/route.ts" ] || find src/app/api -name "process" -type d | grep -q .; then
        add_result "SUCCESS" "Rota de processamento encontrada"
    else
        add_result "ERROR" "Rota de processamento não encontrada"
    fi
}

# Check security
check_security() {
    log_step "Validando segurança..."

    # Check if secrets are not in git
    if git rev-parse --git-dir &> /dev/null; then
        if git ls-files | grep -q "\.env$"; then
            add_result "ERROR" "Arquivo .env está no controle de versão - remova imediatamente!"
        else
            add_result "SUCCESS" "Arquivo .env não está no controle de versão"
        fi

        if git ls-files | grep -q "\.env\."; then
            add_result "WARNING" "Arquivos .env.* podem conter dados sensíveis"
        fi
    fi

    # Check .gitignore
    if [ -f ".gitignore" ]; then
        if grep -q "\.env" .gitignore; then
            add_result "SUCCESS" ".env está no .gitignore"
        else
            add_result "ERROR" ".env não está no .gitignore"
        fi
    else
        add_result "ERROR" ".gitignore não encontrado"
    fi
}

# Check deployment platform readiness
check_deployment_readiness() {
    log_step "Validando preparação para deploy..."

    # Check for Vercel
    if [ -f "vercel.json" ]; then
        add_result "SUCCESS" "Configuração Vercel encontrada"
    else
        add_result "WARNING" "Configuração Vercel não encontrada (opcional)"
    fi

    # Check build script
    if node -pe "JSON.parse(require('fs').readFileSync('package.json', 'utf8')).scripts.build" &>/dev/null; then
        add_result "SUCCESS" "Script de build configurado"
    else
        add_result "ERROR" "Script de build não encontrado no package.json"
    fi

    # Check start script
    if node -pe "JSON.parse(require('fs').readFileSync('package.json', 'utf8')).scripts.start" &>/dev/null; then
        add_result "SUCCESS" "Script de start configurado"
    else
        add_result "ERROR" "Script de start não encontrado no package.json"
    fi
}

# Generate summary report
generate_summary() {
    log_step "Resumo da Validação"

    echo -e "\n${PURPLE}═══════════════════════════════════════${NC}"
    echo -e "${PURPLE}           RELATÓRIO DE VALIDAÇÃO        ${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════${NC}\n"

    # Overall status
    if [ $ERROR_COUNT -eq 0 ]; then
        if [ $WARNING_COUNT -eq 0 ]; then
            echo -e "${GREEN}✅ TUDO PERFEITO! Pronto para deploy${NC}\n"
        else
            echo -e "${YELLOW}⚠️  PRONTO COM AVISOS ($WARNING_COUNT warnings)${NC}\n"
        fi
    else
        echo -e "${RED}❌ PROBLEMAS ENCONTRADOS ($ERROR_COUNT errors, $WARNING_COUNT warnings)${NC}\n"
    fi

    # Statistics
    local total_checks=$((${#VALIDATION_RESULTS[@]}))
    local success_count=$((total_checks - ERROR_COUNT - WARNING_COUNT))

    echo -e "${BLUE}📊 Estatísticas:${NC}"
    echo -e "  • Total de verificações: $total_checks"
    echo -e "  • ${GREEN}Sucessos: $success_count${NC}"
    echo -e "  • ${YELLOW}Avisos: $WARNING_COUNT${NC}"
    echo -e "  • ${RED}Erros: $ERROR_COUNT${NC}"

    # Recommendations
    echo -e "\n${BLUE}📋 Próximos passos:${NC}"

    if [ $ERROR_COUNT -gt 0 ]; then
        echo -e "  ${RED}1. Corrija os erros críticos listados acima${NC}"
        echo -e "  ${YELLOW}2. Execute novamente este script${NC}"
        echo -e "  ${BLUE}3. Teste localmente antes do deploy${NC}"
    else
        echo -e "  ${GREEN}1. Configure domínio customizado${NC}"
        echo -e "  ${GREEN}2. Configure webhooks do Stripe${NC}"
        echo -e "  ${GREEN}3. Faça deploy!${NC}"
    fi

    echo -e "\n${PURPLE}🚀 Plataformas recomendadas para deploy:${NC}"
    echo -e "  • Vercel (recomendado para Next.js)"
    echo -e "  • Railway (boa para apps full-stack)"
    echo -e "  • Netlify (alternativa para static)"
}

# Main execution
main() {
    echo -e "${PURPLE}"
    echo "╔════════════════════════════════════════╗"
    echo "║       DEPLOYMENT VALIDATION            ║"
    echo "║      Valide antes de fazer deploy      ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}\n"

    check_config_files
    check_env_vars
    check_dependencies
    check_database
    check_api_routes
    check_typescript
    check_security
    check_deployment_readiness

    # Only run build check if everything else is okay
    if [ $ERROR_COUNT -eq 0 ]; then
        check_build
    fi

    generate_summary

    # Exit with error code if there are critical errors
    if [ $ERROR_COUNT -gt 0 ]; then
        exit 1
    fi
}

# Run main function
main "$@"