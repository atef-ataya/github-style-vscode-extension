export declare class PatternAnalyzer {
    analyzeFile(content: string): any;
    private analyzeFileStructure;
    private analyzeNamingConventions;
    private analyzeCommonPatterns;
    private analyzeDependencies;
    private countImportStatements;
    private countClassDefinitions;
    private countFunctionDefinitions;
    private countCamelCase;
    private countPascalCase;
    private countSnakeCase;
    private countAsyncAwait;
    private countPromiseChaining;
    private countErrorHandling;
    private countDestructuring;
    private detectFrameworks;
    private detectLibraries;
    private detectTestingTools;
}
