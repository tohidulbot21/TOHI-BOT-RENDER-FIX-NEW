
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

# Skip problematic native dependencies
echo "🚫 Skipping problematic native dependencies..."
export SKIP_CANVAS=true
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export SKIP_NATIVE_MODULES=true
export npm_config_build_from_source=true

# Install essential packages first
echo "📦 Installing essential packages..."
npm install express fs-extra axios chalk moment --no-optional --legacy-peer-deps --force --ignore-engines

# Install remaining packages excluding problematic ones
echo "📦 Installing remaining dependencies..."
npm install --no-optional --legacy-peer-deps --force --ignore-engines --no-bin-links

# Handle Canvas-related packages separately with fallback
echo "🎨 Handling Canvas dependencies..."
npm install canvas discord-image-generation --no-optional --legacy-peer-deps --force --ignore-engines 2>/dev/null || {
    echo "⚠️ Canvas installation failed, continuing without it..."
    # Remove canvas from node_modules if partially installed
    rm -rf node_modules/canvas node_modules/discord-image-generation 2>/dev/null || true
}

# Fallback installation if needed
if [ ! -d "node_modules/fs-extra" ]; then
    echo "🔄 Essential packages missing, trying fallback method..."
    npm cache clean --force
    rm -rf node_modules package-lock.json
    npm install express fs-extra axios chalk moment --legacy-peer-deps --force --ignore-engines --no-optional
    npm install --legacy-peer-deps --force --ignore-engines --no-optional --no-bin-links
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
