import { AnalysisProgress } from './types';

export class ProgressTracker {
  private currentProgress: AnalysisProgress;
  private startTime: number;
  private estimatedTotalTime: number;
  private onProgressUpdate: ((progress: AnalysisProgress) => void) | undefined;

  constructor(onProgressUpdate?: (progress: AnalysisProgress) => void) {
    this.onProgressUpdate = onProgressUpdate || undefined;
    this.startTime = Date.now();
    this.estimatedTotalTime = 30000; // Default 30 seconds
    this.currentProgress = {
      stage: 'fetching',
      progress: 0,
      message: 'Starting analysis...',
      currentRepository: undefined,
      currentFile: undefined,
      estimatedTimeRemaining: undefined,
    };
  }

  setTotalRepositories(count: number): void {
    this.estimatedTotalTime = Math.max(10000, count * 3000);
  }

  updateStage(
    stage: AnalysisProgress['stage'], 
    message: string,
    currentRepository?: string | undefined,
    currentFile?: string | undefined
  ): void {
    const elapsed = Date.now() - this.startTime;
    const estimatedRemaining = Math.max(0, this.estimatedTotalTime - elapsed);
    
    let baseProgress = 0;
    switch (stage) {
      case 'fetching': baseProgress = 0; break;
      case 'analyzing': baseProgress = 20; break;
      case 'generating': baseProgress = 80; break;
      case 'complete': baseProgress = 100; break;
    }

    this.currentProgress = {
      stage,
      progress: Math.min(100, baseProgress),
      message,
      currentRepository: currentRepository || undefined,
      currentFile: currentFile || undefined,
      estimatedTimeRemaining: estimatedRemaining,
    };

    this.notifyProgress();
  }

  updateRepositoryProgress(current: number, total: number, repoName: string): void {
    const repoProgress = (current / total) * 60;
    const baseProgress = this.currentProgress.stage === 'fetching' ? 0 : 20;
    
    this.currentProgress = {
      stage: 'analyzing',
      progress: Math.min(100, baseProgress + repoProgress),
      message: `Analyzing repository ${current} of ${total}: ${repoName}`,
      currentRepository: repoName,
      currentFile: undefined,
      estimatedTimeRemaining: this.currentProgress.estimatedTimeRemaining,
    };

    this.notifyProgress();
  }

  updateFileProgress(current: number, total: number, fileName: string, repoName: string): void {
    const fileProgress = (current / total) * 5;
    const currentRepoProgress = this.currentProgress.progress;
    
    this.currentProgress = {
      stage: 'analyzing',
      progress: Math.min(100, currentRepoProgress + fileProgress),
      message: `Analyzing ${fileName} (${current}/${total} files in ${repoName})`,
      currentRepository: repoName,
      currentFile: fileName,
      estimatedTimeRemaining: this.currentProgress.estimatedTimeRemaining,
    };

    this.notifyProgress();
  }

  updateGenerationProgress(message: string): void {
    this.currentProgress = {
      stage: 'generating',
      progress: 85,
      message,
      currentRepository: undefined,
      currentFile: undefined,
      estimatedTimeRemaining: this.currentProgress.estimatedTimeRemaining,
    };

    this.notifyProgress();
  }

  complete(message: string = 'Analysis complete!'): void {
    this.currentProgress = {
      stage: 'complete',
      progress: 100,
      message,
      currentRepository: undefined,
      currentFile: undefined,
      estimatedTimeRemaining: 0,
    };

    this.notifyProgress();
  }

  error(message: string): void {
    this.currentProgress = {
      ...this.currentProgress,
      message: `Error: ${message}`,
      estimatedTimeRemaining: 0,
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

  getElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  static formatTime(milliseconds: number): string {
    const seconds = Math.ceil(milliseconds / 1000);
    
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (remainingSeconds === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
