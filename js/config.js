/**
 * Configuration centralisée pour La Manufacture de Laurence
 * Optimisé pour production
 */
const AppConfig = {
    // Version de l'application
    version: '2.0.0',
    
    // Configuration de l'agenda
    agenda: {
        maxEventsPerDay: 5,
        defaultView: 'month',
        firstDayOfWeek: 1, // Lundi
        eventColors: {
            'spectacle': '#e74c3c',
            'cours': '#3498db',
            'atelier': '#2ecc71',
            'conference': '#f39c12',
            'autre': '#9b59b6'
        },
        timeFormat: '24h',
        locale: 'fr-FR'
    },

    // Configuration OCR
    ocr: {
        language: 'fra',
        confidence: {
            minimum: 20,
            good: 70,
            excellent: 90
        },
        maxFileSize: 10 * 1024 * 1024, // 10MB
        supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
        timeout: 30000 // 30 secondes
    },

    // Configuration du stockage
    storage: {
        dbName: 'LaManufactureDB',
        dbVersion: 2,
        maxCacheSize: 100,
        compressionThreshold: 1024, // 1KB
        fallbackToLocalStorage: true,
        maxImageSize: 5 * 1024 * 1024, // 5MB
        imageQuality: 0.8
    },

    // Configuration mobile
    mobile: {
        breakpoint: 768,
        touchDelay: 300,
        swipeThreshold: 50,
        hamburgerAnimation: 300
    },

    // Configuration des animations
    animations: {
        defaultDuration: 300,
        easing: 'ease-in-out',
        slideSpeed: 250,
        fadeSpeed: 200
    },

    // Configuration des notifications
    notifications: {
        defaultDuration: 3000,
        errorDuration: 5000,
        position: 'top-right',
        maxVisible: 3
    },

    // Configuration des exports
    exports: {
        formats: ['ics', 'csv', 'json'],
        filename: 'agenda-manufacture-laurence',
        dateFormat: 'YYYY-MM-DD',
        csvSeparator: ';',
        encoding: 'UTF-8'
    },

    // URLs et endpoints
    urls: {
        tesseractWorker: 'https://unpkg.com/tesseract.js@v4.1.1/dist/worker.min.js',
        tesseractCore: 'https://unpkg.com/tesseract.js-core@v4.0.3/tesseract-core.wasm.js',
        backup: null // À configurer si backup externe
    },

    // Configuration de développement
    dev: {
        debug: false,
        verbose: false,
        mockData: false,
        performance: true
    },

    // Méthodes utilitaires
    isMobile() {
        return window.innerWidth <= this.mobile.breakpoint;
    },

    isDebug() {
        return this.dev.debug || window.location.hostname === 'localhost';
    },

    getEventColor(type) {
        return this.agenda.eventColors[type] || this.agenda.eventColors.autre;
    },

    formatDate(date, format = 'short') {
        if (!date) return '';
        const d = new Date(date);
        
        switch (format) {
            case 'full':
                return d.toLocaleDateString(this.agenda.locale, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            case 'medium':
                return d.toLocaleDateString(this.agenda.locale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            case 'short':
            default:
                return d.toLocaleDateString(this.agenda.locale);
        }
    },

    log(message, level = 'info') {
        if (!this.isDebug()) return;
        
        const timestamp = new Date().toISOString();
        const prefix = '[' + timestamp + '] [' + level.toUpperCase() + ']';
        
        switch (level) {
            case 'error':
                console.error(prefix, message);
                break;
            case 'warn':
                console.warn(prefix, message);
                break;
            case 'debug':
                if (this.dev.verbose) console.log(prefix, message);
                break;
            default:
                console.log(prefix, message);
        }
    }
};

// Détection automatique de l'environnement
if (typeof window !== 'undefined') {
    // Mode développement si localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        AppConfig.dev.debug = true;
        AppConfig.dev.verbose = true;
    }
    
    // Adaptation mobile
    if (AppConfig.isMobile()) {
        AppConfig.animations.defaultDuration = 200; // Plus rapide sur mobile
        AppConfig.ocr.timeout = 45000; // Plus de temps sur mobile
    }
}

// Export pour compatibilité
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
} else {
    window.AppConfig = AppConfig;
}
