# Configuration pour l'hébergement avec PHP
# La Manufacture de Laurence

# 1. PRÉREQUIS SERVEUR
- PHP 7.4 ou supérieur
- Extensions PHP : json, fileinfo, gd (pour images)
- Permissions d'écriture sur les dossiers :
  - /data/
  - /images/
  - /pages/

# 2. CONFIGURATION SÉCURISÉE

## Pour votre hébergeur, modifiez ces lignes dans admin/api/index.php :

// Changez le mot de passe admin (ligne 8)
define('ADMIN_PASSWORD_HASH', password_hash('VOTRE_NOUVEAU_MOT_DE_PASSE', PASSWORD_DEFAULT));

// Pour plus de sécurité, vous pouvez ajouter une vérification d'IP :
$allowed_ips = ['VOTRE_IP_FIXE']; // Optionnel

# 3. STRUCTURE DES FICHIERS

Votre site web aura cette structure :
```
/
├── admin/
│   ├── api/
│   │   └── index.php          ← API Backend (NOUVEAU)
│   ├── css/
│   ├── js/
│   └── index.html
├── data/
│   └── pedagogues.json        ← Données (NOUVEAU)
├── images/
│   ├── laurence.jpg
│   ├── adrien.jpg
│   └── ilan.jpg
└── pages/
    ├── desktop/
    └── mobile/
```

# 4. FONCTIONNEMENT

## AVANT (localStorage uniquement) :
Modifications → Navigateur local → Aucun effet sur le site live

## MAINTENANT (avec PHP/API) :
Modifications → API PHP → Fichiers du site → Site live mis à jour

# 5. INSTRUCTIONS DE DÉPLOIEMENT

1. Uploadez tous les fichiers sur votre serveur
2. Vérifiez que PHP fonctionne
3. Donnez les permissions d'écriture (chmod 755) aux dossiers :
   - /data/
   - /images/
   - /pages/
4. Testez l'admin : votre-site.com/admin/
5. Ajoutez/modifiez un pédagogue
6. Vérifiez que les pages sont mises à jour automatiquement

# 6. SÉCURITÉ

- L'API vérifie l'authentification
- Upload d'images sécurisé (types et tailles)
- Validation des données
- Protection contre les injections

# 7. COMPATIBILITÉ

✅ Fonctionne avec la plupart des hébergeurs mutualisés
✅ Compatible OVH, 1&1, HostGator, etc.
✅ Aucune base de données requise (utilise JSON)
✅ Interface admin reste la même
