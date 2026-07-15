#!/bin/bash
# check-activity.sh - Monitors web activity and shuts down VM after 8 hours of inactivity
# Installed by: StableRoomie Azure cost optimization

INACTIVITY_HOURS=1
INACTIVITY_SECONDS=$((INACTIVITY_HOURS * 3600))
ACTIVITY_FILE='/tmp/last-web-activity'
LOG_FILE='/var/log/activity-monitor.log'

# Function to log
log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG_FILE"; }

# Create activity file if not exists
touch "$ACTIVITY_FILE"

# Check for recent web requests by looking at Docker container logs
LAST_REQUEST=$(docker logs stableroomie-java --since=5m 2>&1 | grep -c 'DispatcherServlet.*Completed 200' || echo 0)

if [ "$LAST_REQUEST" -gt 0 ]; then
    touch "$ACTIVITY_FILE"
    log "Activity detected ($LAST_REQUEST requests). Keeping VM alive."
else
    LAST_ACTIVE=$(stat -c %Y "$ACTIVITY_FILE" 2>/dev/null || echo 0)
    NOW=$(date +%s)
    IDLE_TIME=$((NOW - LAST_ACTIVE))

    if [ "$IDLE_TIME" -ge "$INACTIVITY_SECONDS" ]; then
        log "No activity for $INACTIVITY_HOURS hours. Shutting down VM."
        wall "No web activity for $INACTIVITY_HOURS hours. VM shutting down in 5 minutes."
        sleep 300
        cd /home/azureuser/StableRoomie && docker compose stop
        sudo shutdown -h now
    else
        REMAINING=$(( (INACTIVITY_SECONDS - IDLE_TIME) / 60 ))
        log "Idle for $((IDLE_TIME / 60)) min. Shutdown in ${REMAINING} min if no activity."
    fi
fi