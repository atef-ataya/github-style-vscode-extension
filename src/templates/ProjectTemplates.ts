// src/templates/ProjectTemplates.ts
export interface ProjectTemplate {
  name: string;
  files: string[];
  dependencies: string[];
  devDependencies: string[];
  generator: string;
}

export const PROJECT_TEMPLATES: Record<string, ProjectTemplate> = {
  'express-api': {
    name: 'Express.js API',
    files: ['app.js', 'package.json', 'routes/index.js'],
    dependencies: ['express', 'cors', 'helmet'],
    devDependencies: ['nodemon', 'jest'],
    generator: 'ExpressGenerator'
  }
};