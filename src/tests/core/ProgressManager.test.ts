import { 
  ProgressManager, 
  BatchOperation, 
  createStandardProgressManager,
  DEFAULT_STAGES,
  OperationSummary,
  BatchSummary
} from '../../core/ProgressManager';
import { ProgressTracker, AnalysisProgress } from '../../core/ProgressTracker';

describe('ProgressManager', () => {
  let progressManager: ProgressManager;
  let mockProgressCallback: jest.Mock;

  beforeEach(() => {
    mockProgressCallback = jest.fn();
    progressManager = new ProgressManager(mockProgressCallback);
  });

  describe('constructor', () => {
    it('should initialize with empty trackers and stages', () => {
      expect(progressManager.getActiveTrackers().size).toBe(0);
      expect(progressManager.getGlobalProgress()).toBe(0);
      expect(progressManager.hasActiveOperations()).toBe(false);
    });

    it('should accept optional progress callback', () => {
      const callback = jest.fn();
      const manager = new ProgressManager(callback);
      
      expect(manager).toBeInstanceOf(ProgressManager);
    });
  });

  describe('setStages', () => {
    it('should set stage weights', () => {
      const stages = {
        'stage1': 30,
        'stage2': 50,
        'stage3': 20
      };
      
      progressManager.setStages(stages);
      
      // Test by creating trackers and checking global progress calculation
      const tracker1 = progressManager.createTracker('test1', 10);
      tracker1.setStage('stage1');
      tracker1.updateProgress(1, 'Test progress');
      
      expect(progressManager.getGlobalProgress()).toBeGreaterThan(0);
    });
  });

  describe('createTracker', () => {
    it('should create and store a new progress tracker', () => {
      const tracker = progressManager.createTracker('test-operation', 10);
      
      expect(tracker).toBeInstanceOf(ProgressTracker);
      expect(progressManager.getActiveTrackers().has('test-operation')).toBe(true);
      expect(progressManager.hasActiveOperations()).toBe(true);
    });

    it('should call progress callback when tracker updates', () => {
      const tracker = progressManager.createTracker('test-operation', 10);
      
      tracker.updateProgress(1, 'Test progress');
      
      expect(mockProgressCallback).toHaveBeenCalled();
    });

    it('should allow multiple trackers', () => {
      const tracker1 = progressManager.createTracker('operation1', 10);
      const tracker2 = progressManager.createTracker('operation2', 5);
      
      expect(progressManager.getActiveTrackers().size).toBe(2);
      expect(progressManager.getTracker('operation1')).toBe(tracker1);
      expect(progressManager.getTracker('operation2')).toBe(tracker2);
    });
  });

  describe('getTracker', () => {
    it('should return existing tracker', () => {
      const tracker = progressManager.createTracker('test-operation', 10);
      const retrieved = progressManager.getTracker('test-operation');
      
      expect(retrieved).toBe(tracker);
    });

    it('should return undefined for non-existent tracker', () => {
      const retrieved = progressManager.getTracker('non-existent');
      
      expect(retrieved).toBeUndefined();
    });
  });

  describe('removeTracker', () => {
    it('should remove tracker and update global progress', () => {
      const tracker = progressManager.createTracker('test-operation', 10);
      tracker.updateProgress(5, 'Half done');
      
      expect(progressManager.hasActiveOperations()).toBe(true);
      
      progressManager.removeTracker('test-operation');
      
      expect(progressManager.hasActiveOperations()).toBe(false);
      expect(progressManager.getTracker('test-operation')).toBeUndefined();
    });

    it('should handle removal of non-existent tracker gracefully', () => {
      expect(() => {
        progressManager.removeTracker('non-existent');
      }).not.toThrow();
    });
  });

  describe('updateProgress', () => {
    beforeEach(() => {
      progressManager.setStages({
        'initialization': 20,
        'processing': 60,
        'finalization': 20
      });
    });

    it('should update progress for a specific stage', () => {
      progressManager.updateProgress('processing', 50);
      
      expect(mockProgressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: 'processing',
          percentage: 50,
          message: 'processing: 50%'
        })
      );
    });

    it('should calculate global progress based on stage weights', () => {
      progressManager.updateProgress('initialization', 100); // 20% of total
      progressManager.updateProgress('processing', 50);      // 30% of total (50% of 60%)
      
      // Global progress should reflect weighted stages
      expect(progressManager.getGlobalProgress()).toBeGreaterThan(0);
    });
  });

  describe('getGlobalProgress', () => {
    it('should return 0 when no operations are active', () => {
      expect(progressManager.getGlobalProgress()).toBe(0);
    });

    it('should calculate global progress from active trackers', () => {
      const tracker1 = progressManager.createTracker('op1', 10);
      const tracker2 = progressManager.createTracker('op2', 10);
      
      tracker1.updateProgress(5, 'Half done'); // 50%
      tracker2.updateProgress(2, 'Quarter done'); // 20%
      
      const globalProgress = progressManager.getGlobalProgress();
      expect(globalProgress).toBeGreaterThan(0);
      expect(globalProgress).toBeLessThanOrEqual(100);
    });
  });

  describe('getOperationsSummary', () => {
    it('should return summary of all active operations', () => {
      const tracker1 = progressManager.createTracker('op1', 10);
      const tracker2 = progressManager.createTracker('op2', 5);
      
      tracker1.setStage('processing');
      tracker1.updateProgress(3, 'Processing files');
      
      tracker2.setStage('finalizing');
      tracker2.updateProgress(1, 'Finalizing');
      
      const summary = progressManager.getOperationsSummary();
      
      expect(summary).toHaveLength(2);
      expect(summary[0]).toMatchObject({
        id: 'op1',
        stage: 'processing',
        percentage: 30
      });
      expect(summary[1]).toMatchObject({
        id: 'op2',
        stage: 'finalizing',
        percentage: 20
      });
    });

    it('should return empty array when no operations are active', () => {
      const summary = progressManager.getOperationsSummary();
      expect(summary).toHaveLength(0);
    });
  });

  describe('reset', () => {
    it('should clear all trackers and reset progress', () => {
      progressManager.createTracker('op1', 10);
      progressManager.createTracker('op2', 5);
      progressManager.setStages({ 'stage1': 100 });
      
      expect(progressManager.hasActiveOperations()).toBe(true);
      
      progressManager.reset();
      
      expect(progressManager.hasActiveOperations()).toBe(false);
      expect(progressManager.getGlobalProgress()).toBe(0);
      expect(progressManager.getActiveTrackers().size).toBe(0);
    });
  });

  describe('createBatchOperation', () => {
    it('should create a batch operation with multiple sub-operations', () => {
      const batchConfig = [
        { id: 'fetch', name: 'Fetching Data', weight: 30, totalSteps: 5 },
        { id: 'process', name: 'Processing', weight: 50, totalSteps: 10 },
        { id: 'save', name: 'Saving Results', weight: 20, totalSteps: 3 }
      ];
      
      const batchOp = progressManager.createBatchOperation('batch-1', batchConfig);
      
      expect(batchOp).toBeInstanceOf(BatchOperation);
      expect(progressManager.getActiveTrackers().size).toBe(3); // One for each sub-operation
    });
  });
});

describe('BatchOperation', () => {
  let progressManager: ProgressManager;
  let batchOperation: BatchOperation;
  
  const batchConfig = [
    { id: 'fetch', name: 'Fetching Data', weight: 30, totalSteps: 5 },
    { id: 'process', name: 'Processing', weight: 50, totalSteps: 10 },
    { id: 'save', name: 'Saving Results', weight: 20, totalSteps: 3 }
  ];

  beforeEach(() => {
    progressManager = new ProgressManager();
    batchOperation = progressManager.createBatchOperation('test-batch', batchConfig);
  });

  describe('getOperation', () => {
    it('should return specific operation tracker', () => {
      const fetchTracker = batchOperation.getOperation('fetch');
      const processTracker = batchOperation.getOperation('process');
      
      expect(fetchTracker).toBeInstanceOf(ProgressTracker);
      expect(processTracker).toBeInstanceOf(ProgressTracker);
      expect(fetchTracker).not.toBe(processTracker);
    });

    it('should return undefined for non-existent operation', () => {
      const tracker = batchOperation.getOperation('non-existent');
      expect(tracker).toBeUndefined();
    });
  });

  describe('completeOperation', () => {
    it('should mark operation as completed', () => {
      expect(batchOperation.isComplete()).toBe(false);
      
      batchOperation.completeOperation('fetch');
      batchOperation.completeOperation('process');
      
      expect(batchOperation.isComplete()).toBe(false);
      
      batchOperation.completeOperation('save');
      
      expect(batchOperation.isComplete()).toBe(true);
    });

    it('should update batch progress when operations complete', () => {
      const initialProgress = batchOperation.getBatchProgress();
      
      const fetchTracker = batchOperation.getOperation('fetch')!;
      fetchTracker.updateProgress(5, 'Fetch complete'); // 100% of fetch
      batchOperation.completeOperation('fetch');
      
      const updatedProgress = batchOperation.getBatchProgress();
      expect(updatedProgress).toBeGreaterThan(initialProgress);
    });
  });

  describe('getBatchProgress', () => {
    it('should calculate overall batch progress based on weights', () => {
      const fetchTracker = batchOperation.getOperation('fetch')!;
      const processTracker = batchOperation.getOperation('process')!;
      
      fetchTracker.updateProgress(5, 'Fetch complete'); // 100% of 30% weight = 30%
      processTracker.updateProgress(5, 'Half processed'); // 50% of 50% weight = 25%
      
      const batchProgress = batchOperation.getBatchProgress();
      expect(batchProgress).toBeGreaterThan(50); // Should be around 55%
      expect(batchProgress).toBeLessThan(60);
    });
  });

  describe('getSummary', () => {
    it('should return comprehensive batch summary', () => {
      const fetchTracker = batchOperation.getOperation('fetch')!;
      fetchTracker.updateProgress(3, 'Fetching in progress');
      
      const summary = batchOperation.getSummary();
      
      expect(summary).toMatchObject({
        batchId: 'test-batch',
        isComplete: false,
        completedOperations: 0,
        totalOperations: 3
      });
      
      expect(summary.operations).toHaveLength(3);
      expect(summary.operations[0]).toMatchObject({
        id: 'fetch',
        stage: 'Fetching Data',
        percentage: 60
      });
    });

    it('should reflect completion status in summary', () => {
      batchOperation.completeOperation('fetch');
      batchOperation.completeOperation('process');
      batchOperation.completeOperation('save');
      
      const summary = batchOperation.getSummary();
      
      expect(summary.isComplete).toBe(true);
      expect(summary.completedOperations).toBe(3);
    });
  });
});

describe('createStandardProgressManager', () => {
  it('should create progress manager with default stages', () => {
    const callback = jest.fn();
    const manager = createStandardProgressManager(callback);
    
    expect(manager).toBeInstanceOf(ProgressManager);
    
    // Test that default stages are set by creating a tracker
    const tracker = manager.createTracker('test', 10);
    tracker.setStage('FETCHING_REPOSITORIES');
    tracker.updateProgress(5, 'Fetching repos');
    
    expect(callback).toHaveBeenCalled();
  });

  it('should work without callback', () => {
    const manager = createStandardProgressManager();
    
    expect(manager).toBeInstanceOf(ProgressManager);
    expect(() => {
      const tracker = manager.createTracker('test', 10);
      tracker.updateProgress(5, 'Test');
    }).not.toThrow();
  });
});

describe('DEFAULT_STAGES', () => {
  it('should have correct stage weights', () => {
    expect(DEFAULT_STAGES.INITIALIZATION).toBe(5);
    expect(DEFAULT_STAGES.FETCHING_REPOSITORIES).toBe(20);
    expect(DEFAULT_STAGES.ANALYZING_CODE).toBe(50);
    expect(DEFAULT_STAGES.GENERATING_PROFILE).toBe(15);
    expect(DEFAULT_STAGES.FINALIZING).toBe(10);
  });

  it('should have weights that sum to 100', () => {
    const total = Object.values(DEFAULT_STAGES).reduce((sum, weight) => sum + weight, 0);
    expect(total).toBe(100);
  });
});

describe('Integration Tests', () => {
  it('should handle complex multi-stage, multi-operation scenario', async () => {
    const progressCallback = jest.fn();
    const manager = createStandardProgressManager(progressCallback);
    
    // Create batch operation
    const batchConfig = [
      { id: 'init', name: 'Initialization', weight: 10, totalSteps: 2 },
      { id: 'fetch', name: 'Fetching', weight: 30, totalSteps: 5 },
      { id: 'analyze', name: 'Analysis', weight: 50, totalSteps: 10 },
      { id: 'generate', name: 'Generation', weight: 10, totalSteps: 3 }
    ];
    
    const batch = manager.createBatchOperation('full-workflow', batchConfig);
    
    // Simulate workflow progression
    const initTracker = batch.getOperation('init')!;
    initTracker.setStage('INITIALIZATION');
    initTracker.updateProgress(2, 'Initialization complete');
    batch.completeOperation('init');
    
    const fetchTracker = batch.getOperation('fetch')!;
    fetchTracker.setStage('FETCHING_REPOSITORIES');
    for (let i = 1; i <= 5; i++) {
      fetchTracker.updateProgress(i, `Fetched ${i}/5 repositories`);
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    batch.completeOperation('fetch');
    
    const analyzeTracker = batch.getOperation('analyze')!;
    analyzeTracker.setStage('ANALYZING_CODE');
    for (let i = 1; i <= 10; i++) {
      analyzeTracker.updateProgress(i, `Analyzed ${i}/10 files`);
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    batch.completeOperation('analyze');
    
    const generateTracker = batch.getOperation('generate')!;
    generateTracker.setStage('GENERATING_PROFILE');
    generateTracker.updateProgress(3, 'Profile generated');
    batch.completeOperation('generate');
    
    // Verify final state
    expect(batch.isComplete()).toBe(true);
    expect(batch.getBatchProgress()).toBe(100);
    
    const summary = batch.getSummary();
    expect(summary.completedOperations).toBe(4);
    expect(summary.isComplete).toBe(true);
    
    // Verify progress callbacks were called
    expect(progressCallback).toHaveBeenCalled();
    
    manager.reset();
  });

  it('should handle error scenarios gracefully', () => {
    const manager = new ProgressManager();
    
    // Test with invalid operations
    expect(() => {
      manager.removeTracker('non-existent');
    }).not.toThrow();
    
    expect(() => {
      manager.updateProgress('invalid-stage', 50);
    }).not.toThrow();
    
    // Test batch operation with invalid operation ID
    const batch = manager.createBatchOperation('test', [
      { id: 'valid', name: 'Valid Op', weight: 100, totalSteps: 5 }
    ]);
    
    expect(batch.getOperation('invalid')).toBeUndefined();
    
    expect(() => {
      batch.completeOperation('invalid');
    }).not.toThrow();
  });
});