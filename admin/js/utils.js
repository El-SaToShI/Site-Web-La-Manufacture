/**
 * 🛠️ UTILITAIRES JAVASCRIPT - LA MANUFACTURE
 * Fonctions utilitaires réutilisables pour l'admin
 */

class AdminUtils {
    /**
     * Validation des données
     */
    static validate = {
        email: (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        required: (value) => {
            return value !== null && value !== undefined && value.toString().trim() !== '';
        },
        
        minLength: (value, min) => {
            return value && value.length >= min;
        },
        
        maxLength: (value, max) => {
            return value && value.length <= max;
        },
        
        fileSize: (file, maxSizeMB) => {
            return file && file.size <= maxSizeMB * 1024 * 1024;
        },
        
        fileType: (file, allowedTypes) => {
            if (!file) return false;
            const ext = file.name.split('.').pop().toLowerCase();
            return allowedTypes.includes(ext);
        }
    };

    /**
     * Gestion des messages
     */
    static showMessage(message, type = 'info', duration = 4000) {
        // Supprimer les anciens messages
        const existing = document.querySelectorAll('.admin-message');
        existing.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `admin-message admin-message-${type}`;
        messageDiv.innerHTML = `
            <div class="admin-message-content">
                <i class="fas fa-${this.getMessageIcon(type)}"></i>
                <span>${message}</span>
                <button class="admin-message-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Styles inline pour garantir l'affichage
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: var(--z-notification, 3000);
            max-width: 400px;
            padding: 16px;
            border-radius: var(--radius-lg, 8px);
            box-shadow: var(--shadow-lg);
            color: white;
            font-weight: 500;
            animation: slideIn 0.3s ease;
            ${this.getMessageStyles(type)}
        `;

        document.body.appendChild(messageDiv);

        // Auto-suppression
        if (duration > 0) {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => messageDiv.remove(), 300);
                }
            }, duration);
        }

        return messageDiv;
    }

    static getMessageIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    static getMessageStyles(type) {
        const styles = {
            success: 'background-color: var(--admin-success, #10b981);',
            error: 'background-color: var(--admin-danger, #ef4444);',
            warning: 'background-color: var(--admin-warning, #f59e0b); color: black;',
            info: 'background-color: var(--admin-info, #3b82f6);'
        };
        return styles[type] || styles.info;
    }

    /**
     * Gestion des formulaires
     */
    static validateForm(formElement, rules) {
        const errors = {};
        let isValid = true;

        Object.keys(rules).forEach(fieldName => {
            const field = formElement.querySelector(`[name="${fieldName}"]`);
            const fieldRules = rules[fieldName];
            const value = field ? field.value.trim() : '';

            // Supprimer les anciens messages d'erreur
            const existingError = field?.parentElement.querySelector('.form-error');
            if (existingError) existingError.remove();
            if (field) field.classList.remove('error');

            // Validation required
            if (fieldRules.required && !this.validate.required(value)) {
                errors[fieldName] = 'Ce champ est obligatoire';
                isValid = false;
            }
            // Validation minLength
            else if (fieldRules.minLength && !this.validate.minLength(value, fieldRules.minLength)) {
                errors[fieldName] = `Minimum ${fieldRules.minLength} caractères`;
                isValid = false;
            }
            // Validation maxLength
            else if (fieldRules.maxLength && !this.validate.maxLength(value, fieldRules.maxLength)) {
                errors[fieldName] = `Maximum ${fieldRules.maxLength} caractères`;
                isValid = false;
            }
            // Validation email
            else if (fieldRules.email && value && !this.validate.email(value)) {
                errors[fieldName] = 'Email invalide';
                isValid = false;
            }

            // Afficher l'erreur
            if (errors[fieldName] && field) {
                field.classList.add('error');
                const errorDiv = document.createElement('div');
                errorDiv.className = 'form-error';
                errorDiv.textContent = errors[fieldName];
                field.parentElement.appendChild(errorDiv);
            }
        });

        return { isValid, errors };
    }

    /**
     * Gestion des fichiers
     */
    static handleFileUpload(fileInput, options = {}) {
        return new Promise((resolve, reject) => {
            const file = fileInput.files[0];
            if (!file) {
                reject(new Error('Aucun fichier sélectionné'));
                return;
            }

            const {
                maxSizeMB = 5,
                allowedTypes = ['jpg', 'jpeg', 'png', 'webp'],
                preview = null
            } = options;

            // Validation taille
            if (!this.validate.fileSize(file, maxSizeMB)) {
                reject(new Error(`Fichier trop volumineux (max ${maxSizeMB}MB)`));
                return;
            }

            // Validation type
            if (!this.validate.fileType(file, allowedTypes)) {
                reject(new Error(`Type de fichier non autorisé (${allowedTypes.join(', ')})`));
                return;
            }

            // Lecture du fichier
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = {
                    file,
                    dataUrl: e.target.result,
                    name: file.name,
                    size: file.size,
                    type: file.type
                };

                // Affichage de l'aperçu
                if (preview && preview.tagName === 'IMG') {
                    preview.src = result.dataUrl;
                    preview.style.display = 'block';
                }

                resolve(result);
            };
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Utilitaires de chaînes
     */
    static string = {
        slugify: (text) => {
            return text
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        },
        
        capitalize: (text) => {
            return text.charAt(0).toUpperCase() + text.slice(1);
        },
        
        truncate: (text, length = 100) => {
            return text.length > length ? text.substring(0, length) + '...' : text;
        },
        
        stripHtml: (html) => {
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || '';
        }
    };

    /**
     * Utilitaires de stockage
     */
    static storage = {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Erreur localStorage:', e);
                return false;
            }
        },
        
        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Erreur localStorage:', e);
                return defaultValue;
            }
        },
        
        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Erreur localStorage:', e);
                return false;
            }
        },
        
        clear: () => {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                console.error('Erreur localStorage:', e);
                return false;
            }
        }
    };

    /**
     * Utilitaires de date
     */
    static date = {
        format: (date, locale = 'fr-FR') => {
            return new Intl.DateTimeFormat(locale).format(new Date(date));
        },
        
        formatDateTime: (date, locale = 'fr-FR') => {
            return new Intl.DateTimeFormat(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(date));
        },
        
        isValid: (dateString) => {
            return !isNaN(Date.parse(dateString));
        }
    };

    /**
     * Utilitaires de navigation
     */
    static navigation = {
        goTo: (url) => {
            window.location.href = url;
        },
        
        reload: () => {
            window.location.reload();
        },
        
        back: () => {
            window.history.back();
        },
        
        openInNewTab: (url) => {
            window.open(url, '_blank');
        }
    };

    /**
     * Debounce pour optimiser les performances
     */
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }

    /**
     * Animation d'apparition
     */
    static animateIn(element, animation = 'fadeIn') {
        element.style.animation = `${animation} 0.3s ease`;
    }

    /**
     * Animation de disparition
     */
    static animateOut(element, animation = 'fadeOut') {
        return new Promise((resolve) => {
            element.style.animation = `${animation} 0.3s ease`;
            setTimeout(() => {
                element.remove();
                resolve();
            }, 300);
        });
    }
}

// Ajout des animations CSS si elles n'existent pas
if (!document.querySelector('#admin-animations')) {
    const style = document.createElement('style');
    style.id = 'admin-animations';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
        }
        
        .admin-message-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .admin-message-close {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            padding: 4px;
            margin-left: auto;
        }
    `;
    document.head.appendChild(style);
}

// Export pour utilisation globale
window.AdminUtils = AdminUtils;
