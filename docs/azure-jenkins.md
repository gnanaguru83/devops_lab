# Azure Deployment with Jenkins (No Docker)

This guide matches `jenkins/Jenkinsfile` in this repository.

## 1) VM Prerequisites

Open inbound ports in NSG:
- `22` (SSH)
- `80` (App)
- `8080` (Jenkins UI)

Install Jenkins on the VM:

```bash
sudo apt update
sudo apt install -y fontconfig openjdk-21-jre git curl ca-certificates
sudo install -d -m 0755 /etc/apt/keyrings
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key | sudo tee /etc/apt/keyrings/jenkins-keyring.asc > /dev/null
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install -y jenkins
sudo systemctl enable --now jenkins
```

Open Jenkins:
- `http://<VM_PUBLIC_IP>:8080`

## 2) Jenkins Plugins

Install:
- SSH Agent
- Credentials Binding
- Pipeline
- Git

## 3) Jenkins Credentials

Create these IDs exactly:
1. `attendance-jwt-secret` (Secret text)
2. `attendance-mongo-uri` (Secret text, MongoDB connection string)

Deploy key file required on Jenkins host:
- `/var/lib/jenkins/.ssh/ci_deploy_key`
- Public key must be present in `/home/azureuser/.ssh/authorized_keys`

## 4) Pipeline Job

1. Create Pipeline job.
2. Use `Pipeline script from SCM`.
3. Repository: your GitHub repo.
4. Script Path: `jenkins/Jenkinsfile`.

## 5) Build Parameters

- `AZURE_VM_HOST`: VM public IP or DNS
- `AZURE_VM_USER`: `azureuser`
- `AZURE_VM_APP_DIR`: `/opt/attendance-app`
- `GIT_REPO_URL`: repo URL
- `DEPLOY_BRANCH`: `main`

## 6) What Pipeline Does

1. Installs dependencies and runs backend tests.
2. Builds frontend.
3. SSH deploys latest code to VM.
4. Writes backend `.env` using Jenkins secrets.
5. Runs backend with PM2.
6. Serves frontend via Nginx.
7. Runs health check on `http://localhost/api/health`.

## 7) Verify

- App: `http://<VM_PUBLIC_IP>`
- Health: `http://<VM_PUBLIC_IP>/api/health`
