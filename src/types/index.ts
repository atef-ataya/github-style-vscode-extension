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
  created_at: string | null;
  updated_at: string | null;
  pushed_at: string | null;
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

// Enhanced Style Analysis Types
export interface StyleConfidence {
  level: 'very-low' | 'low' | 'medium' | 'high';
  percentage: number;
}

export interface StylePattern {
  indentation: {
    type: 'spaces' | 'tabs';
    size: number;
    confidence: StyleConfidence;
  };
  quotes: {
    type: 'single' | 'double';
    confidence: StyleConfidence;
  };
  semicolons: {
    usage: 'always' | 'never' | 'mixed';
    confidence: StyleConfidence;
  };
  bracketSpacing: {
    enabled: boolean;
    confidence: StyleConfidence;
  };
  trailingCommas: {
    usage: 'always' | 'never' | 'es5' | 'mixed';
    confidence: StyleConfidence;
  };
  functionStyle: {
    preferred: 'arrow' | 'regular' | 'mixed';
    asyncUsage: number;
    confidence: StyleConfidence;
  };
  variableDeclarations: {
    preferred: 'const' | 'let' | 'var' | 'mixed';
    namingConvention: 'camelCase' | 'snake_case' | 'PascalCase' | 'mixed';
    confidence: StyleConfidence;
  };
  modernFeatures: {
    templateLiterals: boolean;
    destructuring: boolean;
    spreadOperator: boolean;
    asyncAwait: boolean;
    confidence: StyleConfidence;
  };
}

export interface StyleProfile {
  patterns: StylePattern;
  fileTypes: string[];
  totalFiles: number;
  analysisDate: string;
  confidence: StyleConfidence;
  repositories: string[];
  languageBreakdown: Record<string, number>;
  projectPatterns: string[];
  recommendations: string[];
}

// Simple style analysis result for PatternAnalyzer
export interface SimpleStyleProfile {
  indentStyle: 'spaces' | 'tabs';
  quoteStyle: 'single' | 'double';
  useSemicolons: boolean;
  raw: Record<string, number>;
  fileCount: number;
}

// Enhanced Code Generation Types
export interface EnhancedCodeGenerationRequest {
  prompt: string;
  styleProfile: SimpleStyleProfile;
  language?: string;
  framework?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
  includeComments?: boolean;
  includeTests?: boolean;
  additionalContext?: string;
}

export interface CodeGenerationResponse {
  code: string;
  explanation?: string | undefined;
  suggestions?: string[] | undefined;
  confidence: number;
  tokensUsed: number;
  estimatedQuality: 'low' | 'medium' | 'high';
  followUpQuestions?: string[] | undefined;
}

// Cache Management Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
}

export interface RepositoryCache {
  repositories: CacheEntry<GitHubRepository[]>;
  analyses: Map<string, CacheEntry<SimpleStyleProfile>>;
}

// Analysis Types
export type AnalysisDepth = 'basic' | 'detailed';

export interface AnalysisProgress {
  stage: 'fetching' | 'analyzing' | 'generating' | 'complete';
  progress: number; // 0-100
  currentRepository?: string | undefined;
  currentFile?: string | undefined;
  message: string;
  estimatedTimeRemaining?: number | undefined;
}

// Configuration Types
export interface EnvironmentConfig {
  githubToken: string;
  githubUsername: string;
  openaiApiKey: string;
  openaiModel?: string;
  maxReposToAnalyze?: number;
  analysisDepth?: AnalysisDepth;
  apiTimeout?: number;
  debug?: boolean;
  cacheDir?: string;
  cacheEnabled?: boolean;
  cacheTtl?: number; // Time to live in milliseconds
}

// Enhanced Error Types
export interface ApiError {
  message: string;
  code: string;
  statusCode?: number;
  details?: unknown;
  timestamp?: string;
  retryable?: boolean;
}

export interface AnalysisError extends ApiError {
  repository?: string;
  file?: string;
  step: 'fetch' | 'parse' | 'analyze';
  context?: Record<string, unknown>;
}

// VS Code Extension Types
export interface WebviewMessage {
  type: string;
  payload?: unknown;
  timestamp?: number;
}

export interface AnalyzeStyleMessage extends WebviewMessage {
  type: 'analyzeStyle';
  payload: {
    githubUrl: string;
    depth?: AnalysisDepth;
  };
}

export interface GenerateCodeMessage extends WebviewMessage {
  type: 'generateCode';
  payload: {
    prompt: string;
    styleProfile: StyleProfile;
    options?: Partial<EnhancedCodeGenerationRequest>;
  };
}

export interface SaveFileMessage extends WebviewMessage {
  type: 'saveFile';
  payload: {
    content: string;
    filename: string;
    format?: string;
  };
}

export interface CopyToClipboardMessage extends WebviewMessage {
  type: 'copyToClipboard';
  payload: {
    content: string;
  };
}

export interface ProgressUpdateMessage extends WebviewMessage {
  type: 'progressUpdate';
  payload: AnalysisProgress;
}

// Performance Monitoring Types
export interface PerformanceMetrics {
  analysisTime: number;
  generationTime: number;
  totalRepositories: number;
  totalFiles: number;
  cacheHitRate: number;
  apiCallsCount: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
}

// Quality Assessment Types
export interface CodeQualityMetrics {
  complexity: 'low' | 'medium' | 'high';
  maintainability: number; // 0-100
  readability: number; // 0-100
  testCoverage?: number; // 0-100
  documentation: number; // 0-100
  bestPractices: {
    followed: string[];
    violations: string[];
    suggestions: string[];
  };
}

// Utility Types
export type Result<T, E = ApiError> =
  | { success: true; data: T }
  | { success: false; error: E };

export type AsyncResult<T, E = ApiError> = Promise<Result<T, E>>;

// Repository Analysis Types
export interface RepositoryAnalysisResult {
  repository: GitHubRepository;
  styleProfile: SimpleStyleProfile;
  analysisTime: number;
  filesAnalyzed: number;
  errors: AnalysisError[];
  quality: CodeQualityMetrics;
}

export interface BatchAnalysisResult {
  results: RepositoryAnalysisResult[];
  aggregatedProfile: StyleProfile;
  totalTime: number;
  performance: PerformanceMetrics;
  summary: {
    successRate: number;
    topLanguages: string[];
    confidenceLevel: StyleConfidence['level'];
    recommendations: string[];
  };
}

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
  '.vue',
  '.svelte',
] as const;

export const DEFAULT_CONFIG: Partial<EnvironmentConfig> = {
  openaiModel: 'gpt-4',
  maxReposToAnalyze: 20,
  analysisDepth: 'detailed',
  apiTimeout: 30000,
  debug: false,
  cacheDir: './cache',
  cacheEnabled: true,
  cacheTtl: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export const CACHE_VERSIONS = {
  REPOSITORY_LIST: '1.0',
  STYLE_ANALYSIS: '1.1',
  CODE_GENERATION: '1.0',
} as const;