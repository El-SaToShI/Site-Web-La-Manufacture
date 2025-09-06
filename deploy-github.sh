#!/bin/bash
# 🚀 SCRIPT DE DÉPLOIEMENT GITHUB PAGES
# 📅 Automatisation du déploiement

echo "🌟 === DÉPLOIEMENT GITHUB PAGES ==="
echo "📅 $(date)"

# 1. Vérification du statut Git
echo "📊 Vérification du statut Git..."
git status

# 2. Ajout de tous les fichiers
echo "📁 Ajout des fichiers modifiés..."
git add .

# 3. Commit avec timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
echo "💾 Création du commit..."
git commit -m "🚀 Mise à jour site - $TIMESTAMP

✨ Améliorations:
- Système de contenu dynamique
- Adaptation GitHub Pages
- Données JSON centralisées
- Scripts de gestion automatisés

📊 Statistiques:
- Date: $TIMESTAMP
- Version: GitHub Pages Ready"

# 4. Push vers GitHub
echo "🌐 Envoi vers GitHub..."
git push origin main

# 5. Information de déploiement
echo ""
echo "✅ === DÉPLOIEMENT TERMINÉ ==="
echo "🌐 Site disponible sous peu à :"
echo "   https://el-satoshi.github.io/Site-Web-La-Manufacture/"
echo ""
echo "⏰ Délai d'activation : 1-5 minutes"
echo "🔄 Vérifiez les GitHub Actions pour le statut"

# 6. Ouverture automatique de GitHub (optionnel)
read -p "🌐 Ouvrir GitHub dans le navigateur ? (y/N): " choice
case "$choice" in 
  y|Y ) echo "🌐 Ouverture de GitHub..." && start "https://github.com/El-SaToShI/Site-Web-La-Manufacture";;
  * ) echo "👍 Déploiement terminé.";;
esac
