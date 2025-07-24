export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

export class ValidationUtils {
  static validateGitHubToken(token: string): ValidationResult {
    if (!token?.trim()) {
      return {
        isValid: false,
        error: 'GitHub token is required',
        suggestion: 'Get a token from: https://github.com/settings/tokens'
      };
    }

    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
      return {
        isValid: false,
        error: 'Invalid GitHub token format',
        suggestion: 'Token should start with "ghp_" or "github_pat_"'
      };
    }

    if (token.length < 20) {
      return {
        isValid: false,
        error: 'GitHub token appears to be too short',
      };
    }

    return { isValid: true };
  }

  static validateOpenAIKey(key: string): ValidationResult {
    if (!key?.trim()) {
      return {
        isValid: false,
        error: 'OpenAI API key is required',
        suggestion: 'Get a key from: https://platform.openai.com/api-keys'
      };
    }

    if (!key.startsWith('sk-')) {
      return {
        isValid: false,
        error: 'Invalid OpenAI API key format',
        suggestion: 'Key should start with "sk-"'
      };
    }

    if (key.length < 20) {
      return {
        isValid: false,
        error: 'OpenAI API key appears to be too short',
      };
    }

    return { isValid: true };
  }

  static validateUsername(username: string): ValidationResult {
    if (!username?.trim()) {
      return {
        isValid: false,
        error: 'GitHub username is required'
      };
    }

    if (!/^[a-zA-Z0-9]([a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
      return {
        isValid: false,
        error: 'Invalid GitHub username format',
        suggestion: 'Username can only contain alphanumeric characters and hyphens'
      };
    }

    return { isValid: true };
  }

  static validateCodeSpec(spec: string): ValidationResult {
    if (!spec?.trim()) {
      return {
        isValid: false,
        error: 'Project description is required'
      };
    }

    if (spec.trim().length < 10) {
      return {
        isValid: false,
        error: 'Project description is too short',
        suggestion: 'Please provide at least 10 characters describing your project'
      };
    }

    if (spec.trim().length > 2000) {
      return {
        isValid: false,
        error: 'Project description is too long',
        suggestion: 'Please keep description under 2000 characters'
      };
    }

    return { isValid: true };
  }

  static validateRepositoryCount(count: number): ValidationResult {
    if (!Number.isInteger(count) || count < 1) {
      return {
        isValid: false,
        error: 'Repository count must be at least 1'
      };
    }

    if (count > 50) {
      return {
        isValid: false,
        error: 'Repository count cannot exceed 50',
        suggestion: 'Large numbers may cause rate limiting issues'
      };
    }

    if (count > 20) {
      return {
        isValid: true,
        suggestion: 'Large repository counts may take longer to analyze'
      };
    }

    return { isValid: true };
  }

  static validateAll(inputs: {
    githubToken: string;
    username: string;
    openaiKey: string;
    codeSpec: string;
    maxRepos: number;
  }): ValidationResult[] {
    return [
      this.validateGitHubToken(inputs.githubToken),
      this.validateUsername(inputs.username),
      this.validateOpenAIKey(inputs.openaiKey),
      this.validateCodeSpec(inputs.codeSpec),
      this.validateRepositoryCount(inputs.maxRepos),
    ];
  }
}
