#!/bin/bash

# SSL Setup Script for SpotWorks Backend
# This script sets up HTTPS using Let's Encrypt SSL certificates

echo "🔒 Setting up HTTPS with Let's Encrypt..."

# Configuration
DOMAIN="ec2-65-0-122-131.ap-south-1.compute.amazonaws.com"
EMAIL="your-email@example.com"  # Change this to your email

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

print_status "Installing Certbot..."
# Install snapd if not already installed
apt update
apt install -y snapd

# Install certbot via snap
snap install core; snap refresh core
snap install --classic certbot

# Create a symlink
ln -sf /snap/bin/certbot /usr/bin/certbot

print_status "Installing Nginx if not already installed..."
apt install -y nginx

print_status "Configuring Nginx for initial setup..."

# Create initial Nginx configuration for domain verification
cat > /etc/nginx/sites-available/spotworks-ssl << EOF
server {
    listen 80;
    server_name $DOMAIN 65.0.122.131;

    # Allow Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all other traffic to HTTPS (will be enabled after SSL setup)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/spotworks-ssl /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

if [ $? -ne 0 ]; then
    print_error "Nginx configuration test failed!"
    exit 1
fi

# Reload nginx
systemctl reload nginx

print_status "Obtaining SSL certificate from Let's Encrypt..."

# Obtain SSL certificate
certbot --nginx -d $DOMAIN -d 65.0.122.131 --non-interactive --agree-tos --email $EMAIL --redirect

if [ $? -eq 0 ]; then
    print_status "SSL certificate obtained successfully!"
    
    # Update Nginx configuration for better security
    print_status "Updating Nginx configuration for enhanced security..."
    
    cat > /etc/nginx/sites-available/spotworks-ssl << EOF
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $DOMAIN 65.0.122.131;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server configuration
server {
    listen 443 ssl http2;
    server_name $DOMAIN 65.0.122.131;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    
    location / {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout       60s;
        proxy_send_timeout          60s;
        proxy_read_timeout          60s;
    }
    
    # Handle large file uploads
    client_max_body_size 10M;
    
    # Logs
    access_log /var/log/nginx/spotworks_access.log;
    error_log /var/log/nginx/spotworks_error.log;
}
EOF

    # Test and reload nginx
    nginx -t && systemctl reload nginx
    
    print_status "Setting up automatic certificate renewal..."
    
    # Test automatic renewal
    certbot renew --dry-run
    
    if [ $? -eq 0 ]; then
        print_status "✅ HTTPS setup completed successfully!"
        echo ""
        echo "🌐 Your application is now available at:"
        echo "   - https://$DOMAIN"
        echo "   - https://65.0.122.131"
        echo ""
        echo "🔒 SSL certificate will auto-renew every 90 days"
        echo "🔄 HTTP traffic is automatically redirected to HTTPS"
        echo ""
        echo "📋 Next steps:"
        echo "1. Update your frontend to use HTTPS URLs"
        echo "2. Update your environment variables if needed"
        echo "3. Test your application thoroughly"
    else
        print_warning "SSL certificate obtained but auto-renewal test failed"
        print_warning "You may need to manually renew certificates"
    fi
    
else
    print_error "Failed to obtain SSL certificate!"
    print_warning "Please check:"
    print_warning "1. Domain is pointing to this server"
    print_warning "2. Port 80 and 443 are open in security group"
    print_warning "3. No other service is using port 80"
    exit 1
fi
