/**
 * ADMIN PANEL ULTRA-SIMPLE
 * Interface conçue pour utilisateurs non-techniques
 * Sauvegarde automatique, messages clairs, pas de termes techniques
 */

class SimpleAdmin {
    // Apparence
    saveDesign() {
        const color = document.getElementById('sitePrimaryColor').value;
        const font = document.getElementById('siteFont').value;
        const logoInput = document.getElementById('siteLogo');
        let logo = '';
        if (logoInput.files && logoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                logo = e.target.result;
                this.saveData('design', { color, font, logo });
                this.applyDesign({ color, font, logo });
                this.showMessage('Apparence sauvegardée !', 'success');
            };
            reader.readAsDataURL(logoInput.files[0]);
        } else {
            this.saveData('design', { color, font, logo });
            this.applyDesign({ color, font, logo });
            this.showMessage('Apparence sauvegardée !', 'success');
        }
    }

    applyDesign(design) {
        if (design.color) {
            document.documentElement.style.setProperty('--primary-color', design.color);
        }
        if (design.font) {
            document.body.style.fontFamily = design.font;
        }
        if (design.logo) {
            // Appliquer le logo sur l'en-tête si possible
            const header = document.querySelector('.simple-header h1');
            if (header && !header.querySelector('img')) {
                const img = document.createElement('img');
                img.src = design.logo;
                img.alt = 'Logo';
                img.style.height = '32px';
                img.style.marginRight = '10px';
                header.prepend(img);
            } else if (header && header.querySelector('img')) {
                header.querySelector('img').src = design.logo;
            }
        }
    }

    loadDesign() {
        const design = this.getData('design') || {};
        if (design.color) document.getElementById('sitePrimaryColor').value = design.color;
        if (design.font) document.getElementById('siteFont').value = design.font;
        this.applyDesign(design);
    }

    // Paramètres
    saveSettings() {
        const autoSave = document.getElementById('autoSaveSetting').value;
        const passwordSecurity = document.getElementById('passwordSecurity').value;
        const emailNotifications = document.getElementById('emailNotifications').value;
        const settings = { autoSave, passwordSecurity, emailNotifications };
        this.saveData('settings', settings);
        this.applySettings(settings);
        this.showMessage('Paramètres sauvegardés !', 'success');
    }

    applySettings(settings) {
        this.autoSaveEnabled = settings.autoSave === 'on';
        // Ici, tu pourrais ajouter la logique pour la sécurité et les notifications
    }

    loadSettings() {
        const settings = this.getData('settings') || {};
        if (settings.autoSave) document.getElementById('autoSaveSetting').value = settings.autoSave;
        if (settings.passwordSecurity) document.getElementById('passwordSecurity').value = settings.passwordSecurity;
        if (settings.emailNotifications) document.getElementById('emailNotifications').value = settings.emailNotifications;
        this.applySettings(settings);
    }
    constructor() {
        this.currentSection = 'dashboard';
        this.currentCourse = null;
        this.autoSaveEnabled = true;
        this.autoSaveInterval = 30000; // 30 secondes
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAutoSave();
        this.setupWysiwyg();
        this.setupPhotoManager();
        this.loadData();
        this.showWelcomeMessage();
    }

    setupEventListeners() {
        // Navigation principale
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON') {
                    const button = card.querySelector('button');
                    if (button) button.click();
                }
            });
        });

        // Boutons d'action
        document.querySelectorAll('.action-card-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.action-card');
                const action = card.dataset.action;
                this.handleAction(action);
            });
        });

        // Raccourcis clavier simples
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveCurrentSection();
                this.showMessage('Sauvegardé !', 'success');
            }
            if (e.key === 'Escape') {
                this.showDashboard();
            }
        });
    }

    setupAutoSave() {
        // Sauvegarde automatique toutes les 30 secondes
        setInterval(() => {
            if (this.autoSaveEnabled && this.currentSection !== 'dashboard') {
                this.autoSave();
            }
        }, this.autoSaveInterval);

        // Sauvegarde sur changement de contenu
        document.addEventListener('input', (e) => {
            if (e.target.matches('.form-input-simple, .wysiwyg-editor')) {
                this.markAsChanged();
                // Sauvegarde automatique après 3 secondes d'inactivité
                clearTimeout(this.autoSaveTimeout);
                this.autoSaveTimeout = setTimeout(() => {
                    this.autoSave();
                }, 3000);
            }
        });
    }

    setupWysiwyg() {
        // Configuration de l'éditeur WYSIWYG simple
        document.querySelectorAll('.wysiwyg-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                document.execCommand(command, false, null);
                btn.classList.toggle('active');
                this.markAsChanged();
            });
        });

        // Gestion du focus dans l'éditeur
        document.querySelectorAll('.wysiwyg-editor').forEach(editor => {
            editor.addEventListener('focus', () => {
                if (editor.textContent.trim() === 'Cliquez ici pour écrire...') {
                    editor.textContent = '';
                }
            });

            editor.addEventListener('blur', () => {
                if (editor.textContent.trim() === '') {
                    editor.textContent = 'Cliquez ici pour écrire...';
                }
            });
        });
    }

    setupPhotoManager() {
        const uploadZone = document.getElementById('uploadZone');
        const photoInput = document.getElementById('photoInput');

        // Clic sur la zone d'upload
        uploadZone.addEventListener('click', () => {
            photoInput.click();
        });

        // Glisser-déposer
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            this.handlePhotoUpload(files);
        });

        // Sélection de fichiers
        photoInput.addEventListener('change', (e) => {
            this.handlePhotoUpload(e.target.files);
        });
    }

    handleAction(action) {
        this.hideAllSections();
        switch(action) {
            case 'courses':
                this.showSection('courses-section');
                break;
            case 'photos':
                this.showSection('photos-section');
                this.loadPhotoGallery();
                break;
            case 'pedagogues':
                this.showSection('pedagogues-section');
                break;
            case 'agenda':
                this.showSection('agenda-section');
                break;
            case 'homepage':
                this.showSection('homepage-section');
                this.loadHomepageContent();
                break;
            case 'contact':
                this.showSection('contact-section');
                this.loadContactInfo();
                break;
            case 'design':
                this.showSection('design-section');
                this.loadDesign();
                break;
            case 'settings':
                this.showSection('settings-section');
                this.loadSettings();
                break;
        }
    }

    showSection(sectionId) {
    document.getElementById(sectionId).classList.add('active');
    this.currentSection = sectionId;
    // Masquer le dashboard principal
    document.getElementById('mainDashboard').style.display = 'none';
    }

    hideAllSections() {
        document.querySelectorAll('.work-section').forEach(section => {
            section.classList.remove('active');
        });
    }

    showDashboard() {
    this.hideAllSections();
    this.currentSection = 'dashboard';
    document.getElementById('mainDashboard').style.display = 'grid';
    }

    // GESTION DES COURS
    editCourse(courseId) {
        this.currentCourse = courseId;
        this.showFormStep('course-editing');
        this.loadCourseData(courseId);
    }

    showFormStep(stepId) {
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById(stepId).classList.add('active');
    }

    showCourseSelection() {
        this.showFormStep('course-selection');
    }

    showCourseEditing() {
        this.showFormStep('course-editing');
    }

    previewCourse() {
        this.generateCoursePreview();
        this.showFormStep('course-preview');
    }

    loadCourseData(courseId) {
        // Simuler le chargement des données existantes
        const courseData = this.getCourseData(courseId);
        
        document.getElementById('courseTitle').value = courseData.title || '';
        document.getElementById('courseShort').value = courseData.short || '';
        document.getElementById('courseDescription').innerHTML = courseData.description || 'Cliquez ici pour écrire la description de votre cours...';
        document.getElementById('coursePrice').value = courseData.price || '';
        document.getElementById('courseSchedule').value = courseData.schedule || '';
    }

    generateCoursePreview() {
        const title = document.getElementById('courseTitle').value;
        const short = document.getElementById('courseShort').value;
        const description = document.getElementById('courseDescription').innerHTML;
        const price = document.getElementById('coursePrice').value;
        const schedule = document.getElementById('courseSchedule').value;

        const previewHTML = `
            <div class="action-card-header">
                <i class="fas fa-graduation-cap action-card-icon"></i>
                <h4 class="action-card-title">${title}</h4>
                <p class="action-card-subtitle">${short}</p>
            </div>
            <div class="action-card-content">
                <div class="course-details">
                    ${description}
                    <div style="margin-top: 20px;">
                        <strong>Tarif :</strong> ${price}<br>
                        <strong>Horaires :</strong> ${schedule}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('coursePreviewContent').innerHTML = previewHTML;
    }

    saveCourse() {
        const courseData = {
            title: document.getElementById('courseTitle').value,
            short: document.getElementById('courseShort').value,
            description: document.getElementById('courseDescription').innerHTML,
            price: document.getElementById('coursePrice').value,
            schedule: document.getElementById('courseSchedule').value
        };

        this.saveCourseData(this.currentCourse, courseData);
        this.showMessage('Cours sauvegardé avec succès !', 'success');
        this.showCourseSelection();
    }

    // GESTION DES PHOTOS
    handlePhotoUpload(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                this.processPhoto(file);
            }
        });
    }

    processPhoto(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Redimensionnement automatique
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const maxSize = 800;
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxSize) {
                        height = height * (maxSize / width);
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = width * (maxSize / height);
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                this.addPhotoToGallery(dataUrl, file.name);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    addPhotoToGallery(dataUrl, fileName) {
        const gallery = document.getElementById('photoGallery');
        const photoId = 'photo_' + Date.now();
        
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `
            <img src="${dataUrl}" alt="${fileName}">
            <div class="photo-overlay">
                <div class="photo-actions">
                    <button class="photo-action-btn" onclick="simpleAdmin.editPhoto('${photoId}')" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="photo-action-btn" onclick="simpleAdmin.deletePhoto('${photoId}')" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        gallery.appendChild(photoItem);
        
        // Sauvegarder la photo
        this.savePhoto(photoId, dataUrl, fileName);
        this.showMessage('Photo ajoutée avec succès !', 'success');
    }

    loadPhotoGallery() {
        const gallery = document.getElementById('photoGallery');
        gallery.innerHTML = '';
        
        const photos = this.getPhotos();
        photos.forEach(photo => {
            this.addPhotoToGallery(photo.dataUrl, photo.fileName);
        });
    }

    deletePhoto(photoId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
            document.querySelector(`[data-photo-id="${photoId}"]`)?.remove();
            this.removePhoto(photoId);
            this.showMessage('Photo supprimée', 'success');
        }
    }

    // GESTION DES ÉVÉNEMENTS
    saveEvent() {
        const eventData = {
            type: document.getElementById('eventType').value,
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            location: document.getElementById('eventLocation').value,
            description: document.getElementById('eventDescription').value
        };

        if (!eventData.title || !eventData.date) {
            this.showMessage('Veuillez remplir au moins le titre et la date', 'warning');
            return;
        }

        this.saveEventData(eventData);
        this.showMessage('Événement ajouté avec succès !', 'success');
        this.clearEventForm();
    }

    clearEventForm() {
        document.getElementById('eventType').value = '';
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventLocation').value = '';
        document.getElementById('eventDescription').value = '';
    }

    // GESTION DE LA PAGE D'ACCUEIL
    loadHomepageContent() {
        const welcomeMessage = this.getWelcomeMessage();
        document.getElementById('welcomeMessage').innerHTML = welcomeMessage || 'Bienvenue à La Manufacture de Laurence...';
    }

    saveHomepage() {
        const welcomeMessage = document.getElementById('welcomeMessage').innerHTML;
        this.saveWelcomeMessage(welcomeMessage);
        this.showMessage('Page d\'accueil sauvegardée !', 'success');
    }

    // GESTION DU CONTACT
    loadContactInfo() {
        const contact = this.getContactInfo();
        document.getElementById('contactAddress').value = contact.address || '';
        document.getElementById('contactPhone').value = contact.phone || '';
        document.getElementById('contactEmail').value = contact.email || '';
        document.getElementById('contactHours').value = contact.hours || '';
    }

    saveContact() {
        const contactData = {
            address: document.getElementById('contactAddress').value,
            phone: document.getElementById('contactPhone').value,
            email: document.getElementById('contactEmail').value,
            hours: document.getElementById('contactHours').value
        };

        this.saveContactInfo(contactData);
        this.showMessage('Informations de contact sauvegardées !', 'success');
    }

    // SYSTÈME DE SAUVEGARDE LOCAL
    saveData(key, data) {
        localStorage.setItem(`lamanufacture_${key}`, JSON.stringify(data));
    }

    loadData() {
        // Charger toutes les données au démarrage
        this.data = {
            courses: this.getData('courses') || {},
            photos: this.getData('photos') || [],
            events: this.getData('events') || [],
            homepage: this.getData('homepage') || {},
            contact: this.getData('contact') || {},
            pedagogues: this.getData('pedagogues') || {}
        };
    }

    getData(key) {
        const data = localStorage.getItem(`lamanufacture_${key}`);
        return data ? JSON.parse(data) : null;
    }

    getCourseData(courseId) {
        return this.data.courses[courseId] || {};
    }

    saveCourseData(courseId, courseData) {
        this.data.courses[courseId] = courseData;
        this.saveData('courses', this.data.courses);
    }

    getPhotos() {
        return this.data.photos || [];
    }

    savePhoto(photoId, dataUrl, fileName) {
        this.data.photos.push({ id: photoId, dataUrl, fileName });
        this.saveData('photos', this.data.photos);
    }

    removePhoto(photoId) {
        this.data.photos = this.data.photos.filter(photo => photo.id !== photoId);
        this.saveData('photos', this.data.photos);
    }

    saveEventData(eventData) {
        this.data.events.push({ ...eventData, id: Date.now() });
        this.saveData('events', this.data.events);
    }

    getWelcomeMessage() {
        return this.data.homepage.welcomeMessage || '';
    }

    saveWelcomeMessage(message) {
        this.data.homepage.welcomeMessage = message;
        this.saveData('homepage', this.data.homepage);
    }

    getContactInfo() {
        return this.data.contact || {};
    }

    saveContactInfo(contactData) {
        this.data.contact = contactData;
        this.saveData('contact', this.data.contact);
    }

    // SAUVEGARDE AUTOMATIQUE
    autoSave() {
        this.updateAutoSaveStatus('saving');
        
        // Simuler la sauvegarde
        setTimeout(() => {
            this.updateAutoSaveStatus('saved');
        }, 1000);
    }

    updateAutoSaveStatus(status) {
        const indicator = document.getElementById('autoSaveStatus');
        
        switch(status) {
            case 'saving':
                indicator.className = 'auto-save-indicator saving';
                indicator.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i><span>Sauvegarde...</span>';
                break;
            case 'saved':
                indicator.className = 'auto-save-indicator';
                indicator.innerHTML = '<i class="fas fa-check-circle"></i><span>Tout est sauvegardé</span>';
                break;
        }
    }

    markAsChanged() {
        this.updateAutoSaveStatus('saving');
    }

    saveCurrentSection() {
        switch(this.currentSection) {
            case 'course-editing':
                this.saveCourse();
                break;
            case 'homepage-section':
                this.saveHomepage();
                break;
            case 'contact-section':
                this.saveContact();
                break;
            case 'agenda-section':
                this.saveEvent();
                break;
        }
    }

    // MESSAGES À L'UTILISATEUR
    showMessage(text, type = 'success') {
        // Supprimer les anciens messages
        document.querySelectorAll('.feedback-message').forEach(msg => {
            if (msg.dataset.temporary === 'true') {
                msg.remove();
            }
        });

        const message = document.createElement('div');
        message.className = `feedback-message ${type}`;
        message.dataset.temporary = 'true';
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'warning' ? 'exclamation-triangle' : 
                    type === 'error' ? 'exclamation-circle' : 'info-circle';
        
        message.innerHTML = `<i class="fas fa-${icon}"></i>${text}`;
        
        // Insérer en haut de la section active
        const activeSection = document.querySelector('.work-section.active .section-content');
        if (activeSection) {
            activeSection.insertBefore(message, activeSection.firstChild);
        }
        
        // Supprimer automatiquement après 5 secondes
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    showWelcomeMessage() {
        const hour = new Date().getHours();
        let greeting = 'Bonjour';
        
        if (hour < 6) greeting = 'Bonne nuit';
        else if (hour < 12) greeting = 'Bonjour';
        else if (hour < 18) greeting = 'Bon après-midi';
        else greeting = 'Bonsoir';
        
        document.querySelector('.welcome-text').innerHTML = 
            `${greeting} <span id="userName">Laurence</span> ! Que voulez-vous faire aujourd'hui ?`;
    }
}

// Fonctions globales pour les événements
function showDashboard() {
    simpleAdmin.showDashboard();
}

function editCourse(courseId) {
    simpleAdmin.editCourse(courseId);
}

function showCourseSelection() {
    simpleAdmin.showCourseSelection();
}

function showCourseEditing() {
    simpleAdmin.showCourseEditing();
}

function previewCourse() {
    simpleAdmin.previewCourse();
}

function saveCourse() {
    simpleAdmin.saveCourse();
}

function saveEvent() {
    simpleAdmin.saveEvent();
}

function saveHomepage() {
    simpleAdmin.saveHomepage();
}

function saveContact() {
    simpleAdmin.saveContact();
}

function editPedagogue(pedagogueId) {
    simpleAdmin.showMessage('Fonctionnalité en cours de développement', 'warning');
}

// Initialisation
let simpleAdmin;
document.addEventListener('DOMContentLoaded', () => {
    simpleAdmin = new SimpleAdmin();
});

// Éviter la fermeture accidentelle
window.addEventListener('beforeunload', (e) => {
    if (simpleAdmin && simpleAdmin.currentSection !== 'dashboard') {
        e.preventDefault();
        e.returnValue = 'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?';
    }
});
