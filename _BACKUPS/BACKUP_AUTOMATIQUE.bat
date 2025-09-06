@echo off
setlocal enabledelayedexpansion

echo =========================================
echo     🔒 BACKUP LA MANUFACTURE 🔒
echo =========================================
echo.

:: Récupération de la date/heure
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do (
    set jour=%%a
    set mois=%%b
    set annee=%%c
)

for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
    set heure=%%a
    set minute=%%b
)

:: Formatage de la date (supprimer les espaces)
set heure=%heure: =0%
set minute=%minute: =0%

:: Nom du backup avec timestamp
set backup_name=BACKUP_LaManufacture_%annee%-%mois%-%jour%_%heure%h%minute%

echo 📅 Date du backup : %jour%/%mois%/%annee% à %heure%:%minute%
echo 📁 Nom du backup : %backup_name%
echo.

:: Création du dossier de backup
set backup_path=d:\Site web Laurence\_BACKUPS\%backup_name%
mkdir "%backup_path%"

echo 1️⃣ Sauvegarde des fichiers du site...
:: Copie de tous les fichiers sauf le dossier _BACKUPS
robocopy "d:\Site web Laurence" "%backup_path%\SITE" /E /XD "_BACKUPS"

echo.
echo 2️⃣ Création de l'archive ZIP...
:: Utilisation de PowerShell pour créer le ZIP
powershell -command "Compress-Archive -Path '%backup_path%\SITE\*' -DestinationPath '%backup_path%\LaManufacture_%backup_name%.zip' -Force"

echo.
echo 3️⃣ Création du rapport de sauvegarde...
:: Création d'un fichier de rapport
echo RAPPORT DE SAUVEGARDE > "%backup_path%\RAPPORT_BACKUP.txt"
echo ===================== >> "%backup_path%\RAPPORT_BACKUP.txt"
echo. >> "%backup_path%\RAPPORT_BACKUP.txt"
echo Date : %jour%/%mois%/%annee% >> "%backup_path%\RAPPORT_BACKUP.txt"
echo Heure : %heure%:%minute% >> "%backup_path%\RAPPORT_BACKUP.txt"
echo Nom : %backup_name% >> "%backup_path%\RAPPORT_BACKUP.txt"
echo. >> "%backup_path%\RAPPORT_BACKUP.txt"
echo CONTENU SAUVEGARDÉ : >> "%backup_path%\RAPPORT_BACKUP.txt"
echo ================== >> "%backup_path%\RAPPORT_BACKUP.txt"
dir "d:\Site web Laurence" /B >> "%backup_path%\RAPPORT_BACKUP.txt"
echo. >> "%backup_path%\RAPPORT_BACKUP.txt"
echo TAILLE TOTALE : >> "%backup_path%\RAPPORT_BACKUP.txt"
dir "d:\Site web Laurence" /-C /S | find "fichier(s)" >> "%backup_path%\RAPPORT_BACKUP.txt"

echo.
echo 4️⃣ Nettoyage des anciens backups (garde les 5 derniers)...
:: Supprimer les backups trop anciens (garde les 5 plus récents)
for /f "skip=5 delims=" %%i in ('dir "d:\Site web Laurence\_BACKUPS" /AD /B /O-D') do (
    echo Suppression ancien backup : %%i
    rmdir /S /Q "d:\Site web Laurence\_BACKUPS\%%i"
)

echo.
echo ✅ BACKUP TERMINÉ AVEC SUCCÈS !
echo =====================================
echo 📁 Dossier : %backup_path%
echo 🗜️  Archive : LaManufacture_%backup_name%.zip
echo 📄 Rapport : RAPPORT_BACKUP.txt
echo.
echo 💡 TIP : Copiez ce backup sur un disque externe ou cloud !
echo.
pause
