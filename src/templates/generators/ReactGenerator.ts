import { BaseGenerator, GenerationConfig, GenerationResult } from './BaseGenerator';
import { ProjectFile } from '../../utils/FileUtils';

/**
 * Generator for React applications
 * Creates a modern React app with TypeScript, Vite, and best practices
 */
export class ReactGenerator extends BaseGenerator {
  constructor(config: GenerationConfig) {
    super(config);
  }

  async generate(): Promise<GenerationResult> {
    try {
      const errors = this.validateConfig();
      if (errors.length > 0) {
        return {
          success: false,
          files: [],
          errors
        };
      }

      const files: ProjectFile[] = [
        {
          path: 'package.json',
          content: this.createPackageJson()
        },
        {
          path: 'README.md',
          content: this.createReadme()
        },
        {
          path: '.gitignore',
          content: this.createGitignore()
        },
        {
          path: 'index.html',
          content: this.createIndexHtml()
        },
        {
          path: 'vite.config.ts',
          content: this.applyStyleProfile(this.createViteConfig())
        },
        {
          path: 'tsconfig.json',
          content: this.createTsConfig()
        },
        {
          path: 'tsconfig.node.json',
          content: this.createTsNodeConfig()
        },
        {
          path: 'src/main.tsx',
          content: this.applyStyleProfile(this.createMainFile())
        },
        {
          path: 'src/App.tsx',
          content: this.applyStyleProfile(this.createAppComponent())
        },
        {
          path: 'src/App.css',
          content: this.createAppStyles()
        },
        {
          path: 'src/index.css',
          content: this.createGlobalStyles()
        },
        {
          path: 'src/components/Header.tsx',
          content: this.applyStyleProfile(this.createHeaderComponent())
        },
        {
          path: 'src/components/Footer.tsx',
          content: this.applyStyleProfile(this.createFooterComponent())
        },
        {
          path: 'src/hooks/useCounter.ts',
          content: this.applyStyleProfile(this.createCounterHook())
        },
        {
          path: 'src/utils/api.ts',
          content: this.applyStyleProfile(this.createApiUtils())
        },
        {
          path: 'src/types/index.ts',
          content: this.applyStyleProfile(this.createTypes())
        },
        {
          path: 'src/tests/App.test.tsx',
          content: this.applyStyleProfile(this.createAppTest())
        },
        {
          path: 'src/tests/setup.ts',
          content: this.applyStyleProfile(this.createTestSetup())
        },
        {
          path: '.env.example',
          content: this.createEnvExample()
        }
      ];

      return {
        success: true,
        files,
        message: 'React application generated successfully'
      };
    } catch (error) {
      return {
        success: false,
        files: [],
        errors: [`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  getFileList(): string[] {
    return [
      'package.json',
      'README.md',
      '.gitignore',
      'index.html',
      'vite.config.ts',
      'tsconfig.json',
      'tsconfig.node.json',
      'src/main.tsx',
      'src/App.tsx',
      'src/App.css',
      'src/index.css',
      'src/components/Header.tsx',
      'src/components/Footer.tsx',
      'src/hooks/useCounter.ts',
      'src/utils/api.ts',
      'src/types/index.ts',
      'src/tests/App.test.tsx',
      'src/tests/setup.ts',
      '.env.example'
    ];
  }

  getDependencies(): { dependencies: string[]; devDependencies: string[] } {
    return {
      dependencies: ['react', 'react-dom'],
      devDependencies: [
        '@types/react',
        '@types/react-dom',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        '@vitejs/plugin-react',
        'eslint',
        'eslint-plugin-react-hooks',
        'eslint-plugin-react-refresh',
        'typescript',
        'vite',
        '@testing-library/react',
        '@testing-library/jest-dom',
        '@testing-library/user-event',
        'vitest',
        'jsdom'
      ]
    };
  }

  protected getScripts(): Record<string, string> {
    return {
      dev: 'vite',
      build: 'tsc && vite build',
      lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
      preview: 'vite preview',
      test: 'vitest',
      'test:ui': 'vitest --ui',
      'test:coverage': 'vitest --coverage'
    };
  }

  private createIndexHtml(): string {
    return this.processTemplate(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ projectName }}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);
  }

  private createViteConfig(): string {
    return this.processTemplate(`import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
});
`);
  }

  private createTsConfig(): string {
    return `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
`;
  }

  private createTsNodeConfig(): string {
    return `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
`;
  }

  private createMainFile(): string {
    return this.processTemplate(`import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`);
  }

  private createAppComponent(): string {
    return this.processTemplate(`import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { useCounter } from './hooks/useCounter';
import './App.css';

function App() {
  const { count, increment, decrement, reset } = useCounter(0);

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <div className="hero">
          <h1>Welcome to {{ projectName }}</h1>
          <p>{{ description }}</p>
        </div>
        
        <div className="counter-section">
          <h2>Interactive Counter</h2>
          <div className="counter">
            <button onClick={decrement} className="btn btn-secondary">
              -
            </button>
            <span className="count">{count}</span>
            <button onClick={increment} className="btn btn-primary">
              +
            </button>
          </div>
          <button onClick={reset} className="btn btn-outline">
            Reset
          </button>
        </div>

        <div className="features">
          <h2>Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>⚡ Vite</h3>
              <p>Lightning fast build tool</p>
            </div>
            <div className="feature-card">
              <h3>⚛️ React 18</h3>
              <p>Latest React with concurrent features</p>
            </div>
            <div className="feature-card">
              <h3>🔷 TypeScript</h3>
              <p>Type-safe development</p>
            </div>
            <div className="feature-card">
              <h3>🧪 Vitest</h3>
              <p>Fast unit testing framework</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
`);
  }

  private createAppStyles(): string {
    return `.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.counter-section {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0;
}

.count {
  font-size: 2rem;
  font-weight: bold;
  min-width: 3rem;
  color: #333;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-outline {
  background: transparent;
  border: 2px solid #667eea;
  color: #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.features {
  margin-top: 3rem;
}

.features h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #666;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .hero h1 {
    font-size: 2rem;
  }
  
  .counter {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
`;
  }

  private createGlobalStyles(): string {
    return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #ffffff;
  color: #333333;
  line-height: 1.6;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.2;
}

a {
  color: #667eea;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button {
  font-family: inherit;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`;
  }

  private createHeaderComponent(): string {
    return this.processTemplate(`import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <div className="logo">
            <h1>{{ projectName }}</h1>
          </div>
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </div>
      <style jsx>{\`
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem 0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo h1 {
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .nav-links {
          display: flex;
          list-style: none;
          gap: 2rem;
        }
        
        .nav-links a {
          color: white;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s ease;
        }
        
        .nav-links a:hover {
          opacity: 0.8;
          text-decoration: none;
        }
        
        @media (max-width: 768px) {
          .nav {
            flex-direction: column;
            gap: 1rem;
          }
          
          .nav-links {
            gap: 1rem;
          }
        }
      \`}</style>
    </header>
  );
};

export default Header;
`);
  }

  private createFooterComponent(): string {
    return this.processTemplate(`import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{{ projectName }}</h3>
            <p>{{ description }}</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <ul>
              <li><a href="#">GitHub</a></li>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} {{ projectName }}. All rights reserved.</p>
        </div>
      </div>
      <style jsx>{\`
        .footer {
          background: #2c3e50;
          color: white;
          padding: 2rem 0 1rem;
          margin-top: auto;
        }
        
        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .footer-section h3,
        .footer-section h4 {
          margin-bottom: 1rem;
        }
        
        .footer-section ul {
          list-style: none;
        }
        
        .footer-section ul li {
          margin-bottom: 0.5rem;
        }
        
        .footer-section a {
          color: #bdc3c7;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        
        .footer-section a:hover {
          color: white;
          text-decoration: none;
        }
        
        .footer-bottom {
          border-top: 1px solid #34495e;
          padding-top: 1rem;
          text-align: center;
          color: #bdc3c7;
        }
        
        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }
      \`}</style>
    </footer>
  );
};

export default Footer;
`);
  }

  private createCounterHook(): string {
    return this.processTemplate(`import { useState, useCallback } from 'react';

export interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  set: (value: number) => void;
}

export const useCounter = (initialValue: number = 0): UseCounterReturn => {
  const [count, setCount] = useState<number>(initialValue);

  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(prev => prev - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  const set = useCallback((value: number) => {
    setCount(value);
  }, []);

  return {
    count,
    increment,
    decrement,
    reset,
    set
  };
};
`);
  }

  private createApiUtils(): string {
    return this.processTemplate(`const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = \`\${this.baseURL}\${endpoint}\`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || 'Request failed',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

// Utility functions
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};
`);
  }

  private createTypes(): string {
    return this.processTemplate(`// Common types for the application

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Component props types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

// Form types
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface ValidationRule<T> {
  field: keyof T;
  validator: (value: any) => string | null;
}

// Theme types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

// Environment variables
export interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
`);
  }

  private createAppTest(): string {
    return this.processTemplate(`import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders welcome message', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to {{ projectName }}/i)).toBeInTheDocument();
  });

  it('renders counter section', () => {
    render(<App />);
    expect(screen.getByText(/Interactive Counter/i)).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('increments counter when + button is clicked', () => {
    render(<App />);
    const incrementButton = screen.getByText('+');
    const counter = screen.getByText('0');
    
    fireEvent.click(incrementButton);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('decrements counter when - button is clicked', () => {
    render(<App />);
    const decrementButton = screen.getByText('-');
    const incrementButton = screen.getByText('+');
    
    // First increment to 1
    fireEvent.click(incrementButton);
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Then decrement back to 0
    fireEvent.click(decrementButton);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('resets counter when reset button is clicked', () => {
    render(<App />);
    const incrementButton = screen.getByText('+');
    const resetButton = screen.getByText(/Reset/i);
    
    // Increment counter
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Reset counter
    fireEvent.click(resetButton);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<App />);
    expect(screen.getByText(/⚡ Vite/i)).toBeInTheDocument();
    expect(screen.getByText(/⚛️ React 18/i)).toBeInTheDocument();
    expect(screen.getByText(/🔷 TypeScript/i)).toBeInTheDocument();
    expect(screen.getByText(/🧪 Vitest/i)).toBeInTheDocument();
  });

  it('renders header and footer', () => {
    render(<App />);
    // Header should contain navigation
    expect(screen.getByRole('banner')).toBeInTheDocument();
    // Footer should contain copyright
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
`);
  }

  private createTestSetup(): string {
    return this.processTemplate(`import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock environment variables
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};
`);
  }

  private createEnvExample(): string {
    return this.processTemplate(`# {{ projectName }} Environment Variables

# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# App Configuration
VITE_APP_TITLE={{ projectName }}
VITE_APP_VERSION=1.0.0

# Development
VITE_DEV_PORT=5173
VITE_DEV_HOST=localhost

# Analytics (optional)
# VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
# VITE_SENTRY_DSN=https://your-sentry-dsn

# Feature Flags (optional)
# VITE_ENABLE_ANALYTICS=true
# VITE_ENABLE_DEBUG=false
`);
  }

  protected createReadme(): string {
    return this.processTemplate(`# {{ projectName }}

{{ description }}

## Features

- ⚡ **Vite** - Lightning fast build tool
- ⚛️ **React 18** - Latest React with concurrent features
- 🔷 **TypeScript** - Type-safe development
- 🧪 **Vitest** - Fast unit testing framework
- 🎨 **Modern CSS** - Clean and responsive design
- 📱 **Mobile First** - Responsive design approach
- 🔧 **ESLint** - Code linting and formatting
- 🚀 **Hot Reload** - Instant development feedback

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd {{ projectName }}
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The app will be available at http://localhost:5173

## Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - Run ESLint
- \`npm run test\` - Run tests
- \`npm run test:ui\` - Run tests with UI
- \`npm run test:coverage\` - Run tests with coverage

## Project Structure

\`\`\`
src/
├── components/         # Reusable components
│   ├── Header.tsx
│   └── Footer.tsx
├── hooks/             # Custom React hooks
│   └── useCounter.ts
├── utils/             # Utility functions
│   └── api.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── tests/             # Test files
│   ├── App.test.tsx
│   └── setup.ts
├── App.tsx            # Main App component
├── App.css            # App-specific styles
├── main.tsx           # Application entry point
└── index.css          # Global styles
\`\`\`

## Environment Variables

See \`.env.example\` for all available environment variables.

### Required Variables

- \`VITE_API_BASE_URL\` - Backend API URL

### Optional Variables

- \`VITE_APP_TITLE\` - Application title
- \`VITE_APP_VERSION\` - Application version

## Testing

This project uses Vitest for testing with React Testing Library.

### Running Tests

\`\`\`bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
\`\`\`

### Writing Tests

Test files should be placed in the \`src/tests/\` directory and follow the naming convention \`*.test.tsx\` or \`*.test.ts\`.

## Building for Production

\`\`\`bash
npm run build
\`\`\`

The built files will be in the \`dist/\` directory.

### Preview Production Build

\`\`\`bash
npm run preview
\`\`\`

## Deployment

### Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify

1. Connect your repository to Netlify
2. Set build command: \`npm run build\`
3. Set publish directory: \`dist\`
4. Set environment variables in Netlify dashboard

### Docker

\`\`\`dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

{{ license }}

## Author

{{ author }}
`);
  }
}