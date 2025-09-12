#!/bin/bash

# Manual SSL Setup Script (Alternative to Let's Encrypt)
# Use this if Let's Encrypt doesn't work due to domain restrictions

echo "🔒 Setting up HTTPS with self-signed certificate (for development/testing)..."

# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/spotworks.key \
    -out /etc/nginx/ssl/spotworks.crt \
    -subj "/C=IN/ST=State/L=City/O=SpotWorks/OU=IT/CN=65.0.122.131"

# Create Nginx configuration for self-signed SSL
sudo tee /etc/nginx/sites-available/spotworks-ssl > /dev/null << 'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name 65.0.122.131 ec2-65-0-122-131.ap-south-1.compute.amazonaws.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server configuration
server {
    listen 443 ssl http2;
    server_name 65.0.122.131 ec2-65-0-122-131.ap-south-1.compute.amazonaws.com;

    # Self-signed SSL Configuration
    ssl_certificate /etc/nginx/ssl/spotworks.crt;
    ssl_certificate_key /etc/nginx/ssl/spotworks.key;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
    }
    
    client_max_body_size 10M;
    
    access_log /var/log/nginx/spotworks_ssl_access.log;
    error_log /var/log/nginx/spotworks_ssl_error.log;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/spotworks-ssl /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Self-signed SSL setup completed!"
echo ""
echo "🌐 Your application is now available at:"
echo "   - https://65.0.122.131"
echo ""
echo "⚠️  NOTE: Browsers will show a security warning for self-signed certificates."
echo "    Click 'Advanced' and 'Proceed to 65.0.122.131 (unsafe)' to access your site."
