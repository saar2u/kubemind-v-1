#!/bin/bash

set -e

echo "🚀 Deploying Kubemind Frontend to Staging..."
echo "=========================================="

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

# Build the application
echo ""
echo "🔨 Building application..."
npm run build

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📁 Build output: dist/"

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
echo "   aws s3 sync dist/ s3://your-bucket-name/"
echo ""
echo "   Vercel:"
echo "   vercel --prod"
echo ""
echo "   Netlify:"
echo "   netlify deploy --prod"
echo ""
echo "✨ Staging deployment ready!"
echo "   API URL: https://kubemind-api-446293329392.us-central1.run.app"
