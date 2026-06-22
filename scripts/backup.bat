@echo off
REM Daily database backup launcher (used by the Windows Scheduled Task).
"C:\Program Files\nodejs\node.exe" "%~dp0backup.cjs"
