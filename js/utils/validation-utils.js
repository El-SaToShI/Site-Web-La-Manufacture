/**
 * Utilitaires de validation
 * Optimisé pour performance et sécurité
 */
class ValidationUtils {
    /**
     * Nettoie et valide un titre
     * @param {string} title - Titre à valider
     * @returns {string} Titre nettoyé
     */
    static sanitizeTitle(title) {
        if (!title || typeof title !== 'string') return '';
        return title.trim()
            .replace(/<[^>]*>/g, '') // Supprime les balises HTML
            .replace(/[<>&"']/g, function(match) { // Escape les caractères dangereux
                const escapeMap = {
                    '<': '&lt;',
                    '>': '&gt;',
                    '&': '&amp;',
                    '"': '&quot;',
                    "'": '&#x27;'
                };
                return escapeMap[match];
            })
            .substring(0, 200); // Limite la longueur
    }

    /**
     * Valide un email
     * @param {string} email - Email à valider
     * @returns {boolean} True si valide
     */
    static isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    /**
     * Valide une URL
     * @param {string} url - URL à valider
     * @returns {boolean} True si valide
     */
    static isValidUrl(url) {
        if (!url || typeof url !== 'string') return false;
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Nettoie une description
     * @param {string} description - Description à nettoyer
     * @returns {string} Description nettoyée
     */
    static sanitizeDescription(description) {
        if (!description || typeof description !== 'string') return '';
        return description.trim()
            .replace(/<script[^>]*>.*?<\/script>/gi, '') // Supprime les scripts
            .replace(/<[^>]*>/g, '') // Supprime les balises HTML
            .substring(0, 1000); // Limite la longueur
    }

    /**
     * Valide les données d'un événement
     * @param {Object} event - Données de l'événement
     * @returns {Object} Résultat de validation
     */
    static validateEvent(event) {
        const errors = [];
        const warnings = [];

        if (!event) {
            errors.push('Aucune donnée d\'événement fournie');
            return { isValid: false, errors, warnings };
        }

        // Validation du titre
        if (!event.title || event.title.trim().length === 0) {
            errors.push('Le titre est obligatoire');
        } else if (event.title.trim().length < 3) {
            warnings.push('Le titre est très court');
        }

        // Validation de la date
        if (!event.date || !DateUtils.isValidDate(event.date)) {
            errors.push('La date est obligatoire et doit être valide');
        }

        // Validation de l'heure
        if (event.time && !DateUtils.formatTime(event.time)) {
            errors.push('L\'heure doit être au format HH:MM');
        }

        // Validation du lieu
        if (!event.location || event.location.trim().length === 0) {
            warnings.push('Le lieu n\'est pas spécifié');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}

// Export pour compatibilité
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidationUtils;
} else {
    window.ValidationUtils = ValidationUtils;
}
