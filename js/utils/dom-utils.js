/**
 * Utilitaires DOM optimisés
 * Améliore les performances et la compatibilité
 */
class DOMUtils {
    /**
     * Cache pour les éléments fréquemment utilisés
     */
    static elementCache = new Map();

    /**
     * Sélecteur optimisé avec cache
     * @param {string} selector - Sélecteur CSS
     * @param {boolean} useCache - Utiliser le cache (défaut: true)
     * @returns {Element|null} Élément trouvé
     */
    static $(selector, useCache = true) {
        if (useCache && this.elementCache.has(selector)) {
            const cached = this.elementCache.get(selector);
            // Vérifier que l'élément est toujours dans le DOM
            if (document.contains(cached)) {
                return cached;
            } else {
                this.elementCache.delete(selector);
            }
        }

        const element = document.querySelector(selector);
        if (element && useCache) {
            this.elementCache.set(selector, element);
        }
        return element;
    }

    /**
     * Sélecteur multiple optimisé
     * @param {string} selector - Sélecteur CSS
     * @returns {NodeList} Liste d'éléments
     */
    static $$(selector) {
        return document.querySelectorAll(selector);
    }

    /**
     * Création d'élément optimisée
     * @param {string} tag - Tag HTML
     * @param {Object} attributes - Attributs
     * @param {string} content - Contenu HTML
     * @returns {Element} Élément créé
     */
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        // Ajout des attributs
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else {
                element.setAttribute(key, value);
            }
        }

        // Ajout du contenu
        if (content) {
            element.innerHTML = content;
        }

        return element;
    }

    /**
     * Animation fluide
     * @param {Element} element - Élément à animer
     * @param {string} className - Classe CSS d'animation
     * @param {number} duration - Durée en ms
     * @returns {Promise} Promise résolue à la fin de l'animation
     */
    static animate(element, className, duration = 300) {
        return new Promise((resolve) => {
            element.classList.add(className);
            setTimeout(() => {
                element.classList.remove(className);
                resolve();
            }, duration);
        });
    }

    /**
     * Debounce pour optimiser les événements
     * @param {Function} func - Fonction à debouncer
     * @param {number} wait - Délai en ms
     * @returns {Function} Fonction debouncée
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle pour limiter les appels
     * @param {Function} func - Fonction à throttler
     * @param {number} limit - Limite en ms
     * @returns {Function} Fonction throttlée
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Notification toast optimisée
     * @param {string} message - Message à afficher
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Durée en ms
     */
    static showToast(message, type = 'info', duration = 3000) {
        // Supprimer les toasts existants du même type
        const existingToasts = this.$$('.toast.' + type);
        existingToasts.forEach(toast => toast.remove());

        const toast = this.createElement('div', {
            className: 'toast toast-' + type,
            style: 'position: fixed; top: 20px; right: 20px; z-index: 10000; padding: 15px 20px; border-radius: 5px; color: white; font-weight: bold; opacity: 0; transition: opacity 0.3s ease;'
        }, message);

        // Styles selon le type
        const styles = {
            success: 'background: #28a745;',
            error: 'background: #dc3545;',
            warning: 'background: #ffc107; color: #212529;',
            info: 'background: #17a2b8;'
        };

        toast.style.cssText += styles[type] || styles.info;

        document.body.appendChild(toast);

        // Animation d'apparition
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        // Suppression automatique
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    /**
     * Vide le cache des éléments
     */
    static clearCache() {
        this.elementCache.clear();
    }
}

// Export pour compatibilité
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOMUtils;
} else {
    window.DOMUtils = DOMUtils;
}
