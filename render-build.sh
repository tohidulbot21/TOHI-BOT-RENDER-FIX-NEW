
#!/bin/bash

echo "🚀 Starting Render Build Process..."

# Set environment variables for Render
export NODE_ENV=production
export NPM_CONFIG_PRODUCTION=false
export SKIP_CANVAS=true

# Clean npm cache
echo "🧹 Cleaning npm cache..."
npm cache clean --force 2>/dev/null || true

# Remove problematic files
echo "🗑️ Cleaning old files..."
rm -rf node_modules package-lock.json 2>/dev/null || true

# Install dependencies with specific flags for Render
echo "📦 Installing dependencies for Render..."
npm install --no-audit --no-fund --prefer-offline --no-optional --legacy-peer-deps

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p modules/commands/cache
mkdir -p modules/events/cache
mkdir -p includes/database/data
mkdir -p attached_assets

# Set proper permissions
echo "🔒 Setting permissions..."
chmod +x main.js 2>/dev/null || true
chmod +x index.js 2>/dev/null || true

echo "✅ Render build complete!"
