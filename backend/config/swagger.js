/**
 * Swagger/OpenAPI Configuration — Matches official ERD
 */
const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SADAR Finance API',
    version: '1.0.0',
    description: 'Smart AI-Driven Automated Receipt & Finance Management API.\n\nFeatures: Auth, Accounts, Transactions, Incomes, OCR, AI Categorization, Behavior Analysis, Overspending Prediction, Health Score, Budgets.',
    contact: { name: 'SADAR Finance Team' },
  },
  servers: [{ url: `http://localhost:${config.port}/api/v1`, description: 'Development Server' }],
  components: {
    securitySchemes: {
      BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  tags: [
    { name: 'Authentication', description: 'Register, Login, Profile' },
    { name: 'Accounts', description: 'Bank account management' },
    { name: 'Transactions', description: 'Expense transaction CRUD' },
    { name: 'Incomes', description: 'Income record CRUD' },
    { name: 'OCR', description: 'Receipt image upload and parsing' },
    { name: 'Analytics', description: 'AI Categorization, Behavior, Overspending, Health Score, Budget' },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./controllers/*.controller.js'],
};

module.exports = swaggerJsdoc(options);
