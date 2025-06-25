"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternAnalyzer = void 0;
class PatternAnalyzer {
    styleProfile = {};
    feed(content, analysisDepth = 'detailed') {
        const lines = content.split('\n');
        // Example style detection logic
        const indentSpaces = lines.filter((line) => line.startsWith('    ')).length;
        const indentTabs = lines.filter((line) => line.startsWith('\t')).length;
        const semicolons = lines.filter((line) => line.trim().endsWith(';')).length;
        const singleQuotes = lines.filter((line) => line.includes("'")).length;
        const doubleQuotes = lines.filter((line) => line.includes('"')).length;
        this.styleProfile = {
            indentSpaces,
            indentTabs,
            semicolons,
            singleQuotes,
            doubleQuotes,
            totalLines: lines.length,
        };
    }
    getStyle() {
        return this.styleProfile;
    }
}
exports.PatternAnalyzer = PatternAnalyzer;
