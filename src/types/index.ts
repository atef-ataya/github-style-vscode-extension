/**
 * Type definitions for GitHub Style Agent - Fixed Version
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
  currentRepository?: string | undefined;
  currentFile?: string | undefined;
  estimatedTimeRemaining?: number | undefined;
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
