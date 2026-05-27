#!/usr/bin/env bash
# Helper script to trigger a Render deploy using the Render API.
# Usage:
#   export RENDER_API_KEY="<your_render_api_key>"
#   export SERVICE_ID="srv_xxx..."
#   ./deploy_render.sh

set -euo pipefail

if [ -z "${RENDER_API_KEY:-}" ] || [ -z "${SERVICE_ID:-}" ]; then
  echo "Must set RENDER_API_KEY and SERVICE_ID environment variables."
  echo "Example: export RENDER_API_KEY=\"<token>\"; export SERVICE_ID=\"srv_xxx\""
  exit 1
fi

API_URL="https://api.render.com/v1/services/$SERVICE_ID/deploys"

echo "Triggering deploy for service $SERVICE_ID..."
resp=$(curl -s -X POST "$API_URL" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "Response:"
if command -v jq >/dev/null 2>&1; then
  echo "$resp" | jq
  deploy_id=$(echo "$resp" | jq -r '.id')
else
  echo "$resp"
  deploy_id=$(echo "$resp" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || true)
fi

if [ -z "$deploy_id" ] || [ "$deploy_id" = "null" ]; then
  echo "Failed to create deploy. Check API key and service ID, and inspect the response above."
  exit 1
fi

echo "Created deploy: $deploy_id"

# Poll deploy status
status_url="https://api.render.com/v1/services/$SERVICE_ID/deploys/$deploy_id"
while true; do
  sleep 5
  s=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" "$status_url")
  if command -v jq >/dev/null 2>&1; then
    state=$(echo "$s" | jq -r '.state')
  else
    state=$(echo "$s" | python3 -c "import sys,json; print(json.load(sys.stdin).get('state',''))" 2>/dev/null || true)
  fi
  echo "Deploy state: $state"
  if [ "$state" = "ACTIVE" ] || [ "$state" = "COLLAPSED" ] || [ "$state" = "FAILED" ] || [ "$state" = "SUCCEEDED" ]; then
    echo "Final deploy response:"
    if command -v jq >/dev/null 2>&1; then
      echo "$s" | jq
    else
      echo "$s"
    fi
    break
  fi
done

echo "Done."