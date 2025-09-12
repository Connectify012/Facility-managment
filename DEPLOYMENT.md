# SpotWorks Backend Deployment Guide

## Prerequisites

1. **Download your AWS Key Pair**
   - Go to AWS EC2 Console > Key Pairs
   - Download `Facility.pem` file
   - Place it in your project root directory

2. **Set Key Permissions** (if on Linux/Mac)
   ```bash
   chmod 400 Facility.pem
   ```

## Deployment Steps

### Step 1: Connect to Your EC2 Instance

```bash
# Using SSH client
ssh -i "Facility.pem" ubuntu@65.0.122.131
```

### Step 2: Initial Server Setup

Run this command on your EC2 instance to install all dependencies:

```bash
# Download and run the server setup script
curl -o server-setup.sh https://raw.githubusercontent.com/your-repo/spotworks-backend/main/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

Or manually set up the server by copying the `server-setup.sh` script content.

### Step 3: Upload Your Code

From your local machine, use the deployment script:

```bash
# Make the deploy script executable (Linux/Mac)
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

**For Windows PowerShell, use:**
```powershell
# Upload files manually using SCP
scp -i "Facility.pem" -r dist package.json .env ubuntu@65.0.122.131:/home/ubuntu/spotworks-backend/
```

### Step 4: Configure Environment Variables

1. Copy the production environment template:
   ```bash
   cp .env.production.example .env
   ```

2. Edit the `.env` file with your actual values:
   ```bash
   nano .env
   ```

### Step 5: Install Dependencies and Start Application

```bash
# Navigate to project directory
cd /home/ubuntu/spotworks-backend

# Install production dependencies
npm install --production

# Build the application (if TypeScript source is uploaded)
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 6: Configure Nginx (Optional but Recommended)

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/spotworks

# Enable the site
sudo ln -s /etc/nginx/sites-available/spotworks /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Step 7: Configure AWS Security Group

In AWS Console:
1. Go to EC2 > Security Groups
2. Select your instance's security group
3. Add inbound rules:
   - Port 22 (SSH) - Your IP
   - Port 80 (HTTP) - 0.0.0.0/0
   - Port 443 (HTTPS) - 0.0.0.0/0
   - Port 3000 (Node.js) - 0.0.0.0/0

## Useful Commands

### PM2 Management
```bash
# Check status
pm2 status

# View logs
pm2 logs spotworks-backend

# Restart application
pm2 restart spotworks-backend

# Stop application
pm2 stop spotworks-backend

# Monitor in real-time
pm2 monit
```

### System Services
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check Redis status
sudo systemctl status redis-server

# Check Nginx status
sudo systemctl status nginx
```

### Logs
```bash
# Application logs
tail -f /home/ubuntu/spotworks-backend/logs/combined.log

# Nginx logs
sudo tail -f /var/log/nginx/spotworks_access.log
sudo tail -f /var/log/nginx/spotworks_error.log

# System logs
sudo journalctl -u mongod -f
```

## Troubleshooting

### Common Issues

1. **Port 3000 not accessible**
   - Check security group settings
   - Verify application is running: `pm2 status`

2. **MongoDB connection issues**
   - Check if MongoDB is running: `sudo systemctl status mongod`
   - Verify connection string in `.env`

3. **Application crashes**
   - Check logs: `pm2 logs spotworks-backend`
   - Verify all environment variables are set

4. **File upload issues**
   - Check disk space: `df -h`
   - Verify uploads directory permissions

### Performance Optimization

1. **Enable Nginx caching**
2. **Set up SSL with Let's Encrypt**
3. **Configure MongoDB replica set**
4. **Set up Redis for session storage**

## URLs After Deployment

- **Direct Node.js**: http://65.0.122.131:3000
- **Through Nginx**: http://65.0.122.131
- **API Documentation**: http://65.0.122.131:3000/api-docs

## Security Considerations

1. **Change default MongoDB port**
2. **Set up MongoDB authentication**
3. **Configure Redis password**
4. **Set up SSL certificates**
5. **Update system packages regularly**
6. **Configure fail2ban for SSH protection**

## Backup Strategy

1. **Database backups**
   ```bash
   mongodump --db spotworks_production --out /home/ubuntu/backups/
   ```

2. **Application backups**
   ```bash
   tar -czf /home/ubuntu/backups/app-backup-$(date +%Y%m%d).tar.gz /home/ubuntu/spotworks-backend
   ```

3. **Automated backups with cron**
   ```bash
   # Add to crontab
   0 2 * * * /home/ubuntu/backup-script.sh
   ```
