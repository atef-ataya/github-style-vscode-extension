"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeGenerator = void 0;
const openai_1 = __importDefault(require("openai"));
class CodeGenerator {
    openai;
    config;
    constructor(apiKey, config) {
        this.openai = new openai_1.default({ apiKey });
        this.config = config;
    }
    async generateCode(specification) {
        try {
            const prompt = this.createPrompt(specification);
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are a code generation assistant that writes code following specific style patterns and conventions. Please generate code according to these preferences:
              - Variable naming: ${this.config.namingStyle.variables}
              - Function naming: ${this.config.namingStyle.functions}
              - Class naming: ${this.config.namingStyle.classes}
              - Indentation: ${this.config.codeStyle.indentation}
              - Line spacing: ${this.config.codeStyle.lineSpacing} empty lines between blocks
              - Comment style: ${this.config.codeStyle.commentStyle}
              - Preferred function length: ${this.config.structuralPreferences.functionLength} lines
              - Error handling style: ${this.config.structuralPreferences.errorHandlingStyle}
              - Class structure: ${this.config.structuralPreferences.classStructure}
              - Using frameworks: ${this.config.preferredDependencies.frameworks.join(', ')}
              - Using libraries: ${this.config.preferredDependencies.libraries.join(', ')}`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            });
            const generatedCode = completion.choices[0]?.message?.content;
            if (!generatedCode) {
                throw new Error('No code was generated');
            }
            return this.postProcessCode(generatedCode);
        }
        catch (error) {
            console.error('Error generating code:', error);
            throw new Error('Failed to generate code');
        }
    }
    createPrompt(specification) {
        return `Please generate code for the following specification, strictly following the style preferences provided:

${specification}

Ensure the code follows:
1. The specified naming conventions for variables, functions, and classes
2. The preferred code structure and organization
3. The specified error handling patterns
4. The preferred comment style and documentation approach
5. Use of the specified frameworks and libraries when applicable

Please provide complete, production-ready code that can be used directly.`;
    }
    postProcessCode(generatedCode) {
        // Remove markdown code blocks if present
        let code = generatedCode.replace(/```[\w]*\n|```/g, '');
        // Apply indentation style
        code = this.applyIndentation(code);
        // Ensure consistent line spacing
        code = this.applyLineSpacing(code);
        // Add file header comment
        code = this.addFileHeader(code);
        return code;
    }
    applyIndentation(code) {
        const lines = code.split('\n');
        const indentChar = this.config.codeStyle.indentation === 'tabs' ? '\t' : ' ';
        const indentSize = this.config.codeStyle.indentation === 'tabs' ? 1 :
            parseInt(this.config.codeStyle.indentation.split(' ')[0]);
        return lines
            .map(line => {
            const currentIndent = line.match(/^\s*/)?.[0].length ?? 0;
            const newIndent = indentChar.repeat(currentIndent * indentSize);
            return newIndent + line.trimLeft();
        })
            .join('\n');
    }
    applyLineSpacing(code) {
        const lines = code.split('\n');
        const processedLines = [];
        let lastLineWasEmpty = false;
        for (const line of lines) {
            const isEmptyLine = line.trim() === '';
            // Prevent multiple consecutive empty lines
            if (isEmptyLine && lastLineWasEmpty) {
                continue;
            }
            processedLines.push(line);
            lastLineWasEmpty = isEmptyLine;
        }
        return processedLines.join('\n');
    }
    addFileHeader(code) {
        const timestamp = new Date().toISOString();
        const header = this.config.codeStyle.commentStyle === 'multi_line' ?
            `/**\n * Generated code based on user's coding style\n * Generated at: ${timestamp}\n */\n\n` :
            `// Generated code based on user's coding style\n// Generated at: ${timestamp}\n\n`;
        return header + code;
    }
}
exports.CodeGenerator = CodeGenerator;
