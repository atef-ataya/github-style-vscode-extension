import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}

export interface CacheOptions {
  maxMemoryEntries?: number;
  defaultTtl?: number;
  diskCacheDir?: string;
}

/**
 * Centralized cache manager with both memory and disk caching capabilities
 * Implements the caching strategy from Phase 3.1 of the improvement plan
 */
export class CacheManager {
  private static instance: CacheManager;
  private memoryCache = new Map<string, CacheEntry<any>>();
  private diskCacheDir: string;
  private maxMemoryEntries: number;
  private defaultTtl: number;

  private constructor(options: CacheOptions = {}) {
    this.maxMemoryEntries = options.maxMemoryEntries || 100;
    this.defaultTtl = options.defaultTtl || 3600000; // 1 hour in ms
    this.diskCacheDir = options.diskCacheDir || path.join(os.tmpdir(), 'github-style-agent-cache');
    
    this.ensureCacheDirectory();
  }

  static getInstance(options?: CacheOptions): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(options);
    }
    return CacheManager.instance;
  }

  /**
   * Get value from cache, checking memory first, then disk
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Check memory cache first
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry && this.isEntryValid(memoryEntry)) {
        return memoryEntry.value as T;
      }

      // Remove expired memory entry
      if (memoryEntry) {
        this.memoryCache.delete(key);
      }

      // Check disk cache
      const diskEntry = await this.getDiskEntry<T>(key);
      if (diskEntry && this.isEntryValid(diskEntry)) {
        // Promote to memory cache
        this.setMemoryEntry(key, diskEntry);
        return diskEntry.value;
      }

      return null;
    } catch (error) {
      console.warn(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in both memory and disk cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        value,
        timestamp: Date.now(),
        ttl: ttl || this.defaultTtl
      };

      // Set in memory cache
      this.setMemoryEntry(key, entry);

      // Set in disk cache
      await this.setDiskEntry(key, entry);
    } catch (error) {
      console.warn(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Remove entry from both memory and disk cache
   */
  async delete(key: string): Promise<void> {
    try {
      this.memoryCache.delete(key);
      await this.deleteDiskEntry(key);
    } catch (error) {
      console.warn(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      this.memoryCache.clear();
      await this.clearDiskCache();
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { memoryEntries: number; diskEntries: number } {
    const memoryEntries = this.memoryCache.size;
    let diskEntries = 0;
    
    try {
      if (fs.existsSync(this.diskCacheDir)) {
        diskEntries = fs.readdirSync(this.diskCacheDir).length;
      }
    } catch (error) {
      console.warn('Error getting disk cache stats:', error);
    }

    return { memoryEntries, diskEntries };
  }

  /**
   * Clean up expired entries from both memory and disk
   */
  async cleanup(): Promise<void> {
    try {
      // Clean memory cache
      for (const [key, entry] of this.memoryCache.entries()) {
        if (!this.isEntryValid(entry)) {
          this.memoryCache.delete(key);
        }
      }

      // Clean disk cache
      await this.cleanupDiskCache();
    } catch (error) {
      console.warn('Cache cleanup error:', error);
    }
  }

  private setMemoryEntry<T>(key: string, entry: CacheEntry<T>): void {
    // Implement LRU eviction if memory cache is full
    if (this.memoryCache.size >= this.maxMemoryEntries) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    this.memoryCache.set(key, entry);
  }

  private async getDiskEntry<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const filePath = this.getDiskPath(key);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data) as CacheEntry<T>;
    } catch (error) {
      return null;
    }
  }

  private async setDiskEntry<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    try {
      const filePath = this.getDiskPath(key);
      const data = JSON.stringify(entry);
      await fs.promises.writeFile(filePath, data, 'utf8');
    } catch (error) {
      // Silently fail disk writes to avoid breaking the application
    }
  }

  private async deleteDiskEntry(key: string): Promise<void> {
    try {
      const filePath = this.getDiskPath(key);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      // Silently fail disk operations
    }
  }

  private async clearDiskCache(): Promise<void> {
    try {
      if (fs.existsSync(this.diskCacheDir)) {
        const files = await fs.promises.readdir(this.diskCacheDir);
        await Promise.all(
          files.map(file => 
            fs.promises.unlink(path.join(this.diskCacheDir, file))
          )
        );
      }
    } catch (error) {
      // Silently fail disk operations
    }
  }

  private async cleanupDiskCache(): Promise<void> {
    try {
      if (!fs.existsSync(this.diskCacheDir)) {
        return;
      }

      const files = await fs.promises.readdir(this.diskCacheDir);
      for (const file of files) {
        const filePath = path.join(this.diskCacheDir, file);
        try {
          const data = await fs.promises.readFile(filePath, 'utf8');
          const entry = JSON.parse(data) as CacheEntry<any>;
          if (!this.isEntryValid(entry)) {
            await fs.promises.unlink(filePath);
          }
        } catch (error) {
          // Remove corrupted files
          await fs.promises.unlink(filePath);
        }
      }
    } catch (error) {
      // Silently fail disk operations
    }
  }

  private isEntryValid<T>(entry: CacheEntry<T>): boolean {
    if (!entry.ttl) {
      return true; // No TTL means never expires
    }
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private getDiskPath(key: string): string {
    // Create a safe filename from the key
    const safeKey = key.replace(/[^a-zA-Z0-9]/g, '_');
    return path.join(this.diskCacheDir, `${safeKey}.json`);
  }

  private ensureCacheDirectory(): void {
    try {
      if (!fs.existsSync(this.diskCacheDir)) {
        fs.mkdirSync(this.diskCacheDir, { recursive: true });
      }
    } catch (error) {
      console.warn('Failed to create cache directory:', error);
    }
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();