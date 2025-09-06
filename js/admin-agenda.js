/* ========================================
   JavaScript pour l'interface d'administration
   ======================================== */

class AdminAgenda {
    constructor() {
        this.events = [];
        this.currentTab = 'create';
        this.eventDrafts = [];
        this.analysisResults = null;
        this.storage = null;
        
        this.init();
    }

    checkAuthentication() {
        const savedPassword = localStorage.getItem('adminPassword') || 'manufacture2025';
        const enteredPassword = prompt("🔒 Accès Administration - Mot de passe pédagogue:");
        
        if (enteredPassword === null) {
            // L'utilisateur a annulé
            window.location.href = '../agenda.html';
            return false;
        }
        
        if (enteredPassword === savedPassword) {
            return true;
        } else {
            alert("❌ Mot de passe incorrect");
            window.location.href = '../agenda.html';
            return false;
        }
    }

    async init() {
        // Vérifier l'authentification avant d'initialiser
        if (!this.checkAuthentication()) {
            return; // Arrêter l'initialisation si pas authentifié
        }
        
        // Initialiser le système de stockage
        await this.initStorage();
        
        // Charger les données
        await this.loadData();
        
        // Initialiser l'interface
        this.setupEventListeners();
        this.setupTabNavigation();
        this.setupFormFeatures();
        this.updateStatistics();
        this.renderEventsTable();
        this.loadSettings();
    }

    async initStorage() {
        try {
            this.storage = new StorageManager();
            await this.storage.init();
            
            // Vérifier si migration nécessaire
            const migrationCompleted = await this.storage.getSetting('migrationCompleted');
            if (!migrationCompleted) {
                await this.storage.migrateFromLocalStorage();
                this.showNotification('📦 Migration des données vers le nouveau système de stockage terminée !', 'success');
            }
            
            console.log('Système de stockage IndexedDB initialisé');
            
        } catch (error) {
            console.error('Erreur IndexedDB, fallback vers localStorage:', error);
            this.storage = await this.storage.fallbackToLocalStorage();
            this.showNotification('⚠️ Utilisation du stockage de base (localStorage)', 'warning');
        }
    }

    async loadData() {
        try {
            this.events = await this.storage.getEvents();
            
            // Charger les images associées
            for (const event of this.events) {
                if (event.imageId) {
                    const image = await this.storage.getImage(event.imageId);
                    if (image) {
                        event.imageUrl = image.url;
                    }
                }
            }
            
        } catch (error) {
            console.error('Erreur chargement données:', error);
            this.events = [];
        }
    }

    setupEventListeners() {
        // Navigation des onglets
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Formulaire principal
        const form = document.getElementById('advancedEventForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Upload d'image
        const imageUpload = document.getElementById('imageUploadArea');
        const fileInput = document.getElementById('eventImage');
        
        if (imageUpload && fileInput) {
            imageUpload.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Analyse d'affiche
        this.setupPosterAnalysis();

        // Paramètres avancés
        this.setupAdvancedSettings();
        
        // Palette de couleurs
        this.setupColorPalette();
        
        // Filtres et recherche
        this.setupSearchAndFilters();
        
        // Import/Export
        this.setupImportExport();
    }

    setupTabNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Enlever active de tous les éléments
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
                
                // Ajouter active à l'élément cliqué
                e.currentTarget.classList.add('active');
                const tabId = e.currentTarget.dataset.tab;
                document.getElementById('tab-' + tabId).classList.add('active');
                
                this.currentTab = tabId;
            });
        });
    }

    setupFormFeatures() {
        // Récurrence
        const recurringCheckbox = document.getElementById('eventRecurring');
        const recurringOptions = document.getElementById('recurringOptions');
        
        if (recurringCheckbox && recurringOptions) {
            recurringCheckbox.addEventListener('change', (e) => {
                recurringOptions.style.display = e.target.checked ? 'flex' : 'none';
            });
        }

        // Réservation
        const bookingCheckbox = document.getElementById('eventRequiresBooking');
        const bookingSettings = document.getElementById('bookingSettings');
        
        if (bookingCheckbox && bookingSettings) {
            bookingCheckbox.addEventListener('change', (e) => {
                bookingSettings.style.display = e.target.checked ? 'block' : 'none';
            });
        }

        // Type d'événement - couleur automatique
        const eventType = document.getElementById('eventType');
        const eventColor = document.getElementById('eventColor');
        
        if (eventType && eventColor) {
            eventType.addEventListener('change', (e) => {
                const typeColors = {
                    'cours': '#8b0000',
                    'spectacle': '#b87333',
                    'audition': '#2c3e50',
                    'atelier': '#228b22',
                    'reunion': '#4a4a4a',
                    'masterclass': '#8b008b',
                    'portes-ouvertes': '#ff8c00',
                    'autre': '#20b2aa'
                };
                
                if (typeColors[e.target.value]) {
                    eventColor.value = typeColors[e.target.value];
                }
            });
        }
    }

    setupAdvancedSettings() {
        // Configuration des différents paramètres avancés
        const settings = [
            'eventRecurring',
            'eventNotification', 
            'eventPublic',
            'eventRequiresBooking'
        ];

        settings.forEach(settingId => {
            const element = document.getElementById(settingId);
            if (element) {
                element.addEventListener('change', () => this.saveFormDraft());
            }
        });
    }

    setupColorPalette() {
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                e.preventDefault();
                const color = e.target.dataset.color;
                document.getElementById('eventColor').value = color;
            });
        });
    }

    setupSearchAndFilters() {
        const searchInput = document.getElementById('searchEvents');
        const filterType = document.getElementById('filterType');
        const filterPeriod = document.getElementById('filterPeriod');

        [searchInput, filterType, filterPeriod].forEach(element => {
            if (element) {
                element.addEventListener('input', () => this.filterEvents());
            }
        });
    }

    setupImportExport() {
        // CSV Import
        const csvImport = document.getElementById('csvImport');
        if (csvImport) {
            csvImport.addEventListener('change', (e) => this.handleCSVImport(e));
        }

        // ICS Import
        const icsImport = document.getElementById('icsImport');
        if (icsImport) {
            icsImport.addEventListener('change', (e) => this.handleICSImport(e));
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = this.getFormData();
        
        if (!this.validateFormData(formData)) {
            return;
        }

        try {
            // Créer l'événement ou les événements récurrents
            const events = this.createEventsFromForm(formData);
            
            // Gérer l'image si présente
            const imageElement = document.getElementById('previewImg');
            let imageId = null;
            
            if (imageElement && imageElement.dataset.imageId) {
                imageId = imageElement.dataset.imageId;
                
                // Mettre à jour l'eventId de l'image
                const image = await this.storage.getImage(imageId);
                if (image) {
                    image.eventId = events[0].id; // Associer à l'événement principal
                    await this.storage.saveImage(image);
                }
            }
            
            // Sauvegarder les événements
            for (const event of events) {
                if (imageId) {
                    event.imageId = imageId;
                }
                await this.storage.saveEvent(event);
                this.events.push(event);
            }
            
            this.updateStatistics();
            this.renderEventsTable();
            this.resetForm();
            
            this.showNotification('✅ ' + events.length + ' événement(s) créé(s) avec succès!', 'success');
            
        } catch (error) {
            console.error('Erreur sauvegarde événement:', error);
            this.showNotification('❌ Erreur lors de la sauvegarde', 'error');
        }
    }

    getFormData() {
        return {
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            startTime: document.getElementById('eventStartTime').value,
            endTime: document.getElementById('eventEndTime').value,
            location: document.getElementById('eventLocation').value,
            description: document.getElementById('eventDescription').value,
            type: document.getElementById('eventType').value,
            color: document.getElementById('eventColor').value,
            image: document.getElementById('previewImg')?.src || null,
            recurring: document.getElementById('eventRecurring').checked,
            recurringType: document.getElementById('recurringType').value,
            recurringCount: parseInt(document.getElementById('recurringCount').value),
            notification: document.getElementById('eventNotification').checked,
            public: document.getElementById('eventPublic').checked,
            requiresBooking: document.getElementById('eventRequiresBooking').checked,
            maxParticipants: document.getElementById('maxParticipants').value,
            bookingDeadline: document.getElementById('bookingDeadline').value
        };
    }

    validateFormData(data) {
        if (!data.title.trim()) {
            this.showNotification('❌ Le titre est obligatoire', 'error');
            return false;
        }
        
        if (!data.date) {
            this.showNotification('❌ La date est obligatoire', 'error');
            return false;
        }
        
        if (!data.startTime) {
            this.showNotification('❌ L\'heure de début est obligatoire', 'error');
            return false;
        }
        
        if (!data.type) {
            this.showNotification('❌ Le type d\'événement est obligatoire', 'error');
            return false;
        }

        return true;
    }

    createEventsFromForm(data) {
        const events = [];
        const baseEvent = {
            id: this.generateId(),
            title: data.title,
            location: data.location,
            description: data.description,
            type: data.type,
            color: data.color,
            image: data.image,
            notification: data.notification,
            public: data.public,
            requiresBooking: data.requiresBooking,
            maxParticipants: data.maxParticipants,
            bookingDeadline: data.bookingDeadline,
            createdAt: new Date().toISOString()
        };

        if (data.recurring && data.recurringCount > 1) {
            // Créer des événements récurrents
            for (let i = 0; i < data.recurringCount; i++) {
                const eventDate = new Date(data.date);
                
                switch (data.recurringType) {
                    case 'weekly':
                        eventDate.setDate(eventDate.getDate() + (i * 7));
                        break;
                    case 'biweekly':
                        eventDate.setDate(eventDate.getDate() + (i * 14));
                        break;
                    case 'monthly':
                        eventDate.setMonth(eventDate.getMonth() + i);
                        break;
                }

                events.push({
                    ...baseEvent,
                    id: this.generateId(),
                    date: eventDate.toISOString().split('T')[0],
                    startTime: data.startTime,
                    endTime: data.endTime,
                    seriesId: baseEvent.id
                });
            }
        } else {
            // Événement unique
            events.push({
                ...baseEvent,
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime
            });
        }

        return events;
    }

    async handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Vérifier la taille (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('❌ L\'image doit faire moins de 5MB', 'error');
            return;
        }

        // Vérifier le type
        if (!file.type.startsWith('image/')) {
            this.showNotification('❌ Veuillez sélectionner une image valide', 'error');
            return;
        }

        try {
            // Sauvegarder l'image avec le nouveau système
            const imageData = {
                blob: file,
                filename: file.name,
                type: file.type,
                size: file.size,
                eventId: 'temp' // Sera mis à jour lors de la création de l'événement
            };
            
            const savedImage = await this.storage.saveImage(imageData);
            
            // Afficher l'aperçu
            const preview = document.getElementById('imagePreview');
            const placeholder = document.querySelector('.upload-placeholder');
            const img = document.getElementById('previewImg');
            
            img.src = savedImage.url || URL.createObjectURL(file);
            img.dataset.imageId = savedImage.id;
            placeholder.style.display = 'none';
            preview.style.display = 'block';
            
            this.showNotification('📸 Image chargée avec succès', 'success');
            
        } catch (error) {
            console.error('Erreur sauvegarde image:', error);
            this.showNotification('❌ Erreur lors du chargement de l\'image', 'error');
        }
    }

    setupPosterAnalysis() {
        const posterUpload = document.getElementById('posterUploadArea');
        const posterFile = document.getElementById('posterFile');
        
        if (posterUpload && posterFile) {
            // Click sur la zone d'upload
            posterUpload.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-apply-analysis')) {
                    posterFile.click();
                }
            });
            
            // Drag and drop
            posterUpload.addEventListener('dragover', (e) => {
                e.preventDefault();
                posterUpload.style.borderColor = '#0056b3';
                posterUpload.style.background = 'rgba(255, 255, 255, 0.95)';
            });
            
            posterUpload.addEventListener('dragleave', (e) => {
                e.preventDefault();
                posterUpload.style.borderColor = '#007bff';
                posterUpload.style.background = 'rgba(255, 255, 255, 0.8)';
            });
            
            posterUpload.addEventListener('drop', (e) => {
                e.preventDefault();
                posterUpload.style.borderColor = '#007bff';
                posterUpload.style.background = 'rgba(255, 255, 255, 0.8)';
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handlePosterUpload(files[0]);
                }
            });
            
            posterFile.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handlePosterUpload(e.target.files[0]);
                }
            });
        }
    }

    async handlePosterUpload(file) {
        // Vérifications
        if (!file) return;
        
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            this.showNotification('❌ Format non supporté. Utilisez JPG, PNG ou PDF', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB max
            this.showNotification('❌ Fichier trop volumineux (max 10MB)', 'error');
            return;
        }
        
        // Afficher la progression
        this.showAnalysisProgress();
        
        try {
            // Si c'est un PDF, on ne peut pas l'analyser directement avec Tesseract
            if (file.type === 'application/pdf') {
                this.showNotification('📄 Les PDF nécessitent une conversion. Utilisez une image JPG/PNG de votre affiche.', 'warning');
                this.hideAnalysisProgress();
                return;
            }
            
            // Créer l'aperçu
            const reader = new FileReader();
            reader.onload = async (e) => {
                const img = document.getElementById('posterPreviewImg');
                img.src = e.target.result;
                
                // Lancer l'analyse OCR
                await this.analyzePoster(e.target.result);
            };
            reader.readAsDataURL(file);
            
        } catch (error) {
            console.error('Erreur lors de l\'analyse:', error);
            this.showNotification('❌ Erreur lors de l\'analyse de l\'affiche', 'error');
            this.hideAnalysisProgress();
        }
    }

    async analyzePoster(imageSrc) {
        let worker = null;
        
        try {
            this.updateProgress(5, 'Vérification de la connectivité...');
            
            // Test de connectivité pour Tesseract
            try {
                await fetch('https://unpkg.com/tesseract.js-core@v4.0.4/tesseract-core.wasm.js', { 
                    method: 'HEAD',
                    mode: 'no-cors'
                });
            } catch (e) {
                throw new Error('NETWORK_ERROR');
            }
            
            this.updateProgress(10, 'Initialisation de l\'OCR...');
            
            // Vérification de la taille de l'image
            const img = new Image();
            img.src = imageSrc;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error('IMAGE_CORRUPTED'));
            });
            
            if (img.width * img.height > 4000000) { // > 4MP
                throw new Error('IMAGE_TOO_LARGE');
            }
            
            this.updateProgress(15, 'Création du worker OCR...');
            
            // Configuration Tesseract avec gestion d'erreurs améliorée
            try {
                worker = await Tesseract.createWorker('fra', 1, {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            const progress = Math.round(m.progress * 60) + 20; // 20-80%
                            this.updateProgress(progress, 'Analyse du texte en cours...');
                        } else if (m.status === 'loading tesseract core') {
                            this.updateProgress(18, 'Chargement du moteur OCR...');
                        } else if (m.status === 'initializing tesseract') {
                            this.updateProgress(19, 'Initialisation...');
                        }
                    },
                    errorHandler: (err) => {
                        console.error('Erreur Tesseract:', err);
                    }
                });
            } catch (e) {
                if (e.message.includes('network') || e.message.includes('fetch')) {
                    throw new Error('TESSERACT_DOWNLOAD_FAILED');
                } else if (e.message.includes('memory') || e.message.includes('allocation')) {
                    throw new Error('INSUFFICIENT_MEMORY');
                } else {
                    throw new Error('TESSERACT_INIT_FAILED');
                }
            }
            
            this.updateProgress(80, 'Reconnaissance du texte...');
            
            // Reconnaissance OCR avec timeout
            const recognitionPromise = worker.recognize(imageSrc, {
                rectangle: { top: 0, left: 0, width: img.width, height: img.height }
            });
            
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('OCR_TIMEOUT')), 30000); // 30s timeout
            });
            
            const { data: { text, confidence } } = await Promise.race([
                recognitionPromise,
                timeoutPromise
            ]);
            
            this.updateProgress(90, 'Traitement des résultats...');
            
            // Vérifier la qualité de la reconnaissance
            if (confidence < 30) {
                console.warn('Confiance OCR faible:', confidence);
                this.showNotification('⚠️ Qualité de reconnaissance faible (' + Math.round(confidence) + '%). Résultats approximatifs.', 'warning');
            }
            
            if (!text || text.trim().length < 10) {
                throw new Error('NO_TEXT_DETECTED');
            }
            
            // Analyser le texte extrait
            const extractedInfo = this.parseExtractedText(text);
            
            this.updateProgress(100, 'Analyse terminée !');
            
            // Afficher les résultats
            this.displayAnalysisResults(extractedInfo, text, confidence);
            
            await worker.terminate();
            
        } catch (error) {
            console.error('Erreur complète OCR:', error);
            
            if (worker) {
                try {
                    await worker.terminate();
                } catch (e) {
                    console.error('Erreur lors de la fermeture du worker:', e);
                }
            }
            
            // Messages d'erreur détaillés
            let errorMessage = '';
            let errorType = 'error';
            
            switch (error.message) {
                case 'NETWORK_ERROR':
                    errorMessage = '🌐 Pas de connexion internet. L\'analyse OCR nécessite une connexion pour télécharger les fichiers de langue.';
                    break;
                    
                case 'IMAGE_CORRUPTED':
                    errorMessage = '🖼️ Image corrompue ou format non supporté. Essayez avec une autre image.';
                    break;
                    
                case 'IMAGE_TOO_LARGE':
                    errorMessage = '📏 Image trop grande. Réduisez la résolution à moins de 2000x2000 pixels.';
                    break;
                    
                case 'TESSERACT_DOWNLOAD_FAILED':
                    errorMessage = '📡 Échec du téléchargement des composants OCR. Vérifiez votre connexion internet.';
                    break;
                    
                case 'INSUFFICIENT_MEMORY':
                    errorMessage = '💾 Mémoire insuffisante. Fermez d\'autres onglets et réessayez avec une image plus petite.';
                    break;
                    
                case 'TESSERACT_INIT_FAILED':
                    errorMessage = '⚙️ Échec d\'initialisation de l\'OCR. Votre navigateur peut être incompatible ou trop ancien.';
                    break;
                    
                case 'OCR_TIMEOUT':
                    errorMessage = '⏱️ Analyse trop longue (timeout). Essayez avec une image plus petite ou de meilleure qualité.';
                    break;
                    
                case 'NO_TEXT_DETECTED':
                    errorMessage = '🔍 Aucun texte détecté sur l\'image. Vérifiez que l\'affiche contient du texte lisible.';
                    errorType = 'warning';
                    break;
                    
                default:
                    errorMessage = '❌ Erreur technique: ' + error.message + '. Essayez de recharger la page.';
            }
            
            this.showNotification(errorMessage, errorType);
            this.hideAnalysisProgress();
            
            // Réafficher la zone d'upload pour permettre un nouvel essai
            const placeholder = document.querySelector('.poster-upload-placeholder');
            if (placeholder) {
                placeholder.style.display = 'flex';
            }
        }
    }

    parseExtractedText(text) {
        const info = {
            title: null,
            date: null,
            time: null,
            location: null,
            type: null,
            rawText: text
        };
        
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        // Détection du titre (souvent la première ligne en gros)
        if (lines.length > 0) {
            info.title = lines[0];
        }
        
        // Expressions régulières pour dates
        const datePatterns = [
            /(\d{1,2})\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s*(\d{4})/i,
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
            /(\d{1,2})-(\d{1,2})-(\d{4})/,
            /(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\s*(\d{1,2})\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i
        ];
        
        // Expressions régulières pour heures
        const timePatterns = [
            /(\d{1,2})[h:](\d{2})/,
            /(\d{1,2})\s*h\s*(\d{2})?/,
            /(\d{1,2}):(\d{2})/,
            /(\d{1,2})\s*(h|heures?)/i
        ];
        
        // Recherche dans tout le texte
        for (const line of lines) {
            // Recherche de dates
            for (const pattern of datePatterns) {
                const match = line.match(pattern);
                if (match && !info.date) {
                    info.date = this.convertToDate(match);
                }
            }
            
            // Recherche d'heures
            for (const pattern of timePatterns) {
                const match = line.match(pattern);
                if (match && !info.time) {
                    const hour = match[1];
                    const minute = match[2] || '00';
                    info.time = hour.padStart(2, '0') + ':' + minute.padStart(2, '0');
                }
            }
            
            // Recherche de lieux (mots-clés)
            const locationKeywords = ['théâtre', 'salle', 'auditorium', 'studio', 'centre', 'maison', 'espace'];
            for (const keyword of locationKeywords) {
                if (line.toLowerCase().includes(keyword) && !info.location) {
                    info.location = line;
                }
            }
            
            // Détection du type
            const typeKeywords = {
                'spectacle': ['spectacle', 'représentation', 'pièce'],
                'cours': ['cours', 'leçon', 'formation'],
                'atelier': ['atelier', 'workshop'],
                'audition': ['audition', 'casting'],
                'concert': ['concert', 'récital']
            };
            
            for (const [type, keywords] of Object.entries(typeKeywords)) {
                for (const keyword of keywords) {
                    if (line.toLowerCase().includes(keyword) && !info.type) {
                        info.type = type;
                    }
                }
            }
        }
        
        return info;
    }

    convertToDate(match) {
        const months = {
            'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
            'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
            'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
        };
        
        // Format français: jour mois année
        if (match[2] && months[match[2].toLowerCase()]) {
            const day = match[1].padStart(2, '0');
            const month = months[match[2].toLowerCase()];
            const year = match[3];
            return year + '-' + month + '-' + day;
        }
        
        // Format numérique: jour/mois/année
        if (match[1] && match[2] && match[3]) {
            const day = match[1].padStart(2, '0');
            const month = match[2].padStart(2, '0');
            const year = match[3];
            return year + '-' + month + '-' + day;
        }
        
        return null;
    }

    displayAnalysisResults(info, rawText, confidence) {
        this.analysisResults = info;
        
        const detectedInfo = document.getElementById('detectedInfo');
        const analysisResults = document.getElementById('analysisResults');
        const posterPreview = document.getElementById('posterPreview');
        
        let resultsHTML = '';
        
        // Indicateur de qualité
        if (confidence !== undefined) {
            const qualityClass = confidence > 70 ? 'high' : confidence > 40 ? 'medium' : 'low';
            resultsHTML += '<div class="quality-indicator quality-' + qualityClass + '">' +
                '<span class="quality-label">Qualité de reconnaissance:</span>' +
                '<span class="quality-value">' + Math.round(confidence) + '%</span>' +
            '</div>';
        }
        
        if (info.title) {
            resultsHTML += '<div class="detected-item">' +
                '<span class="detected-label">📝 Titre:</span>' +
                '<span class="detected-value">' + info.title + '</span>' +
            '</div>';
        }
        
        if (info.date) {
            const formattedDate = new Date(info.date).toLocaleDateString('fr-FR');
            resultsHTML += '<div class="detected-item">' +
                '<span class="detected-label">📅 Date:</span>' +
                '<span class="detected-value">' + formattedDate + '</span>' +
            '</div>';
        }
        
        if (info.time) {
            resultsHTML += '<div class="detected-item">' +
                '<span class="detected-label">🕐 Heure:</span>' +
                '<span class="detected-value">' + info.time + '</span>' +
            '</div>';
        }
        
        if (info.location) {
            resultsHTML += '<div class="detected-item">' +
                '<span class="detected-label">📍 Lieu:</span>' +
                '<span class="detected-value">' + info.location + '</span>' +
            '</div>';
        }
        
        if (info.type) {
            resultsHTML += '<div class="detected-item">' +
                '<span class="detected-label">🏷️ Type:</span>' +
                '<span class="detected-value">' + info.type + '</span>' +
            '</div>';
        }
        
        if (!resultsHTML || (!info.title && !info.date && !info.time && !info.location && !info.type)) {
            resultsHTML += '<div class="no-results"><p style="color: #6c757d; font-style: italic;">❌ Aucune information automatiquement détectée.</p>';
            resultsHTML += '<p style="color: #6c757d; font-size: 0.9rem;">💡 Conseils: Vérifiez que le texte sur l\'affiche est net et contrasté.</p>';
            resultsHTML += '<details style="margin-top: 1rem;"><summary style="cursor: pointer; color: #007bff;">🔍 Voir le texte brut détecté</summary>';
            resultsHTML += '<pre style="background: #f8f9fa; padding: 1rem; border-radius: 4px; font-size: 0.8rem; max-height: 200px; overflow-y: auto;">' + (rawText || 'Aucun texte détecté') + '</pre></details></div>';
        }
        
        detectedInfo.innerHTML = resultsHTML;
        
        // Afficher la section des résultats
        this.hideAnalysisProgress();
        posterPreview.style.display = 'flex';
        
        const message = (info.title || info.date || info.time || info.location || info.type) 
            ? '🤖 Analyse terminée ! Vérifiez les informations détectées.' 
            : '🔍 Analyse terminée. Aucune information détectée automatiquement.';
            
        this.showNotification(message, 'success');
    }

    showAnalysisProgress() {
        const placeholder = document.querySelector('.poster-upload-placeholder');
        const progress = document.getElementById('analysisProgress');
        const preview = document.getElementById('posterPreview');
        
        placeholder.style.display = 'none';
        preview.style.display = 'none';
        progress.style.display = 'block';
        
        this.updateProgress(0, 'Préparation...');
    }

    hideAnalysisProgress() {
        const progress = document.getElementById('analysisProgress');
        progress.style.display = 'none';
    }

    updateProgress(percent, text) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            progressFill.style.width = percent + '%';
        }
        if (progressText) {
            progressText.textContent = text;
        }
    }

    removeImage() {
        const preview = document.getElementById('imagePreview');
        const placeholder = document.querySelector('.upload-placeholder');
        const fileInput = document.getElementById('eventImage');
        
        preview.style.display = 'none';
        placeholder.style.display = 'flex';
        fileInput.value = '';
    }

    saveDraft() {
        const formData = this.getFormData();
        const draft = {
            id: Date.now(),
            data: formData,
            savedAt: new Date().toISOString()
        };
        
        this.eventDrafts.push(draft);
        localStorage.setItem('eventDrafts', JSON.stringify(this.eventDrafts));
        
        this.showNotification('💾 Brouillon sauvegardé', 'info');
    }

    saveFormDraft() {
        // Sauvegarde automatique toutes les 30 secondes
        clearTimeout(this.draftTimer);
        this.draftTimer = setTimeout(() => {
            this.saveDraft();
        }, 30000);
    }

    resetForm() {
        document.getElementById('advancedEventForm').reset();
        this.removeImage();
        
        // Réinitialiser les sections conditionnelles
        document.getElementById('recurringOptions').style.display = 'none';
        document.getElementById('bookingSettings').style.display = 'none';
    }

    previewEvent() {
        const formData = this.getFormData();
        
        if (!this.validateFormData(formData)) {
            return;
        }

        // Créer une modal de prévisualisation
        const modal = document.createElement('div');
        modal.className = 'preview-modal';
        
        // Construction du HTML de manière compatible
        let previewHTML = '<div class="preview-content">';
        previewHTML += '<div class="preview-header">';
        previewHTML += '<h3>👁️ Aperçu de l\'événement</h3>';
        previewHTML += '<button onclick="this.closest(\'.preview-modal\').remove()" class="close-btn">×</button>';
        previewHTML += '</div>';
        previewHTML += '<div class="preview-body">';
        
        if (formData.image) {
            previewHTML += '<img src="' + formData.image + '" alt="Image événement" style="max-width: 200px; border-radius: 8px;">';
        }
        
        previewHTML += '<h4 style="color: ' + formData.color + '">' + formData.title + '</h4>';
        previewHTML += '<p><strong>📅 Date:</strong> ' + new Date(formData.date).toLocaleDateString('fr-FR') + '</p>';
        previewHTML += '<p><strong>🕐 Horaire:</strong> ' + formData.startTime;
        if (formData.endTime) {
            previewHTML += ' - ' + formData.endTime;
        }
        previewHTML += '</p>';
        
        if (formData.location) {
            previewHTML += '<p><strong>📍 Lieu:</strong> ' + formData.location + '</p>';
        }
        
        previewHTML += '<p><strong>🏷️ Type:</strong> ' + formData.type + '</p>';
        
        if (formData.description) {
            previewHTML += '<p><strong>📝 Description:</strong> ' + formData.description + '</p>';
        }
        
        previewHTML += '<div class="preview-badges">';
        previewHTML += formData.public ? '<span class="badge badge-public">Public</span>' : '<span class="badge badge-private">Privé</span>';
        if (formData.requiresBooking) {
            previewHTML += '<span class="badge badge-booking">Réservation requise</span>';
        }
        if (formData.recurring) {
            previewHTML += '<span class="badge badge-recurring">Récurrent</span>';
        }
        previewHTML += '</div>';
        previewHTML += '</div>';
        previewHTML += '<div class="preview-actions">';
        previewHTML += '<button onclick="this.closest(\'.preview-modal\').remove()" class="btn-secondary">Fermer</button>';
        previewHTML += '</div>';
        previewHTML += '</div>';
        
        modal.innerHTML = previewHTML;
        
        document.body.appendChild(modal);
    }

    updateStatistics() {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const totalEvents = this.events.length;
        const upcomingEvents = this.events.filter(event => new Date(event.date) >= now).length;
        const thisMonthEvents = this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= thisMonth && eventDate < new Date(now.getFullYear(), now.getMonth() + 1, 1);
        }).length;

        document.getElementById('totalEvents').textContent = totalEvents;
        document.getElementById('upcomingEvents').textContent = upcomingEvents;
        document.getElementById('thisMonthEvents').textContent = thisMonthEvents;
    }

    renderEventsTable() {
        const tbody = document.getElementById('eventsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.events
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(event => {
                const row = document.createElement('tr');
                
                // Construction compatible du HTML
                let rowHTML = '<td>' + new Date(event.date).toLocaleDateString('fr-FR') + '</td>';
                rowHTML += '<td>';
                rowHTML += '<div style="display: flex; align-items: center; gap: 0.5rem;">';
                rowHTML += '<div style="width: 12px; height: 12px; background: ' + event.color + '; border-radius: 50%;"></div>';
                rowHTML += event.title;
                rowHTML += '</div>';
                rowHTML += '</td>';
                rowHTML += '<td><span class="type-badge type-' + event.type + '">' + event.type + '</span></td>';
                rowHTML += '<td>' + (event.location || '-') + '</td>';
                rowHTML += '<td><span class="status-badge ' + (event.public ? 'status-public' : 'status-private') + '">' + (event.public ? 'Public' : 'Privé') + '</span></td>';
                rowHTML += '<td>';
                rowHTML += '<div class="action-buttons">';
                rowHTML += '<button class="action-btn btn-edit" onclick="adminAgenda.editEvent(\'' + event.id + '\')">✏️</button>';
                rowHTML += '<button class="action-btn btn-duplicate" onclick="adminAgenda.duplicateEvent(\'' + event.id + '\')">📋</button>';
                rowHTML += '<button class="action-btn btn-delete" onclick="adminAgenda.deleteEvent(\'' + event.id + '\')">🗑️</button>';
                rowHTML += '</div>';
                rowHTML += '</td>';
                
                row.innerHTML = rowHTML;
                tbody.appendChild(row);
            });
    }

    filterEvents() {
        const search = document.getElementById('searchEvents').value.toLowerCase();
        const typeFilter = document.getElementById('filterType').value;
        const periodFilter = document.getElementById('filterPeriod').value;

        let filteredEvents = this.events;

        // Filtre par recherche
        if (search) {
            filteredEvents = filteredEvents.filter(event => 
                event.title.toLowerCase().includes(search) ||
                (event.description && event.description.toLowerCase().includes(search)) ||
                (event.location && event.location.toLowerCase().includes(search))
            );
        }

        // Filtre par type
        if (typeFilter) {
            filteredEvents = filteredEvents.filter(event => event.type === typeFilter);
        }

        // Filtre par période
        const now = new Date();
        switch (periodFilter) {
            case 'today':
                filteredEvents = filteredEvents.filter(event => 
                    new Date(event.date).toDateString() === now.toDateString()
                );
                break;
            case 'week':
                const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
                filteredEvents = filteredEvents.filter(event => {
                    const eventDate = new Date(event.date);
                    return eventDate >= weekStart && eventDate <= weekEnd;
                });
                break;
            case 'month':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                filteredEvents = filteredEvents.filter(event => {
                    const eventDate = new Date(event.date);
                    return eventDate >= monthStart && eventDate <= monthEnd;
                });
                break;
            case 'upcoming':
                filteredEvents = filteredEvents.filter(event => new Date(event.date) >= now);
                break;
        }

        this.renderFilteredEventsTable(filteredEvents);
    }

    renderFilteredEventsTable(events) {
        const tbody = document.getElementById('eventsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        events
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(event => {
                const row = document.createElement('tr');
                
                // Construction compatible du HTML
                let rowHTML = '<td>' + new Date(event.date).toLocaleDateString('fr-FR') + '</td>';
                rowHTML += '<td>';
                rowHTML += '<div style="display: flex; align-items: center; gap: 0.5rem;">';
                rowHTML += '<div style="width: 12px; height: 12px; background: ' + event.color + '; border-radius: 50%;"></div>';
                rowHTML += event.title;
                rowHTML += '</div>';
                rowHTML += '</td>';
                rowHTML += '<td><span class="type-badge type-' + event.type + '">' + event.type + '</span></td>';
                rowHTML += '<td>' + (event.location || '-') + '</td>';
                rowHTML += '<td><span class="status-badge ' + (event.public ? 'status-public' : 'status-private') + '">' + (event.public ? 'Public' : 'Privé') + '</span></td>';
                rowHTML += '<td>';
                rowHTML += '<div class="action-buttons">';
                rowHTML += '<button class="action-btn btn-edit" onclick="adminAgenda.editEvent(\'' + event.id + '\')">✏️</button>';
                rowHTML += '<button class="action-btn btn-duplicate" onclick="adminAgenda.duplicateEvent(\'' + event.id + '\')">📋</button>';
                rowHTML += '<button class="action-btn btn-delete" onclick="adminAgenda.deleteEvent(\'' + event.id + '\')">🗑️</button>';
                rowHTML += '</div>';
                rowHTML += '</td>';
                
                row.innerHTML = rowHTML;
                tbody.appendChild(row);
            });
    }

    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        // Passer à l'onglet création
        this.switchTab('create');

        // Remplir le formulaire avec les données de l'événement
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDate').value = event.date;
        document.getElementById('eventStartTime').value = event.startTime;
        document.getElementById('eventEndTime').value = event.endTime || '';
        document.getElementById('eventLocation').value = event.location || '';
        document.getElementById('eventDescription').value = event.description || '';
        document.getElementById('eventType').value = event.type;
        document.getElementById('eventColor').value = event.color;
        document.getElementById('eventPublic').checked = event.public;
        document.getElementById('eventRequiresBooking').checked = event.requiresBooking;

        if (event.image) {
            const preview = document.getElementById('imagePreview');
            const placeholder = document.querySelector('.upload-placeholder');
            const img = document.getElementById('previewImg');
            
            img.src = event.image;
            placeholder.style.display = 'none';
            preview.style.display = 'block';
        }

        // Marquer comme édition
        this.editingEventId = eventId;
        
        this.showNotification('✏️ Mode édition activé', 'info');
    }

    duplicateEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const duplicatedEvent = {
            ...event,
            id: this.generateId(),
            title: event.title + ' (Copie)',
            createdAt: new Date().toISOString()
        };

        this.events.push(duplicatedEvent);
        this.saveEvents();
        this.updateStatistics();
        this.renderEventsTable();
        
        this.showNotification('📋 Événement dupliqué avec succès', 'success');
    }

    deleteEvent(eventId) {
        if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            return;
        }

        this.events = this.events.filter(e => e.id !== eventId);
        this.saveEvents();
        this.updateStatistics();
        this.renderEventsTable();
        
        this.showNotification('🗑️ Événement supprimé', 'success');
    }

    // IMPORT/EXPORT
    handleCSVImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',');
                
                let importedCount = 0;
                
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',');
                    if (values.length >= 4) {
                        const event = {
                            id: this.generateId(),
                            title: values[0]?.trim() || 'Événement importé',
                            date: values[1]?.trim() || new Date().toISOString().split('T')[0],
                            startTime: values[2]?.trim() || '09:00',
                            location: values[3]?.trim() || '',
                            description: values[4]?.trim() || '',
                            type: values[5]?.trim() || 'autre',
                            color: '#8b0000',
                            public: true,
                            createdAt: new Date().toISOString()
                        };
                        
                        this.events.push(event);
                        importedCount++;
                    }
                }
                
                this.saveEvents();
                this.updateStatistics();
                this.renderEventsTable();
                
                this.showNotification('📥 ' + importedCount + ' événements importés avec succès', 'success');
            } catch (error) {
                this.showNotification('❌ Erreur lors de l\'import CSV', 'error');
            }
        };
        reader.readAsText(file);
    }

    handleICSImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const ics = e.target.result;
                // Parsing basique ICS (peut être amélioré)
                const events = this.parseICS(ics);
                
                events.forEach(event => {
                    this.events.push({
                        id: this.generateId(),
                        ...event,
                        color: '#8b0000',
                        public: true,
                        createdAt: new Date().toISOString()
                    });
                });
                
                this.saveEvents();
                this.updateStatistics();
                this.renderEventsTable();
                
                this.showNotification('📅 ' + events.length + ' événements importés depuis ICS', 'success');
            } catch (error) {
                this.showNotification('❌ Erreur lors de l\'import ICS', 'error');
            }
        };
        reader.readAsText(file);
    }

    parseICS(icsContent) {
        const events = [];
        const lines = icsContent.split('\n');
        let currentEvent = null;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine === 'BEGIN:VEVENT') {
                currentEvent = {};
            } else if (trimmedLine === 'END:VEVENT' && currentEvent) {
                if (currentEvent.title && currentEvent.date) {
                    events.push(currentEvent);
                }
                currentEvent = null;
            } else if (currentEvent) {
                if (trimmedLine.startsWith('SUMMARY:')) {
                    currentEvent.title = trimmedLine.substring(8);
                } else if (trimmedLine.startsWith('DTSTART:')) {
                    const dateStr = trimmedLine.substring(8);
                    currentEvent.date = this.parseICSDate(dateStr);
                } else if (trimmedLine.startsWith('DESCRIPTION:')) {
                    currentEvent.description = trimmedLine.substring(12);
                } else if (trimmedLine.startsWith('LOCATION:')) {
                    currentEvent.location = trimmedLine.substring(9);
                }
            }
        }
        
        return events;
    }

    parseICSDate(icsDate) {
        // Format: YYYYMMDDTHHMMSS ou YYYYMMDD
        if (icsDate.length >= 8) {
            const year = icsDate.substring(0, 4);
            const month = icsDate.substring(4, 6);
            const day = icsDate.substring(6, 8);
            return year + '-' + month + '-' + day;
        }
        return new Date().toISOString().split('T')[0];
    }

    exportToCSV() {
        const headers = ['Titre', 'Date', 'Heure début', 'Heure fin', 'Lieu', 'Description', 'Type'];
        const rows = [headers.join(',')];
        
        this.events.forEach(event => {
            const row = [
                '"' + event.title + '"',
                event.date,
                event.startTime,
                event.endTime || '',
                '"' + (event.location || '') + '"',
                '"' + (event.description || '') + '"',
                event.type
            ];
            rows.push(row.join(','));
        });
        
        const csvContent = rows.join('\n');
        this.downloadFile(csvContent, 'evenements.csv', 'text/csv');
        
        this.showNotification('📄 Export CSV téléchargé', 'success');
    }

    exportToICS() {
        let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//La Manufacture de Laurence//Agenda//FR\n';
        
        this.events.forEach(event => {
            const startDateTime = event.date.replace(/-/g, '') + 'T' + event.startTime.replace(':', '') + '00';
            const endDateTime = event.endTime 
                ? event.date.replace(/-/g, '') + 'T' + event.endTime.replace(':', '') + '00'
                : event.date.replace(/-/g, '') + 'T' + event.startTime.replace(':', '') + '00';
                
            icsContent += 'BEGIN:VEVENT\n';
            icsContent += 'UID:' + event.id + '@lamanufacturedelaurence.fr\n';
            icsContent += 'DTSTART:' + startDateTime + '\n';
            icsContent += 'DTEND:' + endDateTime + '\n';
            icsContent += 'SUMMARY:' + event.title + '\n';
            if (event.description) icsContent += 'DESCRIPTION:' + event.description + '\n';
            if (event.location) icsContent += 'LOCATION:' + event.location + '\n';
            icsContent += 'END:VEVENT\n';
        });
        
        icsContent += 'END:VCALENDAR';
        
        this.downloadFile(icsContent, 'agenda.ics', 'text/calendar');
        
        this.showNotification('📅 Export ICS téléchargé', 'success');
    }

    exportToPDF() {
        this.showNotification('📋 Génération PDF en développement...', 'info');
        // Implémentation PDF à venir
    }

    exportToJSON() {
        const data = {
            events: this.events,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, 'backup-agenda.json', 'application/json');
        
        this.showNotification('🔧 Backup JSON téléchargé', 'success');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // UTILITAIRES
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveEvents() {
        localStorage.setItem('agendaEvents', JSON.stringify(this.events));
    }

    loadSettings() {
        // Charger les paramètres sauvegardés
        const settings = JSON.parse(localStorage.getItem('adminSettings')) || {};
        
        if (settings.defaultColor) {
            document.getElementById('defaultColor').value = settings.defaultColor;
        }
        
        if (settings.calendarView) {
            document.getElementById('calendarView').value = settings.calendarView;
        }
    }

    saveSettings() {
        const settings = {
            defaultColor: document.getElementById('defaultColor').value,
            calendarView: document.getElementById('calendarView').value,
            emailNotifications: document.getElementById('emailNotifications').checked,
            reminderNotifications: document.getElementById('reminderNotifications').checked
        };
        
        localStorage.setItem('adminSettings', JSON.stringify(settings));
        this.showNotification('⚙️ Paramètres sauvegardés', 'success');
    }

    switchTab(tabId) {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        
        document.querySelector('[data-tab="' + tabId + '"]').classList.add('active');
        document.getElementById('tab-' + tabId).classList.add('active');
        
        this.currentTab = tabId;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.textContent = message;
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem; border-radius: 8px; color: white; font-weight: 500; z-index: 10000; animation: slideIn 0.3s ease; max-width: 350px;';
        
        switch (type) {
            case 'success': notification.style.background = '#28a745'; break;
            case 'error': notification.style.background = '#dc3545'; break;
            case 'warning': notification.style.background = '#ffc107'; notification.style.color = '#000'; break;
            default: notification.style.background = '#17a2b8';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// FONCTIONS GLOBALES
function previewEvent() {
    adminAgenda.previewEvent();
}

function resetForm() {
    adminAgenda.resetForm();
}

function saveDraft() {
    adminAgenda.saveDraft();
}

function removeImage() {
    adminAgenda.removeImage();
}

function applyAnalysisResults() {
    adminAgenda.applyAnalysisResults();
}

function importFromGoogle() {
    adminAgenda.showNotification('📅 Intégration Google Calendar en développement...', 'info');
}

function exportToCSV() {
    adminAgenda.exportToCSV();
}

function exportToICS() {
    adminAgenda.exportToICS();
}

function exportToPDF() {
    adminAgenda.exportToPDF();
}

function exportToJSON() {
    adminAgenda.exportToJSON();
}

function changePassword() {
    const newPassword = prompt('🔑 Nouveau mot de passe:');
    if (newPassword) {
        localStorage.setItem('adminPassword', newPassword);
        adminAgenda.showNotification('🔑 Mot de passe modifié', 'success');
    }
}

function resetAllData() {
    if (confirm('⚠️ ATTENTION: Cette action supprimera TOUS les événements et paramètres. Continuer ?')) {
        if (confirm('🚨 Dernière chance ! Êtes-vous VRAIMENT sûr ?')) {
            localStorage.removeItem('agendaEvents');
            localStorage.removeItem('eventDrafts');
            localStorage.removeItem('adminSettings');
            location.reload();
        }
    }
}

// Méthode pour appliquer les résultats de l'analyse
function applyAnalysisResults() {
    if (!adminAgenda.analysisResults) {
        adminAgenda.showNotification('❌ Aucune analyse disponible', 'error');
        return;
    }
    
    const results = adminAgenda.analysisResults;
    
    // Remplir les champs du formulaire
    if (results.title) {
        document.getElementById('eventTitle').value = results.title;
    }
    
    if (results.date) {
        document.getElementById('eventDate').value = results.date;
    }
    
    if (results.time) {
        document.getElementById('eventStartTime').value = results.time;
    }
    
    if (results.location) {
        document.getElementById('eventLocation').value = results.location;
    }
    
    if (results.type) {
        const typeSelect = document.getElementById('eventType');
        // Vérifier si le type détecté existe dans les options
        const option = Array.from(typeSelect.options).find(opt => opt.value === results.type);
        if (option) {
            typeSelect.value = results.type;
            
            // Déclencher l'événement change pour mettre à jour la couleur
            const event = new Event('change');
            typeSelect.dispatchEvent(event);
        }
    }
    
    // Utiliser l'image de l'affiche comme image de l'événement
    const posterImg = document.getElementById('posterPreviewImg');
    if (posterImg && posterImg.src) {
        const eventImagePreview = document.getElementById('imagePreview');
        const eventImagePlaceholder = document.querySelector('.upload-placeholder');
        const eventImg = document.getElementById('previewImg');
        
        eventImg.src = posterImg.src;
        eventImagePlaceholder.style.display = 'none';
        eventImagePreview.style.display = 'block';
    }
    
    adminAgenda.showNotification('✨ Informations appliquées au formulaire !', 'success');
    
    // Faire défiler vers le formulaire
    document.getElementById('eventTitle').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

// Styles pour les animations
const style = document.createElement('style');
style.textContent = '@keyframes slideIn {' +
    'from { transform: translateX(100%); opacity: 0; }' +
    'to { transform: translateX(0); opacity: 1; }' +
'}' +
'@keyframes slideOut {' +
    'from { transform: translateX(0); opacity: 1; }' +
    'to { transform: translateX(100%); opacity: 0; }' +
'}' +
'.preview-modal {' +
    'position: fixed;' +
    'top: 0;' +
    'left: 0;' +
    'right: 0;' +
    'bottom: 0;' +
    'background: rgba(0, 0, 0, 0.8);' +
    'display: flex;' +
    'align-items: center;' +
    'justify-content: center;' +
    'z-index: 10000;' +
'}' +
'.preview-content {' +
    'background: white;' +
    'border-radius: 15px;' +
    'max-width: 500px;' +
    'width: 90%;' +
    'max-height: 80vh;' +
    'overflow-y: auto;' +
'}' +
'.preview-header {' +
    'display: flex;' +
    'justify-content: space-between;' +
    'align-items: center;' +
    'padding: 1.5rem;' +
    'border-bottom: 1px solid #e0e0e0;' +
'}' +
'.preview-header h3 {' +
    'margin: 0;' +
    'color: #2c3e50;' +
'}' +
'.close-btn {' +
    'background: #dc3545;' +
    'color: white;' +
    'border: none;' +
    'width: 30px;' +
    'height: 30px;' +
    'border-radius: 50%;' +
    'cursor: pointer;' +
    'font-size: 1.2rem;' +
'}' +
'.preview-body {' +
    'padding: 1.5rem;' +
'}' +
'.preview-body h4 {' +
    'margin-top: 0;' +
    'font-size: 1.5rem;' +
'}' +
'.preview-body p {' +
    'margin: 0.8rem 0;' +
    'line-height: 1.5;' +
'}' +
'.preview-badges {' +
    'display: flex;' +
    'gap: 0.5rem;' +
    'flex-wrap: wrap;' +
    'margin-top: 1rem;' +
'}' +
'.badge {' +
    'padding: 0.3rem 0.8rem;' +
    'border-radius: 20px;' +
    'font-size: 0.8rem;' +
    'font-weight: 500;' +
'}' +
'.badge-public {' +
    'background: #d4edda;' +
    'color: #155724;' +
'}' +
'.badge-private {' +
    'background: #f8d7da;' +
    'color: #721c24;' +
'}' +
'.badge-booking {' +
    'background: #d1ecf1;' +
    'color: #0c5460;' +
'}' +
'.badge-recurring {' +
    'background: #e2e3e5;' +
    'color: #383d41;' +
'}' +
'.preview-actions {' +
    'padding: 1rem 1.5rem;' +
    'border-top: 1px solid #e0e0e0;' +
    'text-align: right;' +
'}' +
'.type-badge {' +
    'padding: 0.2rem 0.6rem;' +
    'border-radius: 12px;' +
    'font-size: 0.8rem;' +
    'font-weight: 500;' +
    'text-transform: capitalize;' +
'}' +
'.type-cours { background: #ffebee; color: #c62828; }' +
'.type-spectacle { background: #fff3e0; color: #ef6c00; }' +
'.type-audition { background: #e8f5e8; color: #2e7d32; }' +
'.type-atelier { background: #e3f2fd; color: #1565c0; }' +
'.type-reunion { background: #f3e5f5; color: #7b1fa2; }' +
'.type-masterclass { background: #fff8e1; color: #f57c00; }' +
'.type-portes-ouvertes { background: #e0f2f1; color: #00695c; }' +
'.type-autre { background: #fafafa; color: #424242; }';
document.head.appendChild(style);

// Initialisation
let adminAgenda;
document.addEventListener('DOMContentLoaded', async function() {
    adminAgenda = new AdminAgenda();
});
