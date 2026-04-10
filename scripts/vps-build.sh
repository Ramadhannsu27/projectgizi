#!/bin/bash
# Build script untuk VPS - jalankan di background dengan screen
# Usage: ./vps-build.sh

ssh root@202.155.95.123 << 'EOF'
apt install -y screen -qq
screen -dmS build bash -c "cd /var/www/projectgizi && rm -rf .next && npm run build; echo 'DONE'; exec bash"
echo "Build started in screen session 'build'"
echo "Cek progress: screen -r build"
echo "Exit screen: tekan Ctrl+A lalu D"
EOF
