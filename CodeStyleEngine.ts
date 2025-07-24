import { Octokit } from '@octokit/rest';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

import { PatternAnalyzer } from './src/analyzers/PatternAnalyzer';
import { CodeGenerator } from './src/generators/CodeGenerator';
import { AnalysisDepth, SimpleStyleProfile } from './types';

// Load environment variables
dotenv.config();

// Simple logger for development
const logger = {
  info: (message: string) => {
    if (process.env.DEBUG === 'true') {
      console.log(`[INFO] ${message}`);
    }
  },
  warn: (message: string) => {
    if (process.env.DEBUG === 'true') {
      console.warn(`[WARN] ${message}`);
    }
  },
  error: (message: string, error?: unknown) => {
    if (process.env.DEBUG === 'true') {
      console.error(`[ERROR] ${message}`, error);
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
    logger.info(`Analyzing repositories for user: ${username}`);

    const repos = await octokit.repos.listForUser({
      username,
      per_page: maxRepos,
    });

    if (repos.data.length === 0) {
      logger.warn(`No repositories found for user: ${username}`);
      return {
        indentStyle: 'spaces',
        quoteStyle: 'double',
        useSemicolons: true,
        raw: {},
        fileCount: 0,
      };
    }

    logger.info(`Found ${repos.data.length} repositories to analyze`);
    const analyzer = new PatternAnalyzer();

    for (const repo of repos.data) {
      if (!repo) continue;
      
      logger.info(`Analyzing repository: ${repo.name}`);
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

        logger.info(`Found ${codeFiles.length} code files in ${repo.name}`);

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
            logger.error(`Error analyzing file ${file.path}:`, fileError);
            continue;
          }
        }
      } catch (repoError) {
        logger.error(`Error analyzing repository ${repo.name}:`, repoError);
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
