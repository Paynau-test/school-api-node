# school-api-serverless

Serverless REST API for student CRUD operations. Built with Node.js, AWS Lambda, and API Gateway using AWS SAM.

## Requirements

- Node.js 20+
- AWS SAM CLI (`brew install aws-sam-cli`)
- Docker (for local testing)
- school-db running locally (`make up` in school-db)

## Quick Start (Local)

```bash
make install    # Install dependencies
make dev        # Start API on http://localhost:3000
```

Requires school-db Docker containers running. The API connects to your local MySQL on port 3306.

## Endpoints

```
POST   /students          Create a student
GET    /students           Search students (?term=Garcia&status=active&limit=10&offset=0)
GET    /students/{id}      Get student by ID
PUT    /students/{id}      Update student
DELETE /students/{id}      Soft delete student (sets status to inactive)
```

## Request/Response Examples

### Create Student
```bash
curl -X POST http://localhost:3000/students \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name_father": "Garcia",
    "last_name_mother": "Lopez",
    "date_of_birth": "2015-03-15",
    "gender": "M",
    "grade_id": 3
  }'
# → { "success": true, "data": { "student_id": 11 } }
```

### Search Students
```bash
curl "http://localhost:3000/students?term=Garcia&status=active"
# → { "success": true, "data": [{ "id": 1, "first_name": "Juan Carlos", ... }] }
```

### Get Student
```bash
curl http://localhost:3000/students/1
# → { "success": true, "data": { "id": 1, "first_name": "Juan Carlos", ... } }
```

## Deploy to AWS

```bash
make deploy
```

First time it will ask for a stack name and S3 bucket. After that, `make deploy` handles everything.

## Architecture

Each CRUD operation is a separate Lambda function. They all share a MySQL connection pool (reused across warm invocations) and call stored procedures in school-db.

```
API Gateway → Lambda → mysql2 → RDS (stored procedures)
```

## Available Commands

```
make install        Install dependencies
make dev            Start local API (port 3000)
make build          Build SAM project
make deploy         Build and deploy to AWS
make invoke-create  Test create locally
make invoke-get     Test get locally
make invoke-search  Test search locally
make logs           Tail CloudWatch logs
```
