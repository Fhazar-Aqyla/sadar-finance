# SADAR Finance

> **S**mart **A**I-**D**riven **A**utomated **R**eceipt & Finance Management

A production-ready fintech platform that helps users track expenses, scan receipts via OCR, and get AI-powered financial insights.

## Architecture

```
sadar-finance-main/
├── backend/          # Node.js + Express RESTful API
├── ai/               # Python AI/ML microservice
├── frontend/         # Frontend client
├── data/             # Training data (labeled, processed, raw)
└── notebooks/        # Jupyter notebooks for ML experiments
```

## Backend API

### Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Validation:** Joi
- **Documentation:** Swagger (OpenAPI 3.0)
- **Security:** Helmet, CORS, Rate Limiting

### Quick Start

```bash
cd backend
npm install
cp .env.example .env   # Edit with your DB credentials
npm run db:migrate      # Create tables
npm run db:seed         # Seed default data
npm run dev             # Start dev server with nodemon
```

### API Documentation

Once running, visit **http://localhost:3000/api-docs** for interactive Swagger docs.

### Core Features

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | 3 | Register, Login, Profile |
| Transactions | 8 | CRUD + Summary + Category Breakdown + Trends |
| OCR | 3 | Upload receipt, List scans, Get result |
| Analytics | 6 | AI Categorization, Behavior Analysis, Overspending Prediction, Health Score |

### Environment Variables

See [`.env.example`](backend/.env.example) for all available configuration options.

## License

ISC
