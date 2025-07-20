import OpenAI from 'openai';

export class CodeGenerator {
  constructor(private openai: OpenAI, private style: any) {
    if (!openai) {
      throw new Error('OpenAI instance is required');
    }
  }

  private createPrompt({ spec, style }: { spec: string; style: any }): string {
    if (!spec) {
      throw new Error('Code specification is required');
    }
    
    return `
You are an AI developer assistant.

Generate code based on the following user specification:

🧾 SPEC:
${spec}

🎨 STYLE PROFILE:
${JSON.stringify(style, null, 2)}

Make sure the code matches the user's detected style preferences (indentation, quotes, etc.). Only return valid code.
`;
  }

  async generateCode(input: { spec: string; style: any }): Promise<string> {
    try {
      const prompt = this.createPrompt(input);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      const generatedCode = completion.choices?.[0]?.message?.content?.trim();
      if (!generatedCode) {
        console.warn('No content returned from OpenAI');
        return '// No code generated';
      }

      return generatedCode;
    } catch (error) {
      console.error('Error generating code:', error);
      return `// Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}
