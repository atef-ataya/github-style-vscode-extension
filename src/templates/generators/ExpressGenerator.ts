import { BaseGenerator, GenerationConfig, GenerationResult } from './BaseGenerator';
import { ProjectFile } from '../../utils/FileUtils';

/**
 * Generator for Express.js API projects
 * Creates a complete Express.js server with best practices
 */
export class ExpressGenerator extends BaseGenerator {
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
          path: '.env.example',
          content: this.createEnvExample()
        },
        {
          path: 'src/app.js',
          content: this.applyStyleProfile(this.createAppFile())
        },
        {
          path: 'src/server.js',
          content: this.applyStyleProfile(this.createServerFile())
        },
        {
          path: 'src/routes/index.js',
          content: this.applyStyleProfile(this.createIndexRoute())
        },
        {
          path: 'src/routes/api.js',
          content: this.applyStyleProfile(this.createApiRoute())
        },
        {
          path: 'src/middleware/errorHandler.js',
          content: this.applyStyleProfile(this.createErrorHandler())
        },
        {
          path: 'src/middleware/logger.js',
          content: this.applyStyleProfile(this.createLogger())
        },
        {
          path: 'src/config/database.js',
          content: this.applyStyleProfile(this.createDatabaseConfig())
        },
        {
          path: 'src/controllers/userController.js',
          content: this.applyStyleProfile(this.createUserController())
        },
        {
          path: 'tests/app.test.js',
          content: this.applyStyleProfile(this.createAppTest())
        }
      ];

      return {
        success: true,
        files,
        message: 'Express.js API project generated successfully'
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
      '.env.example',
      'src/app.js',
      'src/server.js',
      'src/routes/index.js',
      'src/routes/api.js',
      'src/middleware/errorHandler.js',
      'src/middleware/logger.js',
      'src/config/database.js',
      'src/controllers/userController.js',
      'tests/app.test.js'
    ];
  }

  getDependencies(): { dependencies: string[]; devDependencies: string[] } {
    return {
      dependencies: ['express', 'cors', 'helmet', 'dotenv', 'morgan'],
      devDependencies: ['nodemon', 'jest', 'supertest', '@types/express', '@types/cors']
    };
  }

  protected getScripts(): Record<string, string> {
    return {
      start: 'node src/server.js',
      dev: 'nodemon src/server.js',
      test: 'jest',
      'test:watch': 'jest --watch',
      'test:coverage': 'jest --coverage'
    };
  }

  private createAppFile(): string {
    return this.processTemplate(`const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const indexRoutes = require('./routes/index');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging middleware
app.use(morgan('combined'));
app.use(logger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', indexRoutes);
app.use('/api', apiRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
`);
  }

  private createServerFile(): string {
    return this.processTemplate(`const app = require('./app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(\`🚀 {{ projectName }} server running on http://\${HOST}:\${PORT}\`);
  console.log(\`Environment: \${process.env.NODE_ENV || 'development'}\`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
`);
  }

  private createIndexRoute(): string {
    return this.processTemplate(`const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to {{ projectName }} API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage()
  });
});

module.exports = router;
`);
  }

  private createApiRoute(): string {
    return this.processTemplate(`const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// User routes
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// API info endpoint
router.get('/info', (req, res) => {
  res.json({
    api: '{{ projectName }} API',
    version: '1.0.0',
    description: '{{ description }}',
    endpoints: {
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/:id': 'Get user by ID',
        'POST /api/users': 'Create new user',
        'PUT /api/users/:id': 'Update user',
        'DELETE /api/users/:id': 'Delete user'
      }
    }
  });
});

module.exports = router;
`);
  }

  private createErrorHandler(): string {
    return this.processTemplate(`const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(e => e.message).join(', ');
    error.status = 400;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error.message = 'Duplicate field value entered';
    error.status = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.status = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.status = 401;
  }

  res.status(error.status).json({
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
`);
  }

  private createLogger(): string {
    return this.processTemplate(`const logger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: \`\${duration}ms\`,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent') || 'Unknown',
      ip: req.ip || req.connection.remoteAddress
    };
    
    console.log(JSON.stringify(logData));
  });
  
  next();
};

module.exports = logger;
`);
  }

  private createDatabaseConfig(): string {
    return this.processTemplate(`// Database configuration
// Uncomment and configure based on your database choice

/*
// MongoDB with Mongoose
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
*/

/*
// PostgreSQL with pg
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
*/

// Simple in-memory storage for demo purposes
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

module.exports = {
  users
};
`);
  }

  private createUserController(): string {
    return this.processTemplate(`const { users } = require('../config/database');

// Get all users
const getAllUsers = (req, res) => {
  try {
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// Get user by ID
const getUserById = (req, res) => {
  try {
    const { id } = req.params;
    const user = users.find(u => u.id === parseInt(id));
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
};

// Create new user
const createUser = (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }
    
    const newUser = {
      id: users.length + 1,
      name,
      email
    };
    
    users.push(newUser);
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
};

// Update user
const updateUser = (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    if (name) users[userIndex].name = name;
    if (email) users[userIndex].email = email;
    
    res.json({
      success: true,
      data: users[userIndex],
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
};

// Delete user
const deleteUser = (req, res) => {
  try {
    const { id } = req.params;
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const deletedUser = users.splice(userIndex, 1)[0];
    
    res.json({
      success: true,
      data: deletedUser,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
`);
  }

  private createAppTest(): string {
    return this.processTemplate(`const request = require('supertest');
const app = require('../src/app');

describe('{{ projectName }} API', () => {
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('{{ projectName }}');
      expect(response.body).toHaveProperty('status', 'healthy');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('name', newUser.name);
      expect(response.body.data).toHaveProperty('email', newUser.email);
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});
`);
  }

  private createEnvExample(): string {
    return this.processTemplate(`# {{ projectName }} Environment Variables

# Server Configuration
PORT=3000
HOST=localhost
NODE_ENV=development

# Database Configuration (uncomment based on your database choice)
# MONGODB_URI=mongodb://localhost:27017/{{ projectName }}
# DATABASE_URL=postgresql://username:password@localhost:5432/{{ projectName }}

# JWT Configuration (if using authentication)
# JWT_SECRET=your-super-secret-jwt-key
# JWT_EXPIRE=7d

# API Keys (if needed)
# API_KEY=your-api-key
# EXTERNAL_SERVICE_URL=https://api.example.com

# Logging
# LOG_LEVEL=info
# LOG_FILE=logs/app.log
`);
  }

  protected createReadme(): string {
    return this.processTemplate(`# {{ projectName }}

{{ description }}

## Features

- ✅ Express.js server with best practices
- ✅ RESTful API endpoints
- ✅ Error handling middleware
- ✅ Request logging
- ✅ Security headers (Helmet)
- ✅ CORS support
- ✅ Environment configuration
- ✅ Unit tests with Jest
- ✅ Development server with Nodemon

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
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

The server will start on http://localhost:3000

## API Endpoints

### Health Check
- \`GET /\` - Welcome message and API status
- \`GET /health\` - Health check endpoint

### Users API
- \`GET /api/users\` - Get all users
- \`GET /api/users/:id\` - Get user by ID
- \`POST /api/users\` - Create new user
- \`PUT /api/users/:id\` - Update user
- \`DELETE /api/users/:id\` - Delete user
- \`GET /api/info\` - API information

## Scripts

- \`npm start\` - Start production server
- \`npm run dev\` - Start development server with auto-reload
- \`npm test\` - Run tests
- \`npm run test:watch\` - Run tests in watch mode
- \`npm run test:coverage\` - Run tests with coverage report

## Project Structure

\`\`\`
src/
├── app.js              # Express app configuration
├── server.js           # Server entry point
├── routes/             # Route definitions
│   ├── index.js        # Main routes
│   └── api.js          # API routes
├── controllers/        # Route controllers
│   └── userController.js
├── middleware/         # Custom middleware
│   ├── errorHandler.js
│   └── logger.js
└── config/             # Configuration files
    └── database.js
tests/                  # Test files
├── app.test.js
└── ...
\`\`\`

## Environment Variables

See \`.env.example\` for all available environment variables.

## Testing

Run the test suite:

\`\`\`bash
npm test
\`\`\`

Run tests with coverage:

\`\`\`bash
npm run test:coverage
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