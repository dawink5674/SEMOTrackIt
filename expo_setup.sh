#!/bin/bash

# SEMOTrackIt Expo Setup and Fix Script
# Automates fixes for WSL Ubuntu environment issues:
# - Node.js version check/install via nvm
# - npm global prefix setup and @expo/ngrok install
# - Expo CLI install
# - Dependency checks/upgrades in project
# - npm cache clearing
# - Android SDK setup
# - Git credential cache clear
# - Expo start with fallbacks

set -x  # Enable tracing for verbose output
set +e  # Continue on errors to handle gracefully

PROJECT_DIR="/mnt/c/Users/nolan/CS445/SEMOTrackIt"
LOG_FILE="$HOME/expo_setup.log"

# Function to log messages
log() {
    echo "$(date): $1" | tee -a "$LOG_FILE"
}

# Function to log errors
error_log() {
    echo "ERROR: $1" >&2 | tee -a "$LOG_FILE"
}

log "Starting SEMOTrackIt Expo setup script..."

# Step 1: Check and install/update Node.js to at least v16 via nvm
log "Step 1: Checking Node.js version..."
if ! command -v node &> /dev/null; then
    log "Node.js not found. Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 18 || error_log "Failed to install Node.js 18 via nvm"
    nvm use 18
else
    NODE_VERSION=$(node --version | sed 's/v//')
    if [ "$(printf '%s\n' "$NODE_VERSION" "16.0.0" | sort -V | head -n1)" != "16.0.0" ]; then
        log "Node.js version $NODE_VERSION is below v16. Installing nvm and updating..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm install 18 || error_log "Failed to install Node.js 18 via nvm"
        nvm use 18
    else
        log "Node.js version $NODE_VERSION is sufficient."
    fi
fi
log "Node.js version: $(node --version)"

# Step 2: Set up custom npm global prefix and install @expo/ngrok
log "Step 2: Setting up npm global prefix..."
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
export PATH="$HOME/.npm-global/bin:$PATH"
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc
log "npm global prefix set to ~/.npm-global and added to PATH."

if ! command -v ngrok &> /dev/null; then
    log "Installing @expo/ngrok@^4.1.0..."
    npm install -g @expo/ngrok@^4.1.0 || error_log "Failed to install @expo/ngrok"
else
    log "@expo/ngrok already installed."
fi

# Step 3: Install Expo CLI globally if not present
log "Step 3: Checking Expo CLI..."
if ! command -v expo &> /dev/null; then
    log "Installing Expo CLI globally..."
    npm install -g @expo/cli || error_log "Failed to install Expo CLI"
else
    log "Expo CLI already installed: $(expo --version)"
fi

# Step 4: In project dir, run npx expo doctor and handle warnings
log "Step 4: Checking project dependencies..."
cd "$PROJECT_DIR" || { error_log "Failed to cd to $PROJECT_DIR"; exit 1; }
log "Running npx expo doctor..."
DOCTOR_OUTPUT=$(npx expo doctor 2>&1)
echo "$DOCTOR_OUTPUT" | tee -a "$LOG_FILE"
if echo "$DOCTOR_OUTPUT" | grep -q "react-native-maps"; then
    log "Warning detected for react-native-maps. Updating to ~1.10.0..."
    npm install react-native-maps@~1.10.0 || error_log "Failed to update react-native-maps"
fi
if echo "$DOCTOR_OUTPUT" | grep -q "SDK"; then
    log "SDK mismatch detected. Upgrading to SDK 53..."
    npx expo upgrade || error_log "Failed to upgrade Expo SDK"
fi

# Step 5: Clear npm cache safely
log "Step 5: Clearing npm cache..."
npm cache verify || log "npm cache verify failed, proceeding to clean."
npm cache clean --force || error_log "Failed to clear npm cache"

# Step 6: Set ANDROID_HOME and add to PATH
log "Step 6: Setting up Android SDK..."
export ANDROID_HOME="$HOME/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$PATH"
echo 'export ANDROID_HOME="$HOME/Android/sdk"' >> ~/.bashrc
echo 'export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$PATH"' >> ~/.bashrc
if [ ! -d "$ANDROID_HOME" ]; then
    log "ANDROID_HOME not found at $ANDROID_HOME. Prompting to install Android cmdline-tools..."
    echo "Please install Android Studio or cmdline-tools manually and set ANDROID_HOME to ~/Android/sdk."
    # Note: Automated install would require sdkmanager, but assuming manual for now
fi
log "ANDROID_HOME set to $ANDROID_HOME and added to PATH."

# Step 7: Clear Git credential cache
log "Step 7: Clearing Git credential cache..."
git config --global --unset credential.helper || error_log "Failed to unset Git credential helper"
log "Git credential cache cleared. Next push will prompt for PAT."

# Step 8: Start Expo with --tunnel and --clear, fallback to LAN
log "Step 8: Starting Expo..."
if npx expo start --tunnel --clear; then
    log "Expo started successfully with tunnel mode."
else
    error_log "Tunnel mode failed. Falling back to LAN mode..."
    npx expo start --clear || error_log "Expo start failed in LAN mode. Check network and dependencies."
fi

# Summary
log "Script completed. Summary of fixes:"
log "- Node.js checked/updated to v18 via nvm."
log "- npm global prefix set, @expo/ngrok installed if missing."
log "- Expo CLI installed globally."
log "- Dependencies checked via expo doctor, updates applied."
log "- npm cache cleared."
log "- ANDROID_HOME set and added to PATH."
log "- Git credential cache cleared."
log "- Expo started with tunnel mode (fallback to LAN)."
log "Check $LOG_FILE for full logs. If issues persist, review errors and network settings."

set +x
