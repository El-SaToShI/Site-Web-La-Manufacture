@echo off
echo ====================================
echo   DÉPLOIEMENT SITE WEB LAURENCE
echo ====================================

echo.
echo 1. Vérification des fichiers...
if not exist "index.html" (
    echo ERREUR: index.html non trouvé
    pause
    exit /b 1
)

if not exist "admin\index.html" (
    echo ERREUR: Interface admin non trouvée
    pause
    exit /b 1
)

echo   ✅ Fichiers principaux trouvés

echo.
echo 2. Ajout des fichiers à Git...
git add .
if %errorlevel% neq 0 (
    echo ERREUR: Problème avec git add
    pause
    exit /b 1
)

echo   ✅ Fichiers ajoutés

echo.
echo 3. Création du commit...
set /p commit_message="Message du commit (ou Entrée pour 'Update website'): "
if "%commit_message%"=="" set commit_message=Update website

git commit -m "%commit_message%"
if %errorlevel% neq 0 (
    echo ERREUR: Problème avec git commit
    pause
    exit /b 1
)

echo   ✅ Commit créé

echo.
echo 4. Envoi vers GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ERREUR: Problème avec git push
    pause
    exit /b 1
)

echo   ✅ Envoyé vers GitHub

echo.
echo ====================================
echo   DÉPLOIEMENT TERMINÉ !
echo ====================================
echo.
echo 📋 Prochaines étapes :
echo   1. Vérifier GitHub : https://github.com/El-SaToShI/Site-Web-La-Manufacture
echo   2. Activer GitHub Pages dans Settings
echo   3. Site test disponible : https://el-satoshi.github.io/Site-Web-La-Manufacture/
echo.
echo ⚠️  IMPORTANT :
echo   - GitHub Pages = site PUBLIC uniquement
echo   - Interface admin = nécessite hébergeur PHP
echo   - Voir HÉBERGEMENT-GUIDE.md pour l'hébergement payant
echo.
pause
