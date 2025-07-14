#!/bin/bash

# Health check script for AI Service
# This script checks the /health endpoint and logs the results

# Configuration
AI_SERVICE_URL="${AI_SERVICE_URL:-http://localhost:8080}"
HEALTH_ENDPOINT="$AI_SERVICE_URL/health"
LOG_FILE="/var/log/ai-service-health.log"
TIMEOUT=10

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Function to log with timestamp
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Function to send alert (customize as needed)
send_alert() {
    local message="$1"
    # You can add email, Slack, or other notification methods here
    echo "ALERT: $message" >> "$LOG_FILE"
    # Example: curl -X POST -H 'Content-type: application/json' --data '{"text":"'"$message"'"}' YOUR_SLACK_WEBHOOK_URL
}

# Perform health check
log_message "Starting health check for $HEALTH_ENDPOINT"

# Make the HTTP request
response=$(curl -s -w "%{http_code}" -o /tmp/health_response.txt --max-time $TIMEOUT "$HEALTH_ENDPOINT" 2>/dev/null)
http_code="${response: -3}"

if [ $? -eq 0 ] && [ "$http_code" = "200" ]; then
    log_message "SUCCESS - AI Service is healthy (HTTP $http_code)"
    
    # Optional: Log response body for detailed monitoring
    if [ -s /tmp/health_response.txt ]; then
        response_body=$(cat /tmp/health_response.txt)
        log_message "Response: $response_body"
    fi
else
    error_msg="FAILED - AI Service health check failed"
    
    if [ $? -ne 0 ]; then
        error_msg="$error_msg (Connection timeout or network error)"
    elif [ "$http_code" != "200" ]; then
        error_msg="$error_msg (HTTP $http_code)"
    fi
    
    log_message "$error_msg"
    send_alert "$error_msg"
fi

# Cleanup
rm -f /tmp/health_response.txt

# Optional: Rotate log file if it gets too large (>10MB)
if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null || echo 0) -gt 10485760 ]; then
    mv "$LOG_FILE" "${LOG_FILE}.old"
    log_message "Log file rotated"
fi 