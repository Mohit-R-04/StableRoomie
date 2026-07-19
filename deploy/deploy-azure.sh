#!/usr/bin/env bash

# deploy-azure.sh
# Builds and deploys StableRoomie to Azure Container Apps.
#
# Architecture:
#   - Java Backend → Container App (stableroomie-api)
#   - Flask API   → Container App (stableroomie-flask)
#   - Shared ACR  → ssiwalletacr.azurecr.io
#   - Shared Env  → ssi-wallet-env
#
# Prerequisites:
#   - Azure CLI installed and authenticated (az login)
#   - Docker installed locally (for building images)
#   - Custom domain DNS pointing to environment static IP (135.235.144.68)

set -euo pipefail

echo "============================================="
echo "   StableRoomie Azure Container Apps Deploy"
echo "============================================="

# --- Configuration ---
RG="ssi-wallet-rg"
ENV="ssi-wallet-env"
ACR="ssiwalletacr"
JAVA_APP="stableroomie-api"
FLASK_APP="stableroomie-flask"
JAVA_IMAGE="$ACR.azurecr.io/stableroomie-java:latest"
FLASK_IMAGE="$ACR.azurecr.io/stableroomie-flask:latest"

# --- Verify prerequisites ---
echo "--> Checking prerequisites..."
command -v az >/dev/null 2>&1 || { echo "Error: Azure CLI (az) not found. Install it first."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Error: Docker not found. Install it first."; exit 1; }

# --- Verify Azure login ---
echo "--> Verifying Azure CLI login..."
az account show >/dev/null 2>&1 || { echo "Error: Not logged in. Run 'az login' first."; exit 1; }

# --- Log in to ACR ---
echo "--> Logging in to Azure Container Registry..."
az acr login --name "$ACR"

# --- Build and push images ---
echo "--> Building Java backend image..."
docker build -f StableRoomie/Dockerfile.deploy -t "$JAVA_IMAGE" StableRoomie/
echo "--> Pushing Java backend image..."
docker push "$JAVA_IMAGE"

echo "--> Building Flask API image..."
docker build -f flask-api/Dockerfile.deploy -t "$FLASK_IMAGE" flask-api/
echo "--> Pushing Flask API image..."
docker push "$FLASK_IMAGE"

# --- Create/update Java backend Container App ---
echo "--> Deploying Java backend Container App..."
az containerapp up \
  --name "$JAVA_APP" \
  --resource-group "$RG" \
  --environment "$ENV" \
  --image "$JAVA_IMAGE" \
  --registry-server "$ACR.azurecr.io" \
  --registry-username "$ACR" \
  --registry-password "$(az acr credential show --name "$ACR" --query "passwords[0].value" -o tsv)" \
  --target-port 8080 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 3 \
  --cpu 1.0 \
  --memory 2Gi 2>/dev/null || {
    echo "--> Container app exists, updating image..."
    az containerapp update \
      --name "$JAVA_APP" \
      --resource-group "$RG" \
      --image "$JAVA_IMAGE" 2>/dev/null || true
  }

# --- Create/update Flask API Container App ---
echo "--> Deploying Flask API Container App..."
az containerapp up \
  --name "$FLASK_APP" \
  --resource-group "$RG" \
  --environment "$ENV" \
  --image "$FLASK_IMAGE" \
  --registry-server "$ACR.azurecr.io" \
  --registry-username "$ACR" \
  --registry-password "$(az acr credential show --name "$ACR" --query "passwords[0].value" -o tsv)" \
  --target-port 5000 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 3 \
  --cpu 0.5 \
  --memory 1Gi 2>/dev/null || {
    echo "--> Container app exists, updating image..."
    az containerapp update \
      --name "$FLASK_APP" \
      --resource-group "$RG" \
      --image "$FLASK_IMAGE" 2>/dev/null || true
  }

echo ""
echo "============================================="
echo "Deployment completed!"
echo ""
echo "Services:"
echo "  Java Backend: https://$JAVA_APP.thankfulwave-027f5c02.centralindia.azurecontainerapps.io"
echo "  Flask API:    https://$FLASK_APP.thankfulwave-027f5c02.centralindia.azurecontainerapps.io"
echo ""
echo "Custom Domain (if DNS configured):"
echo "  https://stableroomie.ssnce.dev"
echo ""
echo "Next Steps:"
echo "  1. Configure environment variables (DB, OAuth) via Azure Portal or CLI"
echo "  2. Set up custom domain: see AZURE_DEPLOYMENT.md Step 6"
echo "  3. Update Google OAuth redirect URIs"
echo "============================================="