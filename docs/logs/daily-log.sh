#!/bin/bash
# AhoyCrew — Daily Session Log Script
# Run at the start of each work session: ./scripts/daily-log.sh
# Or add to package.json: "log": "./scripts/daily-log.sh"

LOGS_DIR="docs/logs"
TODAY=$(date +%Y-%m-%d)
LOG_FILE="$LOGS_DIR/$TODAY.md"
TEMPLATE="$LOGS_DIR/TEMPLATE.md"

# Ensure logs directory exists
mkdir -p "$LOGS_DIR"

# Check if today's log already exists
if [ -f "$LOG_FILE" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  📋 DAILY LOG: $TODAY"
    echo "  Log already exists: $LOG_FILE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
else
    # Create from template
    if [ -f "$TEMPLATE" ]; then
        sed "s/YYYY-MM-DD/$TODAY/g" "$TEMPLATE" > "$LOG_FILE"
    else
        # Inline template if TEMPLATE.md doesn't exist
        cat > "$LOG_FILE" << EOF
# Session Log: $TODAY

## Session Info
- **Developer:** Plix
- **Agent:** Claude (Anthropic)
- **Branch(es):** 
- **Duration:** 

## Plan for Today
- [ ] 
- [ ] 
- [ ] 

## Progress Log

### HH:MM - Session Start
- Read previous log
- Current git state: (paste git log --oneline -3)
- Continuing from: 

## Commits Today
| Hash | Message |
|------|---------|
|  |  |

## End of Day Status
- **Completed:** 
- **Not completed:** 
- **Blockers:** 
- **Next session:** 

## Agent Performance Notes
- Did the agent fabricate anything? (Y/N, details)
- Were plans approved before implementation? (Y/N)

## Files Changed

EOF
    fi
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  📋 NEW DAILY LOG CREATED: $TODAY"
    echo "  File: $LOG_FILE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
fi

# Show current git state
echo "  📌 Git Status:"
echo "  Branch: $(git branch --show-current 2>/dev/null || echo 'not in git repo')"
echo ""
echo "  📌 Recent Commits:"
git log --oneline -5 2>/dev/null || echo "  (not in git repo)"
echo ""

# Find and show previous log
PREV_LOG=$(ls -1 "$LOGS_DIR"/????-??-??.md 2>/dev/null | grep -v "$TODAY" | sort -r | head -1)
if [ -n "$PREV_LOG" ]; then
    echo "  📌 Previous Log: $PREV_LOG"
    echo ""
    # Show "Next session" from previous log
    NEXT_SESSION=$(grep -A2 "Next session:" "$PREV_LOG" | head -2)
    if [ -n "$NEXT_SESSION" ]; then
        echo "  📌 From last session:"
        echo "  $NEXT_SESSION"
    fi
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ⚠️  REMINDERS:"
echo "  • Fill in 'Plan for Today' before starting"
echo "  • Log progress as you go"  
echo "  • End of day: update status + commits"
echo "  • Don't forget Agent Performance Notes!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
