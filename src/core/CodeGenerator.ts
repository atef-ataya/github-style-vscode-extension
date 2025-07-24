import OpenAI from 'openai';
import { SimpleStyleProfile } from './types';

export class CodeGenerator {
  constructor(
    private openai: OpenAI,
    private style: SimpleStyleProfile
  ) {
    if (!openai) {
      throw new Error('OpenAI instance is required');
    }
  }

  private createPrompt({ spec, style }: { spec: string; style: SimpleStyleProfile }): string {
    if (!spec) {
      throw new Error('Code specification is required');
    }

    return `You are an AI developer assistant.

Generate code based on the following user specification:

SPEC: ${spec}

STYLE PREFERENCES:
- Indentation: ${style.indentStyle}
- Quotes: ${style.quoteStyle} quotes
- Semicolons: ${style.useSemicolons ? 'use semicolons' : 'no semicolons'}

Make sure the code matches the user's style preferences. Only return valid code.`;
  }

  async generateCode(input: { spec: string; style: SimpleStyleProfile }): Promise<string> {
    try {
      const prompt = this.createPrompt(input);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      const generatedCode = completion.choices?.[0]?.message?.content?.trim();
      if (!generatedCode) {
        return '// No code generated';
      }

      return generatedCode;
    } catch (error) {
      return `// Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}
