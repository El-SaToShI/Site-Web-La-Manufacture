/**
 * 📊 DASHBOARD ACTIVITÉ ADMIN - LA MANUFACTURE
 * 🔍 Interface de visualisation des modifications
 * 👥 Suivi des utilisateurs et actions
 */

class ActivityDashboard {
    constructor() {
        this.logger = window.activityLogger;
        this.currentView = 'overview';
        this.init();
    }

    /**
     * 🚀 Initialisation du dashboard
     */
    init() {
        this.createDashboardHTML();
        this.bindEvents();
        this.loadData();
        this.startAutoRefresh();
        console.log('✅ ActivityDashboard initialisé');
    }

    /**
     * 🎨 Création de l'interface HTML
     */
    createDashboardHTML() {
        const dashboardHTML = `
            <div id="activity-dashboard" class="admin-section">
                <div class="section-header">
                    <h2>📊 Suivi des Modifications</h2>
                    <div class="dashboard-controls">
                        <button class="btn-view" data-view="overview">📈 Vue d'ensemble</button>
                        <button class="btn-view" data-view="recent">🕒 Récent</button>
                        <button class="btn-view" data-view="users">👥 Utilisateurs</button>
                        <button class="btn-view" data-view="search">🔍 Recherche</button>
                        <button class="btn-export" id="export-log">📤 Export</button>
                    </div>
                </div>

                <div id="dashboard-content">
                    <!-- Le contenu sera généré dynamiquement -->
                </div>
            </div>

            <style>
            #activity-dashboard {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #e9ecef;
            }

            .dashboard-controls {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .btn-view, .btn-export {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            }

            .btn-view {
                background: #6c757d;
                color: white;
            }

            .btn-view.active {
                background: #007bff;
                transform: translateY(-2px);
            }

            .btn-export {
                background: #28a745;
                color: white;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }

            .stat-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .stat-number {
                font-size: 2em;
                font-weight: bold;
                color: #007bff;
            }

            .stat-label {
                color: #6c757d;
                margin-top: 5px;
            }

            .activity-list {
                background: white;
                border-radius: 8px;
                padding: 15px;
                max-height: 500px;
                overflow-y: auto;
            }

            .activity-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                border-bottom: 1px solid #e9ecef;
                transition: background 0.2s ease;
            }

            .activity-item:hover {
                background: #f8f9fa;
            }

            .activity-info {
                flex: 1;
            }

            .activity-time {
                color: #6c757d;
                font-size: 0.9em;
            }

            .activity-category {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.8em;
                color: white;
                margin-right: 8px;
            }

            .category-content { background: #17a2b8; }
            .category-user { background: #28a745; }
            .category-system { background: #6c757d; }
            .category-file { background: #ffc107; color: black; }
            .category-config { background: #dc3545; }

            .search-container {
                margin-bottom: 20px;
            }

            .search-input {
                width: 100%;
                padding: 12px;
                border: 2px solid #e9ecef;
                border-radius: 6px;
                font-size: 16px;
            }

            .no-data {
                text-align: center;
                color: #6c757d;
                padding: 40px;
                font-style: italic;
            }
            </style>
        `;

        // Insertion dans le conteneur admin
        const adminContainer = document.querySelector('.admin-container, #admin-content, main');
        if (adminContainer) {
            adminContainer.insertAdjacentHTML('beforeend', dashboardHTML);
        }
    }

    /**
     * 🔗 Liaison des événements
     */
    bindEvents() {
        // Boutons de vue
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Bouton d'export
        document.getElementById('export-log')?.addEventListener('click', () => {
            this.showExportModal();
        });

        // Écoute des nouvelles activités
        window.addEventListener('activityLogged', (e) => {
            this.handleNewActivity(e.detail);
        });
    }

    /**
     * 📊 Chargement des données
     */
    loadData() {
        this.switchView('overview');
    }

    /**
     * 🔄 Changement de vue
     */
    switchView(view) {
        this.currentView = view;
        
        // Mise à jour des boutons actifs
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Génération du contenu
        const content = this.generateViewContent(view);
        document.getElementById('dashboard-content').innerHTML = content;

        // Actions post-rendu
        this.postRenderActions(view);
    }

    /**
     * 🎨 Génération du contenu selon la vue
     */
    generateViewContent(view) {
        switch (view) {
            case 'overview':
                return this.generateOverviewContent();
            case 'recent':
                return this.generateRecentContent();
            case 'users':
                return this.generateUsersContent();
            case 'search':
                return this.generateSearchContent();
            default:
                return '<div class="no-data">Vue non disponible</div>';
        }
    }

    /**
     * 📈 Contenu vue d'ensemble
     */
    generateOverviewContent() {
        const stats = this.logger.getStats();
        
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${stats.total}</div>
                    <div class="stat-label">Total d'actions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.today}</div>
                    <div class="stat-label">Aujourd'hui</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.thisWeek}</div>
                    <div class="stat-label">Cette semaine</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.sessions}</div>
                    <div class="stat-label">Sessions</div>
                </div>
            </div>

            <div class="category-breakdown">
                <h3>📊 Répartition par catégorie</h3>
                <div class="activity-list">
                    ${Object.entries(stats.byCategory).map(([category, count]) => `
                        <div class="activity-item">
                            <div class="activity-info">
                                <span class="activity-category category-${category}">${this.getCategoryIcon(category)} ${this.getCategoryName(category)}</span>
                            </div>
                            <div class="activity-count">${count} actions</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 🕒 Contenu activités récentes
     */
    generateRecentContent() {
        const recentActivities = this.logger.getLog().slice(0, 50);
        
        return `
            <div class="activity-list">
                <h3>🕒 Activités récentes (50 dernières)</h3>
                ${recentActivities.length > 0 ? recentActivities.map(activity => this.renderActivityItem(activity)).join('') : '<div class="no-data">Aucune activité récente</div>'}
            </div>
        `;
    }

    /**
     * 👥 Contenu utilisateurs/sessions
     */
    generateUsersContent() {
        const log = this.logger.getLog();
        const sessionStats = this.getSessionStats(log);
        
        return `
            <div class="session-stats">
                <h3>👥 Sessions utilisateurs</h3>
                <div class="activity-list">
                    ${sessionStats.map(session => `
                        <div class="activity-item">
                            <div class="activity-info">
                                <strong>Session ${session.sessionId.substr(-8)}</strong><br>
                                <small>🕒 ${this.formatDate(session.firstActivity)} - ${this.formatDate(session.lastActivity)}</small><br>
                                <small>🌐 ${session.ip || 'IP non disponible'}</small>
                            </div>
                            <div class="activity-count">${session.activityCount} actions</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 🔍 Contenu recherche
     */
    generateSearchContent() {
        return `
            <div class="search-container">
                <h3>🔍 Recherche dans l'historique</h3>
                <input type="text" class="search-input" id="activity-search" placeholder="Rechercher une action, détail, ou date...">
                <div class="search-filters" style="margin-top: 10px;">
                    <select id="category-filter">
                        <option value="">Toutes les catégories</option>
                        <option value="content">Contenu</option>
                        <option value="user">Utilisateur</option>
                        <option value="system">Système</option>
                        <option value="file">Fichier</option>
                        <option value="config">Configuration</option>
                    </select>
                </div>
            </div>
            <div class="activity-list" id="search-results">
                <div class="no-data">Effectuez une recherche pour voir les résultats</div>
            </div>
        `;
    }

    /**
     * 🎬 Actions post-rendu
     */
    postRenderActions(view) {
        if (view === 'search') {
            this.setupSearchFunctionality();
        }
    }

    /**
     * 🔍 Configuration de la recherche
     */
    setupSearchFunctionality() {
        const searchInput = document.getElementById('activity-search');
        const categoryFilter = document.getElementById('category-filter');
        const resultsContainer = document.getElementById('search-results');

        const performSearch = () => {
            const query = searchInput.value.trim();
            const category = categoryFilter.value;

            if (query.length < 2) {
                resultsContainer.innerHTML = '<div class="no-data">Tapez au moins 2 caractères pour rechercher</div>';
                return;
            }

            const results = this.logger.searchLog(query, category || null);
            
            if (results.length === 0) {
                resultsContainer.innerHTML = '<div class="no-data">Aucun résultat trouvé</div>';
            } else {
                resultsContainer.innerHTML = results.map(activity => this.renderActivityItem(activity)).join('');
            }
        };

        searchInput.addEventListener('input', performSearch);
        categoryFilter.addEventListener('change', performSearch);
    }

    /**
     * 🎨 Rendu d'un élément d'activité
     */
    renderActivityItem(activity) {
        return `
            <div class="activity-item">
                <div class="activity-info">
                    <span class="activity-category category-${activity.category}">
                        ${this.getCategoryIcon(activity.category)} ${this.getCategoryName(activity.category)}
                    </span>
                    <strong>${activity.action}</strong><br>
                    <small>${activity.details}</small>
                </div>
                <div class="activity-time">${this.formatDate(activity.timestamp)}</div>
            </div>
        `;
    }

    /**
     * 📊 Statistiques des sessions
     */
    getSessionStats(log) {
        const sessions = {};
        
        log.forEach(activity => {
            if (!sessions[activity.sessionId]) {
                sessions[activity.sessionId] = {
                    sessionId: activity.sessionId,
                    activities: [],
                    ip: null
                };
            }
            sessions[activity.sessionId].activities.push(activity);
        });

        return Object.values(sessions).map(session => {
            const sortedActivities = session.activities.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            return {
                sessionId: session.sessionId,
                activityCount: session.activities.length,
                firstActivity: sortedActivities[0].timestamp,
                lastActivity: sortedActivities[sortedActivities.length - 1].timestamp,
                ip: sortedActivities[0].data?.ip || 'Non disponible'
            };
        }).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
    }

    /**
     * 🎯 Icônes des catégories
     */
    getCategoryIcon(category) {
        const icons = {
            content: '📝',
            user: '👤',
            system: '⚙️',
            file: '📁',
            config: '🔧'
        };
        return icons[category] || '📋';
    }

    /**
     * 🏷️ Noms des catégories
     */
    getCategoryName(category) {
        const names = {
            content: 'Contenu',
            user: 'Utilisateur',
            system: 'Système',
            file: 'Fichier',
            config: 'Configuration'
        };
        return names[category] || category;
    }

    /**
     * 📅 Formatage des dates
     */
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * 🆕 Gestion des nouvelles activités
     */
    handleNewActivity(activity) {
        // Mise à jour en temps réel si on est sur la vue récente
        if (this.currentView === 'recent') {
            this.switchView('recent');
        }
    }

    /**
     * 📤 Modal d'export
     */
    showExportModal() {
        const modal = `
            <div id="export-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 30px; border-radius: 12px; max-width: 400px; width: 90%;">
                    <h3>📤 Exporter l'historique</h3>
                    <p>Choisissez le format d'export :</p>
                    <div style="margin: 20px 0;">
                        <button class="btn-export-format" data-format="json" style="margin-right: 10px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 6px;">JSON</button>
                        <button class="btn-export-format" data-format="csv" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 6px;">CSV</button>
                    </div>
                    <div style="text-align: right; margin-top: 20px;">
                        <button id="close-export-modal" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 6px;">Annuler</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);

        // Événements du modal
        document.querySelectorAll('.btn-export-format').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.logger.exportLog(e.target.dataset.format);
                document.getElementById('export-modal').remove();
            });
        });

        document.getElementById('close-export-modal').addEventListener('click', () => {
            document.getElementById('export-modal').remove();
        });
    }

    /**
     * 🔄 Actualisation automatique
     */
    startAutoRefresh() {
        setInterval(() => {
            if (this.currentView === 'recent' || this.currentView === 'overview') {
                this.switchView(this.currentView);
            }
        }, 30000); // Toutes les 30 secondes
    }
}

// 🌟 Export global
window.ActivityDashboard = ActivityDashboard;
