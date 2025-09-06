# 🔐 CONFIGURATION SÉCURITÉ ADMIN - GITHUB PAGES

## ⚠️ **IMPORTANT - SÉCURITÉ ADMIN**

Le panel admin est maintenant accessible publiquement via GitHub Pages à l'adresse :
**https://el-satoshi.github.io/Site-Web-La-Manufacture/admin/**

### **🔒 MESURES DE SÉCURITÉ ACTUELLES :**

#### **1. Authentification JavaScript :**
- Connexion requise avec identifiants
- Stockage sécurisé en localStorage
- Session avec timeout automatique

#### **2. Identifiants par défaut :**
```
Utilisateur : laurence
Mot de passe : manufacture2024
```

### **⚠️ RECOMMANDATIONS DE SÉCURITÉ :**

#### **🔧 IMMÉDIAT - Changement des identifiants :**
1. Ouvrir `admin/config/admin-config.js`
2. Modifier les identifiants par défaut
3. Utiliser un mot de passe fort

#### **🛡️ PROTECTION SUPPLÉMENTAIRE :**

##### **Option 1 - Restriction IP (GitHub Pages Pro) :**
- Configuration dans les settings du repository
- Limiter l'accès à certaines IP

##### **Option 2 - Authentification tierce :**
- Intégration Auth0, Firebase Auth
- Authentification Google/Microsoft

##### **Option 3 - Déploiement admin séparé :**
- Admin sur un domaine privé
- Site public sur GitHub Pages
- Communication via API

### **🚨 ACTIONS RECOMMANDÉES :**

#### **1. Changement immédiat des identifiants :**
```javascript
// Dans admin/config/admin-config.js
const ADMIN_CONFIG = {
    auth: {
        users: [
            {
                username: 'votre_nouveau_username',
                password: 'votre_mot_de_passe_fort_123!',
                role: 'admin',
                name: 'Laurence Voreux'
            }
        ]
    }
};
```

#### **2. Monitoring des accès :**
- Le système de tracking enregistre tous les accès
- Surveiller les logs d'activité
- Alertes en cas d'activité suspecte

#### **3. Sauvegarde régulière :**
- Backup automatique des modifications
- Export régulier des données
- Version de récupération disponible

### **📱 ACCÈS ADMIN :**

**URL :** https://el-satoshi.github.io/Site-Web-La-Manufacture/admin/
**Délai activation :** 2-5 minutes après le push

---

**⚠️ CHANGEZ LES IDENTIFIANTS DÈS LE PREMIER ACCÈS !**
