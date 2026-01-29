@plan.md @activity.md @STYLE_GUIDE.md

We are improving the Genius Garden Tarot app.

IMPORTANT STYLE/MOTIF REQUIREMENTS:
- Incorporate images/cards/CardBack.png as a visual motif suitable for marketing/brand consistency (subtle, elegant).
- Choose a palette that matches the deck vibe (warm neutrals + tasteful accent). Prefer CSS variables. Do not over-saturate.

REVERSED CARD RULES:
- A reversed card is not "bad"; interpret it as the same theme turned inward, blocked, delayed, or in shadow.
- Keep tone empowering and grounded per STYLE_GUIDE.md.

PROCESS:
1. Read activity.md first.
2. Find the next task where passes is false.
3. Work on EXACTLY ONE task.
4. After changes, start the app locally (bind localhost only). Keep trying ports until one works:
    - Try 8000, then 8001, then 8002, etc.
    - Use: python3 -m http.server <PORT> --bind 127.0.0.1
    - IMPORTANT: Record the chosen PORT and use it consistently for all following steps.

5. Use Playwright MCP to open:
   http://127.0.0.1:<PORT>, If Playwright MCP is unavailable or errors, write the error into activity.md and STOP this iteration (do not mark passes true).

6. Take a screenshot and save it into the existing screenshots directory.
    - IMPORTANT: Do NOT create a nested screenshots/ directory.
    - Save filename ONLY (no folder prefix) like:
      <task-slug>-<yyyymmdd-hhmm>.png
7. If the task appears completed, update that task passes to true.
8. Append a log entry to activity.md.
9. Make one git commit.
10. Stop server.

ONLY DO ONE TASK.

When all tasks are passing, output <promise>COMPLETE</promise>