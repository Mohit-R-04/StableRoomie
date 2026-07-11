#!/usr/bin/env bash

# deploy-azure.sh
# Automates the setup of Docker, Docker Compose, and starts the StableRoomie stack on an Azure Ubuntu VM.

set -euo pipefail

echo "============================================="
echo "   StableRoomie Azure Deployment Automator"
echo "============================================="

# 1. Update package lists
echo "--> Updating system packages..."
sudo apt-get update -y

# 2. Install prerequisites
echo "--> Installing prerequisites..."
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git

# 3. Add Docker GPG Key & Repository
echo "--> Setting up Docker official repository..."
sudo mkdir -p /etc/apt/keyrings
if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
fi

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Install Docker Engine and Docker Compose
echo "--> Installing Docker Engine and Docker Compose..."
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 5. Start and enable Docker
echo "--> Enabling and starting Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

# 6. Verify Docker Installation
echo "--> Verifying Docker installation..."
sudo docker --version
sudo docker compose version

# 7. Configure current user to run Docker commands without sudo (Optional but recommended)
echo "--> Adding current user to docker group..."
sudo usermod -aG docker $USER || true
echo "Note: You might need to log out and log back in for docker group changes to take effect."

# 8. Setup .env file
echo "--> Setting up environment configuration..."
if [ ! -f .env ]; then
    echo "Creating a new .env file from template..."
    cat <<EOT > .env
# Google OAuth Credentials
# Replace these placeholder values with your real credentials from Google Cloud Console
GOOGLE_CLIENT_ID=your_real_google_client_id
GOOGLE_CLIENT_SECRET=your_real_google_client_secret
EOT
    echo ".env template created. Please edit it to add your real Google OAuth Credentials before launching."
else
    echo ".env file already exists. Skipping template creation."
fi

echo "============================================="
echo "Setup completed successfully!"
echo "Next Steps:"
echo "1. Edit the '.env' file using: nano .env"
echo "2. Add your real GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
echo "3. Run: docker compose up -d --build"
echo "============================================="
