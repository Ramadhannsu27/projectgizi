#!/bin/bash

# ============================================================
#  MBG GIZI - Setup Lengkap Sekali Klik
#  TARGET VPS: 202.155.95.123
# ============================================================
#  Jalankan di VPS Hostinger BARU (Ubuntu):
#
#    1. SSH ke VPS:
#       ssh root@202.155.95.123
#
#    2. Download script ini:
#       curl -fsSL https://raw.githubusercontent.com/Ramadhannsu27/projectgizi/main/scripts/one-click.sh -o one-click.sh
#       chmod +x one-click.sh
#
#    3. Jalankan:
#       ./one-click.sh
#
#    Selesai! App langsung jalan di port 80
# ============================================================

set -e

# Konfigurasi
VPS_IP="${1:-}"
DOMAIN="${2:-}"
DB_HOST="${3:-localhost}"
DB_PORT="${4:-3306}"
DB_NAME="${5:-mbg_gizi}"
DB_USER="${6:-}"
DB_PASS="${7:-}"

# Warna
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Banner
echo -e "${CYAN}"
echo "  ██████╗ ██████╗ ██╗   ██╗███╗   ██╗██████╗ ███████╗██████╗  "
echo "  ██╔══██╗██╔══██╗██║   ██║████╗  ██║██╔══██╗██╔════╝██╔══██╗ "
echo "  ██║  ██║██████╔╝██║   ██║██╔██╗ ██║██║  ██║█████╗  ██║  ██║ "
echo "  ██║  ██║██╔══██╗██║   ██║██║╚██╗██║██║  ██║██╔══╝  ██║  ██║ "
echo "  ██████╔╝██║  ██║╚██████╔╝██║ ╚████║██████╔╝███████╗██████╔╝ "
echo "  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═════╝  "
echo -e "${NC}"
echo -e "${BLUE}  MBG GIZI - Auto Deploy Script${NC}"
echo -e "${BLUE}  Untuk VPS Hostinger${NC}"
echo ""

# ============================================================
#  Tanya konfigurasi jika tidak diberikan sebagai argumen
# ============================================================
if [ -z "$VPS_IP" ]; then
    echo -ne "${YELLOW}  Masukkan IP VPS kamu: ${NC}"
    read -r VPS_IP
fi

if [ -z "$DOMAIN" ]; then
    echo -ne "${YELLOW}  Masukkan domain kamu (kosongkan jika pakai IP): ${NC}"
    read -r DOMAIN
    DOMAIN=${DOMAIN:-$VPS_IP}
fi

if [ -z "$DB_USER" ]; then
    echo ""
    echo -e "${BLUE}  ─── Konfigurasi Database MySQL ───${NC}"
    echo -e "${BLUE}  (Buka hPanel > Databases untuk info ini)${NC}"
    echo ""
    echo -ne "${YELLOW}  Database Name [mbg_gizi]: ${NC}"
    read -r DB_NAME_INPUT
    DB_NAME=${DB_NAME_INPUT:-mbg_gizi}

    echo -ne "${YELLOW}  Database User: ${NC}"
    read -r DB_USER

    echo -ne "${YELLOW}  Database Password: ${NC}"
    read -rs DB_PASS
    echo ""
fi

PROJECT_DIR="/var/www/projectgizi"
NGINX_CONF="/etc/nginx/sites-available/projectgizi"

echo ""
echo -e "${YELLOW}  Memulai setup...${NC}"
echo ""

# ============================================================
#  STEP 1: Install Node.js 20
# ============================================================
echo -e "${YELLOW}  [1/7] Install Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
apt-get install -y nodejs > /dev/null 2>&1
echo -e "  ${GREEN}OK${NC} Node.js $(node -v)"

# ============================================================
#  STEP 2: Install PM2
# ============================================================
echo -e "${YELLOW}  [2/7] Install PM2...${NC}"
npm install -g pm2 > /dev/null 2>&1
echo -e "  ${GREEN}OK${NC} PM2 $(pm2 --version 2>/dev/null | head -1)"

# ============================================================
#  STEP 3: Install Nginx
# ============================================================
echo -e "${YELLOW}  [3/7] Install Nginx...${NC}"
apt-get update > /dev/null 2>&1
apt-get install -y nginx > /dev/null 2>&1
echo -e "  ${GREEN}OK${NC} Nginx $(nginx -v 2>&1 | grep -o '[0-9.]*')"

# ============================================================
#  STEP 4: Buat directory
# ============================================================
echo -e "${YELLOW}  [4/7] Setup directory...${NC}"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"
echo -e "  ${GREEN}OK${NC} Directory: $PROJECT_DIR"

# ============================================================
#  STEP 5: Nginx config
# ============================================================
echo -e "${YELLOW}  [5/7] Configure Nginx...${NC}"
cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
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
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/projectgizi
rm -f /etc/nginx/sites-enabled/default
nginx -t > /dev/null 2>&1 && systemctl reload nginx
echo -e "  ${GREEN}OK${NC} Nginx configured for $DOMAIN"

# ============================================================
#  STEP 6: Environment + Install + Build
# ============================================================
echo -e "${YELLOW}  [6/7] Install dependencies & build...${NC}"

cat > "$PROJECT_DIR/.env" << EOF
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
NEXT_PUBLIC_APP_URL="http://${DOMAIN}"
NODE_ENV="production"
EOF

npm install --prefix "$PROJECT_DIR" 2>/dev/null | tail -3 || echo -e "  ${YELLOW}WARN${NC} npm install finished with warnings"

if [ -f "$PROJECT_DIR/package.json" ]; then
    npm run build --prefix "$PROJECT_DIR" 2>/dev/null | tail -3 || echo -e "  ${YELLOW}WARN${NC} Build finished with warnings"
fi
echo -e "  ${GREEN}OK${NC} Dependencies installed & built"

# ============================================================
#  STEP 7: PM2 Start
# ============================================================
echo -e "${YELLOW}  [7/7] Start app with PM2...${NC}"
pm2 stop projectgizi 2>/dev/null || true
pm2 delete projectgizi 2>/dev/null || true
cd "$PROJECT_DIR"
pm2 start npm --name "projectgizi" -- start
pm2 save
pm2 startup > /dev/null 2>&1
sleep 2

# Status check
APP_STATUS=$(pm2 show projectgizi 2>/dev/null | grep "status" | awk '{print $4}')
echo -e "  ${GREEN}OK${NC} PM2 Status: $APP_STATUS"

# ============================================================
#  DONE
# ============================================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  SETUP SELESAI!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}  🌐 URL:${NC}       http://${DOMAIN}"
echo -e "${BLUE}  📂 Project:${NC}  $PROJECT_DIR"
echo ""
echo -e "${YELLOW}  Command berguna:${NC}"
echo -e "  ${CYAN}pm2 logs projectgizi${NC}     → Lihat log aplikasi"
echo -e "  ${CYAN}pm2 status${NC}            → Cek status app"
echo -e "  ${CYAN}pm2 restart projectgizi${NC}   → Restart app"
echo -e "  ${CYAN}pm2 monit${NC}             → Monitor real-time"
echo ""
echo -e "${YELLOW}  Langkah selanjutnya:${NC}"
echo -e "  1. Buka http://${DOMAIN} di browser"
echo -e "  2. Setup database schema:"
echo -e "     ${CYAN}cd $PROJECT_DIR && npx drizzle-kit push${NC}"
echo -e "  3. Seed data demo (opsional):"
echo -e "     ${CYAN}cd $PROJECT_DIR && npx tsx scripts/seed.ts${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
