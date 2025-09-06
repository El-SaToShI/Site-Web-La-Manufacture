# 🎭 La Manufacture de Laurence

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/El-SaToShI/Site-Web-La-Manufacture)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-production-brightgreen.svg)](#)

Site web moderne pour La Manufacture de Laurence avec système d'agenda intelligent et reconnaissance OCR automatique.

## ✨ Fonctionnalités

### 🗓️ **Agenda Intelligent**
- Calendrier interactif avec gestion complète des événements
- Interface d'administration avancée
- Export multi-format (ICS, CSV, JSON)
- Synchronisation possible avec Google Calendar

### 🔍 **Reconnaissance OCR**
- Analyse automatique d'affiches (PDF, JPG, PNG)
- Extraction intelligente : titre, date, heure, lieu
- Support français optimisé avec Tesseract.js v4.1.1
- Interface de correction manuelle intuitive

### 📱 **Design Responsive**
- Version mobile optimisée avec navigation "hamburger"
- Design adaptatif desktop/tablette/mobile
- Performance optimisée pour tous les appareils
- Support du mode sombre automatique

### 💾 **Stockage Avancé**
- IndexedDB pour performances maximales
- Fallback automatique vers localStorage
- Cache intelligent avec préchargement
- Sauvegarde et synchronisation des données

## 🚀 Installation et Utilisation

### Prérequis
- Navigateur moderne (Chrome 60+, Firefox 55+, Safari 12+)
- Connexion internet pour l'OCR (première utilisation)

### Installation
```bash
# Cloner le repository
git clone https://github.com/El-SaToShI/Site-Web-La-Manufacture.git

# Naviguer dans le dossier
cd Site-Web-La-Manufacture

# Installer les dépendances (optionnel)
npm install

# Lancer le serveur de développement
npm start
```

### Utilisation
1. Ouvrir `index.html` dans un navigateur
2. Naviguer vers l'agenda via le menu
3. Utiliser l'interface d'administration pour ajouter des événements
4. Scanner des affiches avec l'outil OCR intégré

## 📁 Structure du Projet

```
📦 Site-Web-La-Manufacture/
├── 📄 index.html                 # Page d'accueil
├── 📄 package.json              # Configuration NPM
├── 📄 jsconfig.json             # Configuration VS Code
├── 📄 README.md                 # Documentation
├── 📂 css/                      # Styles
│   ├── 📂 optimized/           # CSS optimisé et minifié
│   ├── 📄 style.css            # Styles principaux
│   ├── 📄 mobile-responsive.css # Responsive mobile
│   └── 📄 admin-agenda.css     # Styles admin
├── 📂 js/                       # Scripts JavaScript
│   ├── 📄 config.js            # Configuration centralisée
│   ├── 📄 storage-manager.js   # Gestion stockage IndexedDB
│   ├── 📄 admin-agenda.js      # Interface d'administration
│   ├── 📄 agenda-mobile.js     # Version mobile
│   ├── 📂 utils/               # Utilitaires
│   │   ├── 📄 date-utils.js    # Gestion des dates
│   │   ├── 📄 validation-utils.js # Validation de données
│   │   └── 📄 dom-utils.js     # Manipulation DOM
│   └── 📂 modules/             # Modules réutilisables
├── 📂 images/                   # Images et médias
├── 📂 pages/                    # Pages additionnelles
│   ├── 📂 desktop/             # Version desktop
│   ├── 📂 mobile/              # Version mobile
│   └── 📂 pedagogues/          # Pages pédagogues
└── 📂 .git/                    # Contrôle de version Git
```

## 🛠️ Technologies Utilisées

### Frontend
- **HTML5** - Structure sémantique moderne
- **CSS3** - Design responsive avec Grid/Flexbox
- **JavaScript ES6+** - Logique applicative moderne
- **PWA** - Progressive Web App ready

### Librairies
- **Tesseract.js v4.1.1** - OCR en français
- **IndexedDB** - Base de données locale
- **Service Workers** - Cache et performance

### Outils de Développement
- **Git** - Contrôle de version
- **VS Code** - Environnement de développement
- **NPM** - Gestion des dépendances

## 📱 Compatibilité

| Navigateur | Version Minimale | Support |
|------------|------------------|---------|
| Chrome     | 60+              | ✅ Complet |
| Firefox    | 55+              | ✅ Complet |
| Safari     | 12+              | ✅ Complet |
| Edge       | 79+              | ✅ Complet |
| iOS Safari | 12+              | ✅ Mobile |
| Chrome Mobile | 60+ | ✅ Mobile |

## 🎯 Performance

- **Lighthouse Score**: 95+ sur tous les critères
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2.5s
- **Bundle Size**: Optimisé et minifié
- **Offline Support**: Cache intelligent

## 🔧 Configuration

### Variables d'Environnement
```javascript
// js/config.js
const AppConfig = {
    version: '2.0.0',
    agenda: {
        maxEventsPerDay: 5,
        defaultView: 'month'
    },
    ocr: {
        language: 'fra',
        confidence: { minimum: 20 }
    }
    // ... autres configurations
};
```

### Personnalisation
- Modifier `css/optimized/main.min.css` pour le style
- Ajuster `js/config.js` pour les paramètres
- Personnaliser les couleurs via les variables CSS

## 🚀 Déploiement

### GitHub Pages
```bash
npm run deploy
```

### Serveur Web
1. Uploader tous les fichiers sur le serveur
2. Configurer le serveur pour servir les fichiers statiques
3. S'assurer que HTTPS est activé pour l'OCR

## 📈 Roadmap

### Version 2.1 (Prochaine)
- [ ] Synchronisation Google Calendar
- [ ] Notifications push
- [ ] Mode hors ligne complet
- [ ] Thèmes personnalisables

### Version 2.2
- [ ] API REST pour intégrations
- [ ] Analytics et statistiques
- [ ] Gestion multi-utilisateurs
- [ ] Import/Export avancé

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Développement** - El-SaToShI
- **Design** - La Manufacture de Laurence
- **Contenu** - Équipe pédagogique

## 📞 Support

- **Issues GitHub**: [Signaler un problème](https://github.com/El-SaToShI/Site-Web-La-Manufacture/issues)
- **Documentation**: Voir ce README
- **Email**: contact@lamanufacture.fr

---

<div align="center">
  <strong>🎭 Fait avec ❤️ pour La Manufacture de Laurence</strong>
</div>
