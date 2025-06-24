
#!/bin/bash

echo "🔧 Installing system dependencies for Canvas..."

# Update package lists
apt-get update

# Install Canvas dependencies
apt-get install -y \
  libuuid1 \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  libfontconfig1-dev \
  libfreetype6-dev \
  libssl-dev \
  pkg-config

echo "✅ System dependencies installed successfully!"

# Reinstall Canvas
echo "🎨 Reinstalling Canvas..."
npm install canvas --build-from-source

echo "🚀 Setup complete!"
