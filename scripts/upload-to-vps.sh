#!/bin/bash

# ============================================================
#  MBG GIZI - Upload Script dari Lokal ke VPS
#  TARGET VPS: 202.155.95.123
# ============================================================
#  Cara pakai:
#    1. Jalankan script ini di komputer lokal (Windows PowerShell / Git Bash)
#    2. Masukkan password root VPS kamu saat diminta
# ============================================================

set -e

# Warna
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MBG GIZI - Upload ke VPS${NC}"
echo -e "${BLUE}  IP VPS: 202.155.95.123${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ============================================================
#  IP VPS (sudah diset ke 202.155.95.123)
# ============================================================
VPS_IP="202.155.95.123"

# ============================================================
#  Tanya nama folder project
# ============================================================
echo -ne "${YELLOW}  Folder project di komputer ini [projectgizi]: ${NC}"
read -r LOCAL_DIR
LOCAL_DIR=${LOCAL_DIR:-projectgizi}

# Tentukan path absolute
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/../"

# ============================================================
#  Upload via SCP
# ============================================================
echo ""
echo -e "${YELLOW}  Mengupload project ke VPS...${NC}"
echo -e "${YELLOW}  (Masukkan password root VPS kamu saat diminta)${NC}"
echo ""

# Upload semua file ke /var/www/projectgizi/
scp -r "$PROJECT_DIR"/* root@"$VPS_IP":/var/www/projectgizi/

echo ""
echo -e "${GREEN}  Upload selesai!${NC}"
echo -e "${GREEN}  SSH ke VPS dan jalankan setup script:${NC}"
echo ""
echo -e "${YELLOW}  ssh root@${VPS_IP}${NC}"
echo -e "${YELLOW}  ./setup-vps.sh${NC}"
echo ""
