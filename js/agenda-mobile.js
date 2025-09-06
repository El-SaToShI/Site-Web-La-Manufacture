/* ========================================
   JAVASCRIPT AGENDA MOBILE - LA MANUFACTURE DE LAURENCE
   ======================================== */

class MobileAgenda {
    constructor() {
        this.events = [];
        this.currentDate = new Date();
        this.storage = null;
        this.currentFilter = 'all';
        this.analysisResults = null;
        
        this.init();
    }

    async init() {
        // Initialiser le stockage
        await this.initStorage();
        
        // Charger les données
        await this.loadData();
        
        // Initialiser l'interface
        this.setupEventListeners();
        this.renderCalendar();
        this.renderEvents();
        this.updateMonthDisplay();
    }

    async initStorage() {
        try {
            this.storage = new StorageManager();
            await this.storage.init();
            console.log('Mobile: Système de stockage IndexedDB initialisé');
        } catch (error) {
            console.error('Mobile: Erreur IndexedDB, fallback vers localStorage:', error);
            this.storage = await new StorageManager().fallbackToLocalStorage();
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
            console.error('Mobile: Erreur chargement données:', error);
            this.events = [];
        }
    }

    setupEventListeners() {
        // Navigation du calendrier
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.updateCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.updateCalendar();
        });

        // Filtres
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderEvents();
            });
        });

        // Administration
        document.getElementById('adminToggleMobile').addEventListener('click', () => {
            this.showMobileAdmin();
        });

        // Onglets d'administration
        document.querySelectorAll('.mobile-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchMobileTab(e.target.dataset.tab);
            });
        });

        // Formulaire mobile
        document.getElementById('mobileEventForm').addEventListener('submit', (e) => {
            this.handleMobileFormSubmit(e);
        });

        // Scanner d'affiche
        document.getElementById('takePicture').addEventListener('click', () => {
            document.getElementById('mobilePosterFile').click();
        });

        document.getElementById('selectFromGallery').addEventListener('click', () => {
            document.getElementById('mobileGalleryFile').click();
        });

        document.getElementById('mobilePosterFile').addEventListener('change', (e) => {
            this.handleMobilePosterUpload(e);
        });

        document.getElementById('mobileGalleryFile').addEventListener('change', (e) => {
            this.handleMobilePosterUpload(e);
        });

        // Recherche
        document.getElementById('mobileSearchEvents').addEventListener('input', (e) => {
            this.filterMobileEvents(e.target.value);
        });
    }

    updateCalendar() {
        this.renderCalendar();
        this.updateMonthDisplay();
    }

    updateMonthDisplay() {
        const monthNames = [
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ];
        
        const monthYear = monthNames[this.currentDate.getMonth()] + ' ' + this.currentDate.getFullYear();
        document.getElementById('currentMonthYear').textContent = monthYear;
    }

    renderCalendar() {
        const grid = document.getElementById('calendarGridMobile');
        grid.innerHTML = '';

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const today = new Date();
        
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day-mobile';
            dayElement.textContent = date.getDate();
            
            // Classes conditionnelles
            if (date.getMonth() !== this.currentDate.getMonth()) {
                dayElement.classList.add('other-month');
            }
            
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            // Vérifier s'il y a des événements ce jour
            const hasEvents = this.events.some(event => 
                new Date(event.date).toDateString() === date.toDateString()
            );
            
            if (hasEvents) {
                dayElement.classList.add('has-event');
            }
            
            // Événement de clic
            dayElement.addEventListener('click', () => {
                this.showDayEvents(date);
            });
            
            grid.appendChild(dayElement);
        }
    }

    renderEvents() {
        const container = document.getElementById('mobileEventsList');
        const noEventsMessage = document.getElementById('noEventsMessage');
        
        let filteredEvents = this.events;
        
        // Filtrer par type
        if (this.currentFilter !== 'all') {
            filteredEvents = filteredEvents.filter(event => event.type === this.currentFilter);
        }
        
        // Trier par date
        filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (filteredEvents.length === 0) {
            container.style.display = 'none';
            noEventsMessage.style.display = 'block';
            return;
        }
        
        container.style.display = 'block';
        noEventsMessage.style.display = 'none';
        container.innerHTML = '';
        
        filteredEvents.forEach(event => {
            const eventElement = this.createMobileEventElement(event);
            container.appendChild(eventElement);
        });
    }

    createMobileEventElement(event) {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('fr-FR');
        const formattedTime = event.startTime || 'Heure non définie';
        
        const element = document.createElement('div');
        element.className = `mobile-event-item type-${event.type}`;
        
        element.innerHTML = `
            <div class="mobile-event-header">
                <h5 class="mobile-event-title">${event.title}</h5>
                <span class="mobile-event-type">${this.getTypeLabel(event.type)}</span>
            </div>
            <div class="mobile-event-details">
                <div class="mobile-event-detail">
                    <span>📅</span>
                    <span><strong>Date:</strong> ${formattedDate}</span>
                </div>
                <div class="mobile-event-detail">
                    <span>🕐</span>
                    <span><strong>Heure:</strong> ${formattedTime}</span>
                </div>
                ${event.location ? `
                <div class="mobile-event-detail">
                    <span>📍</span>
                    <span><strong>Lieu:</strong> ${event.location}</span>
                </div>
                ` : ''}
                ${event.description ? `
                <div class="mobile-event-detail">
                    <span>📝</span>
                    <span><strong>Description:</strong> ${event.description}</span>
                </div>
                ` : ''}
            </div>
            <div class="mobile-event-actions">
                <button class="mobile-action-btn add-calendar" onclick="mobileAgenda.addToCalendar('${event.id}')">
                    📅 Ajouter
                </button>
                <button class="mobile-action-btn share" onclick="mobileAgenda.shareEvent('${event.id}')">
                    📤 Partager
                </button>
            </div>
        `;
        
        return element;
    }

    getTypeLabel(type) {
        const labels = {
            'cours': '📚 Cours',
            'spectacle': '🎭 Spectacle',
            'audition': '🎤 Audition',
            'atelier': '🛠️ Atelier',
            'reunion': '👥 Réunion',
            'autre': '📌 Autre'
        };
        return labels[type] || '📌 Autre';
    }

    showDayEvents(date) {
        const dayEvents = this.events.filter(event => 
            new Date(event.date).toDateString() === date.toDateString()
        );
        
        if (dayEvents.length === 0) {
            this.showNotification('📅 Aucun événement prévu ce jour', 'info');
            return;
        }
        
        // Faire défiler vers les événements et les mettre en surbrillance
        const eventsSection = document.querySelector('.mobile-events-section');
        eventsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Filtrer temporairement pour afficher seulement les événements du jour
        this.highlightDayEvents(date);
    }

    highlightDayEvents(date) {
        const eventItems = document.querySelectorAll('.mobile-event-item');
        eventItems.forEach(item => {
            const eventTitle = item.querySelector('.mobile-event-title').textContent;
            const event = this.events.find(e => e.title === eventTitle);
            
            if (event && new Date(event.date).toDateString() === date.toDateString()) {
                item.style.background = '#e8f4f8';
                item.style.borderLeftColor = '#007bff';
                item.style.borderLeftWidth = '6px';
                
                // Enlever la surbrillance après 3 secondes
                setTimeout(() => {
                    item.style.background = '';
                    item.style.borderLeftColor = '';
                    item.style.borderLeftWidth = '';
                }, 3000);
            }
        });
    }

    showMobileAdmin() {
        const password = prompt("Mot de passe pédagogue:");
        if (password === "manufacture2025") {
            const panel = document.getElementById('mobileAdminPanel');
            panel.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Charger la liste de gestion
            this.renderMobileManageList();
        } else if (password !== null) {
            this.showNotification('❌ Mot de passe incorrect', 'error');
        }
    }

    switchMobileTab(tabId) {
        // Mettre à jour les onglets
        document.querySelectorAll('.mobile-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        
        // Mettre à jour le contenu
        document.querySelectorAll('.mobile-tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`tab-${tabId}`).classList.add('active');
    }

    async handleMobileFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('mobileEventTitle').value,
            date: document.getElementById('mobileEventDate').value,
            startTime: document.getElementById('mobileEventTime').value,
            location: document.getElementById('mobileEventLocation').value,
            description: document.getElementById('mobileEventDescription').value,
            type: document.getElementById('mobileEventType').value
        };
        
        // Validation
        if (!formData.title || !formData.date || !formData.startTime || !formData.type) {
            this.showNotification('❌ Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }
        
        try {
            const event = {
                id: this.generateId(),
                ...formData,
                color: this.getTypeColor(formData.type),
                public: true,
                createdAt: new Date().toISOString()
            };
            
            await this.storage.saveEvent(event);
            this.events.push(event);
            
            this.renderCalendar();
            this.renderEvents();
            this.resetMobileForm();
            
            this.showNotification('✅ Événement créé avec succès !', 'success');
            
        } catch (error) {
            console.error('Erreur création événement mobile:', error);
            this.showNotification('❌ Erreur lors de la création', 'error');
        }
    }

    async handleMobilePosterUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Vérifications
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('❌ Fichier trop volumineux (max 10MB)', 'error');
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            this.showNotification('❌ Veuillez sélectionner une image', 'error');
            return;
        }
        
        // Afficher l'aperçu
        const preview = document.getElementById('mobileScanPreview');
        const img = document.getElementById('mobileScanImage');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
            preview.style.display = 'block';
            
            // Lancer l'analyse OCR
            this.analyzeMobilePoster(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    async analyzeMobilePoster(imageSrc) {
        const progress = document.getElementById('mobileScanProgress');
        const results = document.getElementById('mobileScanResults');
        
        progress.style.display = 'block';
        results.style.display = 'none';
        
        try {
            // Utiliser Tesseract.js comme sur desktop
            this.updateMobileProgress(10, 'Initialisation...');
            
            const worker = await Tesseract.createWorker('fra', 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        const progressPercent = Math.round(m.progress * 70) + 10;
                        this.updateMobileProgress(progressPercent, 'Analyse du texte...');
                    }
                }
            });
            
            this.updateMobileProgress(80, 'Extraction des informations...');
            
            const { data: { text } } = await worker.recognize(imageSrc);
            const extractedInfo = this.parseExtractedText(text);
            
            this.updateMobileProgress(100, 'Terminé !');
            
            await worker.terminate();
            
            setTimeout(() => {
                progress.style.display = 'none';
                this.displayMobileResults(extractedInfo);
            }, 1000);
            
        } catch (error) {
            console.error('Erreur OCR mobile:', error);
            this.showNotification('❌ Erreur lors de l\'analyse', 'error');
            progress.style.display = 'none';
        }
    }

    updateMobileProgress(percent, text) {
        const progressFill = document.getElementById('mobileProgressFill');
        const progressText = document.getElementById('mobileProgressText');
        
        if (progressFill) progressFill.style.width = percent + '%';
        if (progressText) progressText.textContent = text;
    }

    parseExtractedText(text) {
        // Utiliser la même logique que sur desktop
        const info = {
            title: null,
            date: null,
            time: null,
            location: null,
            type: null
        };
        
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        if (lines.length > 0) {
            info.title = lines[0];
        }
        
        // Recherche de dates et heures (logique simplifiée pour mobile)
        const fullText = text.toLowerCase();
        
        // Dates
        const dateMatch = text.match(/(\d{1,2})\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s*(\d{4})/i);
        if (dateMatch) {
            info.date = this.convertToDate(dateMatch);
        }
        
        // Heures
        const timeMatch = text.match(/(\d{1,2})[h:](\d{2})/);
        if (timeMatch) {
            info.time = timeMatch[1].padStart(2, '0') + ':' + timeMatch[2].padStart(2, '0');
        }
        
        // Types
        if (fullText.includes('spectacle') || fullText.includes('pièce')) {
            info.type = 'spectacle';
        } else if (fullText.includes('cours') || fullText.includes('formation')) {
            info.type = 'cours';
        } else if (fullText.includes('atelier')) {
            info.type = 'atelier';
        }
        
        return info;
    }

    convertToDate(match) {
        const months = {
            'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
            'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
            'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
        };
        
        if (match[2] && months[match[2].toLowerCase()]) {
            const day = match[1].padStart(2, '0');
            const month = months[match[2].toLowerCase()];
            const year = match[3];
            return year + '-' + month + '-' + day;
        }
        
        return null;
    }

    displayMobileResults(info) {
        const results = document.getElementById('mobileScanResults');
        const detectedInfo = document.getElementById('mobileDetectedInfo');
        
        this.analysisResults = info;
        
        let resultsHTML = '';
        
        if (info.title) {
            resultsHTML += `
                <div class="mobile-detected-item">
                    <span class="mobile-detected-label">📝 Titre:</span>
                    <span class="mobile-detected-value">${info.title}</span>
                </div>
            `;
        }
        
        if (info.date) {
            const formattedDate = new Date(info.date).toLocaleDateString('fr-FR');
            resultsHTML += `
                <div class="mobile-detected-item">
                    <span class="mobile-detected-label">📅 Date:</span>
                    <span class="mobile-detected-value">${formattedDate}</span>
                </div>
            `;
        }
        
        if (info.time) {
            resultsHTML += `
                <div class="mobile-detected-item">
                    <span class="mobile-detected-label">🕐 Heure:</span>
                    <span class="mobile-detected-value">${info.time}</span>
                </div>
            `;
        }
        
        if (info.type) {
            resultsHTML += `
                <div class="mobile-detected-item">
                    <span class="mobile-detected-label">🏷️ Type:</span>
                    <span class="mobile-detected-value">${info.type}</span>
                </div>
            `;
        }
        
        if (!resultsHTML) {
            resultsHTML = '<p style="text-align: center; color: #6c757d;">Aucune information détectée automatiquement</p>';
        }
        
        detectedInfo.innerHTML = resultsHTML;
        results.style.display = 'block';
    }

    renderMobileManageList() {
        const container = document.getElementById('mobileManageList');
        container.innerHTML = '';
        
        this.events.forEach(event => {
            const item = document.createElement('div');
            item.className = 'mobile-manage-item';
            
            const formattedDate = new Date(event.date).toLocaleDateString('fr-FR');
            
            item.innerHTML = `
                <div class="mobile-manage-header">
                    <h6 class="mobile-manage-title">${event.title}</h6>
                    <div class="mobile-manage-actions">
                        <button class="mobile-manage-btn edit" onclick="mobileAgenda.editMobileEvent('${event.id}')">
                            ✏️
                        </button>
                        <button class="mobile-manage-btn delete" onclick="mobileAgenda.deleteMobileEvent('${event.id}')">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="mobile-event-detail">
                    <span>📅 ${formattedDate} à ${event.startTime || 'Heure non définie'}</span>
                </div>
                ${event.location ? `<div class="mobile-event-detail"><span>📍 ${event.location}</span></div>` : ''}
            `;
            
            container.appendChild(item);
        });
    }

    filterMobileEvents(searchTerm) {
        const items = document.querySelectorAll('.mobile-manage-item');
        const term = searchTerm.toLowerCase();
        
        items.forEach(item => {
            const title = item.querySelector('.mobile-manage-title').textContent.toLowerCase();
            const shouldShow = title.includes(term);
            item.style.display = shouldShow ? 'block' : 'none';
        });
    }

    async deleteMobileEvent(eventId) {
        if (!confirm('Supprimer cet événement ?')) return;
        
        try {
            await this.storage.deleteEvent(eventId);
            this.events = this.events.filter(e => e.id !== eventId);
            
            this.renderCalendar();
            this.renderEvents();
            this.renderMobileManageList();
            
            this.showNotification('🗑️ Événement supprimé', 'success');
        } catch (error) {
            console.error('Erreur suppression:', error);
            this.showNotification('❌ Erreur lors de la suppression', 'error');
        }
    }

    addToCalendar(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;
        
        // Créer un fichier ICS pour l'événement
        const startDate = new Date(event.date + 'T' + (event.startTime || '09:00'));
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // +2h par défaut
        
        const icsContent = this.generateICS(event, startDate, endDate);
        
        // Télécharger le fichier ICS
        this.downloadFile(icsContent, event.title + '.ics', 'text/calendar');
        
        this.showNotification('📅 Événement exporté vers votre calendrier', 'success');
    }

    shareEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;
        
        const shareText = `🎭 ${event.title}\n📅 ${new Date(event.date).toLocaleDateString('fr-FR')}\n🕐 ${event.startTime || 'Heure à définir'}\n${event.location ? '📍 ' + event.location + '\n' : ''}${event.description ? '📝 ' + event.description : ''}`;
        
        if (navigator.share) {
            navigator.share({
                title: event.title,
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: copier dans le presse-papiers
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('📤 Informations copiées dans le presse-papiers', 'success');
            });
        }
    }

    resetMobileForm() {
        document.getElementById('mobileEventForm').reset();
    }

    getTypeColor(type) {
        const colors = {
            'cours': '#2c3e50',
            'spectacle': '#8b0000',
            'audition': '#b87333',
            'atelier': '#228b22',
            'reunion': '#6c7b7f',
            'autre': '#2f2f2f'
        };
        return colors[type] || '#2f2f2f';
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateICS(event, startDate, endDate) {
        const formatDate = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };
        
        return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//La Manufacture de Laurence//Mobile//FR
BEGIN:VEVENT
UID:${event.id}@lamanufacturedelaurence.fr
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT
END:VCALENDAR`;
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

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'mobile-notification mobile-notification-' + type;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            padding: 1rem;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            text-align: center;
            animation: slideDown 0.3s ease;
        `;
        
        switch (type) {
            case 'success': notification.style.background = '#28a745'; break;
            case 'error': notification.style.background = '#dc3545'; break;
            case 'warning': notification.style.background = '#ffc107'; notification.style.color = '#000'; break;
            default: notification.style.background = '#17a2b8';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Fonctions globales
function closeMobileAdmin() {
    const panel = document.getElementById('mobileAdminPanel');
    panel.style.display = 'none';
    document.body.style.overflow = '';
}

function applyMobileResults() {
    if (!mobileAgenda.analysisResults) {
        mobileAgenda.showNotification('❌ Aucune analyse disponible', 'error');
        return;
    }
    
    const results = mobileAgenda.analysisResults;
    
    // Passer à l'onglet d'ajout
    mobileAgenda.switchMobileTab('quick-add');
    
    // Remplir le formulaire
    if (results.title) {
        document.getElementById('mobileEventTitle').value = results.title;
    }
    if (results.date) {
        document.getElementById('mobileEventDate').value = results.date;
    }
    if (results.time) {
        document.getElementById('mobileEventTime').value = results.time;
    }
    if (results.type) {
        document.getElementById('mobileEventType').value = results.type;
    }
    
    mobileAgenda.showNotification('✨ Informations appliquées au formulaire !', 'success');
}

// Styles d'animation
const mobileStyle = document.createElement('style');
mobileStyle.textContent = `
    @keyframes slideDown {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(-100%); opacity: 0; }
    }
`;
document.head.appendChild(mobileStyle);

// Initialisation
let mobileAgenda;
document.addEventListener('DOMContentLoaded', () => {
    mobileAgenda = new MobileAgenda();
});
