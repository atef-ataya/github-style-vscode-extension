import { ProgressTracker, AnalysisProgress } from '../../core/ProgressTracker';

describe('ProgressTracker', () => {
  let progressTracker: ProgressTracker;
  let mockCallback: jest.Mock;

  beforeEach(() => {
    mockCallback = jest.fn();
    progressTracker = new ProgressTracker('test-operation', 10, mockCallback);
  });

  describe('constructor', () => {
    it('should initialize with correct values', () => {
      expect(progressTracker.getId()).toBe('test-operation');
      expect(progressTracker.getTotalSteps()).toBe(10);
      expect(progressTracker.getCurrentStep()).toBe(0);
      expect(progressTracker.getPercentage()).toBe(0);
      expect(progressTracker.isComplete()).toBe(false);
    });

    it('should work without callback', () => {
      const tracker = new ProgressTracker('test', 5);
      expect(tracker).toBeInstanceOf(ProgressTracker);
      expect(() => tracker.updateProgress(1, 'Test')).not.toThrow();
    });

    it('should handle zero total steps', () => {
      const tracker = new ProgressTracker('test', 0);
      expect(tracker.getTotalSteps()).toBe(0);
      expect(tracker.getPercentage()).toBe(0);
    });
  });

  describe('updateProgress', () => {
    it('should update current step and calculate percentage', () => {
      progressTracker.updateProgress(3, 'Processing step 3');
      
      expect(progressTracker.getCurrentStep()).toBe(3);
      expect(progressTracker.getPercentage()).toBe(30);
      expect(progressTracker.getLastMessage()).toBe('Processing step 3');
      expect(progressTracker.isComplete()).toBe(false);
    });

    it('should call progress callback with correct data', () => {
      progressTracker.updateProgress(5, 'Half way done');
      
      expect(mockCallback).toHaveBeenCalledWith({
        id: 'test-operation',
        currentStep: 5,
        totalSteps: 10,
        percentage: 50,
        message: 'Half way done',
        stage: undefined,
        isComplete: false,
        startTime: expect.any(Date),
        lastUpdateTime: expect.any(Date),
        elapsedTime: expect.any(Number)
      });
    });

    it('should handle completion when current step equals total steps', () => {
      progressTracker.updateProgress(10, 'Completed');
      
      expect(progressTracker.isComplete()).toBe(true);
      expect(progressTracker.getPercentage()).toBe(100);
    });

    it('should handle steps exceeding total steps', () => {
      progressTracker.updateProgress(15, 'Over completion');
      
      expect(progressTracker.getCurrentStep()).toBe(15);
      expect(progressTracker.getPercentage()).toBe(150);
      expect(progressTracker.isComplete()).toBe(true);
    });

    it('should handle negative steps', () => {
      progressTracker.updateProgress(-1, 'Negative step');
      
      expect(progressTracker.getCurrentStep()).toBe(-1);
      expect(progressTracker.getPercentage()).toBe(-10);
    });

    it('should update last update time', () => {
      const initialTime = progressTracker.getLastUpdateTime();
      
      // Wait a small amount to ensure time difference
      setTimeout(() => {
        progressTracker.updateProgress(1, 'Updated');
        const updatedTime = progressTracker.getLastUpdateTime();
        
        expect(updatedTime.getTime()).toBeGreaterThan(initialTime.getTime());
      }, 10);
    });
  });

  describe('setStage', () => {
    it('should set and get stage', () => {
      progressTracker.setStage('processing');
      
      expect(progressTracker.getStage()).toBe('processing');
    });

    it('should include stage in callback data', () => {
      progressTracker.setStage('analyzing');
      progressTracker.updateProgress(2, 'Analyzing data');
      
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: 'analyzing'
        })
      );
    });

    it('should handle undefined stage', () => {
      progressTracker.setStage(undefined);
      
      expect(progressTracker.getStage()).toBeUndefined();
    });
  });

  describe('complete', () => {
    it('should mark tracker as complete', () => {
      progressTracker.complete('Operation finished');
      
      expect(progressTracker.isComplete()).toBe(true);
      expect(progressTracker.getCurrentStep()).toBe(10);
      expect(progressTracker.getPercentage()).toBe(100);
      expect(progressTracker.getLastMessage()).toBe('Operation finished');
    });

    it('should call callback when completed', () => {
      progressTracker.complete('Done');
      
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          isComplete: true,
          percentage: 100,
          message: 'Done'
        })
      );
    });

    it('should use default message if none provided', () => {
      progressTracker.complete();
      
      expect(progressTracker.getLastMessage()).toBe('Completed');
    });
  });

  describe('reset', () => {
    it('should reset tracker to initial state', () => {
      progressTracker.setStage('processing');
      progressTracker.updateProgress(7, 'Almost done');
      
      expect(progressTracker.getCurrentStep()).toBe(7);
      expect(progressTracker.getStage()).toBe('processing');
      
      progressTracker.reset();
      
      expect(progressTracker.getCurrentStep()).toBe(0);
      expect(progressTracker.getPercentage()).toBe(0);
      expect(progressTracker.getStage()).toBeUndefined();
      expect(progressTracker.getLastMessage()).toBe('');
      expect(progressTracker.isComplete()).toBe(false);
    });

    it('should update start time when reset', () => {
      const originalStartTime = progressTracker.getStartTime();
      
      setTimeout(() => {
        progressTracker.reset();
        const newStartTime = progressTracker.getStartTime();
        
        expect(newStartTime.getTime()).toBeGreaterThan(originalStartTime.getTime());
      }, 10);
    });
  });

  describe('getElapsedTime', () => {
    it('should return elapsed time in milliseconds', () => {
      const elapsedTime = progressTracker.getElapsedTime();
      
      expect(elapsedTime).toBeGreaterThanOrEqual(0);
      expect(typeof elapsedTime).toBe('number');
    });

    it('should increase over time', (done) => {
      const initialElapsed = progressTracker.getElapsedTime();
      
      setTimeout(() => {
        const laterElapsed = progressTracker.getElapsedTime();
        expect(laterElapsed).toBeGreaterThan(initialElapsed);
        done();
      }, 50);
    });
  });

  describe('getProgress', () => {
    it('should return complete progress information', () => {
      progressTracker.setStage('testing');
      progressTracker.updateProgress(4, 'Testing in progress');
      
      const progress = progressTracker.getProgress();
      
      expect(progress).toMatchObject({
        id: 'test-operation',
        currentStep: 4,
        totalSteps: 10,
        percentage: 40,
        message: 'Testing in progress',
        stage: 'testing',
        isComplete: false,
        startTime: expect.any(Date),
        lastUpdateTime: expect.any(Date),
        elapsedTime: expect.any(Number)
      });
    });

    it('should reflect current state accurately', () => {
      progressTracker.complete('All done');
      
      const progress = progressTracker.getProgress();
      
      expect(progress.isComplete).toBe(true);
      expect(progress.percentage).toBe(100);
      expect(progress.currentStep).toBe(10);
    });
  });

  describe('edge cases', () => {
    it('should handle tracker with 1 total step', () => {
      const singleStepTracker = new ProgressTracker('single', 1, mockCallback);
      
      expect(singleStepTracker.getPercentage()).toBe(0);
      
      singleStepTracker.updateProgress(1, 'Done');
      
      expect(singleStepTracker.getPercentage()).toBe(100);
      expect(singleStepTracker.isComplete()).toBe(true);
    });

    it('should handle very large total steps', () => {
      const largeTracker = new ProgressTracker('large', 1000000);
      
      largeTracker.updateProgress(500000, 'Half way');
      
      expect(largeTracker.getPercentage()).toBe(50);
    });

    it('should handle fractional percentages correctly', () => {
      const tracker = new ProgressTracker('fraction', 3);
      
      tracker.updateProgress(1, 'One third');
      
      expect(tracker.getPercentage()).toBeCloseTo(33.33, 1);
    });
  });

  describe('callback behavior', () => {
    it('should not call callback if none provided', () => {
      const tracker = new ProgressTracker('no-callback', 5);
      
      expect(() => {
        tracker.updateProgress(2, 'Test');
        tracker.setStage('test-stage');
        tracker.complete();
        tracker.reset();
      }).not.toThrow();
    });

    it('should call callback on every progress update', () => {
      progressTracker.updateProgress(1, 'Step 1');
      progressTracker.updateProgress(2, 'Step 2');
      progressTracker.updateProgress(3, 'Step 3');
      
      expect(mockCallback).toHaveBeenCalledTimes(3);
    });

    it('should call callback when stage is set during progress', () => {
      progressTracker.setStage('initial');
      progressTracker.updateProgress(1, 'First step');
      
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: 'initial'
        })
      );
    });
  });

  describe('time tracking', () => {
    it('should track start time correctly', () => {
      const startTime = progressTracker.getStartTime();
      
      expect(startTime).toBeInstanceOf(Date);
      expect(startTime.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should track last update time correctly', () => {
      const initialUpdateTime = progressTracker.getLastUpdateTime();
      
      progressTracker.updateProgress(1, 'Updated');
      const newUpdateTime = progressTracker.getLastUpdateTime();
      
      expect(newUpdateTime.getTime()).toBeGreaterThanOrEqual(initialUpdateTime.getTime());
    });

    it('should calculate elapsed time correctly', () => {
      const elapsed1 = progressTracker.getElapsedTime();
      
      // Small delay
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Busy wait for 10ms
      }
      
      const elapsed2 = progressTracker.getElapsedTime();
      
      expect(elapsed2).toBeGreaterThan(elapsed1);
    });
  });

  describe('message handling', () => {
    it('should store and retrieve last message', () => {
      expect(progressTracker.getLastMessage()).toBe('');
      
      progressTracker.updateProgress(1, 'First message');
      expect(progressTracker.getLastMessage()).toBe('First message');
      
      progressTracker.updateProgress(2, 'Second message');
      expect(progressTracker.getLastMessage()).toBe('Second message');
    });

    it('should handle empty messages', () => {
      progressTracker.updateProgress(1, '');
      expect(progressTracker.getLastMessage()).toBe('');
      
      progressTracker.updateProgress(2);
      expect(progressTracker.getLastMessage()).toBe('');
    });

    it('should handle undefined messages', () => {
      progressTracker.updateProgress(1, undefined as any);
      expect(progressTracker.getLastMessage()).toBe('');
    });
  });
});

describe('AnalysisProgress interface', () => {
  it('should have correct structure', () => {
    const progress: AnalysisProgress = {
      id: 'test',
      currentStep: 5,
      totalSteps: 10,
      percentage: 50,
      message: 'Test message',
      stage: 'testing',
      isComplete: false,
      startTime: new Date(),
      lastUpdateTime: new Date(),
      elapsedTime: 1000
    };
    
    expect(progress.id).toBe('test');
    expect(progress.currentStep).toBe(5);
    expect(progress.totalSteps).toBe(10);
    expect(progress.percentage).toBe(50);
    expect(progress.message).toBe('Test message');
    expect(progress.stage).toBe('testing');
    expect(progress.isComplete).toBe(false);
    expect(progress.startTime).toBeInstanceOf(Date);
    expect(progress.lastUpdateTime).toBeInstanceOf(Date);
    expect(progress.elapsedTime).toBe(1000);
  });
});

describe('Integration scenarios', () => {
  it('should handle rapid progress updates', () => {
    const callback = jest.fn();
    const tracker = new ProgressTracker('rapid', 100, callback);
    
    // Simulate rapid updates
    for (let i = 1; i <= 100; i++) {
      tracker.updateProgress(i, `Step ${i}`);
    }
    
    expect(callback).toHaveBeenCalledTimes(100);
    expect(tracker.isComplete()).toBe(true);
    expect(tracker.getPercentage()).toBe(100);
  });

  it('should handle stage changes during progress', () => {
    const callback = jest.fn();
    const tracker = new ProgressTracker('stages', 10, callback);
    
    tracker.setStage('initialization');
    tracker.updateProgress(2, 'Initializing');
    
    tracker.setStage('processing');
    tracker.updateProgress(6, 'Processing');
    
    tracker.setStage('finalization');
    tracker.updateProgress(10, 'Finalizing');
    
    expect(tracker.getStage()).toBe('finalization');
    expect(tracker.isComplete()).toBe(true);
    
    // Verify stage was included in callbacks
    const lastCall = callback.mock.calls[callback.mock.calls.length - 1][0];
    expect(lastCall.stage).toBe('finalization');
  });

  it('should handle reset and reuse', () => {
    const callback = jest.fn();
    const tracker = new ProgressTracker('reuse', 5, callback);
    
    // First use
    tracker.setStage('first-run');
    tracker.updateProgress(5, 'First completion');
    expect(tracker.isComplete()).toBe(true);
    
    // Reset and reuse
    tracker.reset();
    expect(tracker.isComplete()).toBe(false);
    expect(tracker.getCurrentStep()).toBe(0);
    
    tracker.setStage('second-run');
    tracker.updateProgress(3, 'Second run progress');
    
    expect(tracker.getStage()).toBe('second-run');
    expect(tracker.getCurrentStep()).toBe(3);
    expect(tracker.getPercentage()).toBe(60);
  });
});