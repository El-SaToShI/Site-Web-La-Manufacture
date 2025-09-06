// ============================================
// NOYAU DE L'ADMINISTRATION
// ============================================

class AdminCore {
    constructor() {
        this.currentSection = 'dashboard';
        this.managers = {};
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeAdmin();
            });
        } else {
            this.initializeAdmin();
        }
    }
    
    initializeAdmin() {
        // Initialiser les systèmes dans l'ordre
        this.initializeAuth();
        this.initializeNavigation();
        this.initializeManagers();
        this.bindGlobalEvents();
        
        this.isInitialized = true;
        
        console.log('🎭 Interface d\'administration initialisée avec succès!');
    }
    
    initializeAuth() {
        // Créer l'instance d'authentification
        window.adminAuth = new AdminAuth();
        
        // Vérifier si l'utilisateur est connecté
        if (!window.adminAuth.checkExistingSession()) {
            // Afficher l'écran de connexion
            this.showLoginScreen();
        } else {
            // Afficher l'interface d'admin
            this.showAdminInterface();
        }
    }
    
    initializeNavigation() {
        // Gestion de la navigation dans la sidebar
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });
        
        // Gestion du bouton de sauvegarde global
        const saveBtn = document.querySelector('.btn-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveCurrentSection();
            });
        }
        
        // Gestion du bouton d'aperçu
        const previewBtn = document.querySelector('.btn-preview');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.previewSite();
            });
        }
    }
    
    initializeManagers() {
        // Initialiser tous les gestionnaires
        this.managers.dashboard = new DashboardManager();
        this.managers.content = new ContentManager();
        
        // Les autres gestionnaires seront initialisés à la demande
        this.managers.agenda = null;
        this.managers.media = null;
        this.managers.pedagogues = null;
        this.managers.design = null;
        
        // Exposer les managers globalement pour l'interopérabilité
        window.dashboardManager = this.managers.dashboard;
        window.contentManager = this.managers.content;
        window.adminCore = this;
    }
    
    bindGlobalEvents() {
        // Raccourcis clavier globaux
        document.addEventListener('keydown', (e) => {
            this.handleGlobalShortcuts(e);
        });
        
        // Gestion de la fermeture de la fenêtre avec changements non sauvegardés
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = 'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?';
                return e.returnValue;
            }
        });
        
        // Gestion du redimensionnement pour responsive
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    handleGlobalShortcuts(e) {
        // Ctrl/Cmd + S : Sauvegarder
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveCurrentSection();
        }
        
        // Ctrl/Cmd + P : Aperçu
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            this.previewSite();
        }
        
        // Escape : Fermer les modals
        if (e.key === 'Escape') {
            this.closeModals();
        }
        
        // Ctrl/Cmd + 1-9 : Navigation rapide
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            const sectionIndex = parseInt(e.key) - 1;
            const sections = ['dashboard', 'content', 'pedagogues', 'agenda', 'media', 'design', 'settings'];
            if (sections[sectionIndex]) {
                this.switchSection(sections[sectionIndex]);
            }
        }
    }
    
    switchSection(sectionName) {
        if (!this.isInitialized) return;
        
        // Vérifier les changements non sauvegardés
        if (this.hasUnsavedChanges()) {
            if (!confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment changer de section ?')) {
                return;
            }
        }
        
        // Masquer toutes les sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Désactiver tous les menu items
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Activer la nouvelle section
        const newSection = document.getElementById(`${sectionName}-section`);
        const newMenuItem = document.querySelector(`[data-section="${sectionName}"]`);
        
        if (newSection) {
            newSection.classList.add('active');
        }
        
        if (newMenuItem) {
            newMenuItem.classList.add('active');
        }
        
        // Mettre à jour le titre
        const sectionTitle = document.getElementById('sectionTitle');
        if (sectionTitle) {
            sectionTitle.textContent = this.getSectionTitle(sectionName);
        }
        
        // Initialiser le gestionnaire de section si nécessaire
        this.initializeSectionManager(sectionName);
        
        this.currentSection = sectionName;
    }
    
    getSectionTitle(sectionName) {
        const titles = {
            dashboard: 'Tableau de Bord',
            content: 'Gestion de Contenu',
            pedagogues: 'Gestion des Pédagogues',
            agenda: 'Gestion de l\'Agenda',
            media: 'Gestion des Médias',
            design: 'Apparence du Site',
            settings: 'Paramètres'
        };
        return titles[sectionName] || 'Section Inconnue';
    }
    
    initializeSectionManager(sectionName) {
        // Initialiser les gestionnaires à la demande pour optimiser les performances
        switch (sectionName) {
            case 'agenda':
                if (!this.managers.agenda) {
                    this.loadAgendaSection();
                }
                break;
            case 'media':
                if (!this.managers.media) {
                    this.loadMediaSection();
                }
                break;
            case 'pedagogues':
                if (!this.managers.pedagogues) {
                    this.loadPedagoguesSection();
                }
                break;
            case 'design':
                if (!this.managers.design) {
                    this.loadDesignSection();
                }
                break;
            case 'settings':
                if (!this.managers.settings) {
                    this.loadSettingsSection();
                }
                break;
        }
    }
    
    loadAgendaSection() {
        // Créer dynamiquement la section agenda
        const agendaSection = document.getElementById('agenda-section');
        if (agendaSection && !agendaSection.hasChildNodes()) {
            agendaSection.innerHTML = `
                <div class="agenda-manager">
                    <div class="agenda-toolbar">
                        <button class="btn-add-event">
                            <i class="fas fa-plus"></i> Nouvel Événement
                        </button>
                        <div class="view-controls">
                            <button class="view-btn active" data-view="month">Mois</button>
                            <button class="view-btn" data-view="week">Semaine</button>
                            <button class="view-btn" data-view="day">Jour</button>
                        </div>
                    </div>
                    <div class="agenda-calendar">
                        <div id="calendar-widget">
                            <!-- Le calendrier sera généré ici -->
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Initialiser le gestionnaire d'agenda (à créer)
        // this.managers.agenda = new AgendaManager();
    // ...existing code...
    }
    
    loadMediaSection() {
        const mediaSection = document.getElementById('media-section');
        if (mediaSection && !mediaSection.hasChildNodes()) {
            mediaSection.innerHTML = `
                <div class="media-manager">
                    <div class="media-toolbar">
                        <button class="btn-upload-media">
                            <i class="fas fa-upload"></i> Uploader des Médias
                        </button>
                        <div class="media-filters">
                            <select class="media-filter">
                                <option value="all">Tous les médias</option>
                                <option value="images">Images</option>
                                <option value="videos">Vidéos</option>
                                <option value="documents">Documents</option>
                            </select>
                        </div>
                    </div>
                    <div class="media-gallery">
                        <div id="media-grid">
                            <!-- La galerie sera générée ici -->
                        </div>
                    </div>
                </div>
            `;
        }
        
    // ...existing code...
    }
    
    loadPedagoguesSection() {
        // Ne pas écraser le contenu HTML existant de la section pédagogues
        const pedagoguesSection = document.getElementById('pedagogues-section');
        if (pedagoguesSection) {
            // Initialiser le gestionnaire des pédagogues existant
            if (window.PedagogueManager && !this.managers.pedagogues) {
                this.managers.pedagogues = new PedagogueManager();
                console.log('✅ Gestionnaire de pédagogues initialisé');
            }
        }
        
    // ...existing code...
    }
    
    loadDesignSection() {
        const designSection = document.getElementById('design-section');
        if (designSection && !designSection.hasChildNodes()) {
            designSection.innerHTML = `
                <div class="design-manager">
                    <div class="design-tabs">
                        <button class="design-tab active" data-tab="colors">Couleurs</button>
                        <button class="design-tab" data-tab="fonts">Polices</button>
                        <button class="design-tab" data-tab="layout">Mise en Page</button>
                        <button class="design-tab" data-tab="themes">Thèmes</button>
                    </div>
                    <div class="design-content">
                        <div id="design-panel">
                            <!-- Le panneau de design sera généré ici -->
                        </div>
                    </div>
                </div>
            `;
        }
        
    // ...existing code...
    }
    
    loadSettingsSection() {
        const settingsSection = document.getElementById('settings-section');
        if (settingsSection && !settingsSection.hasChildNodes()) {
            settingsSection.innerHTML = `
                <div class="settings-manager">
                    <div class="settings-categories">
                        <div class="settings-category">
                            <h3>Général</h3>
                            <div class="setting-item">
                                <label>Nom du site</label>
                                <input type="text" value="La Manufacture de Laurence">
                            </div>
                            <div class="setting-item">
                                <label>Description</label>
                                <textarea>École professionnelle de théâtre</textarea>
                            </div>
                        </div>
                        <div class="settings-category">
                            <h3>Sauvegardes</h3>
                            <div class="setting-item">
                                <button onclick="window.adminCore.exportData()">
                                    <i class="fas fa-download"></i> Exporter les données
                                </button>
                            </div>
                            <div class="setting-item">
                                <label>Importer des données</label>
                                <input type="file" accept=".json" onchange="window.adminCore.importData(this.files[0])">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
    // ...existing code...
    }
    
    saveCurrentSection() {
        switch (this.currentSection) {
            case 'content':
                if (this.managers.content) {
                    this.managers.content.savePage();
                }
                break;
            case 'agenda':
                if (this.managers.agenda) {
                    this.managers.agenda.saveEvents();
                }
                break;
            case 'pedagogues':
                if (this.managers.pedagogues) {
                    this.managers.pedagogues.savePedagogues();
                }
                break;
            case 'design':
                if (this.managers.design) {
                    this.managers.design.saveDesign();
                }
                break;
            default:
                this.showMessage('Rien à sauvegarder dans cette section.', 'info');
        }
    }
    
    previewSite() {
        // Ouvrir le site dans un nouvel onglet
        window.open('../index.html', '_blank');
    }
    
    hasUnsavedChanges() {
        // Vérifier si des gestionnaires ont des changements non sauvegardés
        return (this.managers.content && this.managers.content.isDirty) ||
               (this.managers.agenda && this.managers.agenda.isDirty) ||
               (this.managers.pedagogues && this.managers.pedagogues.isDirty) ||
               (this.managers.design && this.managers.design.isDirty);
    }
    
    closeModals() {
        // Fermer tous les modals ouverts
        const modals = document.querySelectorAll('.modal, .modal-overlay');
        modals.forEach(modal => {
            modal.remove();
        });
    }
    
    handleResize() {
        // Gérer le responsive design
        const sidebar = document.querySelector('.admin-sidebar');
        const main = document.querySelector('.admin-main');
        
        if (window.innerWidth < 768) {
            // Mode mobile
            if (sidebar) {
                sidebar.style.width = '60px';
            }
        } else {
            // Mode desktop
            if (sidebar) {
                sidebar.style.width = '280px';
            }
        }
    }
    
    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const adminInterface = document.getElementById('adminInterface');
        
        if (loginScreen) loginScreen.style.display = 'flex';
        if (adminInterface) adminInterface.style.display = 'none';
    }
    
    showAdminInterface() {
        const loginScreen = document.getElementById('loginScreen');
        const adminInterface = document.getElementById('adminInterface');
        
        if (loginScreen) loginScreen.style.display = 'none';
        if (adminInterface) adminInterface.style.display = 'flex';
    }
    
    showMessage(text, type = 'info') {
        if (this.managers.dashboard) {
            this.managers.dashboard.addNotification(text, type);
        } else {
            alert(text); // Fallback
        }
    }
    
    // Méthodes pour les paramètres
    exportData() {
        if (this.managers.dashboard) {
            this.managers.dashboard.exportData();
        }
    }
    
    importData(file) {
        if (this.managers.dashboard && file) {
            this.managers.dashboard.importData(file);
        }
    }
    
    // Méthode pour redémarrer l'interface
    restart() {
        if (confirm('Redémarrer l\'interface d\'administration ? Toutes les modifications non sauvegardées seront perdues.')) {
            location.reload();
        }
    }
    
    // État de l'application
    getState() {
        return {
            currentSection: this.currentSection,
            isAuthenticated: window.adminAuth ? window.adminAuth.isAuthenticated() : false,
            hasUnsavedChanges: this.hasUnsavedChanges(),
            managers: Object.keys(this.managers).filter(key => this.managers[key] !== null)
        };
    }
}

// Auto-initialisation quand le script est chargé
window.adminCore = new AdminCore();

// Exposer globalement pour le debug
window.AdminCore = AdminCore;
