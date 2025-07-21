"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternAnalyzer = void 0;
class PatternAnalyzer {
    styleProfile = {};
    fileCount = 0;
    feed(content, _analysisDepth = 'detailed') {
        if (!content) {
            console.warn('Empty content provided to PatternAnalyzer');
            return;
        }
        try {
            const lines = content.split('\n');
            // Example style detection logic
            const indentSpaces = lines.filter(line => line.startsWith('    ')).length;
            const indentTabs = lines.filter(line => line.startsWith('\t')).length;
            const semicolons = lines.filter(line => line.trim().endsWith(';')).length;
            const singleQuotes = lines.filter(line => line.includes("'")).length;
            const doubleQuotes = lines.filter(line => line.includes('"')).length;
            // Update the style profile by adding to existing values
            this.styleProfile.indentSpaces =
                (this.styleProfile.indentSpaces ?? 0) + indentSpaces;
            this.styleProfile.indentTabs =
                (this.styleProfile.indentTabs ?? 0) + indentTabs;
            this.styleProfile.semicolons =
                (this.styleProfile.semicolons ?? 0) + semicolons;
            this.styleProfile.singleQuotes =
                (this.styleProfile.singleQuotes ?? 0) + singleQuotes;
            this.styleProfile.doubleQuotes =
                (this.styleProfile.doubleQuotes ?? 0) + doubleQuotes;
            this.styleProfile.totalLines =
                (this.styleProfile.totalLines ?? 0) + lines.length;
            this.fileCount++;
        }
        catch (error) {
            console.error('Error analyzing code content:', error);
        }
    }
    getStyle() {
        if (this.fileCount === 0) {
            console.warn('No files have been analyzed yet');
            return {
                indentStyle: 'spaces', // Default to spaces
                quoteStyle: 'double', // Default to double quotes
                useSemicolons: true, // Default to using semicolons
                raw: {},
                fileCount: 0,
            };
        }
        try {
            const totalLines = this.styleProfile.totalLines ?? 1;
            // Determine the dominant style
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
                fileCount: this.fileCount,
            };
        }
        catch (error) {
            console.error('Error calculating style profile:', error);
            return {
                indentStyle: 'spaces', // Default to spaces
                quoteStyle: 'double', // Default to double quotes
                useSemicolons: true, // Default to using semicolons
                raw: this.styleProfile,
                fileCount: this.fileCount,
            };
        }
    }
}
exports.PatternAnalyzer = PatternAnalyzer;
//# sourceMappingURL=PatternAnalyzer.js.map