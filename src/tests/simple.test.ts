/**
 * Simple test to verify Jest setup is working
 */

describe('Test Infrastructure', () => {
  test('should run basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should have access to global test utils', () => {
    expect(global.testUtils).toBeDefined();
    expect(typeof global.testUtils.createMockStyleProfile).toBe('function');
  });

  test('should create mock style profile', () => {
    const profile = global.testUtils.createMockStyleProfile();
    expect(profile).toBeDefined();
    expect(profile.indentation).toBeDefined();
    expect(profile.naming).toBeDefined();
  });

  test('should have mocked vscode module', () => {
    const vscode = require('vscode');
    expect(vscode.workspace).toBeDefined();
    expect(vscode.window).toBeDefined();
  });

  test('should have mocked fs module', () => {
    const fs = require('fs');
    expect(fs.existsSync).toBeDefined();
    expect(fs.promises).toBeDefined();
  });
});