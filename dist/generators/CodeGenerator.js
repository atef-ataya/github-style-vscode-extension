"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeGenerator = void 0;
const openai_1 = __importDefault(require("openai"));
class CodeGenerator {
    constructor(apiKey, config) {
        this.openai = new openai_1.default({ apiKey });
        this.config = config;
    }
    async generateCode(specification) {
        try {
            const prompt = this.createPrompt(specification);
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert code generator that follows specific coding styles and patterns.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            });
            return response.choices[0]?.message?.content || 'No code generated';
        }
        catch (error) {
            console.error('Error generating code:', error);
            throw new Error('Failed to generate code');
        }
    }
    createPrompt(specification) {
        return `
      Please generate code following these specifications and style guidelines:

      Specification:
      ${specification}

      Style Guidelines:
      1. Naming Conventions:
         - Variables: ${this.config.namingStyle.variables}
         - Functions: ${this.config.namingStyle.functions}
         - Classes: ${this.config.namingStyle.classes}

      2. Code Style:
         - Indentation: ${this.config.codeStyle.indentation}
         - Line Spacing: ${this.config.codeStyle.lineSpacing} line(s)
         - Comments: ${this.config.codeStyle.commentStyle}

      3. Structural Preferences:
         - Function Length: ~${this.config.structuralPreferences.functionLength} lines
         - Error Handling: ${this.config.structuralPreferences.errorHandlingStyle}
         - Class Structure: ${this.config.structuralPreferences.classStructure}

      4. Dependencies:
         - Frameworks: ${this.config.preferredDependencies.frameworks.join(', ')}
         - Libraries: ${this.config.preferredDependencies.libraries.join(', ')}

      Please generate the code following these guidelines exactly.
    `;
    }
}
exports.CodeGenerator = CodeGenerator;
//# sourceMappingURL=CodeGenerator.js.map