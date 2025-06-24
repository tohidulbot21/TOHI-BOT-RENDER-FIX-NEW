
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
npm install express fs-extra axios chalk moment lodash --legacy-peer-deps --force --ignore-engines --no-optional

# Install remaining packages excluding Canvas
echo "📦 Installing remaining dependencies (excluding Canvas)..."
npm install --legacy-peer-deps --force --ignore-engines --no-optional --no-bin-links

# Try to install Canvas-related packages separately
echo "🎨 Attempting Canvas installation..."
npm install canvas discord-image-generation --legacy-peer-deps --force --ignore-engines --no-optional 2>/dev/null || {
    echo "⚠️ Canvas installation failed - commands will work without image generation"
    # Create a dummy canvas module to prevent require errors
    mkdir -p node_modules/canvas
    echo 'module.exports = { createCanvas: () => null, loadImage: () => null };' > node_modules/canvas/index.js
}

# Verify essential packages
echo "✅ Verifying essential packages..."
if [ ! -d "node_modules/fs-extra" ]; then
    echo "❌ fs-extra missing, installing again..."
    npm install fs-extra --legacy-peer-deps --force --ignore-engines --no-optional
fi

# Create directories
mkdir -p modules/commands/cache modules/events/cache includes/database/data attached_assets utils languages

# Set permissions
chmod +x main.js 2>/dev/null || true

echo "✅ Fallback build complete!"
