# 🚀 SCRIPT DE DÉPLOIEMENT GITHUB PAGES
# 📅 Version PowerShell pour Windows

Write-Host "🌟 === DÉPLOIEMENT GITHUB PAGES ===" -ForegroundColor Cyan
Write-Host "📅 $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Gray

# 1. Vérification du statut Git
Write-Host "`n📊 Vérification du statut Git..." -ForegroundColor Yellow
git status

# 2. Ajout de tous les fichiers
Write-Host "`n📁 Ajout des fichiers modifiés..." -ForegroundColor Yellow
git add .

# 3. Commit avec timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "`n💾 Création du commit..." -ForegroundColor Yellow

$commitMessage = @"
🚀 Mise à jour site - $timestamp

✨ Améliorations:
- Système de contenu dynamique
- Adaptation GitHub Pages  
- Données JSON centralisées
- Scripts de gestion automatisés

📊 Statistiques:
- Date: $timestamp
- Version: GitHub Pages Ready
"@

git commit -m $commitMessage

# 4. Push vers GitHub
Write-Host "`n🌐 Envoi vers GitHub..." -ForegroundColor Yellow
git push origin main

# 5. Information de déploiement
Write-Host "`n✅ === DÉPLOIEMENT TERMINÉ ===" -ForegroundColor Green
Write-Host "🌐 Site disponible sous peu à :" -ForegroundColor Cyan
Write-Host "   https://el-satoshi.github.io/Site-Web-La-Manufacture/" -ForegroundColor White
Write-Host "`n⏰ Délai d'activation : 1-5 minutes" -ForegroundColor Yellow
Write-Host "🔄 Vérifiez les GitHub Actions pour le statut" -ForegroundColor Yellow

# 6. Ouverture automatique de GitHub (optionnel)
$choice = Read-Host "`n🌐 Ouvrir GitHub dans le navigateur ? (y/N)"
if ($choice -eq 'y' -or $choice -eq 'Y') {
    Write-Host "🌐 Ouverture de GitHub..." -ForegroundColor Cyan
    Start-Process "https://github.com/El-SaToShI/Site-Web-La-Manufacture"
} else {
    Write-Host "👍 Déploiement terminé." -ForegroundColor Green
}

Write-Host "`n🎯 Pour voir les logs de déploiement :"
Write-Host "   https://github.com/El-SaToShI/Site-Web-La-Manufacture/actions"
