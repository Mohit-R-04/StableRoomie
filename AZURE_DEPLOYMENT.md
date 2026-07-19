# StableRoomie - Azure Deployment Guide

This guide describes how to deploy the **StableRoomie** application stack (PostgreSQL database, Spring Boot Java backend, and Flask Python microservice) onto **Azure Container Apps** using your **Azure for Students** credits.

## Architecture

```
Custom Domain: stableroomie.ssnce.dev
        │ (DNS A record → 135.235.144.68)
        ▼
Azure Container Apps Environment (ssi-wallet-env)
  ├── stableroomie-api   (Java backend, port 8080, scale 0→3)
  └── stableroomie-flask  (Flask API,   port 5000, scale 0→3)

Azure Container Registry: ssiwalletacr.azurecr.io (shared)
PostgreSQL: Azure Database for PostgreSQL or managed separately
```

**Cost model**: Consumption plan with scale-to-zero. When idle (0 replicas), compute cost is **$0/mo**. Only pay for ACR (~$5/mo shared).

---

## Prerequisites

1. An active Azure account (Access the [Azure Portal](https://portal.azure.com)).
2. Azure CLI installed and authenticated (`az login`).
3. A Google Cloud Console project with OAuth credentials set up.

---

## Step 1: Authenticate with Azure CLI

```bash
az login
az account set --subscription "Azure for Students"
```

Verify your subscription:
```bash
az account show --query "{Name:name, Subscription:id}" -o table
```

---

## Step 2: Verify Container Apps Environment

The StableRoomie apps share an existing Container Apps Environment:

```bash
# List Container Apps Environments
az containerapp env list --query "[].{Name:name, ResourceGroup:resourceGroup, Location:location}" -o table

# Expected output includes:
# ssi-wallet-env | ssi-wallet-rg | centralindia

# Check environment details (static IP, default domain)
az containerapp env show --name ssi-wallet-env --resource-group ssi-wallet-rg \
    --query "{Name:name, StaticIP:properties.staticIp, DefaultDomain:properties.defaultDomain}" -o json
```

**Note the Static IP** — you'll need it for DNS configuration.

---

## Step 3: Build and Push Container Images

Images are pushed to the shared Azure Container Registry (`ssiwalletacr`):

```bash
# Log in to ACR
az acr login --name ssiwalletacr

# Build and push Java backend
docker build -f StableRoomie/Dockerfile.deploy -t ssiwalletacr.azurecr.io/stableroomie-java:latest StableRoomie/
docker push ssiwalletacr.azurecr.io/stableroomie-java:latest

# Build and push Flask API
docker build -f flask-api/Dockerfile.deploy -t ssiwalletacr.azurecr.io/stableroomie-flask:latest flask-api/
docker push ssiwalletacr.azurecr.io/stableroomie-flask:latest
```

---

## Step 4: Create/Update Container Apps

### Java Backend

```bash
az containerapp create \
  --name stableroomie-api \
  --resource-group ssi-wallet-rg \
  --environment ssi-wallet-env \
  --image ssiwalletacr.azurecr.io/stableroomie-java:latest \
  --registry-server ssiwalletacr.azurecr.io \
  --registry-username ssiwalletacr \
  --registry-password $(az acr credential show --name ssiwalletacr --query "passwords[0].value" -o tsv) \
  --target-port 8080 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 3 \
  --cpu 1.0 \
  --memory 2Gi \
  --env-vars \
    DB_URL="jdbc:postgresql://<DB_HOST>:5432/stableromie" \
    DB_USERNAME="mohitreddy" \
    DB_PASSWORD="<DB_PASSWORD>" \
    DB_DRIVER="org.postgresql.Driver" \
    DB_DIALECT="org.hibernate.dialect.PostgreSQLDialect" \
    GOOGLE_CLIENT_ID="<YOUR_CLIENT_ID>" \
    GOOGLE_CLIENT_SECRET="<YOUR_CLIENT_SECRET>" \
    FLASK_API_URL="http://stableroomie-flask.internal.thankfulwave-027f5c02.centralindia.azurecontainerapps.io:5000"
```

### Flask API

```bash
az containerapp create \
  --name stableroomie-flask \
  --resource-group ssi-wallet-rg \
  --environment ssi-wallet-env \
  --image ssiwalletacr.azurecr.io/stableroomie-flask:latest \
  --registry-server ssiwalletacr.azurecr.io \
  --registry-username ssiwalletacr \
  --registry-password $(az acr credential show --name ssiwalletacr --query "passwords[0].value" -o tsv) \
  --target-port 5000 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 3 \
  --cpu 0.5 \
  --memory 1Gi \
  --env-vars \
    JAVA_BACKEND_URL="http://stableroomie-api.internal.thankfulwave-027f5c02.centralindia.azurecontainerapps.io:8080"
```

---

## Step 5: Configure DNS

Point your custom domain to the Container Apps Environment's static IP:

| Type | Host | Value |
|------|------|-------|
| A | stableroomie.ssnce.dev | 135.235.144.68 |

The static IP for the `ssi-wallet-env` environment is: **135.235.144.68**

---

## Step 6: Add Custom Domain to Container App

After DNS propagation (wait ~5 minutes):

```bash
# Add custom domain (requires TXT verification record in DNS)
az containerapp hostname add \
  --hostname stableroomie.ssnce.dev \
  --name stableroomie-api \
  --resource-group ssi-wallet-rg

# If prompted, add the TXT verification record to DNS:
# Type: TXT
# Host: asuid.stableroomie.ssnce.dev
# Value: <verification-id-shown-by-command>

# Bind TLS certificate (Azure auto-provisions managed cert)
az containerapp hostname bind \
  --hostname stableroomie.ssnce.dev \
  --name stableroomie-api \
  --resource-group ssi-wallet-rg \
  --min-tls-version 1.2
```

Verify:
```bash
curl -I https://stableroomie.ssnce.dev
```

---

## Step 7: Update Google OAuth Redirect URIs

Authorize your domain in Google Cloud Console so users can log in:

1. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Edit your OAuth 2.0 Web Client.
3. Under **Authorized JavaScript origins**, add:
   * `https://stableroomie.ssnce.dev`
4. Under **Authorized redirect URIs**, add:
   * `https://stableroomie.ssnce.dev/login/oauth2/code/google`
5. Click **Save**. Note that Google can take a few minutes to apply redirect changes.

---

## Step 8: Verify Deployment

```bash
# Check Container App status
az containerapp show --name stableroomie-api --resource-group ssi-wallet-rg \
    --query "{State:properties.runningState, ProvisioningState:properties.provisioningState}" -o table

# Check revision status
az containerapp revision list --name stableroomie-api --resource-group ssi-wallet-rg \
    --query "[].{Name:name, Replicas:properties.replicas, HealthState:properties.healthState}" -o table

# Test endpoints (may need ~60s cold start)
curl -I https://stableroomie-api.thankfulwave-027f5c02.centralindia.azurecontainerapps.io
curl -I https://stableroomie.ssnce.dev
```

---

## Cost Management

Use the included cost management script:

```bash
chmod +x deploy/azure-cost-manager.sh

# Check status
./deploy/azure-cost-manager.sh status

# Wake up from cold start
./deploy/azure-cost-manager.sh wake

# Keep warm (minReplicas=1, ~$18/mo)
./deploy/azure-cost-manager.sh keep-alive

# Scale to zero (default, ~$0 idle cost)
./deploy/azure-cost-manager.sh scale-to-zero
```

### Cost Breakdown
| Resource | Cost |
|----------|------|
| Container Apps Environment | $0/mo (consumption plan) |
| Compute when idle (0 replicas) | $0/mo |
| Compute when active | ~$0.024/hr per vCPU |
| ACR Basic (shared) | ~$5/mo |

**Estimated monthly**: ~$3-5 if used ~2hr/day, ~$18 if always warm.

### Cold Start Note

With scale-to-zero enabled, the first request after an idle period takes **~30-60 seconds** as Azure spins up the container. Subsequent requests are fast. This is the tradeoff for $0 idle cost.

---

## Troubleshooting

### Container App not responding
```bash
# Check running state
az containerapp revision list --name stableroomie-api --resource-group ssi-wallet-rg \
    --query "[].{Name:name, RunningState:properties.runningState, Replicas:properties.replicas}" -o table

# If ScaledToZero, send a wake-up request (wait 60s for cold start)
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 120 https://stableroomie.ssnce.dev
```

### Custom domain not working
```bash
# Verify DNS
dig stableroomie.ssnce.dev +short   # Should return 135.235.144.68

# Check custom domain binding
az containerapp show --name stableroomie-api --resource-group ssi-wallet-rg \
    --query "properties.configuration.ingress.customDomains" -o json

# Re-add if missing
az containerapp hostname add --hostname stableroomie.ssnce.dev \
    --name stableroomie-api --resource-group ssi-wallet-rg
```

### Logs and debugging
```bash
# Stream container logs
az containerapp logs show --name stableroomie-api --resource-group ssi-wallet-rg --follow

# Check recent logs
az containerapp logs show --name stableroomie-api --resource-group ssi-wallet-rg --tail 50