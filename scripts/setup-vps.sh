#!/bin/bash

# ============================================================
#  MBG GIZI - Auto Deploy Script untuk VPS Hostinger
# ============================================================
#  Cara pakai:
#    1. SSH ke VPS: ssh root@IP-VPS-KAMU
#    2. Download script ini ke VPS:
#       curl -fsSL https://raw.githubusercontent.com/.../setup-vps.sh -o setup-vps.sh
#       chmod +x setup-vps.sh
#       ./setup-vps.sh
# ============================================================

set -e

# Warna
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MBG GIZI - Auto Setup Script${NC}"
echo -e "${BLUE}  Untuk VPS Hostinger${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ============================================================
#  STEP 1: Install Node.js
# ============================================================
echo -e "${YELLOW}[1/6]${NC} Menginstall Node.js 20..."
if command -v node &> /dev/null; then
    echo -e "${GREEN}  Node.js sudah terinstall: $(node -v)${NC}"
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs > /dev/null 2>&1
    echo -e "${GREEN}  Node.js terinstall: $(node -v)${NC}"
fi

# ============================================================
#  STEP 2: Install PM2
# ============================================================
echo -e "${YELLOW}[2/6]${NC} Menginstall PM2 (Process Manager)..."
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}  PM2 sudah terinstall${NC}"
else
    npm install -g pm2 > /dev/null 2>&1
    echo -e "${GREEN}  PM2 terinstall${NC}"
fi

# ============================================================
#  STEP 3: Install Nginx
# ============================================================
echo -e "${YELLOW}[3/6]${NC} Menginstall Nginx..."
if command -v nginx &> /dev/null; then
    echo -e "${GREEN}  Nginx sudah terinstall${NC}"
else
    apt-get update > /dev/null 2>&1
    apt-get install -y nginx > /dev/null 2>&1
    echo -e "${GREEN}  Nginx terinstall${NC}"
fi

# ============================================================
#  STEP 4: Buat directory project
# ============================================================
echo -e "${YELLOW}[4/6]${NC} Menyiapkan directory project..."
PROJECT_DIR="/var/www/mbg-gizi"
NGINX_CONF="/etc/nginx/sites-available/mbg-gizi"
NGINX_ENABLED="/etc/nginx/sites-enabled/mbg-gizi"

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"
echo -e "${GREEN}  Directory siap: $PROJECT_DIR${NC}"

# ============================================================
#  STEP 5: Setup Nginx
# ============================================================
echo -e "${YELLOW}[5/6]${NC} Mengkonfigurasi Nginx..."

# Tanya domain
echo -e "${BLUE}  Masukkan domain kamu (contoh: mbggizi.online):${NC}"
echo -ne "${YELLOW}  Domain: ${NC}"
read -r DOMAIN

if [ -z "$DOMAIN" ]; then
    DOMAIN="localhost"
fi

cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Max upload size
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
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
ln -sf "$NGINX_CONF" "$NGINX_ENABLED"

# Disable default if exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm -f /etc/nginx/sites-enabled/default
fi

nginx -t > /dev/null 2>&1 && echo -e "${GREEN}  Nginx konfigurasi OK${NC}" || echo -e "${RED}  Nginx config error${NC}"
systemctl reload nginx > /dev/null 2>&1
echo -e "${GREEN}  Nginx running${NC}"

# ============================================================
#  STEP 6: Tanya info database
# ============================================================
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Konfigurasi Database MySQL${NC}"
echo -e "${BLUE}  (dari hPanel Hostinger > Databases)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -ne "${YELLOW}  MySQL Host (biasanya localhost): ${NC}"
read -r DB_HOST
DB_HOST=${DB_HOST:-localhost}

echo -ne "${YELLOW}  MySQL Port (biasanya 3306): ${NC}"
read -r DB_PORT
DB_PORT=${DB_PORT:-3306}

echo -ne "${YELLOW}  Database Name (contoh: mbg_gizi): ${NC}"
read -r DB_NAME
DB_NAME=${DB_NAME:-mbg_gizi}

echo -ne "${YELLOW}  Database User: ${NC}"
read -r DB_USER

echo -ne "${YELLOW}  Database Password: ${NC}"
read -rs DB_PASS
echo ""

# ============================================================
#  STEP 7: Tanya apakah upload via git atau scp
# ============================================================
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Upload Project${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}  Pilih metode upload:${NC}"
echo -e "  ${GREEN}1.${NC} Git clone (kode sudah di GitHub)"
echo -e "  ${GREEN}2.${NC} SCP upload dari komputer lokal"
echo -e "  ${GREEN}3.${NC} Download langsung (tarball)"
echo ""
echo -ne "${YELLOW}  Pilih [1/2/3]: ${NC}"
read -r UPLOAD_METHOD

case $UPLOAD_METHOD in
1)
    echo -ne "${YELLOW}  Git Repository URL: ${NC}"
    read -r GIT_URL
    if [ -n "$GIT_URL" ]; then
        rm -rf "$PROJECT_DIR"/*
        git clone "$GIT_URL" "$PROJECT_DIR" 2>/dev/null || echo -e "${RED}  Git clone failed${NC}"
    fi
    ;;
2)
    echo -e "${YELLOW}  Dari komputer lokal, jalankan command ini:${NC}"
    echo -e "${GREEN}  scp -r C:/xampp/htdocs/projectgizi/* root@$(curl -s ifconfig.me)://var/www/mbg-gizi/${NC}"
    echo -e "${YELLOW}  Setelah upload, tekan Enter di sini${NC}"
    echo -ne "${YELLOW}  Tekan Enter untuk melanjutkan: ${NC}"
    read -r _
    ;;
3)
    echo -ne "${YELLOW}  Tarball URL (GitHub release, dll): ${NC}"
    read -r TARBALL_URL
    if [ -n "$TARBALL_URL" ]; then
        cd /tmp
        curl -fsSL "$TARBALL_URL" -o project.tar.gz
        tar -xzf project.tar.gz -C "$PROJECT_DIR" --strip-components=1
        rm -f project.tar.gz
        cd "$PROJECT_DIR"
    fi
    ;;
esac

# ============================================================
#  STEP 8: Install dependencies & build
# ============================================================
echo -e "${YELLOW}[6/6]${NC} Installing dependencies..."

if [ ! -f "$PROJECT_DIR/package.json" ]; then
    echo -e "${RED}  ERROR: package.json tidak ditemukan di $PROJECT_DIR${NC}"
    echo -e "${YELLOW}  Pastikan file project sudah diupload ke $PROJECT_DIR${NC}"
    exit 1
fi

cd "$PROJECT_DIR"
npm install 2>/dev/null || echo -e "${RED}  npm install failed${NC}"
npm run build 2>/dev/null || echo -e "${RED}  npm build failed${NC}"

# ============================================================
#  STEP 9: Setup Environment Variables
# ============================================================
echo -e "${YELLOW}  Membuat file .env...${NC}"

cat > "$PROJECT_DIR/.env" << EOF
# ============================================================
#  MBG GIZI - Environment Configuration
#  Dibuat otomatis oleh setup script
# ============================================================

# Database
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# App
NEXT_PUBLIC_APP_URL="http://${DOMAIN}"
NODE_ENV="production"
EOF

echo -e "${GREEN}  .env created${NC}"

# ============================================================
#  STEP 10: PM2 Setup
# ============================================================
echo -e "${YELLOW}  Menjalankan aplikasi dengan PM2...${NC}"

# Stop existing if any
pm2 stop mbg-gizi 2>/dev/null || true
pm2 delete mbg-gizi 2>/dev/null || true

# Start app
pm2 start npm --name "mbg-gizi" -- start
pm2 save
pm2 startup

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Selesai!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}  URL:${NC}       http://${DOMAIN}"
echo -e "${BLUE}  Project:${NC}  $PROJECT_DIR"
echo -e "${BLUE}  Logs:${NC}      pm2 logs mbg-gizi"
echo -e "${BLUE}  Status:${NC}     pm2 status"
echo -e "${BLUE}  Restart:${NC}    pm2 restart mbg-gizi"
echo ""
echo -e "${YELLOW}  Langkah selanjutnya:${NC}"
echo -e "  1. Setup SSL (opsional tapi disarankan):"
echo -e "     certbot --nginx -d $DOMAIN"
echo -e "  2. Setup database schema:"
echo -e "     cd $PROJECT_DIR && npx drizzle-kit push"
echo -e "  3. Seed database (opsional):"
echo -e "     cd $PROJECT_DIR && npx tsx scripts/seed.ts"
echo ""
echo -e "${GREEN}========================================${NC}"
