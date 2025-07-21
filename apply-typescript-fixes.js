#!/usr/bin/env node

/**
 * Complete TypeScript fixes for GitHub Style Agent
 * This script applies all necessary fixes to resolve compilation errors
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Applying Complete TypeScript Fixes...\n');

// 1. Create working types file
function createTypes() {
  console.log('1. Creating types file...');
  
  const typesDir = './src/types';
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }
  
  const typesContent = `/**
 * Type definitions for GitHub Style Agent
 */

export type AnalysisDepth = 'basic' | 'detailed';

export interface SimpleStyleProfile {
  indentStyle: 'spaces' | 'tabs';
  quoteStyle: 'single' | 'double';
  useSemicolons: boolean;
  raw: Record<string, number>;
  fileCount: number;
}

export interface AnalysisProgress {
  stage: 'fetching' | 'analyzing' | 'generating' | 'complete';
  progress: number;
  message: string;
  currentRepository?: string;
  currentFile?: string;
  estimatedTimeRemaining?: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string | null;
  updated_at: string | null;
  pushed_at: string | null;
  size: number;
  stargazers_count: number;
  language: string | null;
  default_branch: string;
}
`;
  
  fs.writeFileSync(path.join(typesDir, 'index.ts'), typesContent);
  console.log('   ✓ Created src/types/index.ts');
}

// 2. Create working PatternAnalyzer
function createPatternAnalyzer() {
  console.log('2. Creating PatternAnalyzer...');
  
  const analyzerDir = './src/analyzers';
  if (!fs.existsSync(analyzerDir)) {
    fs.mkdirSync(analyzerDir, { recursive: true });
  }
  
  const analyzerContent = `import { AnalysisDepth, SimpleStyleProfile } from '../types';

export class PatternAnalyzer {
  private styleProfile: Record<string, number> = {};
  private fileCount: number = 0;

  feed(content: string, _analysisDepth: AnalysisDepth = 'detailed'): void {
    if (!content) {
      return;
    }

    try {
      const lines = content.split('\\n');

      const indentSpaces = lines.filter(line => line.startsWith('    ')).length;
      const indentTabs = lines.filter(line => line.startsWith('\\t')).length;
      const semicolons = lines.filter(line => line.trim().endsWith(';')).length;
      const singleQuotes = lines.filter(line => line.includes("'")).length;
      const doubleQuotes = lines.filter(line => line.includes('"')).length;

      this.styleProfile.indentSpaces = (this.styleProfile.indentSpaces ?? 0) + indentSpaces;
      this.styleProfile.indentTabs = (this.styleProfile.indentTabs ?? 0) + indentTabs;
      this.styleProfile.semicolons = (this.styleProfile.semicolons ?? 0) + semicolons;
      this.styleProfile.singleQuotes = (this.styleProfile.singleQuotes ?? 0) + singleQuotes;
      this.styleProfile.doubleQuotes = (this.styleProfile.doubleQuotes ?? 0) + doubleQuotes;
      this.styleProfile.totalLines = (this.styleProfile.totalLines ?? 0) + lines.length;

      this.fileCount++;
    } catch (error) {
      // Handle error silently
    }
  }

  getStyle(): SimpleStyleProfile {
    if (this.fileCount === 0) {
      return {
        indentStyle: 'spaces',
        quoteStyle: 'double',
        useSemicolons: true,
        raw: {},
        fileCount: 0
      };
    }

    try {
      const totalLines = this.styleProfile.totalLines ?? 1;
      const indentSpaces = this.styleProfile.indentSpaces ?? 0;
      const indentTabs = this.styleProfile.indentTabs ?? 0;
      const singleQuotes = this.styleProfile.singleQuotes ?? 0;
      const doubleQuotes = this.styleProfile.doubleQuotes ?? 0;
      const semicolons = this.styleProfile.semicolons ?? 0;

      const indentStyle = indentSpaces > indentTabs ? 'spaces' : 'tabs';
      const quoteStyle = singleQuotes > doubleQuotes ? 'single' : 'double';
      const useSemicolons = semicolons / totalLines > 0.5;

      return {
        indentStyle,
        quoteStyle,
        useSemicolons,
        raw: this.styleProfile,
        fileCount: this.fileCount
      };
    } catch (error) {
      return {
        indentStyle: 'spaces',
        quoteStyle: 'double',
        useSemicolons: true,
        raw: this.styleProfile,
        fileCount: this.fileCount
      };
    }
  }
}
`;
  
  fs.writeFileSync(path.join(analyzerDir, 'PatternAnalyzer.ts'), analyzerContent);
  console.log('   ✓ Created src/analyzers/PatternAnalyzer.ts');
}

// 3. Create working CodeGenerator
function createCodeGenerator() {
  console.log('3. Creating CodeGenerator...');
  
  const generatorDir = './src/generators';
  if (!fs.existsSync(generatorDir)) {
    fs.mkdirSync(generatorDir, { recursive: true });
  }
  
  const generatorContent = `import OpenAI from 'openai';
import { SimpleStyleProfile } from '../types';

export class CodeGenerator {
  constructor(
    private openai: OpenAI,
    private style: SimpleStyleProfile
  ) {
    if (!openai) {
      throw new Error('OpenAI instance is required');
    }
  }

  private createPrompt({ spec, style }: { spec: string; style: SimpleStyleProfile }): string {
    if (!spec) {
      throw new Error('Code specification is required');
    }

    return \`You are an AI developer assistant.

Generate code based on the following user specification:

SPEC: \${spec}

STYLE PREFERENCES:
- Indentation: \${style.indentStyle}
- Quotes: \${style.quoteStyle} quotes
- Semicolons: \${style.useSemicolons ? 'use semicolons' : 'no semicolons'}

Make sure the code matches the user's style preferences. Only return valid code.\`;
  }

  async generateCode(input: { spec: string; style: SimpleStyleProfile }): Promise<string> {
    try {
      const prompt = this.createPrompt(input);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      const generatedCode = completion.choices?.[0]?.message?.content?.trim();
      if (!generatedCode) {
        return '// No code generated';
      }

      return generatedCode;
    } catch (error) {
      return \`// Error generating code: \${error instanceof Error ? error.message : 'Unknown error'}\`;
    }
  }
}
`;
  
  fs.writeFileSync(path.join(generatorDir, 'CodeGenerator.ts'), generatorContent);
  console.log('   ✓ Created src/generators/CodeGenerator.ts');
}

// 4. Fix the main CodeStyleEngine.ts
function fixCodeStyleEngine() {
  console.log('4. Fixing CodeStyleEngine.ts...');
  
  const engineContent = `import { Octokit } from '@octokit/rest';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

import { PatternAnalyzer } from './src/analyzers/PatternAnalyzer';
import { CodeGenerator } from './src/generators/CodeGenerator';
import { AnalysisDepth, SimpleStyleProfile } from './src/types';

// Load environment variables
dotenv.config();

// Simple logger for development
const logger = {
  info: (message: string) => {
    if (process.env.DEBUG === 'true') {
      console.log(\`[INFO] \${message}\`);
    }
  },
  warn: (message: string) => {
    if (process.env.DEBUG === 'true') {
      console.warn(\`[WARN] \${message}\`);
    }
  },
  error: (message: string, error?: unknown) => {
    if (process.env.DEBUG === 'true') {
      console.error(\`[ERROR] \${message}\`, error);
    }
  },
};

export async function analyzeMultipleReposPatterns(
  token: string,
  username: string,
  maxRepos = 10,
  analysisDepth: AnalysisDepth = 'detailed'
): Promise<SimpleStyleProfile> {
  if (!token) {
    throw new Error('GitHub token is required');
  }

  if (!username) {
    throw new Error('GitHub username is required');
  }

  try {
    const octokit = new Octokit({ auth: token });
    logger.info(\`Analyzing repositories for user: \${username}\`);

    const repos = await octokit.repos.listForUser({
      username,
      per_page: maxRepos,
    });

    if (repos.data.length === 0) {
      logger.warn(\`No repositories found for user: \${username}\`);
      return {
        indentStyle: 'spaces',
        quoteStyle: 'double',
        useSemicolons: true,
        raw: {},
        fileCount: 0,
      };
    }

    logger.info(\`Found \${repos.data.length} repositories to analyze\`);
    const analyzer = new PatternAnalyzer();

    for (const repo of repos.data) {
      if (!repo) continue;
      
      logger.info(\`Analyzing repository: \${repo.name}\`);
      try {
        const contents = await octokit.repos.getContent({
          owner: username,
          repo: repo.name,
          path: '',
        });

        const files = Array.isArray(contents.data) ? contents.data : [];
        const codeFiles = files.filter(file => {
          if (!file || file.type !== 'file') return false;
          const ext = file.name.split('.').pop()?.toLowerCase();
          return ext && [
            'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'cs',
          ].includes(ext);
        });

        logger.info(\`Found \${codeFiles.length} code files in \${repo.name}\`);

        for (const file of codeFiles.slice(0, 10)) { // Limit to 10 files per repo
          if (!file) continue;
          
          try {
            const fileRes = await octokit.repos.getContent({
              owner: username,
              repo: repo.name,
              path: file.path,
            });
            
            if ('content' in fileRes.data && fileRes.data.content) {
              const content = Buffer.from(fileRes.data.content, 'base64').toString('utf8');
              analyzer.feed(content, analysisDepth);
            }
          } catch (fileError) {
            logger.error(\`Error analyzing file \${file.path}:\`, fileError);
            continue;
          }
        }
      } catch (repoError) {
        logger.error(\`Error analyzing repository \${repo.name}:\`, repoError);
        continue;
      }
    }

    const styleProfile = analyzer.getStyle();
    logger.info('Analysis complete. Style profile generated.');
    return styleProfile;
  } catch (error) {
    logger.error('Error in repository analysis:', error);
    throw error;
  }
}

export async function generateCodeSample(
  openaiApiKey: string,
  styleProfile: SimpleStyleProfile,
  codeSpec: string
): Promise<string> {
  if (!openaiApiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (!codeSpec) {
    throw new Error('Code specification is required');
  }

  try {
    logger.info('Initializing OpenAI client');
    const openai = new OpenAI({ apiKey: openaiApiKey });

    if (!styleProfile || Object.keys(styleProfile).length === 0) {
      logger.warn('No style profile provided, using defaults');
      styleProfile = {
        indentStyle: 'spaces',
        quoteStyle: 'double',
        useSemicolons: true,
        raw: {},
        fileCount: 0,
      };
    }

    logger.info('Initializing code generator');
    const generator = new CodeGenerator(openai, styleProfile);

    logger.info('Generating code sample based on specification');
    const generatedCode = await generator.generateCode({
      spec: codeSpec,
      style: styleProfile,
    });

    if (!generatedCode || generatedCode === '// No code generated') {
      logger.warn('Failed to generate code sample');
    } else {
      logger.info('Code sample generated successfully');
    }

    return generatedCode;
  } catch (error) {
    logger.error('Error generating code sample:', error);
    throw error;
  }
}
`;
  
  fs.writeFileSync('./CodeStyleEngine.ts', engineContent);
  console.log('   ✓ Fixed CodeStyleEngine.ts');
}

// 5. Create the Progress Tracker (if needed)
function createProgressTracker() {
  console.log('5. Creating ProgressTracker...');
  
  const utilsDir = './src/utils';
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
  }
  
  // Check if ProgressTracker already exists
  const progressTrackerPath = path.join(utilsDir, 'ProgressTracker.ts');
  if (fs.existsSync(progressTrackerPath)) {
    console.log('   ℹ️  ProgressTracker.ts already exists, skipping...');
    return;
  }
  
  const progressTrackerContent = `import { AnalysisProgress } from '../types';

export class ProgressTracker {
  private currentProgress: AnalysisProgress;
  private startTime: number;
  private onProgressUpdate?: (progress: AnalysisProgress) => void;

  constructor(onProgressUpdate?: (progress: AnalysisProgress) => void) {
    this.onProgressUpdate = onProgressUpdate;
    this.startTime = Date.now();
    this.currentProgress = {
      stage: 'fetching',
      progress: 0,
      message: 'Starting analysis...',
    };
  }

  updateStage(stage: AnalysisProgress['stage'], message: string): void {
    let progress = 0;
    switch (stage) {
      case 'fetching': progress = 10; break;
      case 'analyzing': progress = 50; break;
      case 'generating': progress = 85; break;
      case 'complete': progress = 100; break;
    }

    this.currentProgress = { stage, progress, message };
    this.notifyProgress();
  }

  updateRepositoryProgress(current: number, total: number, repoName: string): void {
    const progress = 20 + (current / total) * 60;
    this.currentProgress = {
      stage: 'analyzing',
      progress: Math.round(progress),
      message: \`Analyzing repository \${current} of \${total}: \${repoName}\`,
      currentRepository: repoName,
    };
    this.notifyProgress();
  }

  complete(message: string = 'Analysis complete!'): void {
    this.currentProgress = {
      stage: 'complete',
      progress: 100,
      message,
    };
    this.notifyProgress();
  }

  private notifyProgress(): void {
    if (this.onProgressUpdate) {
      this.onProgressUpdate({ ...this.currentProgress });
    }
  }

  getCurrentProgress(): AnalysisProgress {
    return { ...this.currentProgress };
  }
}
`;
  
  fs.writeFileSync(progressTrackerPath, progressTrackerContent);
  console.log('   ✓ Created src/utils/ProgressTracker.ts');
}

// Main execution
async function applyAllFixes() {
  try {
    console.log('🔧 Applying all TypeScript fixes...\n');
    
    createTypes();
    createPatternAnalyzer();
    createCodeGenerator();
    fixCodeStyleEngine();
    createProgressTracker();
    
    console.log('\n🎉 All TypeScript fixes applied successfully!\n');
    
    console.log('✅ Created/Fixed Files:');
    console.log('   • src/types/index.ts');
    console.log('   • src/analyzers/PatternAnalyzer.ts');
    console.log('   • src/generators/CodeGenerator.ts');
    console.log('   • src/utils/ProgressTracker.ts');
    console.log('   • CodeStyleEngine.ts');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. npm run build     # Should compile successfully now');
    console.log('2. npm test          # Verify functionality');
    console.log('3. npm run lint      # Check code quality');
    console.log('4. Press F5 in VS Code to test the extension');
    
    console.log('\n✨ Your GitHub Style Agent is ready to use!');
    
  } catch (error) {
    console.error('\n❌ Error applying fixes:', error.message);
    console.log('\n🔄 If issues persist:');
    console.log('1. Check file permissions');
    console.log('2. Ensure you run this from the project root');
    console.log('3. Try running: npm install && npm run clean');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  applyAllFixes();
}

module.exports = { applyAllFixes };