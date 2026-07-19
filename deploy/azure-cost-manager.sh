#!/bin/bash
# azure-cost-manager.sh - Manage Azure Container Apps for StableRoomie
#
# Architecture (Container Apps - scale to zero):
#   Java Backend → Container App (1 CPU, 2GB, scale 0-3) 
#   Flask API   → Container App (0.5 CPU, 1GB, scale 0-3)
#   Shared env  → ssi-wallet-env (consumption plan, $0 base)
#   Shared ACR  → ssiwalletacr (Basic, ~$5/mo shared with SSI-Wallet)
#
# Custom Domain: stableroomie.ssnce.dev → 135.235.144.68 (env static IP)
# When nobody is using the apps → scales to 0 → $0 compute cost!
# Cold start: ~60 seconds (app wakes up on first request)
#
# Usage: ./azure-cost-manager.sh [status|pause|resume|delete]

set -euo pipefail

SUBSCRIPTION="7ce49b02-b72e-4efa-a1dc-5c50d4dac506"

# --- StableRoomie Container Apps ---
SR_RG="ssi-wallet-rg"
SR_ENV="ssi-wallet-env"
SR_JAVA_APP="stableroomie-api"
SR_FLASK_APP="stableroomie-flask"

# --- URLs ---
CUSTOM_DOMAIN="stableroomie.ssnce.dev"
JAVA_FQDN="stableroomie-api.thankfulwave-027f5c02.centralindia.azurecontainerapps.io"
FLASK_FQDN="stableroomie-flask.thankfulwave-027f5c02.centralindia.azurecontainerapps.io"

show_status() {
    echo "============================================="
    echo "  StableRoomie - Container Apps Status"
    echo "============================================="
    echo ""
    echo "--- Java Backend ---"
    az containerapp show --name "$SR_JAVA_APP" --resource-group "$SR_RG" \
        --query "{State:properties.runningState, MinReplicas:properties.template.scale.minReplicas, MaxReplicas:properties.template.scale.maxReplicas}" \
        -o table 2>/dev/null || echo "  Could not fetch status"
    echo ""
    echo "--- Flask API ---"
    az containerapp show --name "$SR_FLASK_APP" --resource-group "$SR_RG" \
        --query "{State:properties.runningState, MinReplicas:properties.template.scale.minReplicas, MaxReplicas:properties.template.scale.maxReplicas}" \
        -o table 2>/dev/null || echo "  Could not fetch status"
    echo ""
    echo "--- Custom Domain ---"
    local domains
    domains=$(az containerapp show --name "$SR_JAVA_APP" --resource-group "$SR_RG" \
        --query "properties.configuration.ingress.customDomains[].domainName" -o tsv 2>/dev/null || echo "")
    if [ -n "$domains" ]; then
        echo "  Custom domains: $domains"
    else
        echo "  No custom domain configured"
    fi
    echo ""
    echo "--- URLs ---"
    echo "  Custom Domain: https://$CUSTOM_DOMAIN"
    echo "  Java Backend:  https://$JAVA_FQDN"
    echo "  Flask API:     https://$FLASK_FQDN"
    echo ""
    echo "--- Cost Info ---"
    echo "  Container Apps Environment: \$0/mo (consumption plan)"
    echo "  Compute when idle (0 replicas): \$0/mo"
    echo "  Compute when active (1 replica): ~\$0.024/hr per CPU"
    echo "  ACR Basic (shared): ~\$5/mo"
    echo ""
    echo "  Estimated monthly (if used ~2hr/day): ~\$3-5/mo"
    echo "  Estimated monthly (if used 24/7):     ~\$18/mo"
    echo "============================================="
}

wake_up() {
    echo "Waking up StableRoomie (sending HTTP requests)..."
    echo "  Cold start may take 30-60 seconds..."
    curl -s -o /dev/null -w "  Java Backend: HTTP %{http_code}\n" --max-time 120 "https://$JAVA_FQDN/" &
    curl -s -o /dev/null -w "  Flask API:    HTTP %{http_code}\n" --max-time 120 "https://$FLASK_FQDN/" &
    wait
    echo "Both apps should be awake now."
    echo "Custom domain: https://$CUSTOM_DOMAIN"
}

check_domain() {
    echo "--- Domain Health Check ---"
    echo ""
    echo "1. DNS Resolution:"
    local resolved_ip
    resolved_ip=$(dig +short "$CUSTOM_DOMAIN" 2>/dev/null || echo "FAILED")
    echo "   $CUSTOM_DOMAIN → $resolved_ip"
    
    local env_ip
    env_ip=$(az containerapp env show --name "$SR_ENV" --resource-group "$SR_RG" \
        --query "properties.staticIp" -o tsv 2>/dev/null || echo "unknown")
    echo "   Environment IP: $env_ip"
    
    if [ "$resolved_ip" = "$env_ip" ]; then
        echo "   ✅ DNS matches environment IP"
    else
        echo "   ❌ DNS MISMATCH! Update DNS A record to: $env_ip"
    fi
    echo ""
    
    echo "2. Custom Domain Binding:"
    local domains
    domains=$(az containerapp show --name "$SR_JAVA_APP" --resource-group "$SR_RG" \
        --query "properties.configuration.ingress.customDomains" -o json 2>/dev/null || echo "null")
    if [ "$domains" = "null" ] || [ "$domains" = "[]" ]; then
        echo "   ❌ No custom domain binding. Run:"
        echo "   az containerapp hostname add --hostname $CUSTOM_DOMAIN --name $SR_JAVA_APP --resource-group $SR_RG"
    else
        echo "   ✅ Custom domain configured"
        echo "   $domains"
    fi
    echo ""
    
    echo "3. HTTPS Connectivity:"
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 15 --max-time 30 "https://$CUSTOM_DOMAIN" 2>/dev/null || echo "000")
    if [ "$http_code" = "200" ] || [ "$http_code" = "301" ] || [ "$http_code" = "302" ]; then
        echo "   ✅ https://$CUSTOM_DOMAIN → HTTP $http_code"
    elif [ "$http_code" = "000" ]; then
        echo "   ⏳ Connection timeout (app may be scaled to zero, try: $0 wake)"
    else
        echo "   ⚠️  https://$CUSTOM_DOMAIN → HTTP $http_code"
    fi
}

set_min_replicas() {
    local min=$1
    echo "Setting minReplicas=$min for both apps..."
    az containerapp update --name "$SR_JAVA_APP" --resource-group "$SR_RG" \
        --min-replicas "$min" --max-replicas 3 2>/dev/null || true
    az containerapp update --name "$SR_FLASK_APP" --resource-group "$SR_RG" \
        --min-replicas "$min" --max-replicas 3 2>/dev/null || true
    echo "Done. minReplicas=$min"
}

delete_everything() {
    echo "============================================="
    echo "  WARNING: This will DELETE StableRoomie Container Apps!"
    echo "  - Java Backend Container App"
    echo "  - Flask API Container App"
    echo ""
    echo "  Shared resources (ACR, environment) will be kept."
    echo "  You will need to re-deploy from scratch."
    echo "============================================="
    read -p "Are you sure? Type 'yes' to proceed: " confirm
    if [ "$confirm" = "yes" ]; then
        az containerapp delete --name "$SR_JAVA_APP" --resource-group "$SR_RG" --yes 2>/dev/null || true
        az containerapp delete --name "$SR_FLASK_APP" --resource-group "$SR_RG" --yes 2>/dev/null || true
        echo "Both Container Apps deleted."
    else
        echo "Cancelled."
    fi
}

case "${1:-status}" in
    status)          show_status ;;
    wake|start)      wake_up ;;
    domain|check)    check_domain ;;
    keep-alive)      set_min_replicas 1 ;;
    scale-to-zero)   set_min_replicas 0 ;;
    delete)          delete_everything ;;
    *)
        echo "Usage: $0 [command]"
        echo ""
        echo "  status          Show current status of Container Apps"
        echo "  wake / start    Wake up apps from cold start (sends HTTP requests)"
        echo "  domain / check  Check custom domain health (DNS, binding, HTTPS)"
        echo "  keep-alive      Set minReplicas=1 (always warm, ~\$18/mo)"
        echo "  scale-to-zero   Set minReplicas=0 (default, ~\$0 idle cost)"
        echo "  delete          Delete StableRoomie Container Apps"
        exit 1
        ;;
esac