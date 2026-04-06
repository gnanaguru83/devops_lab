pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  parameters {
    string(name: 'AZURE_VM_HOST', defaultValue: 'your-vm-public-ip', description: 'Azure VM public IP or DNS')
    string(name: 'AZURE_VM_USER', defaultValue: 'azureuser', description: 'Azure VM SSH username')
    string(name: 'AZURE_VM_APP_DIR', defaultValue: '/opt/attendance-app', description: 'Deployment path on Azure VM')
    string(name: 'GIT_REPO_URL', defaultValue: 'https://github.com/your-org/attendance-app.git', description: 'Repository URL accessible from Azure VM')
    string(name: 'DEPLOY_BRANCH', defaultValue: 'main', description: 'Git branch to deploy')
  }

  stages {
    stage('Clone Repository') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      parallel {
        stage('Backend Dependencies') {
          steps {
            dir('backend') {
              sh 'npm install'
            }
          }
        }
        stage('Frontend Dependencies') {
          steps {
            dir('frontend') {
              sh 'npm install'
            }
          }
        }
      }
    }

    stage('Run Tests') {
      steps {
        dir('backend') {
          sh 'npm test'
        }
      }
    }

    stage('Build Frontend') {
      steps {
        dir('frontend') {
          sh 'npm run build'
        }
      }
    }

    stage('Deploy to Azure VM (No Docker)') {
      steps {
        withCredentials([
          string(credentialsId: 'attendance-jwt-secret', variable: 'APP_JWT_SECRET'),
          string(credentialsId: 'attendance-mongo-uri', variable: 'APP_MONGO_URI')
        ]) {
          sh """
            DEPLOY_KEY="/var/lib/jenkins/.ssh/ci_deploy_key"
            if [ ! -f "\$DEPLOY_KEY" ]; then
              echo "Deploy key not found at \$DEPLOY_KEY"
              exit 1
            fi
            if [ -z "\$APP_JWT_SECRET" ]; then
              echo "Jenkins credential attendance-jwt-secret is empty"
              exit 1
            fi
            if [ -z "\$APP_MONGO_URI" ]; then
              echo "Jenkins credential attendance-mongo-uri is empty"
              exit 1
            fi

            MONGO_URI_B64=\$(printf '%s' "\$APP_MONGO_URI" | base64 | tr -d '\\n')
            JWT_SECRET_B64=\$(printf '%s' "\$APP_JWT_SECRET" | base64 | tr -d '\\n')

            ssh -i "\$DEPLOY_KEY" -o StrictHostKeyChecking=no ${params.AZURE_VM_USER}@${params.AZURE_VM_HOST} "
              set -e

              if ! command -v node >/dev/null 2>&1; then
                curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
                sudo apt-get install -y nodejs
              fi

              if ! command -v nginx >/dev/null 2>&1; then
                sudo apt-get update
                sudo apt-get install -y nginx
              fi

              if ! command -v pm2 >/dev/null 2>&1; then
                sudo npm install -g pm2
              fi

              if [ ! -d ${params.AZURE_VM_APP_DIR}/.git ]; then
                git clone ${params.GIT_REPO_URL} ${params.AZURE_VM_APP_DIR}
              fi

              cd ${params.AZURE_VM_APP_DIR}
              git fetch --all
              git checkout ${params.DEPLOY_BRANCH}
              git pull origin ${params.DEPLOY_BRANCH}

              APP_MONGO_URI=\$(echo \${MONGO_URI_B64} | base64 -d)
              APP_JWT_SECRET=\$(echo \${JWT_SECRET_B64} | base64 -d)

              cd backend
              npm install --omit=dev
              cat > .env <<EOF
PORT=5000
MONGO_URI=\${APP_MONGO_URI}
JWT_SECRET=\${APP_JWT_SECRET}
EOF

              cd ../frontend
              npm install
              npm run build

              sudo mkdir -p /var/www/attendance
              sudo rm -rf /var/www/attendance/*
              sudo cp -r dist/* /var/www/attendance/

              sudo tee /etc/nginx/sites-available/attendance >/dev/null <<'NGINX'
server {
  listen 80;
  server_name _;
  root /var/www/attendance;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:5000/api/;
    proxy_http_version 1.1;
  }

  location /metrics {
    proxy_pass http://127.0.0.1:5000/metrics;
  }

  location / {
    try_files /index.html =404;
  }
}
NGINX

              sudo ln -sf /etc/nginx/sites-available/attendance /etc/nginx/sites-enabled/attendance
              sudo rm -f /etc/nginx/sites-enabled/default
              sudo nginx -t
              sudo systemctl restart nginx

              cd ${params.AZURE_VM_APP_DIR}/backend
              if pm2 describe attendance-backend >/dev/null 2>&1; then
                pm2 restart attendance-backend --update-env
              else
                pm2 start server.js --name attendance-backend
              fi
              pm2 save
            "
          """
        }
      }
    }

    stage('Post Deploy Check') {
      steps {
        sh """
          DEPLOY_KEY="/var/lib/jenkins/.ssh/ci_deploy_key"
          ssh -i "\$DEPLOY_KEY" -o StrictHostKeyChecking=no ${params.AZURE_VM_USER}@${params.AZURE_VM_HOST} '
            curl -fsS http://localhost/api/health
          '
        """
      }
    }
  }

  post {
    success {
      echo 'Azure deployment pipeline completed successfully (no Docker).'
    }
    failure {
      echo 'Pipeline failed. Check Jenkins stage logs for details.'
    }
  }
}
