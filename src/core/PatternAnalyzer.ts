import { AnalysisDepth, SimpleStyleProfile } from './types';

export class PatternAnalyzer {
  private styleProfile: Record<string, number> = {};
  private fileCount: number = 0;

  feed(content: string, _analysisDepth: AnalysisDepth = 'detailed'): void {
    if (!content) {
      return;
    }

    try {
      const lines = content.split('\n');

      const indentSpaces = lines.filter(line => line.startsWith('    ')).length;
      const indentTabs = lines.filter(line => line.startsWith('\t')).length;
      const semicolons = lines.filter(line => line.trim().endsWith(';')).length;
      const singleQuotes = lines.filter(line => line.includes("'")).length;
      const doubleQuotes = lines.filter(line => line.includes('"')).length;

      this.styleProfile.indentSpaces = (this.styleProfile.indentSpaces ?? 0) + indentSpaces;
      this.styleProfile.indentTabs = (this.styleProfile.indentTabs ?? 0) + indentTabs;
      this.styleProfile.semicolons = (this.styleProfile.semicolons ?? 0) + semicolons;
      this.styleProfile.singleQuotes = (this.styleProfile.singleQuotes ?? 0) + singleQuotes;
      this.styleProfile.doubleQuotes = (this.styleProfile.doubleQuotes ?? 0) + doubleQuotes;
      this.styleProfile.totalLines = (this.styleProfile.totalLines ?? 0) + lines.length;

      this.fileCount++;
    } catch (error) {
      // Handle error silently
    }
  }

  getStyle(): SimpleStyleProfile {
    if (this.fileCount === 0) {
      return {
        indentStyle: 'spaces',
        quoteStyle: 'double',
        useSemicolons: true,
        raw: {},
        fileCount: 0
      };
    }

    try {
      const totalLines = this.styleProfile.totalLines ?? 1;
      const indentSpaces = this.styleProfile.indentSpaces ?? 0;
      const indentTabs = this.styleProfile.indentTabs ?? 0;
      const singleQuotes = this.styleProfile.singleQuotes ?? 0;
      const doubleQuotes = this.styleProfile.doubleQuotes ?? 0;
      const semicolons = this.styleProfile.semicolons ?? 0;

      const indentStyle = indentSpaces > indentTabs ? 'spaces' : 'tabs';
      const quoteStyle = singleQuotes > doubleQuotes ? 'single' : 'double';
      const useSemicolons = semicolons / totalLines > 0.5;

      return {
        indentStyle,
        quoteStyle,
        useSemicolons,
        raw: this.styleProfile,
        fileCount: this.fileCount
      };
    } catch (error) {
      return {
        indentStyle: 'spaces',
        quoteStyle: 'double',
        useSemicolons: true,
        raw: this.styleProfile,
        fileCount: this.fileCount
      };
    }
  }
}
