#!/bin/bash

# ==============================================================================
# MUSKOM Local Development Hosts Installer
# ==============================================================================
# This script injects the required local domains into /etc/hosts.
# It requires sudo privileges.

set -e

HOSTS_FILE="/etc/hosts"
DOMAINS=(
    "muskom.local"
    "api.muskom.local"
    "admin.muskom.local"
)
IP="127.0.0.1"

echo "Checking /etc/hosts for MUSKOM local domains..."

for DOMAIN in "${DOMAINS[@]}"; do
    if grep -q "$DOMAIN" "$HOSTS_FILE"; then
        echo "✅ Domain $DOMAIN is already configured."
    else
        echo "🔧 Adding $DOMAIN to $HOSTS_FILE..."
        # Use sudo sh -c to append to the file
        echo "$IP $DOMAIN" | sudo tee -a "$HOSTS_FILE" > /dev/null
        echo "✅ Domain $DOMAIN added successfully."
    fi
done

echo ""
echo "🎉 Setup complete! You can now access:"
echo "   - http://muskom.local:8080"
echo "   - http://admin.muskom.local:8080"
echo "   - http://api.muskom.local:8080"
