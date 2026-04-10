#!/bin/bash
# ============================================================
# Project Gizi — VPS Auto Setup Script
# Jalankan SEKALI di VPS Ubuntu 22.04 fresh
# Usage: bash -c "$(curl -sL https://raw.githubusercontent.com/Ramadhannsu27/projectgizi/main/scripts/vps-setup.sh)"
# ============================================================

set -e

# Warna
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Project Gizi — VPS Auto Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ============================================================
# STEP 1: Input dari user
# ============================================================
echo -e "${YELLOW}📝 Langkah 1: Konfigurasi${NC}"

read -p "Nama domain (contoh: gizi.sekolahku.sch.id): " DOMAIN
read -p "Password MySQL untuk database: " MYSQL_PASSWORD
read -p "AUTH_SECRET (tekan Enter untuk generate otomatis): " AUTH_SECRET

# Generate AUTH_SECRET jika kosong
if [ -z "$AUTH_SECRET" ]; then
    AUTH_SECRET=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)
    echo -e "${GREEN}✅ AUTH_SECRET di-generate otomatis${NC}"
fi

echo ""
echo -e "${YELLOW}📝 Langkah 2: Install dependencies...${NC}"
echo ""

# ============================================================
# STEP 2: Update & Install packages
# ============================================================
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null 2>&1
sudo apt install -y nodejs

# Install tools lain
sudo apt install -y \
    git \
    nginx \
    mysql-server \
    certbot \
    python3-certbot-nginx \
    ufw \
    curl \
    openssl

echo -e "${GREEN}✅ Dependencies terinstall${NC}"
echo ""

# ============================================================
# STEP 3: Clone / Update project
# ============================================================
echo -e "${YELLOW}📝 Langkah 3: Clone project dari GitHub...${NC}"

PROJECT_DIR="/var/www/projectgizi"

if [ -d "$PROJECT_DIR" ]; then
    echo "Project sudah ada, update dari GitHub..."
    cd "$PROJECT_DIR" && sudo git pull
else
    sudo git clone https://github.com/Ramadhannsu27/projectgizi.git "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"
sudo npm install

echo -e "${GREEN}✅ Project ter-clone dan dependencies terinstall${NC}"
echo ""

# ============================================================
# STEP 4: Setup MySQL
# ============================================================
echo -e "${YELLOW}📝 Langkah 4: Setup MySQL database...${NC}"

# Start MySQL
sudo systemctl enable mysql
sudo systemctl start mysql

# Buat database dan user
sudo mysql -e "CREATE DATABASE IF NOT EXISTS projectgizi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'gizi'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';"
sudo mysql -e "GRANT ALL PRIVILEGES ON projectgizi.* TO 'gizi'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

echo -e "${GREEN}✅ Database 'projectgizi' dan user 'gizi' dibuat${NC}"
echo ""

# ============================================================
# STEP 5: Setup Environment Variables
# ============================================================
echo -e "${YELLOW}📝 Langkah 5: Setup environment variables...${NC}"

ENV_FILE="$PROJECT_DIR/.env"

sudo tee "$ENV_FILE" > /dev/null <<EOF
DATABASE_URL=mysql://gizi:${MYSQL_PASSWORD}@localhost:3306/projectgizi
AUTH_SECRET=${AUTH_SECRET}
NODE_ENV=production
EOF

echo -e "${GREEN}✅ .env file dibuat${NC}"
echo ""

# ============================================================
# STEP 6: Build application
# ============================================================
echo -e "${YELLOW}📝 Langkah 6: Build application...${NC}"

cd "$PROJECT_DIR"
sudo npm run build

echo -e "${GREEN}✅ Build selesai${NC}"
echo ""

# ============================================================
# STEP 7: Setup PM2 (process manager)
# ============================================================
echo -e "${YELLOW}📝 Langkah 7: Setup PM2...${NC}"

sudo npm install -g pm2

cd "$PROJECT_DIR"
sudo chown -R $USER:$USER "$PROJECT_DIR"

# Start dengan PM2
pm2 delete projectgizi 2>/dev/null || true
pm2 start npm --name "projectgizi" -- start
pm2 save

# Setup startup script
pm2 startup > /dev/null 2>&1 || true
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $(eval echo ~$USER) > /dev/null 2>&1 || true

echo -e "${GREEN}✅ PM2 aktif dan app berjalan${NC}"
echo ""

# ============================================================
# STEP 8: Setup Nginx
# ============================================================
echo -e "${YELLOW}📝 Langkah 8: Setup Nginx reverse proxy...${NC}"

sudo tee /etc/nginx/sites-available/projectgizi > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

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
        proxy_read_timeout 86400;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/projectgizi /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test & reload
sudo nginx -t && sudo systemctl reload nginx

echo -e "${GREEN}✅ Nginx aktif${NC}"
echo ""

# ============================================================
# STEP 9: Firewall
# ============================================================
echo -e "${YELLOW}📝 Langkah 9: Setup firewall...${NC}"

sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo -e "${GREEN}✅ Firewall aktif (UFW)${NC}"
echo ""

# ============================================================
# STEP 10: SSL Certificate
# ============================================================
echo -e "${YELLOW}📝 Langkah 10: Setup SSL (Let's Encrypt)...${NC}"
echo -e "${BLUE}   Tekan ENTER untuk melanjutkan atau CTRL+C untuk skip${NC}"
read -p "Email untuk SSL (opsional): " SSL_EMAIL

if [ -n "$SSL_EMAIL" ]; then
    sudo certbot --nginx -d "$DOMAIN" --email "$SSL_EMAIL" --agree-tos --non-interactive --redirect
    echo -e "${GREEN}✅ SSL certificate terinstall${NC}"
else
    echo -e "${YELLOW}⏭️  SSL di-skip. Jalankan manual: sudo certbot --nginx -d $DOMAIN${NC}"
fi

echo ""

# ============================================================
# DONE
# ============================================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✅ SETUP SELESAI!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "🌐 Buka browser: ${BLUE}http://$DOMAIN${NC}"
echo ""
echo -e "📋 Info penting:"
echo "   • App berjalan di: http://localhost:3000"
echo "   • Manajemen PM2:  pm2 status"
echo "   • Logs:           pm2 logs projectgizi"
echo "   • Restart:        pm2 restart projectgizi"
echo "   • Stop:           pm2 stop projectgizi"
echo ""
echo -e "🔄 Update project (pull dari GitHub):"
echo "   cd $PROJECT_DIR && git pull && npm install && npm run build && pm2 restart projectgizi"
echo ""
echo -e "🔑 AUTH_SECRET: $AUTH_SECRET"
echo -e "🔑 DATABASE_URL: mysql://gizi:$MYSQL_PASSWORD@localhost:3306/projectgizi"
echo ""
