#!/bin/bash
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

LOG="ralph.log"
: > "$LOG"

for ((i=1; i<=$1; i++)); do
  echo "Iteration $i" | tee -a "$LOG"
  echo "--------------------------------" | tee -a "$LOG"

  set +e
  gtimeout 8m claude -p "$(cat PROMPT.md)" --output-format text 2>&1 | tee -a "$LOG"
  exit_code=${PIPESTATUS[0]}
  set -e

  if [ $exit_code -ne 0 ]; then
    echo "[warn] claude exited with code $exit_code" | tee -a "$LOG"
  fi

  if grep -q "<promise>COMPLETE</promise>" "$LOG"; then
    echo "All tasks complete after $i iterations." | tee -a "$LOG"
    exit 0
  fi

  echo "" | tee -a "$LOG"
  echo "--- End of iteration $i ---" | tee -a "$LOG"
  echo "" | tee -a "$LOG"
  pkill -f "python3 -m http.server" 2>/dev/null || true
  sleep 1
done


echo "Reached max iterations ($1)" | tee -a "$LOG"
exit 1
