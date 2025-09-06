@echo off
echo =========================================
echo      ☁️ SYNC CLOUD LA MANUFACTURE ☁️
echo =========================================
echo.

:: Configuration des destinations cloud
set google_drive="C:\Users\%USERNAME%\Google Drive\BACKUPS_LaManufacture"
set onedrive="C:\Users\%USERNAME%\OneDrive\BACKUPS_LaManufacture"
set dropbox="C:\Users\%USERNAME%\Dropbox\BACKUPS_LaManufacture"

echo 🎯 Destinations possibles :
echo 1. Google Drive : %google_drive%
echo 2. OneDrive : %onedrive%
echo 3. Dropbox : %dropbox%
echo 4. Disque externe (à spécifier)
echo 5. Tous les clouds disponibles
echo.

set /p choice="Choisissez votre destination (1-5) : "

echo.
echo 📦 Création du backup avant sync...
call "d:\Site web Laurence\_BACKUPS\BACKUP_AUTOMATIQUE.bat"

:: Récupération du dernier backup créé
for /f "delims=" %%i in ('dir "d:\Site web Laurence\_BACKUPS" /AD /B /O-D | findstr "BACKUP_"') do (
    set latest_backup=%%i
    goto :found
)
:found

set backup_source="d:\Site web Laurence\_BACKUPS\%latest_backup%"

echo 📤 Synchronisation depuis : %latest_backup%
echo.

if "%choice%"=="1" goto google
if "%choice%"=="2" goto onedrive
if "%choice%"=="3" goto dropbox
if "%choice%"=="4" goto externe
if "%choice%"=="5" goto tous

:google
echo ☁️ Sync vers Google Drive...
if exist %google_drive% (
    robocopy %backup_source% %google_drive%\%latest_backup% /E
    echo ✅ Google Drive OK
) else (
    echo ❌ Google Drive non trouvé
)
goto fin

:onedrive
echo ☁️ Sync vers OneDrive...
if exist %onedrive% (
    robocopy %backup_source% %onedrive%\%latest_backup% /E
    echo ✅ OneDrive OK
) else (
    echo ❌ OneDrive non trouvé
)
goto fin

:dropbox
echo ☁️ Sync vers Dropbox...
if exist %dropbox% (
    robocopy %backup_source% %dropbox%\%latest_backup% /E
    echo ✅ Dropbox OK
) else (
    echo ❌ Dropbox non trouvé
)
goto fin

:externe
echo 💾 Spécifiez le chemin du disque externe :
set /p externe_path="Chemin (ex: E:\BACKUPS_LaManufacture) : "
echo Sync vers disque externe...
robocopy %backup_source% "%externe_path%\%latest_backup%" /E
echo ✅ Disque externe OK
goto fin

:tous
echo ☁️ Sync vers tous les clouds disponibles...
if exist %google_drive% (
    robocopy %backup_source% %google_drive%\%latest_backup% /E
    echo ✅ Google Drive OK
)
if exist %onedrive% (
    robocopy %backup_source% %onedrive%\%latest_backup% /E
    echo ✅ OneDrive OK
)
if exist %dropbox% (
    robocopy %backup_source% %dropbox%\%latest_backup% /E
    echo ✅ Dropbox OK
)

:fin
echo.
echo ✅ SYNCHRONISATION TERMINÉE !
echo ============================
echo 📱 Vos backups sont maintenant sécurisés dans le cloud
echo 🔄 Pensez à faire cette sync régulièrement
echo.
pause
