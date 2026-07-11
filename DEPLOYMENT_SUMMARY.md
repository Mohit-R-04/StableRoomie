# Deployment Summary

## Latest Deployment Status
✅ **Code Status**: All changes pushed to origin/main
✅ **Build Status**: Java backend and Flask API build successfully
✅ **Ready for Deployment**: Yes

## Deployment Process
Deployment is via Docker Compose on a self-hosted environment:
1. ✅ Code pushed to main branch
2. ⏳ Docker Compose builds and deploys services
3. ⏳ Services restarted

## Services Active
- **stableroomie** (Java Backend): Spring Boot 3.5.0
- **stableroomie-flask** (Flask API): Python 3.14
- **Caddy** (Reverse Proxy): Handles routing
- **PostgreSQL** (Database): Persistent storage