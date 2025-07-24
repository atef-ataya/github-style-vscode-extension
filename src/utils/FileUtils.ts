import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  extension?: string;
  lastModified: Date;
}

export interface ProjectFile {
  path: string;
  content: string;
  encoding?: string;
}

export interface ExportOptions {
  format: 'zip' | 'tar' | 'folder';
  includeHidden?: boolean;
  excludePatterns?: string[];
}

/**
 * Utility class for file operations and project management
 * Provides centralized file handling capabilities
 */
export class FileUtils {
  private static readonly DEFAULT_EXCLUDE_PATTERNS = [
    'node_modules',
    '.git',
    '.vscode',
    '*.log',
    '.env',
    'dist',
    'build',
    'out'
  ];

  /**
   * Read file content safely with error handling
   */
  static async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string | null> {
    try {
      const content = await fs.promises.readFile(filePath, encoding);
      return content;
    } catch (error) {
      console.warn(`Failed to read file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Write file content safely with directory creation
   */
  static async writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf8'): Promise<boolean> {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await this.ensureDirectory(dir);
      
      await fs.promises.writeFile(filePath, content, encoding);
      return true;
    } catch (error) {
      console.warn(`Failed to write file ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Ensure directory exists, create if it doesn't
   */
  static async ensureDirectory(dirPath: string): Promise<boolean> {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
      return true;
    } catch (error) {
      console.warn(`Failed to create directory ${dirPath}:`, error);
      return false;
    }
  }

  /**
   * Check if file or directory exists
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file information
   */
  static async getFileInfo(filePath: string): Promise<FileInfo | null> {
    try {
      const stats = await fs.promises.stat(filePath);
      const name = path.basename(filePath);
      const extension = path.extname(filePath);
      
      return {
        name,
        path: filePath,
        size: stats.size,
        isDirectory: stats.isDirectory(),
        extension: extension || undefined,
        lastModified: stats.mtime
      };
    } catch (error) {
      console.warn(`Failed to get file info for ${filePath}:`, error);
      return null;
    }
  }

  /**
   * List directory contents with filtering
   */
  static async listDirectory(
    dirPath: string, 
    options: {
      recursive?: boolean;
      includeHidden?: boolean;
      excludePatterns?: string[];
      fileTypesOnly?: string[];
    } = {}
  ): Promise<FileInfo[]> {
    try {
      const {
        recursive = false,
        includeHidden = false,
        excludePatterns = [],
        fileTypesOnly = []
      } = options;

      const allPatterns = [...this.DEFAULT_EXCLUDE_PATTERNS, ...excludePatterns];
      const files: FileInfo[] = [];

      const processDirectory = async (currentPath: string): Promise<void> => {
        const entries = await fs.promises.readdir(currentPath);
        
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry);
          const fileInfo = await this.getFileInfo(fullPath);
          
          if (!fileInfo) continue;

          // Skip hidden files if not included
          if (!includeHidden && entry.startsWith('.')) continue;

          // Skip excluded patterns
          if (this.matchesPatterns(entry, allPatterns)) continue;

          // Filter by file types if specified
          if (fileTypesOnly.length > 0 && !fileInfo.isDirectory) {
            const ext = fileInfo.extension?.toLowerCase();
            if (!ext || !fileTypesOnly.includes(ext)) continue;
          }

          files.push(fileInfo);

          // Recurse into directories if requested
          if (recursive && fileInfo.isDirectory) {
            await processDirectory(fullPath);
          }
        }
      };

      await processDirectory(dirPath);
      return files;
    } catch (error) {
      console.warn(`Failed to list directory ${dirPath}:`, error);
      return [];
    }
  }

  /**
   * Copy file or directory
   */
  static async copy(source: string, destination: string): Promise<boolean> {
    try {
      const sourceInfo = await this.getFileInfo(source);
      if (!sourceInfo) return false;

      if (sourceInfo.isDirectory) {
        return await this.copyDirectory(source, destination);
      } else {
        return await this.copyFile(source, destination);
      }
    } catch (error) {
      console.warn(`Failed to copy ${source} to ${destination}:`, error);
      return false;
    }
  }

  /**
   * Delete file or directory
   */
  static async delete(filePath: string): Promise<boolean> {
    try {
      const fileInfo = await this.getFileInfo(filePath);
      if (!fileInfo) return true; // Already doesn't exist

      if (fileInfo.isDirectory) {
        await fs.promises.rmdir(filePath, { recursive: true });
      } else {
        await fs.promises.unlink(filePath);
      }
      return true;
    } catch (error) {
      console.warn(`Failed to delete ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Create project structure from file definitions
   */
  static async createProject(projectPath: string, files: ProjectFile[]): Promise<boolean> {
    try {
      // Ensure project directory exists
      await this.ensureDirectory(projectPath);

      // Create all files
      for (const file of files) {
        const fullPath = path.join(projectPath, file.path);
        const success = await this.writeFile(fullPath, file.content, file.encoding as BufferEncoding);
        if (!success) {
          console.warn(`Failed to create file: ${file.path}`);
        }
      }

      return true;
    } catch (error) {
      console.warn(`Failed to create project at ${projectPath}:`, error);
      return false;
    }
  }

  /**
   * Export project to different formats
   */
  static async exportProject(
    projectPath: string, 
    outputPath: string, 
    options: ExportOptions
  ): Promise<boolean> {
    try {
      switch (options.format) {
        case 'folder':
          return await this.copy(projectPath, outputPath);
        case 'zip':
          return await this.createZipArchive(projectPath, outputPath, options);
        case 'tar':
          return await this.createTarArchive(projectPath, outputPath, options);
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      console.warn(`Failed to export project:`, error);
      return false;
    }
  }

  /**
   * Get workspace root path
   */
  static getWorkspaceRoot(): string | null {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    return workspaceFolders && workspaceFolders.length > 0 
      ? workspaceFolders[0].uri.fsPath 
      : null;
  }

  /**
   * Save file to workspace with user confirmation
   */
  static async saveToWorkspace(relativePath: string, content: string): Promise<boolean> {
    try {
      const workspaceRoot = this.getWorkspaceRoot();
      if (!workspaceRoot) {
        vscode.window.showErrorMessage('No workspace folder is open');
        return false;
      }

      const fullPath = path.join(workspaceRoot, relativePath);
      
      // Check if file already exists
      if (await this.exists(fullPath)) {
        const choice = await vscode.window.showWarningMessage(
          `File ${relativePath} already exists. Do you want to overwrite it?`,
          'Overwrite',
          'Cancel'
        );
        
        if (choice !== 'Overwrite') {
          return false;
        }
      }

      const success = await this.writeFile(fullPath, content);
      if (success) {
        vscode.window.showInformationMessage(`File saved: ${relativePath}`);
        
        // Open the file in editor
        const document = await vscode.workspace.openTextDocument(fullPath);
        await vscode.window.showTextDocument(document);
      }

      return success;
    } catch (error) {
      console.warn(`Failed to save to workspace:`, error);
      vscode.window.showErrorMessage(`Failed to save file: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate safe filename from string
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Get file extension from filename
   */
  static getExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  /**
   * Check if file is a code file based on extension
   */
  static isCodeFile(filename: string): boolean {
    const codeExtensions = [
      '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.h',
      '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala',
      '.html', '.css', '.scss', '.sass', '.less', '.vue', '.svelte'
    ];
    
    const ext = this.getExtension(filename);
    return codeExtensions.includes(ext);
  }

  private static async copyFile(source: string, destination: string): Promise<boolean> {
    try {
      await this.ensureDirectory(path.dirname(destination));
      await fs.promises.copyFile(source, destination);
      return true;
    } catch (error) {
      console.warn(`Failed to copy file ${source}:`, error);
      return false;
    }
  }

  private static async copyDirectory(source: string, destination: string): Promise<boolean> {
    try {
      await this.ensureDirectory(destination);
      
      const entries = await fs.promises.readdir(source);
      for (const entry of entries) {
        const sourcePath = path.join(source, entry);
        const destPath = path.join(destination, entry);
        await this.copy(sourcePath, destPath);
      }
      
      return true;
    } catch (error) {
      console.warn(`Failed to copy directory ${source}:`, error);
      return false;
    }
  }

  private static matchesPatterns(filename: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(filename);
      }
      return filename === pattern;
    });
  }

  private static async createZipArchive(
    sourcePath: string, 
    outputPath: string, 
    options: ExportOptions
  ): Promise<boolean> {
    // Note: This would require a zip library like 'archiver'
    // For now, we'll just copy the folder
    console.warn('ZIP export not implemented, falling back to folder copy');
    return await this.copy(sourcePath, outputPath.replace('.zip', ''));
  }

  private static async createTarArchive(
    sourcePath: string, 
    outputPath: string, 
    options: ExportOptions
  ): Promise<boolean> {
    // Note: This would require a tar library
    // For now, we'll just copy the folder
    console.warn('TAR export not implemented, falling back to folder copy');
    return await this.copy(sourcePath, outputPath.replace('.tar', ''));
  }
}