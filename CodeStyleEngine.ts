import { PatternAnalyzer } from './src/analyzers/PatternAnalyzer';
import { CodeGenerator } from './src/generators/CodeGenerator';
import { Octokit } from '@octokit/rest';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export async function analyzeMultipleReposPatterns(
  token: string,
  username: string,
  maxRepos = 10,
  analysisDepth = 'detailed'
) {
  if (!token) {
    throw new Error('GitHub token is required');
  }

  if (!username) {
    throw new Error('GitHub username is required');
  }

  try {
    const octokit = new Octokit({ auth: token });
    console.log(`Analyzing repositories for user: ${username}`);
    console.log(`Maximum repositories to analyze: ${maxRepos}`);
    
    const repos = await octokit.repos.listForUser({
      username,
      per_page: maxRepos,
    });

    if (repos.data.length === 0) {
      console.warn(`No repositories found for user: ${username}`);
      return {};
    }

    console.log(`Found ${repos.data.length} repositories to analyze`);
    const analyzer = new PatternAnalyzer();

    for (const repo of repos.data) {
      console.log(`Analyzing repository: ${repo.name}`);
      try {
        const contents = await octokit.repos.getContent({
          owner: username,
          repo: repo.name,
          path: '',
        });

        const files = contents.data;
        const codeFiles = Array.isArray(files) ? files.filter(file => {
          const ext = file.name.split('.').pop()?.toLowerCase();
          return file.type === 'file' && ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'cs'].includes(ext || '');
        }) : [];
        
        console.log(`Found ${codeFiles.length} code files in ${repo.name}`);
        
        for (const file of codeFiles) {
          try {
            const fileRes = await octokit.repos.getContent({
              owner: username,
              repo: repo.name,
              path: file.path,
            });
            const content = Buffer.from(
              (fileRes.data as any).content,
              'base64'
            ).toString('utf8');
            analyzer.feed(content, analysisDepth);
          } catch (fileError) {
            console.error(`Error analyzing file ${file.path}:`, fileError);
            // Continue with next file
          }
        }
      } catch (repoError) {
        console.error(`Error analyzing repository ${repo.name}:`, repoError);
        // Continue with next repository
      }
    }

    const styleProfile = analyzer.getStyle();
    console.log('Analysis complete. Style profile generated.');
    return styleProfile;
  } catch (error) {
    console.error('Error in repository analysis:', error);
    throw error;
  }
}

export async function generateCodeSample(
  openaiApiKey: string,
  styleProfile: Record<string, any>,
  codeSpec: string
): Promise<string> {
  if (!openaiApiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (!codeSpec) {
    throw new Error('Code specification is required');
  }

  try {
    console.log('Initializing OpenAI client');
    const openai = new OpenAI({ apiKey: openaiApiKey });
    
    // Use default style profile if none provided
    if (!styleProfile || Object.keys(styleProfile).length === 0) {
      console.warn('No style profile provided, using defaults');
      styleProfile = {
        indentStyle: 'spaces',
        quoteStyle: 'double',
        useSemicolons: true,
        raw: {}
      };
    }

    console.log('Initializing code generator');
    const generator = new CodeGenerator(openai, styleProfile);

    console.log('Generating code sample based on specification');
    const generatedCode = await generator.generateCode({
      spec: codeSpec,
      style: styleProfile,
    });

    if (!generatedCode || generatedCode === '// No code generated') {
      console.warn('Failed to generate code sample');
    } else {
      console.log('Code sample generated successfully');
    }

    return generatedCode;
  } catch (error) {
    console.error('Error generating code sample:', error);
    throw error;
  }
}
