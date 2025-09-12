#!/bin/bash

# Deployment script for SpotWorks Backend
# Make sure to run this script from your project root directory

echo "🚀 Starting deployment to AWS EC2..."

# Configuration
EC2_HOST="65.0.122.131"
EC2_USER="ubuntu"
KEY_PATH="./Facility.pem"
PROJECT_NAME="spotworks-backend"
REMOTE_DIR="/home/ubuntu/$PROJECT_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if key file exists
if [ ! -f "$KEY_PATH" ]; then
    print_error "Key file $KEY_PATH not found!"
    print_warning "Please download your Facility.pem file from AWS and place it in the project root."
    print_warning "Make sure to set proper permissions: chmod 400 Facility.pem"
    exit 1
fi

# Set proper permissions for key file
chmod 400 "$KEY_PATH"

print_status "Building the project..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed! Please fix the errors and try again."
    exit 1
fi

print_status "Creating deployment package..."
# Create a temporary directory for deployment
TEMP_DIR="temp_deploy"
mkdir -p $TEMP_DIR

# Copy necessary files
cp -r dist $TEMP_DIR/
cp package.json $TEMP_DIR/
cp package-lock.json $TEMP_DIR/ 2>/dev/null || true
cp .env $TEMP_DIR/ 2>/dev/null || true

print_status "Uploading files to EC2..."
# Upload the deployment package
scp -i "$KEY_PATH" -r $TEMP_DIR/* $EC2_USER@$EC2_HOST:$REMOTE_DIR/

if [ $? -ne 0 ]; then
    print_error "Failed to upload files to EC2!"
    rm -rf $TEMP_DIR
    exit 1
fi

print_status "Setting up the application on EC2..."
# SSH into the server and set up the application
ssh -i "$KEY_PATH" $EC2_USER@$EC2_HOST << 'ENDSSH'
    # Update system packages
    sudo apt update

    # Install Node.js if not already installed
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi

    # Install PM2 globally if not already installed
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        sudo npm install -g pm2
    fi

    # Navigate to project directory
    cd /home/ubuntu/spotworks-backend

    # Install production dependencies
    echo "Installing dependencies..."
    npm install --production

    # Stop existing PM2 processes
    pm2 stop spotworks-backend 2>/dev/null || true
    pm2 delete spotworks-backend 2>/dev/null || true

    # Start the application with PM2
    echo "Starting application with PM2..."
    pm2 start dist/server.js --name "spotworks-backend" --env production

    # Save PM2 configuration
    pm2 save

    # Setup PM2 to start on boot
    pm2 startup

    echo "Application deployed successfully!"
    echo "Status:"
    pm2 status
ENDSSH

# Clean up temporary files
rm -rf $TEMP_DIR

if [ $? -eq 0 ]; then
    print_status "Deployment completed successfully! 🎉"
    print_status "Your application is now running on: http://$EC2_HOST:3000"
    print_warning "Don't forget to configure your security group to allow inbound traffic on port 3000"
else
    print_error "Deployment failed! Please check the error messages above."
    exit 1
fi
