# Deployment Summary

## Latest Deployment Status
✅ **Code Status**: All changes pushed to origin/main
✅ **Build Status**: Java backend and Flask API build successfully
✅ **Deployed to**: Azure Container Apps (Central India)
✅ **Custom Domain**: stableroomie.ssnce.dev

## Deployment Architecture

### Azure Resources (ssi-wallet-rg)
| Resource | Type | Details |
|----------|------|---------|
| stableroomie-api | Container App | Java backend, port 8080, scale 0→3, 1 CPU / 2GB |
| stableroomie-flask | Container App | Flask API, port 5000, scale 0→3, 0.5 CPU / 1GB |
| ssi-wallet-env | Container Apps Env | Shared environment, static IP: 135.235.144.68 |
| ssiwalletacr | Container Registry | Basic ACR (shared), centralindia |

### URLs
| Service | URL |
|---------|-----|
| Custom Domain | https://stableroomie.ssnce.dev |
| Java Backend (direct) | https://stableroomie-api.thankfulwave-027f5c02.centralindia.azurecontainerapps.io |
| Flask API (direct) | https://stableroomie-flask.thankfulwave-027f5c02.centralindia.azurecontainerapps.io |

### DNS Configuration
| Type | Host | Value |
|------|------|-------|
| A | stableroomie.ssnce.dev | 135.235.144.68 |
| TXT | asuid.stableroomie.ssnce.dev | (Azure verification) |

## Deployment Process
1. ✅ Code pushed to main branch
2. ✅ Docker images built and pushed to ssiwalletacr.azurecr.io
3. ✅ Container Apps created/updated via `deploy/deploy-azure.sh`
4. ✅ Custom domain configured with managed TLS certificate
5. ✅ Google OAuth redirect URIs updated

## Services Active
- **stableroomie-api** (Java Backend): Spring Boot 3.5.0, scale 0→3
- **stableroomie-flask** (Flask API): Python 3.14, scale 0→3

## Cost Optimization
- **Scale-to-zero**: Apps scale to 0 replicas when idle → $0 compute cost
- **Cold start**: ~30-60 seconds when waking from idle
- **Monthly estimate**: ~$3-5 with typical usage, $0 when unused
- **Management**: `./deploy/azure-cost-manager.sh [status|wake|keep-alive|scale-to-zero]`