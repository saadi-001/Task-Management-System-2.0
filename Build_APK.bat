@echo off
echo ==============================================================
echo TMS - APK Build Process Started
echo ==============================================================
echo.
echo STEP 1: LOGGING INTO EXPO
echo If you are already logged in, it will just say "Logged in".
echo Otherwise, press Enter to open your browser and login.
echo.
call eas.cmd login
echo.
echo STEP 2: BUILDING AND DOWNLOADING APK
echo.
node build-apk.js
pause
