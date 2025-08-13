@echo off
echo Starting Chrome with CORS disabled for development...
echo.
echo This will open Chrome with web security disabled.
echo ONLY use this for development/testing!
echo.
pause

start chrome --disable-web-security --user-data-dir="%TEMP%\chrome_dev" --allow-running-insecure-content

echo.
echo Chrome started! Now open your auth.html file.
echo.
pause
