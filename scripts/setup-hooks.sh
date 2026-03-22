#!/bin/bash
# Setup git hooks for ProtectMyMobile
# Run this script after cloning the repository

echo "Setting up git hooks..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$SCRIPT_DIR/../.git/hooks"

cp "$SCRIPT_DIR/git-hooks/pre-push" "$HOOKS_DIR/pre-push"
chmod +x "$HOOKS_DIR/pre-push"

echo "✓ Pre-push hook installed"
echo "  This will run 'astro check' before every push"
