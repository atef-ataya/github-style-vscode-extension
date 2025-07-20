"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternAnalyzer = void 0;
class PatternAnalyzer {
    analyzeFile(fileContent) {
        return {
            fileStructure: this.analyzeFileStructure(fileContent),
            namingConventions: this.analyzeNamingConventions(fileContent),
            commonPatterns: this.analyzeCommonPatterns(fileContent),
            dependencies: this.analyzeDependencies(fileContent)
        };
    }
    analyzeFileStructure(content) {
        const structure = {
            totalLines: content.split('\n').length,
            emptyLines: content.split('\n').filter(line => line.trim() === '').length,
            commentLines: this.countCommentLines(content),
            functions: this.extractFunctions(content),
            classes: this.extractClasses(content)
        };
        return structure;
    }
    analyzeNamingConventions(content) {
        const conventions = {
            variables: this.detectVariableNamingStyle(content),
            functions: this.detectFunctionNamingStyle(content),
            classes: this.detectClassNamingStyle(content)
        };
        return conventions;
    }
    analyzeCommonPatterns(content) {
        return {
            indentationStyle: this.detectIndentationStyle(content),
            lineSpacing: this.analyzeLineSpacing(content),
            errorHandling: this.detectErrorHandlingStyle(content),
            commentStyle: this.detectCommentStyle(content)
        };
    }
    analyzeDependencies(content) {
        const imports = this.extractImports(content);
        const dependencies = {
            frameworks: this.identifyFrameworks(imports),
            libraries: this.identifyLibraries(imports),
            versions: this.extractVersions(imports)
        };
        return dependencies;
    }
    countCommentLines(content) {
        const lines = content.split('\n');
        let commentCount = 0;
        let inMultilineComment = false;
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (inMultilineComment) {
                commentCount++;
                if (trimmedLine.includes('*/')) {
                    inMultilineComment = false;
                }
            }
            else if (trimmedLine.startsWith('//')) {
                commentCount++;
            }
            else if (trimmedLine.startsWith('/*')) {
                commentCount++;
                inMultilineComment = true;
            }
        }
        return commentCount;
    }
    extractFunctions(content) {
        // Simplified regex with limited backtracking
        const functionRegex = /(?:function\s+([\w$]{1,100})|(?:const|let|var)\s+([\w$]{1,100})\s*=\s*(?:async\s*)?function|(?:const|let|var)\s+([\w$]{1,100})\s*=\s*(?:async\s*)?\([^)]\)\s*=>)\s*\{([^}]{0,5000})\}/g;
        const functions = [];
        let match;
        // Set a limit on iterations to prevent infinite loops
        let iterationCount = 0;
        const MAX_ITERATIONS = 1000;
        
        while ((match = functionRegex.exec(content)) !== null && iterationCount < MAX_ITERATIONS) {
            iterationCount++;
            const name = match[1] || match[2] || match[3];
            const body = match[4];
            const length = body.split('\n').length;
            functions.push({ name, length });
        }
        return functions;
    }
    extractClasses(content) {
        // Simplified regex with limited backtracking
        const classRegex = /class\s+([\w$]{1,100})[^{]{0,500}\{([^}]{0,10000})\}/g;
        const classes = [];
        let match;
        // Set a limit on iterations to prevent infinite loops
        let iterationCount = 0;
        const MAX_ITERATIONS = 1000;
        
        while ((match = classRegex.exec(content)) !== null && iterationCount < MAX_ITERATIONS) {
            iterationCount++;
            const name = match[1];
            const body = match[2];
            const methods = this.extractMethodNames(body);
            classes.push({ name, methods });
        }
        return classes;
    }
    extractMethodNames(classBody) {
        // Simplified regex with limited backtracking
        const methodRegex = /(?:async\s+)?([\w$]{1,100})\s*\([^)]\)\s*\{/g;
        const methods = [];
        let match;
        // Set a limit on iterations to prevent infinite loops
        let iterationCount = 0;
        const MAX_ITERATIONS = 1000;
        
        while ((match = methodRegex.exec(classBody)) !== null && iterationCount < MAX_ITERATIONS) {
            iterationCount++;
            methods.push(match[1]);
        }
        return methods;
    }
    detectVariableNamingStyle(content) {
        const camelCaseRegex = /(?:let|const|var)\s+[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*/;
        const snakeCaseRegex = /(?:let|const|var)\s+[a-z][a-z0-9]*_[a-z0-9]+/;
        const camelCaseCount = (content.match(camelCaseRegex) || []).length;
        const snakeCaseCount = (content.match(snakeCaseRegex) || []).length;
        return camelCaseCount > snakeCaseCount ? 'camelCase' : 'snake_case';
    }
    detectFunctionNamingStyle(content) {
        const camelCaseRegex = /function\s+[a-z][a-zA-Z0-9]*/;
        const pascalCaseRegex = /function\s+[A-Z][a-zA-Z0-9]*/;
        const camelCaseCount = (content.match(camelCaseRegex) || []).length;
        const pascalCaseCount = (content.match(pascalCaseRegex) || []).length;
        return camelCaseCount > pascalCaseCount ? 'camelCase' : 'PascalCase';
    }
    detectClassNamingStyle(content) {
        const pascalCaseRegex = /class\s+[A-Z][a-zA-Z0-9]*/;
        return (content.match(pascalCaseRegex) || []).length > 0 ? 'PascalCase' : 'unknown';
    }
    detectIndentationStyle(content) {
        const lines = content.split('\n');
        let spacesCount = 0;
        let tabsCount = 0;
        for (const line of lines) {
            if (line.startsWith('    ')) {
                spacesCount++;
            }
            if (line.startsWith('\t')) {
                tabsCount++;
            }
        }
        if (spacesCount > tabsCount) {
            return '4 spaces';
        }
        else if (tabsCount > spacesCount) {
            return 'tabs';
        }
        else {
            return '2 spaces'; // default assumption
        }
    }
    analyzeLineSpacing(content) {
        const lines = content.split('\n');
        let emptyLineCount = 0;
        let blockCount = 0;
        for (let i = 0; i < lines.length - 1; i++) {
            if (lines[i].trim() === '' && lines[i + 1].trim() !== '') {
                emptyLineCount++;
                blockCount++;
            }
        }
        return blockCount > 0 ? Math.round(emptyLineCount / blockCount) : 1;
    }
    detectErrorHandlingStyle(content) {
        const hasTryCatch = content.includes('try') && content.includes('catch');
        const hasThrow = content.includes('throw');
        const hasErrorFirst = content.includes('(error,') || content.includes('(err,');
        if (hasTryCatch && hasThrow) {
            return 'try-catch-throw';
        }
        if (hasErrorFirst) {
            return 'error-first-callbacks';
        }
        return 'minimal';
    }
    detectCommentStyle(content) {
        const singleLineComments = (content.match(/\/\/.*/g) || []).length;
        const multiLineComments = (content.match(/\/\*[\s\S]*?\*\//g) || []).length;
        const jsDocComments = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length;
        if (jsDocComments > 0) {
            return 'jsdoc';
        }
        if (multiLineComments > singleLineComments) {
            return 'multi_line';
        }
        return 'single_line';
    }
    extractImports(content) {
        const imports = [];
        // Simplified regex with limited backtracking
        const importRegex = /import\s+(?:{[^}]{0,500}}\s+from\s+)?['"]([@\w-]{1,200})['"]\.?/g;
        let match;
        // Set a limit on iterations to prevent infinite loops
        let iterationCount = 0;
        const MAX_ITERATIONS = 1000;
        
        while ((match = importRegex.exec(content)) !== null && iterationCount < MAX_ITERATIONS) {
            iterationCount++;
            imports.push(match[1]);
        }
        return imports;
    }
    identifyFrameworks(imports) {
        const commonFrameworks = ['react', 'vue', 'angular', 'next', 'nuxt', 'express', 'koa', 'nest'];
        return imports.filter(imp => commonFrameworks.some(framework => imp.toLowerCase().includes(framework.toLowerCase())));
    }
    identifyLibraries(imports) {
        return imports.filter(imp => !this.identifyFrameworks([imp]).length &&
            !imp.startsWith('.'));
    }
    extractVersions(imports) {
        // This would typically come from package.json
        // For now, return an empty object as version information
        // isn't available from import statements alone
        return {};
    }
}
exports.PatternAnalyzer = PatternAnalyzer;
