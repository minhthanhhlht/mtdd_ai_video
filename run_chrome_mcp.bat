@echo off
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\Users\ADMIN\AppData\Local\Google\Chrome\MCP_Profile" --remote-allow-origins=* --no-first-run --no-default-browser-check http://localhost:6868/skills

