# Student Attendance Management System (Full Stack + DevOps)

A production-style full-stack web application for managing student attendance with role-based access, report export, and CI/CD plus containerized deployment.

## Tech Stack

- Frontend: React.js (Vite)
- Backend: Node.js + Express.js
- Database: MongoDB
- Auth: JWT-based authentication
- DevOps: Docker, Docker Compose, Jenkins, Nginx, Prometheus, Grafana

## Features Implemented

1. JWT Authentication
- Login for Admin, Teacher, Student
- Protected routes and role-based API authorization

2. Admin Capabilities
- Create, list, update, deactivate students and teachers
- Dashboard with student/teacher counts and attendance breakdown

3. Teacher Capabilities
- Mark attendance (`Present`, `Absent`, `Late`) for all students by date
- View recent attendance entries

4. Student Capabilities
- View personal attendance history
- View attendance analytics (percentage and totals)

5. Reports
- Daily and monthly attendance reports
- Export as CSV and PDF

6. DevOps
- Dockerfiles for frontend and backend
- Full stack `docker-compose` (app + Nginx + MongoDB + monitoring)
- Jenkins pipeline with build/test/push/deploy stages
- Prometheus + Grafana monitoring

7. Optional Features Included
- Role-based access control (RBAC)
- Dark mode toggle in UI

## Project Structure

```text
.
|- backend
|- frontend
|- docker
|- jenkins
`- docs
```

## Local Development Setup

## 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Default backend URL: `http://localhost:5000`

## 2) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Default frontend URL: `http://localhost:5173`

## 3) Create initial admin

From the login page, open `Initial Admin Setup` and create the first admin account.

You can also use API once (only works if no admin exists yet):

```bash
curl -X POST http://localhost:5000/api/auth/register-admin \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Admin\",\"email\":\"admin@example.com\",\"password\":\"Password123\"}"
```

Then login from UI.

## Docker Deployment

```bash
cp docker/.env.example .env
docker compose up -d --build
```

Services:
- App via Nginx: `http://localhost`
- Backend health: `http://localhost/api/health`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001` (admin/admin123)

## Jenkins CI/CD

Pipeline file: `jenkins/Jenkinsfile`

Stages:
1. Clone repository
2. Install dependencies
3. Run tests
4. Build frontend
5. Deploy to Azure VM with SSH
6. Restart backend with PM2 and configure Nginx

Required Jenkins credential:
- `attendance-jwt-secret` (secret text for JWT)
- `attendance-mongo-uri` (secret text for MongoDB URI)

Jenkins deploy key file required on Jenkins host:
- `/var/lib/jenkins/.ssh/ci_deploy_key`

Azure automation guide:
- `docs/azure-jenkins.md`

## Monitoring

- Backend exposes Prometheus metrics at `/metrics`
- Prometheus scrapes backend target
- Grafana auto-configures Prometheus datasource

## API Overview

- Auth
  - `POST /api/auth/register-admin`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- Admin
  - `POST /api/admin/users`
  - `GET /api/admin/users/:role`
  - `PUT /api/admin/users/:id`
  - `DELETE /api/admin/users/:id`
- Attendance
  - `POST /api/attendance/mark`
  - `GET /api/attendance/students`
  - `GET /api/attendance/me`
  - `GET /api/attendance/student/:studentId`
- Reports
  - `GET /api/reports/daily?date=YYYY-MM-DD&format=csv|pdf`
  - `GET /api/reports/monthly?month=YYYY-MM&format=csv|pdf`

## Tests

Backend includes Jest + Supertest integration tests:

```bash
cd backend
npm test
```

## Screenshots

Place Jenkins pipeline screenshots in:
- `docs/screenshots/`
- See `docs/screenshots/README.md` for required image names.
- Execution checklist: `docs/pipeline-execution.md`
