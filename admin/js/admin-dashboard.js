// ============================================
// GESTIONNAIRE DE TABLEAU DE BORD
// ============================================

class DashboardManager {
    constructor() {
        this.stats = {
            pages: 5,
            pedagogues: 3,
            events: 0,
            visits: 0
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadStats();
        this.updateActivityFeed();
        this.loadQuickActions();
        this.initActivityLogger();
    }
    
    initActivityLogger() {
        // Initialisation du système de suivi - SEULEMENT pour le logging, PAS l'interface
        if (window.activityLogger) {
            window.activityLogger.logActivity('system', 'Dashboard chargé', 'Accès au tableau de bord admin');
        }
        
        // NE PAS initialiser automatiquement le dashboard d'activité ici
        // Il sera initialisé uniquement quand l'utilisateur accède à la section
    }
    
    bindEvents() {
        // Actions rapides
        const quickActions = document.querySelectorAll('.quick-action');
        quickActions.forEach(action => {
            action.addEventListener('click', (e) => {
                const actionType = e.currentTarget.dataset.action;
                this.handleQuickAction(actionType);
            });
        });
        
        // Mise à jour automatique des stats
        setInterval(() => {
            this.updateStats();
        }, 30000); // Toutes les 30 secondes
    }
    
    handleQuickAction(actionType) {
        switch (actionType) {
            case 'add-event':
                this.quickAddEvent();
                break;
            case 'edit-homepage':
                this.quickEditHomepage();
                break;
            case 'upload-image':
                this.quickUploadImage();
                break;
            default:
                console.log('Action non définie:', actionType);
        }
    }
    
    quickAddEvent() {
        // Basculer vers la section agenda et ouvrir le formulaire d'ajout
        if (window.adminCore) {
            window.adminCore.switchSection('agenda');
        }
        
        // Attendre que la section soit chargée puis ouvrir le modal d'ajout
        setTimeout(() => {
            if (window.agendaManager) {
                window.agendaManager.openAddEventModal();
            }
        }, 300);
    }
    
    quickEditHomepage() {
        // Basculer vers l'éditeur de contenu avec la page d'accueil
        if (window.adminCore) {
            window.adminCore.switchSection('content');
        }
        
        setTimeout(() => {
            if (window.contentManager) {
                window.contentManager.loadPage('index');
            }
        }, 300);
    }
    
    quickUploadImage() {
        // Basculer vers la gestion des médias
        if (window.adminCore) {
            window.adminCore.switchSection('media');
        }
        
        setTimeout(() => {
            if (window.mediaManager) {
                window.mediaManager.openUploadModal();
            }
        }, 300);
    }
    
    loadStats() {
        // Charger les statistiques depuis localStorage ou API
        const savedStats = localStorage.getItem('adminStats');
        if (savedStats) {
            this.stats = { ...this.stats, ...JSON.parse(savedStats) };
        }
        
        this.updateStatsDisplay();
    }
    
    updateStats() {
        // Mettre à jour les statistiques
        this.calculateEventCount();
        this.updateStatsDisplay();
        this.saveStats();
    }
    
    calculateEventCount() {
        // Compter les événements dans l'agenda
        const events = JSON.parse(localStorage.getItem('agendaEvents') || '[]');
        this.stats.events = events.length;
    }
    
    updateStatsDisplay() {
        // Mettre à jour l'affichage des statistiques
        const eventCountEl = document.getElementById('eventCount');
        if (eventCountEl) {
            eventCountEl.textContent = this.stats.events;
        }
        
        // Animation de compteur pour les nouveaux chiffres
        this.animateCounter('eventCount', this.stats.events);
    }
    
    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000; // 1 seconde
        const step = (targetValue - startValue) / (duration / 16); // 60 FPS
        
        let currentValue = startValue;
        const timer = setInterval(() => {
            currentValue += step;
            
            if ((step > 0 && currentValue >= targetValue) || 
                (step < 0 && currentValue <= targetValue)) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            
            element.textContent = Math.round(currentValue);
        }, 16);
    }
    
    saveStats() {
        localStorage.setItem('adminStats', JSON.stringify(this.stats));
    }
    
    updateActivityFeed() {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;
        
        const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
        
        if (activities.length === 0) {
            activityFeed.innerHTML = `
                <div class="activity-item">
                    <i class="fas fa-info-circle"></i>
                    <span>Bienvenue dans l'interface d'administration!</span>
                    <time>Maintenant</time>
                </div>
            `;
            return;
        }
        
        // Afficher les 5 dernières activités
        activityFeed.innerHTML = activities.slice(0, 5).map(activity => `
            <div class="activity-item">
                <i class="${this.getActivityIcon(activity.message)}"></i>
                <span>${activity.message}</span>
                <time>${this.formatTime(activity.timestamp)}</time>
            </div>
        `).join('');
    }
    
    getActivityIcon(message) {
        if (message.includes('connexion') || message.includes('Connexion')) {
            return 'fas fa-sign-in-alt';
        } else if (message.includes('sauvegard') || message.includes('Sauvegard')) {
            return 'fas fa-save';
        } else if (message.includes('ajout') || message.includes('Ajout')) {
            return 'fas fa-plus';
        } else if (message.includes('modification') || message.includes('Modification')) {
            return 'fas fa-edit';
        } else if (message.includes('suppression') || message.includes('Suppression')) {
            return 'fas fa-trash';
        } else {
            return 'fas fa-clock';
        }
    }
    
    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) return 'Il y a moins d\'une minute';
        if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} minutes`;
        if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} heures`;
        if (diff < 604800000) return `Il y a ${Math.floor(diff / 86400000)} jours`;
        
        return new Date(timestamp).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    loadQuickActions() {
        // Personnaliser les actions rapides selon les besoins
        this.addQuickActionAnimations();
    }
    
    addQuickActionAnimations() {
        const quickActions = document.querySelectorAll('.quick-action');
        
        quickActions.forEach((action, index) => {
            // Animation d'apparition échelonnée
            action.style.opacity = '0';
            action.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                action.style.transition = 'all 0.3s ease';
                action.style.opacity = '1';
                action.style.transform = 'translateY(0)';
            }, index * 100);
            
            // Effet de survol amélioré
            action.addEventListener('mouseenter', () => {
                action.style.transform = 'translateY(-2px)';
                action.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            });
            
            action.addEventListener('mouseleave', () => {
                action.style.transform = 'translateY(0)';
                action.style.boxShadow = 'none';
            });
        });
    }
    
    // Méthodes pour mettre à jour les stats depuis d'autres modules
    incrementEventCount() {
        this.stats.events++;
        this.updateStatsDisplay();
        this.saveStats();
    }
    
    decrementEventCount() {
        this.stats.events = Math.max(0, this.stats.events - 1);
        this.updateStatsDisplay();
        this.saveStats();
    }
    
    updatePageCount(count) {
        this.stats.pages = count;
        this.updateStatsDisplay();
        this.saveStats();
    }
    
    updatePedagogueCount(count) {
        this.stats.pedagogues = count;
        this.updateStatsDisplay();
        this.saveStats();
    }
    
    // Gestion des notifications dans le dashboard
    addNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `dashboard-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1002;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; cursor: pointer; margin-left: auto;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Suppression automatique après 5 secondes
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }
    
    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }
    
    // Méthode pour exporter les données
    exportData() {
        const data = {
            stats: this.stats,
            activities: JSON.parse(localStorage.getItem('adminActivities') || '[]'),
            pages: JSON.parse(localStorage.getItem('adminSavedPages') || '{}'),
            events: JSON.parse(localStorage.getItem('agendaEvents') || '[]'),
            pedagogues: JSON.parse(localStorage.getItem('adminPedagogues') || '[]'),
            timestamp: Date.now()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `manufacture-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        this.addNotification('Sauvegarde des données exportée avec succès!', 'success');
    }
    
    // Méthode pour importer les données
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Valider les données
                if (!data.timestamp) {
                    throw new Error('Fichier de sauvegarde invalide');
                }
                
                // Importer les données
                if (data.stats) this.stats = data.stats;
                if (data.activities) localStorage.setItem('adminActivities', JSON.stringify(data.activities));
                if (data.pages) localStorage.setItem('adminSavedPages', JSON.stringify(data.pages));
                if (data.events) localStorage.setItem('agendaEvents', JSON.stringify(data.events));
                if (data.pedagogues) localStorage.setItem('adminPedagogues', JSON.stringify(data.pedagogues));
                
                this.updateStatsDisplay();
                this.updateActivityFeed();
                
                this.addNotification('Données importées avec succès! Rechargement recommandé.', 'success');
                
            } catch (error) {
                this.addNotification('Erreur lors de l\'importation: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }
}

// Exporter pour utilisation globale
window.DashboardManager = DashboardManager;
