#!/bin/bash
# azure-cost-manager.sh - Manage Azure VM sleep/wake for cost savings
# Usage: ./azure-cost-manager.sh [start|stop|status|wake|sleep]

set -e

VM_NAME="stableroomie-vm"
RG="STABLEROOMIE-CENTRALINDIA-RG"

show_status() {
    echo "============================================="
    echo "  Azure Cost Manager - Status"
    echo "============================================="
    
    # VM status
    VM_STATE=$(az vm show -d -g "$RG" -n "$VM_NAME" --query "powerState" -o tsv 2>/dev/null || echo "Unknown")
    echo "VM Status: $VM_STATE"
    
    # Container Apps status (SSI-Wallet)
    echo ""
    echo "SSI-Wallet Container Apps:"
    az containerapp list --query "[].{name:name, replicas:properties.template.scale.minReplicas}" -o table 2>/dev/null || echo "  Could not fetch"
    
    # Auto-shutdown schedule
    echo ""
    echo "Auto-shutdown schedule:"
    az rest --method get --url "/subscriptions/7ce49b02-b72e-4efa-a1dc-5c50d4dac506/resourceGroups/$RG/providers/microsoft.devtestlab/schedules/shutdown-computevm-stableroomie-vm?api-version=2018-09-15" --query "dailyRecurrence.time" -o tsv 2>/dev/null || echo "  Not configured"
    echo "  (UTC 1430 = IST 8:00 PM)"
    
    echo ""
    echo "Access URLs:"
    if [[ "$VM_STATE" == *"running"* ]]; then
        IP=$(az vm show -d -g "$RG" -n "$VM_NAME" --query "publicIps" -o tsv 2>/dev/null)
        echo "  StableRoomie: http://$IP:8080"
        echo "  Flask API:    http://$IP:5000"
    else
        echo "  VM is stopped. Run '$0 start' to wake up."
    fi
    echo "============================================="
}

start_vm() {
    echo "Starting VM $VM_NAME..."
    az vm start -g "$RG" -n "$VM_NAME" --no-wait
    echo "VM start command sent (async). It will be ready in ~1-2 minutes."
    echo "Docker containers will auto-start due to restart: unless-stopped policy."
}

stop_vm() {
    echo "Stopping VM $VM_NAME..."
    az vm stop -g "$RG" -n "$VM_NAME" --no-wait
    echo "VM stop command sent."
}

deallocate_vm() {
    echo "Deallocating VM $VM_NAME (stops billing)..."
    az vm deallocate -g "$RG" -n "$VM_NAME" --no-wait
    echo "VM deallocated. You will not be charged for compute while deallocated."
}

case "${1:-status}" in
    start|wake)
        start_vm
        ;;
    stop|sleep)
        stop_vm
        ;;
    deallocate)
        deallocate_vm
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 [start|stop|deallocate|status]"
        echo "  start/wake      - Start the VM"
        echo "  stop/sleep      - Stop the VM (keeps IP)"
        echo "  deallocate      - Stop and deallocate (saves most money, may lose IP)"
        echo "  status          - Show current status"
        exit 1
        ;;
esac