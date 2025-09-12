#!/bin/bash

# Server setup script for Ubuntu EC2 instance
# Run this script on your EC2 instance to install dependencies

echo "🔧 Setting up Ubuntu server for Node.js application..."

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git build-essential

# Install Node.js 18.x LTS
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install MongoDB
echo "📦 Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Redis (optional, for caching)
echo "📦 Installing Redis..."
sudo apt install -y redis-server

# Configure Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Install Nginx (for reverse proxy)
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Chrome for Puppeteer
echo "📦 Installing Google Chrome for Puppeteer..."
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update
sudo apt install -y google-chrome-stable

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /home/ubuntu/spotworks-backend
cd /home/ubuntu/spotworks-backend

# Create logs directory
mkdir -p logs

# Set up firewall (allow SSH, HTTP, HTTPS, and app port)
echo "🔒 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw --force enable

echo "✅ Server setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Upload your application code"
echo "2. Create .env file with your environment variables"
echo "3. Install application dependencies: npm install"
echo "4. Build the application: npm run build"
echo "5. Start with PM2: pm2 start ecosystem.config.js --env production"
echo ""
echo "🔧 Services status:"
echo "Node.js: $(node --version)"
echo "MongoDB: $(sudo systemctl is-active mongod)"
echo "Redis: $(sudo systemctl is-active redis-server)"
echo "Nginx: $(sudo systemctl is-active nginx)"
