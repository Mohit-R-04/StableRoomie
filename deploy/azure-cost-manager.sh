#!/bin/bash
# azure-cost-manager.sh - Manage Azure VM sleep/wake for cost savings
#
# Schedule:
#   - Auto-shutdown at 8 PM IST daily (Azure DevTestLab schedule)
#   - Auto-start at 8 AM IST daily (local cron or manual)
#   - Activity-based shutdown after 8 hours of inactivity (cron on VM)
#
# Usage: ./deploy/azure-cost-manager.sh [start|stop|status]

set -euo pipefail

SUBSCRIPTION="7ce49b02-b72e-4efa-a1dc-5c50d4dac506"

# --- StableRoomie VM ---
SR_RG="STABLEROOMIE-CENTRALINDIA-RG"
SR_VM="stableroomie-vm"

# --- SSI-Wallet Container Apps (auto-scale to zero already) ---
SSI_RG="ssi-wallet-rg"

show_status() {
    echo "============================================="
    echo "  Azure Cost Manager - Status"
    echo "============================================="
    echo ""
    echo "--- StableRoomie VM ---"
    az vm show -d -g "$SR_RG" -n "$SR_VM" \
        --query "{State:powerState, IP:publicIps, Size:hardwareProfile.vmSize}" \
        -o table 2>/dev/null || echo "  Could not fetch VM status"

    echo ""
    echo "--- SSI-Wallet Container Apps ---"
    az containerapp list -g "$SSI_RG" \
        --query "[].{Name:name, MinReplicas:template.scale.minReplicas, MaxReplicas:template.scale.maxReplicas}" \
        -o table 2>/dev/null || echo "  Could not fetch container app status"

    echo ""
    echo "--- Auto-shutdown Schedule (StableRoomie) ---"
    echo "  8:00 PM IST daily (Azure DevTestLab schedule)"
    echo ""
    echo "--- Activity Monitor ---"
    echo "  Running on VM via cron (every 5 min)"
    echo "  Shuts down VM after 8 hours of zero web requests"
    echo "============================================="
}

start_vm() {
    echo "Starting StableRoomie VM..."
    az vm start -g "$SR_RG" -n "$SR_VM" --no-wait
    echo "VM start command sent. Ready in ~1-2 minutes."
    echo "Docker containers will auto-start (restart: unless-stopped)."
}

stop_vm() {
    echo "Stopping StableRoomie VM..."
    az vm stop -g "$SR_RG" -n "$SR_VM" --no-wait
    echo "VM stop command sent."
}

deallocate_vm() {
    echo "Deallocating StableRoomie VM (stops all billing)..."
    az vm deallocate -g "$SR_RG" -n "$SR_VM" --no-wait
    echo "VM deallocated. No compute charges until started again."
}

case "${1:-status}" in
    start|wake)  start_vm ;;
    stop|sleep)  stop_vm ;;
    deallocate)  deallocate_vm ;;
    status)      show_status ;;
    *)
        echo "Usage: $0 [start|stop|deallocate|status]"
        echo ""
        echo "  start / wake      Start the StableRoomie VM"
        echo "  stop / sleep      Stop the VM (keeps IP)"
        echo "  deallocate        Stop + deallocate (max savings, may lose IP)"
        echo "  status            Show current status of all resources"
        exit 1
        ;;
esac