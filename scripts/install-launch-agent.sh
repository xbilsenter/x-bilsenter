#!/usr/bin/env bash
# Installer bruker-nivå LaunchAgent slik at PM2 gjenoppretter tjenester ved innlogging/reboot.
# Krever ikke sudo. Kjør én gang: npm run services:persist
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLIST="$HOME/Library/LaunchAgents/com.xbilsenter.pm2.plist"
PM2_BIN="$ROOT/node_modules/pm2/bin/pm2"
NODE_BIN="$(command -v node)"

mkdir -p "$HOME/Library/LaunchAgents"

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.xbilsenter.pm2</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE_BIN</string>
    <string>$PM2_BIN</string>
    <string>resurrect</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string>
    <key>PM2_HOME</key>
    <string>$HOME/.pm2</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$ROOT/logs/pm2-launchd-out.log</string>
  <key>StandardErrorPath</key>
  <string>$ROOT/logs/pm2-launchd-err.log</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/com.xbilsenter.pm2" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"

echo "LaunchAgent installert: $PLIST"
echo "Tjenester gjenopprettes automatisk ved innlogging/reboot (pm2 resurrect)."
