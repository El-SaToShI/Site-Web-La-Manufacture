/**
 * Utilitaires pour la gestion des dates
 * Optimisé pour performance et compatibilité
 */
class DateUtils {
    /**
     * Formate une date en français
     * @param {Date|string} date - Date à formater
     * @returns {string} Date formatée
     */
    static formatFrenchDate(date) {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return '';
        
        return dateObj.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Formate une heure
     * @param {string} time - Heure au format HH:MM
     * @returns {string} Heure formatée
     */
    static formatTime(time) {
        if (!time) return '';
        // Validation simple du format HH:MM
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time) ? time : '';
    }

    /**
     * Génère un ID unique basé sur timestamp
     * @returns {string} ID unique
     */
    static generateUniqueId() {
        return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Valide une date
     * @param {string} dateString - Date au format YYYY-MM-DD
     * @returns {boolean} True si valide
     */
    static isValidDate(dateString) {
        if (!dateString) return false;
        const date = new Date(dateString);
        return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
    }

    /**
     * Convertit une date en format ISO pour les inputs
     * @param {Date} date - Date à convertir
     * @returns {string} Date au format YYYY-MM-DD
     */
    static toInputFormat(date) {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return year + '-' + month + '-' + day;
    }
}

// Export pour compatibilité
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DateUtils;
} else {
    window.DateUtils = DateUtils;
}
