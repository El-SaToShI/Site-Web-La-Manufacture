/**
 * Configuration principale de l'interface d'administration
 * La Manufacture de Laurence
 */

const ADMIN_CONFIG = {
    // API Configuration
    api: {
        baseUrl: './api/index.php',
        timeout: 10000,
        retryAttempts: 3
    },
    
    // Authentication
    auth: {
        sessionKey: 'admin_token',
        tokenExpiry: 24 * 60 * 60 * 1000, // 24 heures
        // ⚠️ CHANGEZ CES IDENTIFIANTS AVANT LE PREMIER DÉPLOIEMENT !
        users: {
            'laurence': {
                password: 'VotreMotDePasseFort2024!', // ⚠️ À CHANGER ABSOLUMENT
                role: 'admin',
                name: 'Laurence Voreux'
            }
            // Suppression du compte admin par défaut pour sécurité
        },
        // Sécurité renforcée pour GitHub Pages
        maxLoginAttempts: 3,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
        requireStrongPassword: true
    },
    
    // Interface Settings
    ui: {
        theme: 'light',
        animations: true,
        autoSave: true,
        autoSaveInterval: 30000, // 30 secondes
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedImageTypes: ['jpg', 'jpeg', 'png', 'webp'],
        pagination: {
            itemsPerPage: 10
        }
    },
    
    // Messages
    messages: {
        success: {
            save: '✅ Sauvegarde réussie',
            delete: '✅ Suppression réussie',
            upload: '✅ Upload réussi',
            sync: '✅ Site web mis à jour'
        },
        error: {
            save: '❌ Erreur de sauvegarde',
            delete: '❌ Erreur de suppression',
            upload: '❌ Erreur d\'upload',
            network: '❌ Erreur réseau',
            auth: '❌ Erreur d\'authentification'
        },
        warning: {
            unsaved: '⚠️ Modifications non sauvegardées',
            fileSize: '⚠️ Fichier trop volumineux',
            fileType: '⚠️ Type de fichier non autorisé'
        }
    },
    
    // Default Data
    defaults: {
        pedagogue: {
            name: '',
            subtitle: '',
            description: '',
            image: '../images/default-avatar.jpg',
            timeline: []
        }
    },
    
    // Validation Rules
    validation: {
        pedagogue: {
            name: { required: true, minLength: 2, maxLength: 50 },
            subtitle: { required: true, minLength: 5, maxLength: 100 },
            description: { required: true, minLength: 20, maxLength: 1000 }
        }
    }
};

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ADMIN_CONFIG;
}
