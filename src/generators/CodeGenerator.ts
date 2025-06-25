import OpenAI from 'openai';

export class CodeGenerator {
  constructor(private openai: OpenAI, private style: any) {}

  private createPrompt({ spec, style }: { spec: string; style: any }): string {
    return `
You are an AI developer assistant.

Generate code based on the following user specification:

🧾 SPEC:
${spec}

🎨 STYLE PROFILE:
${JSON.stringify(style, null, 2)}

Make sure the code matches the user’s detected style preferences (indentation, quotes, etc.). Only return valid code.
`;
  }

  async generateCode(input: { spec: string; style: any }): Promise<string> {
    const prompt = this.createPrompt(input);

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    return (
      completion.choices?.[0]?.message?.content?.trim() ||
      '// No code generated'
    );
  }
}
