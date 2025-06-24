
#!/bin/bash

echo "🚨 Using fallback build process..."

# Set strict environment
export NODE_ENV=production
export NPM_CONFIG_ENGINE_STRICT=false
export SKIP_CANVAS=true
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Clean everything
npm cache clean --force
rm -rf node_modules package-lock.json

# Install only essential packages first
echo "📦 Installing essential packages..."
npm install express fs-extra axios chalk moment --legacy-peer-deps --force --ignore-engines

# Install remaining packages
echo "📦 Installing remaining dependencies..."
npm install --legacy-peer-deps --force --ignore-engines --no-optional

# Create directories
mkdir -p modules/commands/cache modules/events/cache includes/database/data attached_assets utils languages

# Set permissions
chmod +x main.js 2>/dev/null || true

echo "✅ Fallback build complete!"
