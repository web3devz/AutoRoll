#!/bin/bash

# AutoRoll Development Setup Script
# This script sets up the complete development environment

echo "🛠️ AutoRoll Development Setup"
echo "============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js detected: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm detected: $(npm --version)${NC}"
echo ""

# Setup smart contract
echo -e "${BLUE}📦 Setting up Smart Contract...${NC}"
cd smart-contract

if [ ! -f package.json ]; then
    echo -e "${RED}❌ Smart contract package.json not found${NC}"
    exit 1
fi

echo "Installing smart contract dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Smart contract dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install smart contract dependencies${NC}"
    exit 1
fi

echo "Building smart contract..."
npm run asbuild:debug

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Smart contract built successfully${NC}"
else
    echo -e "${YELLOW}⚠️ Smart contract build failed (may need Massa SDK)${NC}"
fi

cd ..
echo ""

# Setup frontend
echo -e "${BLUE}🌐 Setting up Frontend...${NC}"
cd frontend

if [ ! -f package.json ]; then
    echo -e "${RED}❌ Frontend package.json not found${NC}"
    exit 1
fi

echo "Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

echo "Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${YELLOW}⚠️ Frontend build failed (may need Massa Web3 libraries)${NC}"
fi

cd ..
echo ""

# Create development commands
echo -e "${BLUE}📝 Creating development scripts...${NC}"

cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting AutoRoll Development Server..."
cd frontend
npm run dev
EOF

chmod +x start-dev.sh

cat > build-all.sh << 'EOF'
#!/bin/bash
echo "🔨 Building AutoRoll Project..."

# Build smart contract
echo "Building smart contract..."
cd smart-contract
npm run asbuild:release
cd ..

# Build frontend
echo "Building frontend..."
cd frontend
npm run build
cd ..

echo "✅ Build complete!"
echo "📁 Smart contract WASM: ./smart-contract/build/release/autoroll.wasm"
echo "📁 Frontend dist: ./frontend/dist/"
EOF

chmod +x build-all.sh

echo -e "${GREEN}✅ Development scripts created${NC}"
echo "  - start-dev.sh: Start development server"
echo "  - build-all.sh: Build entire project"
echo ""

# Setup instructions
echo -e "${YELLOW}📋 Setup Complete! Next Steps:${NC}"
echo ""
echo "1. Install Massa Station Wallet:"
echo "   https://massa.net/docs/install/station"
echo ""
echo "2. Get Buildnet MAS tokens:"
echo "   https://buildnet.massa.net/faucet"
echo ""
echo "3. Start development server:"
echo "   ./start-dev.sh"
echo ""
echo "4. Open browser to:"
echo "   http://localhost:3000"
echo ""
echo "5. Deploy smart contract:"
echo "   cd smart-contract"
echo "   npm run asbuild:release"
echo "   # Then deploy build/release/autoroll.wasm using Massa Station"
echo ""

# Check for Massa tools
echo -e "${BLUE}🔍 Checking for Massa tools...${NC}"

if command -v massa-cli &> /dev/null; then
    echo -e "${GREEN}✅ massa-cli detected: $(massa-cli --version)${NC}"
else
    echo -e "${YELLOW}⚠️ massa-cli not found (optional for CLI deployment)${NC}"
fi

if command -v massa-web &> /dev/null; then
    echo -e "${GREEN}✅ massa-web detected${NC}"
else
    echo -e "${YELLOW}⚠️ massa-web not found (install with: npm install -g @massalabs/massa-web)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 AutoRoll development environment is ready!${NC}"
echo ""
echo "📖 Read README.md for detailed usage instructions"
echo "🚀 Run ./demo.sh to see a demonstration"
echo "🌐 Visit https://docs.massa.net for Massa documentation"
echo ""
