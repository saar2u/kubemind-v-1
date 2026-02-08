#!/bin/bash

set -e

echo "🚀 Deploying Kubemind Frontend to Production..."
echo "==============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci

# Run tests (if any)
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    echo ""
    echo "🧪 Running tests..."
    npm test
fi

# Build the application
echo ""
echo "🔨 Building application..."
npm run build

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📁 Build output: dist/"

echo ""
echo "⚠️  Production Deployment Checklist:"
echo "   ☐ Update .env with production API URLs"
echo "   ☐ Verify OAuth client IDs are production-ready"
echo "   ☐ Check all environment variables are set"
echo "   ☐ Review security settings"
echo "   ☐ Test build locally before deploying"
echo "   ☐ Backup current production version"
echo ""
echo "📤 Deployment options:"
echo "   1. Deploy to Cloudflare Pages (recommended)"
echo "   2. Deploy to AWS S3 + CloudFront"
echo "   3. Deploy to Vercel"
echo "   4. Deploy to Netlify"
echo ""
echo "💡 Manual deployment commands:"
echo ""
echo "   Cloudflare Pages:"
echo "   cd dist && wrangler pages deploy"
echo ""
echo "   AWS S3:"
echo "   aws s3 sync dist/ s3://your-production-bucket/"
echo "   aws cloudfront create-invalidation --distribution-id YOUR_ID --paths '/*'"
echo ""
echo "   Vercel:"
echo "   vercel --prod"
echo ""
echo "   Netlify:"
echo "   netlify deploy --prod"
echo ""
echo "✨ Production deployment ready!"
