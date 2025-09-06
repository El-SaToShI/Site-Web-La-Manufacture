@echo off
echo =========================================
echo     🔄 RESTAURATION LA MANUFACTURE 🔄
echo =========================================
echo.

echo ⚠️  ATTENTION : Cette opération va remplacer tous les fichiers actuels !
echo.
set /p confirm="Êtes-vous sûr de vouloir continuer ? (oui/non) : "

if /i not "%confirm%"=="oui" (
    echo ❌ Restauration annulée
    pause
    exit /b
)

echo.
echo 📁 Backups disponibles :
echo ========================
dir "d:\Site web Laurence\_BACKUPS" /AD /B

echo.
set /p backup_name="Nom du backup à restaurer (sans BACKUP_) : "

set backup_path=d:\Site web Laurence\_BACKUPS\BACKUP_%backup_name%

if not exist "%backup_path%" (
    echo ❌ Backup non trouvé : %backup_path%
    pause
    exit /b
)

echo.
echo 🔄 Restauration en cours...
echo Source : %backup_path%\SITE
echo Destination : d:\Site web Laurence

:: Sauvegarde de sécurité avant restauration
echo 1️⃣ Création d'une sauvegarde de sécurité...
call "d:\Site web Laurence\_BACKUPS\BACKUP_AUTOMATIQUE.bat"

echo.
echo 2️⃣ Restauration des fichiers...
robocopy "%backup_path%\SITE" "d:\Site web Laurence" /E /PURGE /XD "_BACKUPS"

echo.
echo ✅ RESTAURATION TERMINÉE !
echo =========================
echo 📁 Site restauré depuis : %backup_name%
echo 🔍 Vérifiez que tout fonctionne correctement
echo.
pause
