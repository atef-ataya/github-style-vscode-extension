/**
 * Core type definitions for the GitHub Style Agent
 */

// GitHub API Types
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  language: string | null;
  default_branch: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

// Style Analysis Types
export interface StylePattern {
  indentation: {
    type: 'spaces' | 'tabs';
    size: number;
    confidence: number;
  };
  quotes: {
    type: 'single' | 'double';
    confidence: number;
  };
  semicolons: {
    usage: 'always' | 'never' | 'mixed';
    confidence: number;
  };
  bracketSpacing: {
    enabled: boolean;
    confidence: number;
  };
  trailingCommas: {
    usage: 'always' | 'never' | 'es5' | 'mixed';
    confidence: number;
  };
}

export interface StyleProfile {
  patterns: StylePattern;
  fileTypes: string[];
  totalFiles: number;
  analysisDate: string;
  confidence: number;
  repositories: string[];
}

// Simple style analysis result for PatternAnalyzer
export interface SimpleStyleProfile {
  indentStyle: 'spaces' | 'tabs';
  quoteStyle: 'single' | 'double';
  useSemicolons: boolean;
  raw: Record<string, number>;
  fileCount: number;
}

// Code Generation Types
export interface CodeGenerationRequest {
  prompt: string;
  styleProfile: StyleProfile;
  language?: string;
  framework?: string;
  additionalContext?: string;
}

export interface CodeGenerationResponse {
  code: string;
  explanation?: string;
  suggestions?: string[];
  confidence: number;
  tokensUsed: number;
}

// Analysis Types
export type AnalysisDepth = 'basic' | 'detailed';

// Configuration Types
export interface EnvironmentConfig {
  githubToken: string;
  githubUsername: string;
  openaiApiKey: string;
  openaiModel?: string;
  maxReposToAnalyze?: number;
  analysisDepth?: 'basic' | 'detailed';
  apiTimeout?: number;
  debug?: boolean;
  cacheDir?: string;
}

// Error Types
export interface ApiError {
  message: string;
  code: string;
  statusCode?: number | undefined;
  details?: unknown;
}

export interface AnalysisError extends ApiError {
  repository?: string | undefined;
  file?: string | undefined;
  step: 'fetch' | 'parse' | 'analyze';
}

// VS Code Extension Types
export interface WebviewMessage {
  type:
    | 'analyzeStyle'
    | 'generateCode'
    | 'saveFile'
    | 'copyToClipboard'
    | 'error';
  payload?: unknown;
}

export interface AnalyzeStyleMessage extends WebviewMessage {
  type: 'analyzeStyle';
  payload: {
    githubUrl: string;
  };
}

export interface GenerateCodeMessage extends WebviewMessage {
  type: 'generateCode';
  payload: {
    prompt: string;
    styleProfile: StyleProfile;
  };
}

export interface SaveFileMessage extends WebviewMessage {
  type: 'saveFile';
  payload: {
    content: string;
    filename: string;
  };
}

export interface CopyToClipboardMessage extends WebviewMessage {
  type: 'copyToClipboard';
  payload: {
    content: string;
  };
}

// Utility Types
export type Result<T, E = ApiError> =
  | { success: true; data: T }
  | { success: false; error: E };

export type AsyncResult<T, E = ApiError> = Promise<Result<T, E>>;

// Constants
export const SUPPORTED_FILE_EXTENSIONS = [
  '.ts',
  '.js',
  '.tsx',
  '.jsx',
  '.py',
  '.java',
  '.cpp',
  '.c',
  '.cs',
  '.php',
  '.rb',
  '.go',
  '.rs',
  '.swift',
  '.kt',
  '.scala',
] as const;

export const DEFAULT_CONFIG: Partial<EnvironmentConfig> = {
  openaiModel: 'gpt-3.5-turbo',
  maxReposToAnalyze: 20,
  analysisDepth: 'detailed',
  apiTimeout: 30000,
  debug: false,
  cacheDir: './cache',
} as const;
