interface CodeGeneratorConfig {
    namingStyle: {
        variables: string;
        functions: string;
        classes: string;
    };
    codeStyle: {
        indentation: string;
        lineSpacing: number;
        commentStyle: string;
    };
    structuralPreferences: {
        functionLength: number;
        errorHandlingStyle: string;
        classStructure: string;
    };
    preferredDependencies: {
        frameworks: string[];
        libraries: string[];
    };
}
export declare class CodeGenerator {
    private openai;
    private config;
    constructor(apiKey: string, config: CodeGeneratorConfig);
    generateCode(specification: string): Promise<string>;
    private createPrompt;
}
export {};
