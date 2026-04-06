# Architecture Overview

## Application Layers

1. Frontend (`/frontend`)
- React + Vite single-page application
- Role-based dashboards (Admin, Teacher, Student)
- JWT persisted in local storage and sent with Axios interceptor

2. Backend (`/backend`)
- Express REST API
- JWT authentication and role-based authorization middleware
- MongoDB via Mongoose
- Attendance reporting in CSV/PDF
- Prometheus metrics endpoint at `/metrics`

3. Data Layer
- `User` model with roles: `admin`, `teacher`, `student`
- `Attendance` model with status: `Present`, `Absent`, `Late`

4. DevOps Layer (`/docker`, `/jenkins`)
- Dockerized frontend/backend
- Nginx reverse proxy
- MongoDB, Prometheus, Grafana via `docker-compose`
- Jenkins pipeline for CI/CD

## Request Flow

1. User authenticates from React app.
2. Backend issues JWT.
3. Frontend sends JWT in `Authorization` header.
4. Backend middleware validates token and role.
5. Controllers execute attendance/user/report workflows.

## Monitoring Flow

1. Backend exposes Prometheus metrics at `/metrics`.
2. Prometheus scrapes backend every 15 seconds.
3. Grafana reads Prometheus datasource for dashboards.
