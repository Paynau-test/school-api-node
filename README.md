# school-api-node

REST API for student management (Pedido 1). Node.js 20 + AWS Lambda + API Gateway via SAM.

## Quick Start

```bash
make install    # Install dependencies
make dev        # Start API on http://localhost:3000
make logs-tail  # Follow logs
```

Requires `school-db` running locally (`make up` in school-db).

## Endpoints

All endpoints except login require `Authorization: Bearer <token>`.

```
POST   /auth/login       Login (returns JWT)
GET    /auth/me           Get current user

POST   /students          Create student        [admin]
GET    /students           Search students        [admin + teacher]
GET    /students/{id}      Get student by ID      [admin + teacher]
PUT    /students/{id}      Update student         [admin]
DELETE /students/{id}      Soft delete (inactive) [admin]
```

## Deploy

```bash
make deploy       # Build + deploy API to AWS Lambda
make db-deploy    # Run DB migration on production RDS
```

Auto-reads VPC, subnets and DB credentials from AWS. No manual config needed.

## Architecture

- **Runtime**: Node.js 20 on AWS Lambda (one function per endpoint)
- **Database**: MySQL 8 on RDS (via stored procedures)
- **Auth**: JWT with BCrypt password verification
- **Deploy**: SAM (CloudFormation)
- **DB Migration**: Lambda inside VPC that runs DDL + seed directly on RDS
