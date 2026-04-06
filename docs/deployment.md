# Deployment Guide

## Option 1: Local VM / Bare Metal

1. Install Docker and Docker Compose plugin.
2. Copy the project to server.
3. Create `.env` files from examples:
- `backend/.env.example` -> `backend/.env`
- `frontend/.env.example` -> `frontend/.env`
4. Run:

```bash
cp docker/.env.example .env
docker compose up -d --build
```

5. Access:
- App: `http://<server-ip>`
- API health: `http://<server-ip>/api/health`
- Prometheus: `http://<server-ip>:9090`
- Grafana: `http://<server-ip>:3001`

## Option 2: AWS / Azure VM

1. Provision Ubuntu VM.
2. Open inbound ports: `80`, `5000`, `9090`, `3001`.
3. Install Docker, Docker Compose plugin, Git.
4. Clone repo and run same compose command.
5. Configure domain + TLS (recommended) with Nginx or cloud LB.

## Jenkins Deployment

1. Configure Jenkins credentials:
- `attendance-jwt-secret` (Secret text for JWT)
- `attendance-mongo-uri` (Secret text for MongoDB URI)
2. Ensure Jenkins host has deploy key at `/var/lib/jenkins/.ssh/ci_deploy_key` and that public key is in `/home/azureuser/.ssh/authorized_keys` on target VM.
3. Create Pipeline job and point to `jenkins/Jenkinsfile`.
4. Set parameters:
- `AZURE_VM_HOST`
- `AZURE_VM_USER`
- `AZURE_VM_APP_DIR`
- `GIT_REPO_URL`
- `DEPLOY_BRANCH`
5. Run build; Jenkins will test, build frontend, and deploy to Azure VM with PM2 + Nginx.
6. Detailed Azure setup: `docs/azure-jenkins.md`.
