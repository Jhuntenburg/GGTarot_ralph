#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

for ((i=1; i<=$1; i++)); do
  echo "Iteration $i"

  result=$(claude -p "$(cat PROMPT.md)" --output-format text 2>&1) || true
  echo "$result"

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "All tasks complete."
    exit 0
  fi
done

echo "Max iterations reached."
