/**
 * 👥 GESTIONNAIRE DE PÉDAGOGUES - VERSION OPTIMISÉE
 * Interface d'administration - La Manufacture de Laurence
 */

class PedagogueManager {
    constructor() {
        this.pedagogues = [];
        this.currentPedagogue = null;
        this.timelineCounter = 0;
        this.apiBase = ADMIN_CONFIG.api.baseUrl;
        this.isLocalMode = false;
        
        this.init();
    }

    /**
     * Initialisation du gestionnaire
     */
    async init() {
        try {
            // Log de l'initialisation
            if (window.activityLogger) {
                window.activityLogger.logActivity('system', 'Gestionnaire Pédagogues initialisé', 'Chargement du module de gestion des pédagogues');
            }
            
            // Chargement de la configuration
            this.loadConfig();
            
            // Tentative de chargement via API
            await this.loadPedagogues();
            
            // Initialisation de l'interface
            this.bindEvents();
            this.renderPedagogues();
            this.setupImageUpload();
            this.setupWysiwyg();
            this.setupAutoSave();
            
        } catch (error) {
            console.error('Erreur d\'initialisation:', error);
            this.fallbackToLocalMode();
        }
    }

    /**
     * Chargement de la configuration
     */
    loadConfig() {
        if (typeof ADMIN_CONFIG === 'undefined') {
            console.warn('Configuration manquante, utilisation des valeurs par défaut');
            this.fallbackToLocalMode();
        }
    }

    /**
     * Mode de secours local
     */
    fallbackToLocalMode() {
        this.isLocalMode = true;
        this.showLocalModeWarning();
        this.pedagogues = this.getDefaultPedagogues();
        AdminUtils.storage.set('site_pedagogues', this.pedagogues);
    }

    /**
     * Chargement des pédagogues
     */
    async loadPedagogues() {
        if (this.isLocalMode) {
            this.pedagogues = AdminUtils.storage.get('site_pedagogues', this.getDefaultPedagogues());
            return;
        }

        try {
            const response = await this.apiCall('GET', 'pedagogues');
            this.pedagogues = response.data || this.getDefaultPedagogues();
            
        } catch (error) {
            console.warn('API non disponible, basculement en mode local:', error);
            this.fallbackToLocalMode();
        }
    }

    /**
     * Appel API générique avec gestion d'erreurs
     */
    async apiCall(method, endpoint, data = null) {
        const url = `${this.apiBase}?path=${endpoint}`;
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Sauvegarde des pédagogues
     */
    async savePedagogues() {
        if (this.isLocalMode) {
            AdminUtils.storage.set('site_pedagogues', this.pedagogues);
            AdminUtils.showMessage(ADMIN_CONFIG?.messages?.success?.save || '✅ Sauvegarde locale réussie', 'success');
            this.simulateSync();
            return;
        }

        try {
            const response = await this.apiCall('POST', 'pedagogues', {
                pedagogues: this.pedagogues
            });

            AdminUtils.showMessage(
                response.message || ADMIN_CONFIG?.messages?.success?.save || '✅ Sauvegarde réussie', 
                'success'
            );
            
            await this.syncToWebsite();
            
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            AdminUtils.showMessage(
                ADMIN_CONFIG?.messages?.error?.save || '❌ Erreur de sauvegarde', 
                'error'
            );
        }
    }

    /**
     * Synchronisation avec le site web
     */
    async syncToWebsite() {
        if (this.isLocalMode) {
            this.simulateSync();
            return;
        }

        try {
            await this.apiCall('POST', 'sync');
            AdminUtils.showMessage(
                ADMIN_CONFIG?.messages?.success?.sync || '✅ Site web mis à jour', 
                'success'
            );
            
        } catch (error) {
            console.warn('Erreur synchronisation:', error);
        }
    }

    /**
     * Simulation de synchronisation en mode local
     */
    simulateSync() {
        setTimeout(() => {
            AdminUtils.showMessage('⚠️ Synchronisation simulée - installer XAMPP pour une vraie sync', 'warning');
        }, 500);
    }

    /**
     * Affichage de l'avertissement mode local
     */
    showLocalModeWarning() {
        const warning = document.createElement('div');
        warning.id = 'local-mode-warning';
        warning.className = 'alert alert-warning';
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: var(--z-notification, 3000);
            margin: 0;
            border-radius: 0;
            text-align: center;
            font-weight: 600;
        `;
        
        warning.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <strong>MODE LOCAL</strong> - Les modifications ne sont que temporaires
            <br>
            <small>📋 Pour un fonctionnement complet, installer XAMPP (voir documentation)</small>
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
        `;
        
        document.body.insertBefore(warning, document.body.firstChild);
    }

    /**
     * Événements de l'interface
     */
    bindEvents() {
        // Bouton Ajouter Pédagogue
        const addBtn = document.getElementById('add-pedagogue-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openPedagogueModal());
        }

        // Fermer modal
        const closeBtn = document.getElementById('close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closePedagogueModal());
        }

        // Fermer modal en cliquant à l'extérieur
        const modal = document.getElementById('pedagogue-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closePedagogueModal();
            });
        }

        // Sauvegarder pédagogue
        const saveBtn = document.getElementById('save-pedagogue-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.savePedagogue());
        }

        // Ajouter étape timeline
        const addTimelineBtn = document.getElementById('add-timeline-btn');
        if (addTimelineBtn) {
            addTimelineBtn.addEventListener('click', () => this.addTimelineStep());
        }

        // Échap pour fermer modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closePedagogueModal();
        });
    }

    /**
     * Rendu de la liste des pédagogues
     */
    renderPedagogues() {
        const container = document.getElementById('pedagogues-list');
        if (!container) return;

        if (this.pedagogues.length === 0) {
            container.innerHTML = `
                <div class="text-center p-8">
                    <i class="fas fa-users fa-3x text-gray-400 mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-600 mb-2">Aucun pédagogue</h3>
                    <p class="text-gray-500 mb-4">Commencez par ajouter votre premier pédagogue</p>
                    <button onclick="pedagogueManager.openPedagogueModal()" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Ajouter un pédagogue
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.pedagogues.map(pedagogue => `
            <div class="card pedagogue-card" data-id="${pedagogue.id}">
                <div class="card-header">
                    <div class="d-flex align-center justify-between">
                        <div class="d-flex align-center" style="gap: 16px;">
                            <img src="${pedagogue.image}" alt="${pedagogue.name}" 
                                 class="pedagogue-avatar rounded-full" 
                                 style="width: 60px; height: 60px; object-fit: cover;">
                            <div>
                                <h3 class="font-semibold text-lg m-0">${pedagogue.name}</h3>
                                <p class="text-secondary m-0">${pedagogue.subtitle}</p>
                                ${pedagogue.timeline ? `<span class="badge badge-primary">${pedagogue.timeline.length} étapes</span>` : ''}
                            </div>
                        </div>
                        <div class="pedagogue-actions" style="gap: 8px;">
                            <button onclick="pedagogueManager.editPedagogue('${pedagogue.id}')" 
                                    class="btn btn-sm btn-outline" title="Modifier">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="pedagogueManager.deletePedagogue('${pedagogue.id}')" 
                                    class="btn btn-sm btn-danger" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <p class="text-gray-700">${AdminUtils.string.truncate(pedagogue.description, 150)}</p>
                    ${this.renderTimelinePreview(pedagogue.timeline)}
                </div>
            </div>
        `).join('');
    }

    /**
     * Aperçu de la timeline
     */
    renderTimelinePreview(timeline = []) {
        if (!timeline.length) return '';
        
        const recent = timeline.slice(0, 3);
        return `
            <div class="timeline-preview mt-3">
                <h4 class="text-sm font-medium text-gray-600 mb-2">
                    <i class="fas fa-clock"></i> Parcours récent
                </h4>
                <div class="timeline-items">
                    ${recent.map(step => `
                        <div class="timeline-item-preview">
                            <span class="timeline-year">${step.year}</span>
                            <span class="timeline-event">${AdminUtils.string.truncate(step.event, 50)}</span>
                        </div>
                    `).join('')}
                    ${timeline.length > 3 ? `<div class="text-xs text-gray-500">+${timeline.length - 3} autres...</div>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Configuration de l'upload d'images
     */
    setupImageUpload() {
        const input = document.getElementById('pedagogue-image-input');
        const preview = document.getElementById('image-preview');
        
        if (!input) return;

        input.addEventListener('change', async (e) => {
            try {
                const result = await AdminUtils.handleFileUpload(input, {
                    maxSizeMB: ADMIN_CONFIG?.ui?.maxFileSize / (1024 * 1024) || 5,
                    allowedTypes: ADMIN_CONFIG?.ui?.allowedImageTypes || ['jpg', 'jpeg', 'png', 'webp'],
                    preview: preview
                });

                AdminUtils.showMessage('✅ Image chargée avec succès', 'success');
                
            } catch (error) {
                AdminUtils.showMessage(error.message, 'error');
                input.value = '';
            }
        });
    }

    /**
     * Configuration de l'éditeur WYSIWYG
     */
    setupWysiwyg() {
        const textarea = document.getElementById('pedagogue-description');
        if (!textarea) return;

        // Création d'une barre d'outils simple
        if (!textarea.previousElementSibling?.classList.contains('wysiwyg-toolbar')) {
            const toolbar = document.createElement('div');
            toolbar.className = 'wysiwyg-toolbar';
            toolbar.innerHTML = `
                <button type="button" onclick="document.execCommand('bold')" title="Gras">
                    <i class="fas fa-bold"></i>
                </button>
                <button type="button" onclick="document.execCommand('italic')" title="Italique">
                    <i class="fas fa-italic"></i>
                </button>
                <button type="button" onclick="document.execCommand('underline')" title="Souligné">
                    <i class="fas fa-underline"></i>
                </button>
                <span class="toolbar-separator"></span>
                <button type="button" onclick="document.execCommand('justifyLeft')" title="Aligner à gauche">
                    <i class="fas fa-align-left"></i>
                </button>
                <button type="button" onclick="document.execCommand('justifyCenter')" title="Centrer">
                    <i class="fas fa-align-center"></i>
                </button>
                <button type="button" onclick="document.execCommand('justifyRight')" title="Aligner à droite">
                    <i class="fas fa-align-right"></i>
                </button>
            `;
            
            textarea.parentNode.insertBefore(toolbar, textarea);
        }
    }

    /**
     * Configuration de la sauvegarde automatique
     */
    setupAutoSave() {
        if (!ADMIN_CONFIG?.ui?.autoSave) return;

        const interval = ADMIN_CONFIG.ui.autoSaveInterval || 30000;
        
        setInterval(() => {
            if (this.hasUnsavedChanges()) {
                this.savePedagogues();
                AdminUtils.showMessage('💾 Sauvegarde automatique', 'info', 2000);
            }
        }, interval);
    }

    /**
     * Vérification des modifications non sauvegardées
     */
    hasUnsavedChanges() {
        // Logique simple : vérifier si des champs sont remplis dans le modal
        const modal = document.getElementById('pedagogue-modal');
        if (!modal || modal.style.display === 'none') return false;

        const name = document.getElementById('pedagogue-name')?.value.trim();
        const subtitle = document.getElementById('pedagogue-subtitle')?.value.trim();
        const description = document.getElementById('pedagogue-description')?.value.trim();

        return name || subtitle || description;
    }

    /**
     * Ouverture du modal pédagogue
     */
    openPedagogueModal(pedagogueId = null) {
        const modal = document.getElementById('pedagogue-modal');
        if (!modal) return;

        this.currentPedagogue = pedagogueId;
        
        if (pedagogueId) {
            this.loadPedagogueData(pedagogueId);
        } else {
            this.clearForm();
        }

        modal.style.display = 'flex';
        AdminUtils.animateIn(modal.querySelector('.modal-content'));
        
        // Focus sur le premier champ
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    /**
     * Chargement des données d'un pédagogue
     */
    loadPedagogueData(pedagogueId) {
        const pedagogue = this.pedagogues.find(p => p.id === pedagogueId);
        if (!pedagogue) return;

        document.getElementById('pedagogue-name').value = pedagogue.name || '';
        document.getElementById('pedagogue-subtitle').value = pedagogue.subtitle || '';
        document.getElementById('pedagogue-description').value = pedagogue.description || '';
        
        const preview = document.getElementById('image-preview');
        if (preview && pedagogue.image) {
            preview.src = pedagogue.image;
            preview.style.display = 'block';
        }

        this.renderTimeline(pedagogue.timeline || []);
    }

    /**
     * Fermeture du modal
     */
    closePedagogueModal() {
        const modal = document.getElementById('pedagogue-modal');
        if (!modal) return;

        modal.style.display = 'none';
        this.currentPedagogue = null;
        this.clearForm();
    }

    /**
     * Sauvegarde d'un pédagogue
     */
    savePedagogue() {
        const validation = AdminUtils.validateForm(
            document.getElementById('pedagogue-modal'),
            ADMIN_CONFIG?.validation?.pedagogue || {
                'pedagogue-name': { required: true, minLength: 2 },
                'pedagogue-subtitle': { required: true, minLength: 5 },
                'pedagogue-description': { required: true, minLength: 20 }
            }
        );

        if (!validation.isValid) {
            AdminUtils.showMessage('⚠️ Veuillez corriger les erreurs du formulaire', 'warning');
            return;
        }

        const pedagogue = {
            id: this.currentPedagogue || AdminUtils.string.slugify(document.getElementById('pedagogue-name').value),
            name: document.getElementById('pedagogue-name').value.trim(),
            subtitle: document.getElementById('pedagogue-subtitle').value.trim(),
            description: document.getElementById('pedagogue-description').value.trim(),
            image: document.getElementById('image-preview')?.src || ADMIN_CONFIG?.defaults?.pedagogue?.image || '../images/default-avatar.jpg',
            timeline: this.getTimelineData()
        };

        if (this.currentPedagogue) {
            const index = this.pedagogues.findIndex(p => p.id === this.currentPedagogue);
            if (index !== -1) {
                this.pedagogues[index] = pedagogue;
            }
        } else {
            this.pedagogues.push(pedagogue);
        }

        this.savePedagogues();
        this.renderPedagogues();
        this.closePedagogueModal();
        
        AdminUtils.showMessage(
            `✅ ${pedagogue.name} ${this.currentPedagogue ? 'modifié' : 'ajouté'} avec succès`, 
            'success'
        );
    }

    /**
     * Modification d'un pédagogue
     */
    editPedagogue(id) {
        this.openPedagogueModal(id);
    }

    /**
     * Suppression d'un pédagogue
     */
    deletePedagogue(id) {
        const pedagogue = this.pedagogues.find(p => p.id === id);
        if (!pedagogue) return;

        if (confirm(`Êtes-vous sûr de vouloir supprimer ${pedagogue.name} ?`)) {
            this.pedagogues = this.pedagogues.filter(p => p.id !== id);
            this.savePedagogues();
            this.renderPedagogues();
            AdminUtils.showMessage(`✅ ${pedagogue.name} supprimé`, 'success');
        }
    }

    /**
     * Ajout d'une étape timeline
     */
    addTimelineStep() {
        const container = document.getElementById('timeline-container');
        if (!container) return;

        const stepDiv = document.createElement('div');
        stepDiv.className = 'timeline-step';
        stepDiv.innerHTML = `
            <div class="form-group">
                <input type="number" placeholder="Année" class="form-control timeline-year" 
                       min="1900" max="2030" style="width: 120px;">
            </div>
            <div class="form-group" style="flex: 1;">
                <input type="text" placeholder="Événement" class="form-control timeline-event">
            </div>
            <button type="button" onclick="this.parentNode.remove()" 
                    class="btn btn-sm btn-danger" title="Supprimer">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(stepDiv);
        
        // Focus sur le champ année
        const yearInput = stepDiv.querySelector('.timeline-year');
        if (yearInput) yearInput.focus();
    }

    /**
     * Rendu de la timeline
     */
    renderTimeline(timeline = []) {
        const container = document.getElementById('timeline-container');
        if (!container) return;

        container.innerHTML = '';
        
        timeline.forEach(step => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'timeline-step';
            stepDiv.innerHTML = `
                <div class="form-group">
                    <input type="number" placeholder="Année" class="form-control timeline-year" 
                           value="${step.year}" min="1900" max="2030" style="width: 120px;">
                </div>
                <div class="form-group" style="flex: 1;">
                    <input type="text" placeholder="Événement" class="form-control timeline-event" 
                           value="${step.event}">
                </div>
                <button type="button" onclick="this.parentNode.remove()" 
                        class="btn btn-sm btn-danger" title="Supprimer">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(stepDiv);
        });
    }

    /**
     * Récupération des données timeline
     */
    getTimelineData() {
        const steps = document.querySelectorAll('.timeline-step');
        return Array.from(steps)
            .map(step => ({
                year: step.querySelector('.timeline-year').value,
                event: step.querySelector('.timeline-event').value.trim()
            }))
            .filter(step => step.year && step.event)
            .sort((a, b) => parseInt(b.year) - parseInt(a.year)); // Tri par année décroissante
    }

    /**
     * Nettoyage du formulaire
     */
    clearForm() {
        document.getElementById('pedagogue-name').value = '';
        document.getElementById('pedagogue-subtitle').value = '';
        document.getElementById('pedagogue-description').value = '';
        document.getElementById('pedagogue-image-input').value = '';
        
        const preview = document.getElementById('image-preview');
        if (preview) {
            preview.style.display = 'none';
            preview.src = '';
        }

        document.getElementById('timeline-container').innerHTML = '';
        
        // Supprimer les messages d'erreur
        document.querySelectorAll('.form-error').forEach(error => error.remove());
        document.querySelectorAll('.form-control.error').forEach(input => input.classList.remove('error'));
    }

    /**
     * Token d'authentification
     */
    getAuthToken() {
        return AdminUtils.storage.get(ADMIN_CONFIG?.auth?.sessionKey || 'admin_token', 'demo_token');
    }

    /**
     * Données par défaut
     */
    getDefaultPedagogues() {
        return [
            {
                id: 'laurence',
                name: 'Laurence',
                subtitle: 'Fondatrice & Directrice Pédagogique',
                description: 'Passionnée par la transmission du savoir musical, Laurence a créé La Manufacture pour offrir un enseignement musical innovant et personnalisé.',
                image: '../images/laurence.jpg',
                timeline: [
                    { year: '2020', event: 'Création de La Manufacture de Laurence' },
                    { year: '2018', event: 'Formation en pédagogie musicale avancée' },
                    { year: '2015', event: 'Diplôme de Conservatoire en piano' }
                ]
            },
            {
                id: 'adrien',
                name: 'Adrien',
                subtitle: 'Professeur de Guitare & Basse',
                description: 'Musicien polyvalent avec plus de 10 ans d\'expérience, Adrien transmet sa passion pour les cordes avec patience et créativité.',
                image: '../images/adrien.jpg',
                timeline: [
                    { year: '2022', event: 'Rejoint l\'équipe de La Manufacture' },
                    { year: '2020', event: 'Formation en pédagogie musicale' },
                    { year: '2015', event: 'Diplôme en guitare classique' }
                ]
            },
            {
                id: 'ilan',
                name: 'Ilan',
                subtitle: 'Professeur de Batterie & Percussions',
                description: 'Spécialiste des rythmes et des percussions, Ilan apporte une énergie contagieuse à ses cours et développe le sens rythmique de ses élèves.',
                image: '../images/ilan.jpg',
                timeline: [
                    { year: '2021', event: 'Rejoint l\'équipe de La Manufacture' },
                    { year: '2019', event: 'Formation en percussions modernes' },
                    { year: '2017', event: 'Diplôme en batterie jazz' }
                ]
            }
        ];
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    if (typeof pedagogueManager === 'undefined') {
        window.pedagogueManager = new PedagogueManager();
    }
});
