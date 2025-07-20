"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternAnalyzer = void 0;
class PatternAnalyzer {
    analyzeFile(content) {
        const patterns = {
            fileStructure: this.analyzeFileStructure(content),
            namingConventions: this.analyzeNamingConventions(content),
            commonPatterns: this.analyzeCommonPatterns(content),
            dependencies: this.analyzeDependencies(content)
        };
        return patterns;
    }
    analyzeFileStructure(content) {
        const structure = {
            totalLines: content.split('\n').length,
            importStatements: this.countImportStatements(content),
            classDefinitions: this.countClassDefinitions(content),
            functionDefinitions: this.countFunctionDefinitions(content)
        };
        return structure;
    }
    analyzeNamingConventions(content) {
        const conventions = {
            camelCase: this.countCamelCase(content),
            pascalCase: this.countPascalCase(content),
            snakeCase: this.countSnakeCase(content)
        };
        return conventions;
    }
    analyzeCommonPatterns(content) {
        const patterns = {
            asyncAwait: this.countAsyncAwait(content),
            promiseChaining: this.countPromiseChaining(content),
            errorHandling: this.countErrorHandling(content),
            destructuring: this.countDestructuring(content)
        };
        return patterns;
    }
    analyzeDependencies(content) {
        const dependencies = {
            frameworks: this.detectFrameworks(content),
            libraries: this.detectLibraries(content),
            testing: this.detectTestingTools(content)
        };
        return dependencies;
    }
    countImportStatements(content) {
        const importRegex = /^\s*import\s+.+\s+from\s+['"].*['"];?$/gm;
        return (content.match(importRegex) || []).length;
    }
    countClassDefinitions(content) {
        const classRegex = /^\s*(?:export\s+)?class\s+\w+/gm;
        return (content.match(classRegex) || []).length;
    }
    countFunctionDefinitions(content) {
        const functionRegex = /^\s*(?:export\s+)?(?:async\s+)?function\s+\w+|^\s*\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/gm;
        return (content.match(functionRegex) || []).length;
    }
    countCamelCase(content) {
        const camelCaseRegex = /\b[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*\b/g;
        return (content.match(camelCaseRegex) || []).length;
    }
    countPascalCase(content) {
        const pascalCaseRegex = /\b[A-Z][a-zA-Z0-9]+\b/g;
        return (content.match(pascalCaseRegex) || []).length;
    }
    countSnakeCase(content) {
        const snakeCaseRegex = /\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g;
        return (content.match(snakeCaseRegex) || []).length;
    }
    countAsyncAwait(content) {
        const asyncAwaitRegex = /\basync\s+|\bawait\s+/g;
        return (content.match(asyncAwaitRegex) || []).length;
    }
    countPromiseChaining(content) {
        const promiseRegex = /\.then\s*\(|Promise\./g;
        return (content.match(promiseRegex) || []).length;
    }
    countErrorHandling(content) {
        const errorRegex = /\btry\s*{|\bcatch\s*\(|\bthrow\s+|\bError\b/g;
        return (content.match(errorRegex) || []).length;
    }
    countDestructuring(content) {
        const destructuringRegex = /(?:const|let|var)\s*{[^}]+}\s*=|\({[^}]+}\)/g;
        return (content.match(destructuringRegex) || []).length;
    }
    detectFrameworks(content) {
        const frameworks = [];
        if (content.includes('react'))
            frameworks.push('React');
        if (content.includes('angular'))
            frameworks.push('Angular');
        if (content.includes('vue'))
            frameworks.push('Vue');
        if (content.includes('express'))
            frameworks.push('Express');
        if (content.includes('nest'))
            frameworks.push('NestJS');
        return frameworks;
    }
    detectLibraries(content) {
        const libraries = [];
        if (content.includes('lodash'))
            libraries.push('Lodash');
        if (content.includes('axios'))
            libraries.push('Axios');
        if (content.includes('moment'))
            libraries.push('Moment.js');
        if (content.includes('redux'))
            libraries.push('Redux');
        if (content.includes('mobx'))
            libraries.push('MobX');
        return libraries;
    }
    detectTestingTools(content) {
        const tools = [];
        if (content.includes('jest'))
            tools.push('Jest');
        if (content.includes('mocha'))
            tools.push('Mocha');
        if (content.includes('chai'))
            tools.push('Chai');
        if (content.includes('enzyme'))
            tools.push('Enzyme');
        if (content.includes('testing-library'))
            tools.push('Testing Library');
        return tools;
    }
}
exports.PatternAnalyzer = PatternAnalyzer;
//# sourceMappingURL=PatternAnalyzer.js.map