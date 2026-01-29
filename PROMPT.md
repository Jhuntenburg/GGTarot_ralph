@plan.md @activity.md @STYLE_GUIDE.md

We are improving the Genius Garden Tarot app.

1. Read activity.md first.
2. Find the next task where passes is false.
3. Work on EXACTLY ONE task.
4. After changes, start the app locally with:
   python3 -m http.server 8000 --bind 127.0.0.1
5. Use Playwright MCP to open http://127.0.0.1:8000
6. Take a screenshot and save to screenshots/
7. If the task appears completed, update that task passes to true.
8. Append a log entry to activity.md.
9. Make one git commit.
10. Stop server.

ONLY DO ONE TASK.

When all tasks are passing, output <promise>COMPLETE</promise>
