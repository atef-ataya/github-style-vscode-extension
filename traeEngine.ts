import { PatternAnalyzer } from './src/analyzers/PatternAnalyzer';
import { CodeGenerator } from './src/generators/CodeGenerator';
import { Octokit } from '@octokit/rest';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

export async function analyzeMultipleReposPatterns(
  token: string,
  username: string,
  maxRepos = 10,
  analysisDepth = 'detailed'
) {
  const octokit = new Octokit({ auth: token });
  const repos = await octokit.repos.listForUser({
    username,
    per_page: maxRepos,
  });

  const analyzer = new PatternAnalyzer();

  for (const repo of repos.data) {
    const contents = await octokit.repos.getContent({
      owner: username,
      repo: repo.name,
      path: '',
    });

    const files = contents.data;
    for (const file of Array.isArray(files) ? files : []) {
      if (file.type === 'file' && file.name.endsWith('.ts')) {
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
      }
    }
  }

  return analyzer.getStyle();
}

export async function generateCodeSample(
  style: any,
  spec: string,
  openaiKey: string
) {
  const openai = new OpenAI({ apiKey: openaiKey });
  const generator = new CodeGenerator(openai, style);
  return await generator.generateCode({ spec, style });
}
