
# 🚀 TOHI-BOT-HUB Render Deployment Guide

## Prerequisites
- GitHub account
- Render account
- Valid Facebook AppState

## Deployment Steps

### 1. Fork Repository
Fork this repository to your GitHub account

### 2. Create Render Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Use these settings:

```
Name: tohi-bot-hub
Environment: Node
Region: Singapore (recommended)
Branch: main
Build Command: npm run render-build
Start Command: node main.js
```

### 3. Environment Variables
Add these environment variables in Render:

```
NODE_ENV=production
PORT=10000
HOST=0.0.0.0
NPM_CONFIG_PRODUCTION=false
```

### 4. Configure Bot
1. Upload your `appstate.json` file
2. Update `config.json` with your settings:

```json
{
  "BOTNAME": "Your Bot Name",
  "PREFIX": "/",
  "ADMINBOT": ["your_facebook_id"]
}
```

### 5. Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Your bot will be available at the provided URL

## Features for Render

### ✅ Optimizations Included:
- Automatic keep-alive system (prevents sleeping)
- Memory management
- Error handling for Render environment
- Health check endpoints
- Proper dependency installation

### 🔄 Keep-Alive System:
- Self-pings every 14 minutes
- Memory cleanup every 30 minutes
- Health monitoring at `/health`

### 📊 Monitoring Endpoints:
- `/health` - Health check
- `/ping` - Simple ping
- `/dashboard` - Bot dashboard

## Troubleshooting

### npm install fails:
The bot includes a custom build script that handles this automatically.

### Bot goes offline:
The keep-alive system prevents this. Check logs for any errors.

### Memory issues:
Automatic memory cleanup is included. Monitor usage in Render dashboard.

## Important Notes

1. ⚠️ **Free Plan Limitations**: Render free plan has 750 hours/month
2. 🔄 **Auto-Sleep**: Keep-alive system prevents this
3. 📱 **Facebook Limits**: Respect Facebook's rate limits
4. 🔒 **Security**: Keep your appstate.json secure

## Support

For issues specific to this bot on Render:
1. Check Render logs
2. Verify environment variables
3. Ensure appstate.json is valid
4. Monitor the `/health` endpoint

---
**© 2024 TOHI-BOT-HUB Team**
