#!/bin/bash
# check-activity.sh - Monitors StableRoomie Container App activity on Azure
#
# With Container Apps scale-to-zero, there's no VM to shut down.
# This script monitors activity and can trigger scale-to-zero or
# report usage for cost tracking.
#
# Usage: ./check-activity.sh [--log-only]

set -euo pipefail

RG="ssi-wallet-rg"
JAVA_APP="stableroomie-api"
FLASK_APP="stableroomie-flask"
LOG_FILE="/tmp/stableroomie-activity.log"
INACTIVITY_HOURS=1

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"; }

# Check current revision replicas
check_replicas() {
    local app=$1
    az containerapp revision list --name "$app" --resource-group "$RG" \
        --query "[?active].replicas" -o tsv 2>/dev/null || echo "unknown"
}

# Check if any replicas are running
java_replicas=$(check_replicas "$JAVA_APP")
flask_replicas=$(check_replicas "$FLASK_APP")

log "Replicas: $JAVA_APP=$java_replicas, $FLASK_APP=$flask_replicas"

# If both are at zero and user passed --scale-to-zero, force scale down
if [ "${1:-}" = "--scale-to-zero" ]; then
    if [ "$java_replicas" != "0" ] || [ "$flask_replicas" != "0" ]; then
        log "Forcing scale-to-zero..."
        az containerapp update --name "$JAVA_APP" --resource-group "$RG" \
            --min-replicas 0 --max-replicas 3 2>/dev/null || true
        az containerapp update --name "$FLASK_APP" --resource-group "$RG" \
            --min-replicas 0 --max-replicas 3 2>/dev/null || true
        log "Scale-to-zero set for both apps."
    else
        log "Already at zero replicas."
    fi
fi

# Summary
echo ""
echo "StableRoomie Activity Monitor"
echo "============================="
echo "  Java Backend ($JAVA_APP): $java_replicas replica(s)"
echo "  Flask API    ($FLASK_APP): $flask_replicas replica(s)"
echo ""
echo "With scale-to-zero enabled, containers automatically shut down"
echo "when idle. No manual intervention needed."
echo ""
echo "Usage:"
echo "  $0              Check current activity"
echo "  $0 --scale-to-zero  Force scale to zero"
echo ""