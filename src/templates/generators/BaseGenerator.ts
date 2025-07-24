import { ProjectFile, FileUtils } from '../../utils/FileUtils';
import { SimpleStyleProfile } from '../../types';

export interface GenerationConfig {
  projectName: string;
  description?: string;
  author?: string;
  license?: string;
  styleProfile: SimpleStyleProfile;
  features?: string[];
  dependencies?: string[];
  devDependencies?: string[];
  outputPath?: string;
}

export interface GenerationResult {
  success: boolean;
  files: ProjectFile[];
  message?: string;
  errors?: string[];
}

export interface TemplateContext {
  projectName: string;
  description: string;
  author: string;
  license: string;
  styleProfile: SimpleStyleProfile;
  features: string[];
  dependencies: string[];
  devDependencies: string[];
  timestamp: string;
  year: number;
}

/**
 * Base class for all project generators
 * Implements common functionality and defines the generator interface
 */
export abstract class BaseGenerator {
  protected config: GenerationConfig;
  protected context: TemplateContext;

  constructor(config: GenerationConfig) {
    this.config = config;
    this.context = this.createTemplateContext(config);
  }

  /**
   * Generate project files based on the configuration
   */
  abstract generate(): Promise<GenerationResult>;

  /**
   * Get the list of files that will be generated
   */
  abstract getFileList(): string[];

  /**
   * Get generator-specific dependencies
   */
  abstract getDependencies(): { dependencies: string[]; devDependencies: string[] };

  /**
   * Validate the configuration before generation
   */
  protected validateConfig(): string[] {
    const errors: string[] = [];

    if (!this.config.projectName?.trim()) {
      errors.push('Project name is required');
    }

    if (this.config.projectName && !/^[a-zA-Z0-9-_]+$/.test(this.config.projectName)) {
      errors.push('Project name can only contain letters, numbers, hyphens, and underscores');
    }

    if (!this.config.styleProfile) {
      errors.push('Style profile is required');
    }

    return errors;
  }

  /**
   * Create template context from configuration
   */
  protected createTemplateContext(config: GenerationConfig): TemplateContext {
    const now = new Date();
    
    return {
      projectName: config.projectName || 'my-project',
      description: config.description || 'A new project',
      author: config.author || 'Developer',
      license: config.license || 'MIT',
      styleProfile: config.styleProfile,
      features: config.features || [],
      dependencies: config.dependencies || [],
      devDependencies: config.devDependencies || [],
      timestamp: now.toISOString(),
      year: now.getFullYear()
    };
  }

  /**
   * Apply style preferences to code content
   */
  protected applyStyleProfile(code: string): string {
    let styledCode = code;
    const { styleProfile } = this.context;

    // Apply indentation style
    if (styleProfile.indentStyle === 'spaces') {
      const spaces = ' '.repeat(styleProfile.indentSize || 2);
      styledCode = styledCode.replace(/\t/g, spaces);
    } else if (styleProfile.indentStyle === 'tabs') {
      const tabSize = styleProfile.indentSize || 2;
      const spaces = ' '.repeat(tabSize);
      styledCode = styledCode.replace(new RegExp(spaces, 'g'), '\t');
    }

    // Apply quote style
    if (styleProfile.quoteStyle === 'single') {
      styledCode = styledCode.replace(/"([^"]*)"/g, "'$1'");
    } else if (styleProfile.quoteStyle === 'double') {
      styledCode = styledCode.replace(/'([^']*)'/g, '"$1"');
    }

    // Apply semicolon style
    if (styleProfile.semicolons === 'always') {
      // Add semicolons where missing (basic implementation)
      styledCode = styledCode.replace(/([^;\s])\s*\n/g, '$1;\n');
    } else if (styleProfile.semicolons === 'never') {
      // Remove semicolons (basic implementation)
      styledCode = styledCode.replace(/;\s*\n/g, '\n');
    }

    return styledCode;
  }

  /**
   * Process template string with context variables
   */
  protected processTemplate(template: string, additionalContext: Record<string, any> = {}): string {
    const fullContext = { ...this.context, ...additionalContext };
    
    let processed = template;
    
    // Replace template variables
    for (const [key, value] of Object.entries(fullContext)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, String(value));
    }

    // Handle conditional blocks
    processed = this.processConditionals(processed, fullContext);
    
    // Handle loops
    processed = this.processLoops(processed, fullContext);

    return processed;
  }

  /**
   * Process conditional template blocks
   */
  protected processConditionals(template: string, context: Record<string, any>): string {
    const conditionalRegex = /{{#if\s+(\w+)}}([\s\S]*?){{/if}}/g;
    
    return template.replace(conditionalRegex, (match, condition, content) => {
      const value = context[condition];
      return value ? content : '';
    });
  }

  /**
   * Process loop template blocks
   */
  protected processLoops(template: string, context: Record<string, any>): string {
    const loopRegex = /{{#each\s+(\w+)}}([\s\S]*?){{/each}}/g;
    
    return template.replace(loopRegex, (match, arrayName, content) => {
      const array = context[arrayName];
      if (!Array.isArray(array)) {
        return '';
      }
      
      return array.map((item, index) => {
        let itemContent = content;
        
        // Replace {{this}} with current item
        itemContent = itemContent.replace(/{{\s*this\s*}}/g, String(item));
        
        // Replace {{@index}} with current index
        itemContent = itemContent.replace(/{{\s*@index\s*}}/g, String(index));
        
        return itemContent;
      }).join('');
    });
  }

  /**
   * Create package.json content
   */
  protected createPackageJson(): string {
    const deps = this.getDependencies();
    const allDeps = [...this.context.dependencies, ...deps.dependencies];
    const allDevDeps = [...this.context.devDependencies, ...deps.devDependencies];

    const packageJson = {
      name: this.context.projectName,
      version: '1.0.0',
      description: this.context.description,
      main: 'index.js',
      scripts: this.getScripts(),
      keywords: [],
      author: this.context.author,
      license: this.context.license,
      dependencies: this.createDependencyObject(allDeps),
      devDependencies: this.createDependencyObject(allDevDeps)
    };

    return JSON.stringify(packageJson, null, this.context.styleProfile.indentSize || 2);
  }

  /**
   * Get default scripts for package.json
   */
  protected getScripts(): Record<string, string> {
    return {
      test: 'echo "Error: no test specified" && exit 1'
    };
  }

  /**
   * Create README.md content
   */
  protected createReadme(): string {
    return this.processTemplate(`# {{ projectName }}

{{ description }}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

TODO: Add usage instructions

## License

{{ license }}

## Author

{{ author }}
`);
  }

  /**
   * Create .gitignore content
   */
  protected createGitignore(): string {
    return `# Dependencies
node_modules/
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

# nyc test coverage
.nyc_output

# Grunt intermediate storage
.grunt

# Bower dependency directory
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons
build/Release

# Dependency directories
node_modules/
jspm_packages/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# parcel-bundler cache
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;
  }

  /**
   * Save generated project to filesystem
   */
  async saveProject(outputPath?: string): Promise<boolean> {
    try {
      const result = await this.generate();
      if (!result.success) {
        console.error('Generation failed:', result.errors);
        return false;
      }

      const projectPath = outputPath || this.config.outputPath || `./${this.context.projectName}`;
      return await FileUtils.createProject(projectPath, result.files);
    } catch (error) {
      console.error('Failed to save project:', error);
      return false;
    }
  }

  private createDependencyObject(dependencies: string[]): Record<string, string> {
    const deps: Record<string, string> = {};
    
    for (const dep of dependencies) {
      if (dep.includes('@')) {
        const [name, version] = dep.split('@');
        deps[name] = version || 'latest';
      } else {
        deps[dep] = 'latest';
      }
    }
    
    return deps;
  }
}
