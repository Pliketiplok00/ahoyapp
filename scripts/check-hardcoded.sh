#!/bin/bash
#
# check-hardcoded.sh
#
# Checks TypeScript/TSX files for hardcoded values that should use theme constants.
# Run manually: ./scripts/check-hardcoded.sh
# Run on staged files only: ./scripts/check-hardcoded.sh --staged
#
# Exit codes:
#   0 = No violations found
#   1 = Violations found
#

# Colors for output
RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

VIOLATIONS_FOUND=0

# Get files to check
if [[ "$1" == "--staged" ]]; then
  FILES=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null | grep -E '\.(ts|tsx)$' | grep -E '^(app|src)/' || true)
else
  FILES=$(find app src -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | grep -v node_modules || true)
fi

# Exclude theme.ts (where colors are defined)
FILES=$(echo "$FILES" | grep -v "src/config/theme.ts" || true)

if [[ -z "$FILES" ]]; then
  echo -e "${GREEN}No files to check.${NC}"
  exit 0
fi

echo "Checking for hardcoded values..."
echo ""

# ============================================
# CHECK 1: Hardcoded hex colors
# ============================================
# Pattern: #fff, #ffffff, #ffffffff (3, 6, or 8 hex chars)
# Exclude: comments, imports

echo "Checking hex colors..."
HEX_RESULTS=$(echo "$FILES" | xargs grep -nE "#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?([0-9a-fA-F]{2})?" 2>/dev/null | \
  grep -v "^[^:]*:[^:]*:[[:space:]]*//" | \
  grep -v "^[^:]*:[^:]*:[[:space:]]*\*" | \
  grep -v "^[^:]*:[^:]*:[[:space:]]*import" | \
  grep -v "@see\|@example" || true)

if [[ -n "$HEX_RESULTS" ]]; then
  echo -e "${RED}[HEX COLORS]${NC}"
  echo "$HEX_RESULTS" | while read -r line; do
    echo "  $line"
  done
  echo ""
  VIOLATIONS_FOUND=1
fi

# ============================================
# CHECK 2: Hardcoded Croatian strings in JSX
# ============================================
# Pattern: >text with Croatian chars< that's not in {t(...)}

echo "Checking Croatian strings..."
CROATIAN_RESULTS=$(echo "$FILES" | xargs grep -nE ">[^<]*[čćžšđČĆŽŠĐ][^<]*<" 2>/dev/null | \
  grep -v "{t(" | \
  grep -v "^[^:]*:[^:]*:[[:space:]]*//" | \
  grep -v "^[^:]*:[^:]*:[[:space:]]*\*" || true)

if [[ -n "$CROATIAN_RESULTS" ]]; then
  echo -e "${RED}[CROATIAN STRINGS]${NC} (should use i18n)"
  echo "$CROATIAN_RESULTS" | while read -r line; do
    echo "  $line"
  done
  echo ""
  VIOLATIONS_FOUND=1
fi

# ============================================
# CHECK 3: Hardcoded fontSize values
# ============================================
# Pattern: fontSize: 14 (should use TYPOGRAPHY.sizes.xxx)

echo "Checking fontSize values..."
FONTSIZE_RESULTS=$(echo "$FILES" | xargs grep -nE "fontSize:[[:space:]]*[0-9]+" 2>/dev/null | \
  grep -v "^[^:]*:[^:]*:[[:space:]]*//" | \
  grep -v "^[^:]*:[^:]*:[[:space:]]*\*" || true)

if [[ -n "$FONTSIZE_RESULTS" ]]; then
  echo -e "${YELLOW}[FONT SIZE]${NC} (should use TYPOGRAPHY.sizes.xxx)"
  echo "$FONTSIZE_RESULTS" | while read -r line; do
    echo "  $line"
  done
  echo ""
  VIOLATIONS_FOUND=1
fi

# ============================================
# CHECK 4: Hardcoded borderWidth values
# ============================================
# Pattern: borderWidth: 2 (should use BORDERS.xxx)
# Allow borderWidth: 0

echo "Checking borderWidth values..."
BORDER_RESULTS=$(echo "$FILES" | xargs grep -nE "borderWidth:[[:space:]]*[1-9][0-9]*" 2>/dev/null | \
  grep -v "^[^:]*:[^:]*:[[:space:]]*//" | \
  grep -v "^[^:]*:[^:]*:[[:space:]]*\*" || true)

if [[ -n "$BORDER_RESULTS" ]]; then
  echo -e "${YELLOW}[BORDER WIDTH]${NC} (should use BORDERS.xxx)"
  echo "$BORDER_RESULTS" | while read -r line; do
    echo "  $line"
  done
  echo ""
  VIOLATIONS_FOUND=1
fi

# ============================================
# Summary
# ============================================

echo ""
if [[ $VIOLATIONS_FOUND -eq 1 ]]; then
  echo -e "${RED}========================================${NC}"
  echo -e "${RED}Hardcoded values found!${NC}"
  echo -e "${RED}========================================${NC}"
  echo ""
  echo "Please fix the violations above before committing."
  echo "Use theme constants from src/config/theme.ts"
  echo "Use i18n keys with t() for all visible strings"
  echo ""
  echo "To bypass this check (emergency only):"
  echo "  git commit --no-verify"
  echo ""
  exit 1
else
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}No hardcoded values found.${NC}"
  echo -e "${GREEN}========================================${NC}"
  exit 0
fi
