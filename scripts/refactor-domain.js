#!/usr/bin/env node

/**
 * 🔄 Domain Refactoring Script
 * Automatically replaces domain-specific terms and patterns
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.purple}[STEP]${colors.reset} ${msg}`)
};

class DomainRefactor {
  constructor() {
    this.projectRoot = path.dirname(__dirname);
    this.configPath = path.join(this.projectRoot, 'config', 'app.config.json');
    this.mappingsPath = path.join(this.projectRoot, 'config', 'domain-mappings.json');
    this.config = null;
    this.mappings = null;
    this.stats = {
      filesProcessed: 0,
      replacements: 0,
      errors: 0
    };
  }

  // Load configuration
  loadConfig() {
    log.step('Carregando configuração...');

    try {
      // Load app config
      if (!fs.existsSync(this.configPath)) {
        throw new Error(`Arquivo de configuração não encontrado: ${this.configPath}`);
      }
      this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));

      // Load domain mappings
      if (fs.existsSync(this.mappingsPath)) {
        this.mappings = JSON.parse(fs.readFileSync(this.mappingsPath, 'utf8'));
      }

      log.success(`Configuração carregada - App: ${this.config.appName}`);
    } catch (error) {
      log.error(`Erro ao carregar configuração: ${error.message}`);
      process.exit(1);
    }
  }

  // Get files to process
  async getFilesToProcess() {
    log.step('Identificando arquivos para processar...');

    const patterns = [
      'src/**/*.{ts,tsx,js,jsx}',
      'src/**/*.md',
      '*.md',
      'public/**/*.html',
      'docs/**/*.md'
    ];

    const excludePatterns = [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      '.git/**',
      'scripts/**',
      'config/**'
    ];

    let allFiles = [];

    for (const pattern of patterns) {
      try {
        const files = await glob(pattern, {
          cwd: this.projectRoot,
          ignore: excludePatterns
        });
        allFiles = [...allFiles, ...files];
      } catch (error) {
        log.warning(`Erro ao buscar arquivos com padrão ${pattern}: ${error.message}`);
      }
    }

    // Remove duplicates
    allFiles = [...new Set(allFiles)];

    log.success(`${allFiles.length} arquivos identificados`);
    return allFiles;
  }

  // Build replacement patterns
  buildReplacements() {
    log.step('Construindo padrões de substituição...');

    const replacements = new Map();

    // Text replacements from config
    if (this.config.textReplacements) {
      Object.entries(this.config.textReplacements).forEach(([from, to]) => {
        replacements.set(new RegExp(`\\b${this.escapeRegex(from)}\\b`, 'g'), to);
      });
    }

    // Route replacements
    if (this.config.routeReplacements) {
      Object.entries(this.config.routeReplacements).forEach(([from, to]) => {
        // Handle href and paths
        replacements.set(new RegExp(`href="${this.escapeRegex(from)}"`, 'g'), `href="${to}"`);
        replacements.set(new RegExp(`href='${this.escapeRegex(from)}'`, 'g'), `href='${to}'`);
        replacements.set(new RegExp(`"${this.escapeRegex(from)}"`, 'g'), `"${to}"`);
        replacements.set(new RegExp(`'${this.escapeRegex(from)}'`, 'g'), `'${to}'`);
      });
    }

    // Processing type specific replacements
    const processingType = this.config.processingType;
    if (this.mappings && this.mappings.domains[processingType]) {
      const domainConfig = this.mappings.domains[processingType];
      const concepts = this.mappings.commonReplacements.concepts[processingType];

      if (concepts) {
        // Replace concept words
        Object.entries(concepts).forEach(([key, value]) => {
          const placeholder = `{${key}}`;
          // Find and replace placeholders
          Array.from(replacements.keys()).forEach(regex => {
            const replacement = replacements.get(regex);
            if (typeof replacement === 'string' && replacement.includes(placeholder)) {
              replacements.set(regex, replacement.replace(placeholder, value));
            }
          });
        });
      }
    }

    // Specific prompts replacement
    if (this.config.prompts) {
      // Replace processor prompts in tattoo-processor.ts
      replacements.set(
        /generateAddTattooPrompt[\s\S]*?return `[\s\S]*?`;/g,
        `generateAddTattooPrompt(
    bodyPart: string = "arm",
    size: number = 100,
    position: string = "center",
    rotation: number = 0,
    style: string = "realistic"
  ): string {
    return \`${this.config.prompts.restore || this.config.prompts.enhance || 'Process this image'}\`;`
      );
    }

    log.success(`${replacements.size} padrões de substituição criados`);
    return replacements;
  }

  // Escape regex special characters
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Process a single file
  async processFile(filePath, replacements) {
    const fullPath = path.join(this.projectRoot, filePath);

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      let fileReplacements = 0;

      // Apply all replacements
      replacements.forEach((replacement, regex) => {
        const matches = newContent.match(regex);
        if (matches) {
          newContent = newContent.replace(regex, replacement);
          fileReplacements += matches.length;
        }
      });

      // Write back if changes were made
      if (fileReplacements > 0) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        this.stats.replacements += fileReplacements;
        log.info(`${filePath}: ${fileReplacements} substituições`);
      }

      this.stats.filesProcessed++;
    } catch (error) {
      log.error(`Erro ao processar ${filePath}: ${error.message}`);
      this.stats.errors++;
    }
  }

  // Rename processor file
  renameProcessorFile() {
    log.step('Renomeando arquivo do processador...');

    const oldPath = path.join(this.projectRoot, 'src/lib/services/tattoo-processor.ts');
    const newPath = path.join(this.projectRoot, `src/lib/services/${this.config.processingType}-processor.ts`);

    if (fs.existsSync(oldPath)) {
      try {
        // Read, modify and write to new location
        let content = fs.readFileSync(oldPath, 'utf8');

        // Update class name
        content = content.replace(/export class TattooProcessor/g, `export class ${this.getPascalCase(this.config.processingType)}Processor`);

        // Update type name
        content = content.replace(/type TattooMode/g, `type ${this.getPascalCase(this.config.processingType)}Mode`);

        // Write to new location
        fs.writeFileSync(newPath, content, 'utf8');

        // Remove old file
        fs.unlinkSync(oldPath);

        log.success(`Processador renomeado: ${path.basename(newPath)}`);

        // Update imports in other files
        this.updateProcessorImports();
      } catch (error) {
        log.error(`Erro ao renomear processador: ${error.message}`);
      }
    }
  }

  // Update processor imports
  async updateProcessorImports() {
    const files = await glob('src/**/*.{ts,tsx}', { cwd: this.projectRoot });
    const oldImport = 'tattoo-processor';
    const newImport = `${this.config.processingType}-processor`;
    const oldClass = 'TattooProcessor';
    const newClass = `${this.getPascalCase(this.config.processingType)}Processor`;

    files.forEach(file => {
      const fullPath = path.join(this.projectRoot, file);
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        const originalContent = content;

        // Update import path
        content = content.replace(
          new RegExp(`from ['"].*/${oldImport}['"]`, 'g'),
          `from "./${newImport}"`
        );

        // Update class references
        content = content.replace(new RegExp(oldClass, 'g'), newClass);

        if (content !== originalContent) {
          fs.writeFileSync(fullPath, content, 'utf8');
          log.info(`Import atualizado em: ${file}`);
        }
      } catch (error) {
        log.warning(`Erro ao atualizar imports em ${file}: ${error.message}`);
      }
    });
  }

  // Convert to PascalCase
  getPascalCase(str) {
    return str.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  // Update environment template
  updateEnvTemplate() {
    log.step('Atualizando template de ambiente...');

    const envPath = path.join(this.projectRoot, '.env.template');
    if (fs.existsSync(envPath)) {
      try {
        let content = fs.readFileSync(envPath, 'utf8');

        // Update app name and URL
        content = content.replace(/tattoo_preview_v2/g, this.config.appName);
        content = content.replace(/tattoopreview\.com/g, this.config.domain);
        content = content.replace(/TattooPreview/g, this.config.displayName);

        fs.writeFileSync(envPath, content, 'utf8');
        log.success('Template de ambiente atualizado');
      } catch (error) {
        log.error(`Erro ao atualizar .env.template: ${error.message}`);
      }
    }
  }

  // Generate summary
  generateSummary() {
    log.step('Resumo da refatoração');

    console.log(`\n${colors.green}✅ REFATORAÇÃO CONCLUÍDA!${colors.reset}\n`);

    console.log(`${colors.blue}📊 Estatísticas:${colors.reset}`);
    console.log(`  • Arquivos processados: ${colors.green}${this.stats.filesProcessed}${colors.reset}`);
    console.log(`  • Substituições realizadas: ${colors.green}${this.stats.replacements}${colors.reset}`);
    console.log(`  • Erros: ${colors.red}${this.stats.errors}${colors.reset}`);

    console.log(`\n${colors.blue}🔄 Mudanças aplicadas:${colors.reset}`);
    console.log(`  • Tipo de processamento: ${colors.green}${this.config.processingType}${colors.reset}`);
    console.log(`  • Nome do app: ${colors.green}${this.config.appName}${colors.reset}`);
    console.log(`  • Domínio: ${colors.green}${this.config.domain}${colors.reset}`);

    if (this.stats.errors > 0) {
      console.log(`\n${colors.yellow}⚠️  Alguns erros ocorreram. Revise os arquivos manualmente.${colors.reset}`);
    }

    console.log(`\n${colors.purple}📋 Próximo passo:${colors.reset} Teste a aplicação localmente`);
  }

  // Main execution
  async run() {
    console.log(`${colors.purple}`);
    console.log('╔════════════════════════════════════════╗');
    console.log('║        DOMAIN REFACTOR SCRIPT          ║');
    console.log('║     Automatize a transformação         ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`${colors.reset}\n`);

    try {
      this.loadConfig();

      const files = await this.getFilesToProcess();
      const replacements = this.buildReplacements();

      log.step('Processando arquivos...');

      for (const file of files) {
        await this.processFile(file, replacements);
      }

      this.renameProcessorFile();
      this.updateEnvTemplate();
      this.generateSummary();

    } catch (error) {
      log.error(`Erro durante refatoração: ${error.message}`);
      process.exit(1);
    }
  }
}

// Handle process interruption
process.on('SIGINT', () => {
  log.error('Refatoração interrompida');
  process.exit(1);
});

// Run the refactor
if (require.main === module) {
  const refactor = new DomainRefactor();
  refactor.run();
}

module.exports = DomainRefactor;