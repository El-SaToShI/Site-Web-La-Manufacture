# 🔒 GUIDE DE SAUVEGARDE - LA MANUFACTURE

## 🎯 **STRATÉGIE DE BACKUP 3-2-1**
- **3** copies de vos données
- **2** supports différents (local + cloud)
- **1** copie hors site (cloud/externe)

---

## 🛠️ **OUTILS DE SAUVEGARDE**

### **1. 💾 BACKUP_AUTOMATIQUE.bat**
**Usage :** Double-clic pour créer un backup complet
- ✅ Sauvegarde tous les fichiers du site
- ✅ Crée une archive ZIP
- ✅ Génère un rapport détaillé
- ✅ Garde automatiquement les 5 derniers backups
- ✅ Horodatage automatique

### **2. 🔄 RESTAURER_BACKUP.bat**
**Usage :** Restaurer une version précédente
- ⚠️ Crée une sauvegarde de sécurité avant restauration
- 🔄 Remplace tous les fichiers actuels
- 📋 Liste tous les backups disponibles

### **3. ☁️ SYNC_CLOUD.bat**
**Usage :** Synchronisation vers le cloud
- 🌐 Google Drive, OneDrive, Dropbox
- 💾 Disque externe
- 📤 Upload automatique du dernier backup

---

## 📅 **FRÉQUENCE RECOMMANDÉE**

### **BACKUP LOCAL :**
- ⭐ **Avant chaque modification importante**
- 📅 **1 fois par semaine minimum**
- 🚨 **Avant mise à jour hébergeur**

### **SYNC CLOUD :**
- ☁️ **1 fois par mois**
- 💾 **Avant changements majeurs**
- 🔒 **En cas de problème technique**

---

## 🚨 **SITUATIONS D'URGENCE**

### **Site piraté/corrompu :**
1. 🛑 **Arrêter** l'hébergement
2. 🔍 **Identifier** la cause
3. 🔄 **Restaurer** le dernier backup sain
4. 🔒 **Renforcer** la sécurité

### **Erreur de manipulation :**
1. 🔄 **Restaurer** immédiatement
2. 📋 **Vérifier** le fonctionnement
3. 📝 **Noter** la leçon apprise

### **Problème hébergeur :**
1. ☁️ **Récupérer** depuis le cloud
2. 🔄 **Déployer** sur nouvel hébergeur
3. 📧 **Rediriger** le domaine

---

## 📁 **STRUCTURE DES BACKUPS**

```
_BACKUPS/
├── BACKUP_LaManufacture_2025-09-06_17h30/
│   ├── SITE/                   # Site complet
│   ├── LaManufacture_xxx.zip   # Archive compressée
│   └── RAPPORT_BACKUP.txt      # Rapport détaillé
├── BACKUP_LaManufacture_2025-09-05_14h15/
├── BACKUP_AUTOMATIQUE.bat      # Script de backup
├── RESTAURER_BACKUP.bat        # Script de restauration
└── SYNC_CLOUD.bat             # Script cloud
```

---

## 🎯 **CHECKLIST BACKUP**

### **Avant modifications importantes :**
- [ ] Lancer `BACKUP_AUTOMATIQUE.bat`
- [ ] Vérifier que le backup s'est bien créé
- [ ] Noter le nom du backup
- [ ] Procéder aux modifications

### **Après problème :**
- [ ] Identifier la cause
- [ ] Choisir le bon backup à restaurer
- [ ] Lancer `RESTAURER_BACKUP.bat`
- [ ] Tester que tout fonctionne

### **Maintenance mensuelle :**
- [ ] Vérifier l'espace disque backups
- [ ] Lancer `SYNC_CLOUD.bat`
- [ ] Tester une restauration (sur copie)
- [ ] Nettoyer les très anciens backups

---

## 💡 **CONSEILS PROFESSIONNELS**

### **Sécurité :**
- 🔐 **Chiffrer** les backups sensibles
- 🔒 **Protéger** l'accès aux scripts
- 📱 **Diversifier** les emplacements

### **Performance :**
- 🗜️ **Compresser** les gros fichiers
- ⚡ **Automatiser** les tâches répétitives
- 📊 **Surveiller** l'espace disque

### **Organisation :**
- 📅 **Dater** tous les backups
- 📝 **Documenter** les changements
- 🏷️ **Étiqueter** les versions importantes

---

## ☎️ **SUPPORT URGENCE**

### **En cas de problème critique :**
1. **Ne pas paniquer** 😌
2. **Vérifier les backups** disponibles
3. **Restaurer** la dernière version saine
4. **Documenter** l'incident
5. **Renforcer** les mesures préventives

### **Contacts utiles :**
- 🌐 **Hébergeur :** Support technique
- ☁️ **Cloud :** Service client
- 💻 **Technique :** Documentation GitHub

---

*Guide mis à jour le 6 septembre 2025*
