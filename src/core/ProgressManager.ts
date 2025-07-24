import { ProgressTracker, AnalysisProgress } from './ProgressTracker';

/**
 * Centralized progress management for the GitHub Style Agent
 * Manages multiple progress trackers and provides unified progress reporting
 */
export class ProgressManager {
  private trackers = new Map<string, ProgressTracker>();
  private stages = new Map<string, number>();
  private globalProgress = 0;
  private onProgressUpdate?: (progress: AnalysisProgress) => void;

  constructor(onProgressUpdate?: (progress: AnalysisProgress) => void) {
    this.onProgressUpdate = onProgressUpdate;
  }

  /**
   * Set the stages and their weights for progress calculation
   */
  setStages(stages: Record<string, number>): void {
    this.stages = new Map(Object.entries(stages));
  }

  /**
   * Create a new progress tracker for a specific operation
   */
  createTracker(id: string, totalSteps: number): ProgressTracker {
    const tracker = new ProgressTracker(totalSteps, (progress) => {
      this.updateGlobalProgress();
      if (this.onProgressUpdate) {
        this.onProgressUpdate(progress);
      }
    });
    
    this.trackers.set(id, tracker);
    return tracker;
  }

  /**
   * Get an existing tracker by ID
   */
  getTracker(id: string): ProgressTracker | undefined {
    return this.trackers.get(id);
  }

  /**
   * Remove a tracker when operation is complete
   */
  removeTracker(id: string): void {
    this.trackers.delete(id);
    this.updateGlobalProgress();
  }

  /**
   * Update progress for a specific stage
   */
  updateProgress(stage: string, percentage: number): void {
    const weight = this.stages.get(stage) || 1;
    const weightedProgress = (percentage / 100) * weight;
    
    // Update global progress based on all stages
    this.calculateGlobalProgress();
    
    if (this.onProgressUpdate) {
      this.onProgressUpdate({
        stage,
        percentage,
        message: `${stage}: ${percentage}%`,
        estimatedTimeRemaining: this.calculateEstimatedTime(),
        repositories: [],
        files: []
      });
    }
  }

  /**
   * Get the current global progress percentage
   */
  getGlobalProgress(): number {
    return this.globalProgress;
  }

  /**
   * Get all active trackers
   */
  getActiveTrackers(): Map<string, ProgressTracker> {
    return new Map(this.trackers);
  }

  /**
   * Check if any operations are in progress
   */
  hasActiveOperations(): boolean {
    return this.trackers.size > 0;
  }

  /**
   * Reset all progress and clear trackers
   */
  reset(): void {
    this.trackers.clear();
    this.stages.clear();
    this.globalProgress = 0;
  }

  /**
   * Get a summary of all active operations
   */
  getOperationsSummary(): OperationSummary[] {
    const summaries: OperationSummary[] = [];
    
    for (const [id, tracker] of this.trackers) {
      const progress = tracker.getProgress();
      summaries.push({
        id,
        stage: progress.stage,
        percentage: progress.percentage,
        message: progress.message,
        estimatedTimeRemaining: progress.estimatedTimeRemaining
      });
    }
    
    return summaries;
  }

  /**
   * Update global progress based on all active trackers
   */
  private updateGlobalProgress(): void {
    if (this.trackers.size === 0) {
      this.globalProgress = 0;
      return;
    }

    let totalProgress = 0;
    let totalWeight = 0;

    for (const [id, tracker] of this.trackers) {
      const progress = tracker.getProgress();
      const weight = this.stages.get(progress.stage) || 1;
      
      totalProgress += (progress.percentage / 100) * weight;
      totalWeight += weight;
    }

    this.globalProgress = totalWeight > 0 ? (totalProgress / totalWeight) * 100 : 0;
  }

  /**
   * Calculate global progress based on stage weights
   */
  private calculateGlobalProgress(): void {
    if (this.stages.size === 0) {
      return;
    }

    let totalProgress = 0;
    let totalWeight = 0;

    for (const [stage, weight] of this.stages) {
      // Find trackers for this stage
      const stageTrackers = Array.from(this.trackers.values())
        .filter(tracker => tracker.getProgress().stage === stage);
      
      if (stageTrackers.length > 0) {
        const avgProgress = stageTrackers.reduce(
          (sum, tracker) => sum + tracker.getProgress().percentage,
          0
        ) / stageTrackers.length;
        
        totalProgress += (avgProgress / 100) * weight;
      }
      
      totalWeight += weight;
    }

    this.globalProgress = totalWeight > 0 ? (totalProgress / totalWeight) * 100 : 0;
  }

  /**
   * Calculate estimated time remaining based on all active operations
   */
  private calculateEstimatedTime(): number {
    if (this.trackers.size === 0) {
      return 0;
    }

    const estimates = Array.from(this.trackers.values())
      .map(tracker => tracker.getProgress().estimatedTimeRemaining)
      .filter(time => time > 0);

    if (estimates.length === 0) {
      return 0;
    }

    // Return the maximum estimated time (most conservative estimate)
    return Math.max(...estimates);
  }

  /**
   * Create a batch operation that manages multiple sub-operations
   */
  createBatchOperation(batchId: string, operations: BatchOperationConfig[]): BatchOperation {
    return new BatchOperation(batchId, operations, this);
  }
}

/**
 * Interface for operation summary
 */
export interface OperationSummary {
  id: string;
  stage: string;
  percentage: number;
  message: string;
  estimatedTimeRemaining: number;
}

/**
 * Configuration for batch operations
 */
export interface BatchOperationConfig {
  id: string;
  name: string;
  weight: number;
  totalSteps: number;
}

/**
 * Batch operation manager for handling multiple related operations
 */
export class BatchOperation {
  private operations = new Map<string, ProgressTracker>();
  private weights = new Map<string, number>();
  private completed = new Set<string>();
  private batchProgress = 0;

  constructor(
    private batchId: string,
    private configs: BatchOperationConfig[],
    private progressManager: ProgressManager
  ) {
    this.initializeOperations();
  }

  /**
   * Initialize all operations in the batch
   */
  private initializeOperations(): void {
    for (const config of this.configs) {
      const tracker = this.progressManager.createTracker(
        `${this.batchId}_${config.id}`,
        config.totalSteps
      );
      
      this.operations.set(config.id, tracker);
      this.weights.set(config.id, config.weight);
    }
  }

  /**
   * Get a specific operation tracker
   */
  getOperation(operationId: string): ProgressTracker | undefined {
    return this.operations.get(operationId);
  }

  /**
   * Mark an operation as completed
   */
  completeOperation(operationId: string): void {
    this.completed.add(operationId);
    this.updateBatchProgress();
    
    // Remove from progress manager if all operations are complete
    if (this.completed.size === this.operations.size) {
      this.cleanup();
    }
  }

  /**
   * Get the overall batch progress
   */
  getBatchProgress(): number {
    return this.batchProgress;
  }

  /**
   * Check if the batch is complete
   */
  isComplete(): boolean {
    return this.completed.size === this.operations.size;
  }

  /**
   * Get summary of all operations in the batch
   */
  getSummary(): BatchSummary {
    const operations: OperationSummary[] = [];
    
    for (const [id, tracker] of this.operations) {
      const progress = tracker.getProgress();
      const config = this.configs.find(c => c.id === id);
      
      operations.push({
        id,
        stage: config?.name || id,
        percentage: progress.percentage,
        message: progress.message,
        estimatedTimeRemaining: progress.estimatedTimeRemaining
      });
    }

    return {
      batchId: this.batchId,
      overallProgress: this.batchProgress,
      operations,
      isComplete: this.isComplete(),
      completedOperations: this.completed.size,
      totalOperations: this.operations.size
    };
  }

  /**
   * Update the overall batch progress
   */
  private updateBatchProgress(): void {
    let totalProgress = 0;
    let totalWeight = 0;

    for (const [id, tracker] of this.operations) {
      const progress = tracker.getProgress();
      const weight = this.weights.get(id) || 1;
      
      totalProgress += (progress.percentage / 100) * weight;
      totalWeight += weight;
    }

    this.batchProgress = totalWeight > 0 ? (totalProgress / totalWeight) * 100 : 0;
  }

  /**
   * Clean up all operation trackers
   */
  private cleanup(): void {
    for (const [id] of this.operations) {
      this.progressManager.removeTracker(`${this.batchId}_${id}`);
    }
  }
}

/**
 * Interface for batch operation summary
 */
export interface BatchSummary {
  batchId: string;
  overallProgress: number;
  operations: OperationSummary[];
  isComplete: boolean;
  completedOperations: number;
  totalOperations: number;
}

/**
 * Default stage configurations for common operations
 */
export const DEFAULT_STAGES = {
  INITIALIZATION: 5,
  FETCHING_REPOSITORIES: 20,
  ANALYZING_CODE: 50,
  GENERATING_PROFILE: 15,
  FINALIZING: 10
} as const;

/**
 * Utility function to create a standard progress manager
 */
export function createStandardProgressManager(
  onProgressUpdate?: (progress: AnalysisProgress) => void
): ProgressManager {
  const manager = new ProgressManager(onProgressUpdate);
  manager.setStages(DEFAULT_STAGES);
  return manager;
}