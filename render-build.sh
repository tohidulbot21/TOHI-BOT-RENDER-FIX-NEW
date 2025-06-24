
#!/bin/bash

echo "🚀 Starting Render Build Process..."

# Set environment variables for Render
export NODE_ENV=production
export NPM_CONFIG_PRODUCTION=false
export SKIP_CANVAS=true
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Clean npm cache and remove lock file
echo "🧹 Cleaning npm cache and old files..."
npm cache clean --force 2>/dev/null || true
rm -rf node_modules package-lock.json 2>/dev/null || true

# Install dependencies with specific flags for Render
echo "📦 Installing dependencies for Render..."
npm install --no-audit --no-fund --prefer-offline --no-optional --legacy-peer-deps --force --ignore-engines

# Fallback installation if first attempt fails
if [ $? -ne 0 ]; then
    echo "🔄 First installation failed, trying fallback method..."
    npm cache clean --force
    rm -rf node_modules package-lock.json
    npm install --legacy-peer-deps --force --ignore-engines --no-optional
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p modules/commands/cache
mkdir -p modules/events/cache
mkdir -p includes/database/data
mkdir -p attached_assets
mkdir -p utils
mkdir -p languages

# Set proper permissions
echo "🔒 Setting permissions..."
chmod +x main.js 2>/dev/null || true
chmod +x index.js 2>/dev/null || true
chmod +x render-build.sh 2>/dev/null || true

# Copy required files if they don't exist
echo "📋 Checking required files..."
if [ ! -f "config.json" ]; then
    echo '{"BOTNAME":"TOHI-BOT","PREFIX":"/","ADMINBOT":[]}' > config.json
fi

if [ ! -f "appstate.json" ]; then
    echo '[]' > appstate.json
fi

echo "✅ Render build complete!"
