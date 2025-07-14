# AI Service Health Monitoring Setup

This guide explains how to set up automated health monitoring for your AI service using cron jobs.

## Prerequisites

- The AI service should have a `/health` endpoint
- `curl` command should be available on the system
- Appropriate permissions to create log files and cron jobs

## Configuration

### Environment Variables

Set the AI service URL (optional, defaults to `http://localhost:8080`):

```bash
export AI_SERVICE_URL="http://your-ai-service:8080"
```

### Log File Location

By default, logs are written to `/var/log/ai-service-health.log`. Make sure the directory exists and is writable:

```bash
sudo mkdir -p /var/log
sudo chown $USER:$USER /var/log/ai-service-health.log
```

## Setting Up Cron Jobs

### 1. Open Crontab Editor

```bash
crontab -e
```

### 2. Add Cron Job Entry

Choose one of the following monitoring frequencies:

#### Every Minute (for development/testing)
```bash
* * * * * /path/to/JobMatch/scripts/health_check.sh
```

#### Every 5 Minutes (recommended for production)
```bash
*/5 * * * * /path/to/JobMatch/scripts/health_check.sh
```

#### Every 15 Minutes
```bash
*/15 * * * * /path/to/JobMatch/scripts/health_check.sh
```

#### Every Hour
```bash
0 * * * * /path/to/JobMatch/scripts/health_check.sh
```

#### Business Hours Only (9 AM to 5 PM, Monday to Friday)
```bash
*/5 9-17 * * 1-5 /path/to/JobMatch/scripts/health_check.sh
```

### 3. Example Complete Cron Entry

Replace `/path/to/JobMatch` with the actual path to your project:

```bash
# AI Service Health Check - Every 5 minutes
*/5 * * * * AI_SERVICE_URL="http://localhost:8080" /home/tuananh/code/JobMatch/scripts/health_check.sh
```

## Monitoring and Alerts

### View Health Check Logs

```bash
# View recent logs
tail -f /var/log/ai-service-health.log

# View last 50 entries
tail -n 50 /var/log/ai-service-health.log

# Search for failures
grep "FAILED" /var/log/ai-service-health.log
```

### Setup Alerts

To enable alerts, modify the `send_alert()` function in `health_check.sh`:

#### Email Alerts (using mail command)
```bash
send_alert() {
    local message="$1"
    echo "$message" | mail -s "AI Service Alert" admin@yourcompany.com
    echo "ALERT: $message" >> "$LOG_FILE"
}
```

#### Slack Alerts
```bash
send_alert() {
    local message="$1"
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 '"$message"'"}' \
        "YOUR_SLACK_WEBHOOK_URL"
    echo "ALERT: $message" >> "$LOG_FILE"
}
```

#### Discord Alerts
```bash
send_alert() {
    local message="$1"
    curl -X POST -H 'Content-type: application/json' \
        --data '{"content":"🚨 '"$message"'"}' \
        "YOUR_DISCORD_WEBHOOK_URL"
    echo "ALERT: $message" >> "$LOG_FILE"
}
```

## Testing the Setup

### Manual Test

```bash
# Test the script manually
./scripts/health_check.sh

# Check if log was created
cat /var/log/ai-service-health.log
```

### Verify Cron Job

```bash
# List current cron jobs
crontab -l

# Check cron logs (Ubuntu/Debian)
sudo tail -f /var/log/syslog | grep CRON

# Check cron logs (CentOS/RHEL)
sudo tail -f /var/log/cron
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure the script is executable (`chmod +x`)
2. **Log File Not Created**: Check directory permissions for `/var/log/`
3. **Cron Not Running**: Check if cron service is active (`sudo systemctl status cron`)
4. **Path Issues**: Use absolute paths in cron jobs

### Debug Mode

Add debug logging to the script:

```bash
# Add this line at the top of health_check.sh after the shebang
set -x  # Enable debug mode
```

### Environment Issues in Cron

Cron jobs run with minimal environment. If needed, add environment variables at the top of your crontab:

```bash
PATH=/usr/local/bin:/usr/bin:/bin
AI_SERVICE_URL=http://localhost:8080
*/5 * * * * /home/tuananh/code/JobMatch/scripts/health_check.sh
```

## Log Rotation

The script automatically rotates logs when they exceed 10MB. For more advanced log rotation, use `logrotate`:

Create `/etc/logrotate.d/ai-service-health`:

```
/var/log/ai-service-health.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 $USER $USER
}
``` 