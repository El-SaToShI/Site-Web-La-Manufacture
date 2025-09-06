/**
 * SYSTÈME D'AIDE CONTEXTUELLE
 * Guide pas-à-pas pour utilisateurs non-techniques
 * Bulles d'aide, tutoriels interactifs, FAQ
 */

class HelpSystem {
    constructor() {
        this.isActive = false;
        this.currentTutorial = null;
        this.helpData = this.getHelpData();
        this.init();
    }

    init() {
        this.createHelpButton();
        this.createHelpPanel();
        this.setupContextualHelp();
        this.setupTutorials();
        this.setupFAQ();
    }

    createHelpButton() {
        // Bouton d'aide flottant
        const helpButton = document.createElement('div');
        helpButton.id = 'helpButton';
        helpButton.className = 'help-button';
        helpButton.innerHTML = `
            <i class="fas fa-question-circle"></i>
            <span class="help-tooltip">Besoin d'aide ?</span>
        `;
        
        helpButton.addEventListener('click', () => {
            this.toggleHelpPanel();
        });

        document.body.appendChild(helpButton);
    }

    createHelpPanel() {
        const helpPanel = document.createElement('div');
        helpPanel.id = 'helpPanel';
        helpPanel.className = 'help-panel';
        helpPanel.innerHTML = `
            <div class="help-header">
                <h3><i class="fas fa-life-ring"></i> Centre d'Aide</h3>
                <button class="help-close" onclick="helpSystem.closeHelp()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="help-content">
                <!-- Navigation de l'aide -->
                <div class="help-nav">
                    <button class="help-nav-btn active" data-section="quick-help">
                        <i class="fas fa-bolt"></i> Aide Rapide
                    </button>
                    <button class="help-nav-btn" data-section="tutorials">
                        <i class="fas fa-play-circle"></i> Tutoriels
                    </button>
                    <button class="help-nav-btn" data-section="faq">
                        <i class="fas fa-question"></i> Questions Fréquentes
                    </button>
                    <button class="help-nav-btn" data-section="contact-support">
                        <i class="fas fa-headset"></i> Contact
                    </button>
                </div>

                <!-- Section Aide Rapide -->
                <div class="help-section active" id="quick-help">
                    <h4>Que voulez-vous faire ?</h4>
                    <div class="quick-help-grid">
                        <div class="quick-help-card" data-action="modify-course">
                            <i class="fas fa-graduation-cap"></i>
                            <h5>Modifier un cours</h5>
                            <p>Changer la description, le prix ou les horaires</p>
                        </div>
                        <div class="quick-help-card" data-action="add-photo">
                            <i class="fas fa-camera"></i>
                            <h5>Ajouter une photo</h5>
                            <p>Mettre de nouvelles images sur le site</p>
                        </div>
                        <div class="quick-help-card" data-action="add-event">
                            <i class="fas fa-calendar-plus"></i>
                            <h5>Ajouter un spectacle</h5>
                            <p>Annoncer un nouveau spectacle ou événement</p>
                        </div>
                        <div class="quick-help-card" data-action="change-contact">
                            <i class="fas fa-phone"></i>
                            <h5>Changer les contacts</h5>
                            <p>Modifier l'adresse, téléphone ou email</p>
                        </div>
                    </div>
                </div>

                <!-- Section Tutoriels -->
                <div class="help-section" id="tutorials">
                    <h4>Tutoriels Vidéo</h4>
                    <div class="tutorials-list">
                        <div class="tutorial-item" data-tutorial="first-steps">
                            <div class="tutorial-thumbnail">
                                <i class="fas fa-play-circle"></i>
                            </div>
                            <div class="tutorial-info">
                                <h5>Premiers Pas</h5>
                                <p>Découvrez l'interface en 3 minutes</p>
                                <span class="tutorial-duration">3 min</span>
                            </div>
                        </div>
                        <div class="tutorial-item" data-tutorial="edit-course">
                            <div class="tutorial-thumbnail">
                                <i class="fas fa-play-circle"></i>
                            </div>
                            <div class="tutorial-info">
                                <h5>Modifier un Cours</h5>
                                <p>Guide complet pour éditer vos cours</p>
                                <span class="tutorial-duration">5 min</span>
                            </div>
                        </div>
                        <div class="tutorial-item" data-tutorial="manage-photos">
                            <div class="tutorial-thumbnail">
                                <i class="fas fa-play-circle"></i>
                            </div>
                            <div class="tutorial-info">
                                <h5>Gérer les Photos</h5>
                                <p>Ajouter et organiser vos images</p>
                                <span class="tutorial-duration">4 min</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section FAQ -->
                <div class="help-section" id="faq">
                    <h4>Questions Fréquentes</h4>
                    <div class="faq-list">
                        <div class="faq-item">
                            <div class="faq-question">
                                <h5>Comment sauvegarder mes modifications ?</h5>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="faq-answer">
                                <p>Vos modifications sont automatiquement sauvegardées toutes les 30 secondes. Vous pouvez aussi appuyer sur Ctrl+S pour sauvegarder immédiatement.</p>
                            </div>
                        </div>
                        <div class="faq-item">
                            <div class="faq-question">
                                <h5>Mes photos sont-elles automatiquement redimensionnées ?</h5>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="faq-answer">
                                <p>Oui ! Quand vous ajoutez une photo, elle est automatiquement redimensionnée pour le web. Pas besoin de vous en préoccuper.</p>
                            </div>
                        </div>
                        <div class="faq-item">
                            <div class="faq-question">
                                <h5>Comment annuler une modification ?</h5>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="faq-answer">
                                <p>Utilisez Ctrl+Z pour annuler la dernière action, ou cliquez sur "Retour" pour revenir à l'écran précédent sans sauvegarder.</p>
                            </div>
                        </div>
                        <div class="faq-item">
                            <div class="faq-question">
                                <h5>Que faire si je ne vois pas mes modifications sur le site ?</h5>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="faq-answer">
                                <p>Attendez quelques minutes puis actualisez la page (F5). Si le problème persiste, contactez le support technique.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section Contact Support -->
                <div class="help-section" id="contact-support">
                    <h4>Besoin d'une Aide Personnalisée ?</h4>
                    <div class="support-options">
                        <div class="support-card">
                            <i class="fas fa-envelope"></i>
                            <h5>Email</h5>
                            <p>support@lamanufacture.fr</p>
                            <p class="support-time">Réponse sous 24h</p>
                        </div>
                        <div class="support-card">
                            <i class="fas fa-phone"></i>
                            <h5>Téléphone</h5>
                            <p>01 23 45 67 89</p>
                            <p class="support-time">Lun-Ven 9h-18h</p>
                        </div>
                        <div class="support-card">
                            <i class="fas fa-video"></i>
                            <h5>Assistance à Distance</h5>
                            <p>Prise en main de votre ordinateur</p>
                            <p class="support-time">Sur rendez-vous</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(helpPanel);
        this.setupHelpNavigation();
    }

    setupHelpNavigation() {
        // Navigation dans le panel d'aide
        document.querySelectorAll('.help-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                this.showHelpSection(section);
                
                // Mise à jour de l'état actif
                document.querySelectorAll('.help-nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // FAQ accordion
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                faqItem.classList.toggle('active');
            });
        });

        // Actions d'aide rapide
        document.querySelectorAll('.quick-help-card').forEach(card => {
            card.addEventListener('click', () => {
                const action = card.dataset.action;
                this.handleQuickHelpAction(action);
            });
        });

        // Tutoriels
        document.querySelectorAll('.tutorial-item').forEach(item => {
            item.addEventListener('click', () => {
                const tutorial = item.dataset.tutorial;
                this.startTutorial(tutorial);
            });
        });
    }

    setupContextualHelp() {
        // Aide contextuelle basée sur la position de l'utilisateur
        document.addEventListener('mouseover', (e) => {
            if (e.target.dataset.helpTip) {
                this.showContextualTip(e.target);
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.dataset.helpTip) {
                this.hideContextualTip();
            }
        });
    }

    setupTutorials() {
        // Configuration des tutoriels interactifs
        this.tutorials = {
            'first-steps': this.getFirstStepsTutorial(),
            'edit-course': this.getEditCourseTutorial(),
            'manage-photos': this.getManagePhotosTutorial()
        };
    }

    setupFAQ() {
        // Système de recherche dans la FAQ
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Rechercher dans la FAQ...';
        searchInput.className = 'faq-search';
        
        searchInput.addEventListener('input', (e) => {
            this.searchFAQ(e.target.value);
        });
    }

    // GESTION DES SECTIONS D'AIDE
    showHelpSection(sectionId) {
        document.querySelectorAll('.help-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }

    // ACTIONS D'AIDE RAPIDE
    handleQuickHelpAction(action) {
        this.closeHelp();
        
        switch(action) {
            case 'modify-course':
                this.startTutorial('edit-course');
                if (simpleAdmin) simpleAdmin.handleAction('courses');
                break;
            case 'add-photo':
                this.startTutorial('manage-photos');
                if (simpleAdmin) simpleAdmin.handleAction('photos');
                break;
            case 'add-event':
                if (simpleAdmin) simpleAdmin.handleAction('agenda');
                this.showContextualGuidance('event-form');
                break;
            case 'change-contact':
                if (simpleAdmin) simpleAdmin.handleAction('contact');
                this.showContextualGuidance('contact-form');
                break;
        }
    }

    // TUTORIELS INTERACTIFS
    startTutorial(tutorialId) {
        const tutorial = this.tutorials[tutorialId];
        if (!tutorial) return;

        this.currentTutorial = tutorialId;
        this.showTutorialOverlay(tutorial);
    }

    showTutorialOverlay(tutorial) {
        const overlay = document.createElement('div');
        overlay.className = 'tutorial-overlay';
        overlay.innerHTML = `
            <div class="tutorial-modal">
                <div class="tutorial-header">
                    <h3>${tutorial.title}</h3>
                    <button class="tutorial-close" onclick="helpSystem.closeTutorial()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="tutorial-content">
                    <div class="tutorial-step" id="tutorialStep">
                        <!-- Contenu dynamique -->
                    </div>
                    <div class="tutorial-navigation">
                        <button class="tutorial-btn secondary" id="tutorialPrev" style="display: none;">
                            <i class="fas fa-arrow-left"></i> Précédent
                        </button>
                        <div class="tutorial-progress">
                            <span id="tutorialProgress">1 / ${tutorial.steps.length}</span>
                        </div>
                        <button class="tutorial-btn primary" id="tutorialNext">
                            Suivant <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this.currentStep = 0;
        this.showTutorialStep(tutorial.steps[0]);
        this.setupTutorialNavigation(tutorial);
    }

    setupTutorialNavigation(tutorial) {
        const prevBtn = document.getElementById('tutorialPrev');
        const nextBtn = document.getElementById('tutorialNext');

        nextBtn.addEventListener('click', () => {
            if (this.currentStep < tutorial.steps.length - 1) {
                this.currentStep++;
                this.showTutorialStep(tutorial.steps[this.currentStep]);
                this.updateTutorialNavigation(tutorial);
            } else {
                this.closeTutorial();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (this.currentStep > 0) {
                this.currentStep--;
                this.showTutorialStep(tutorial.steps[this.currentStep]);
                this.updateTutorialNavigation(tutorial);
            }
        });
    }

    showTutorialStep(step) {
        const stepElement = document.getElementById('tutorialStep');
        stepElement.innerHTML = `
            <div class="tutorial-step-content">
                <div class="tutorial-image">
                    <i class="${step.icon} tutorial-step-icon"></i>
                </div>
                <h4>${step.title}</h4>
                <p>${step.description}</p>
                ${step.action ? `<div class="tutorial-action">${step.action}</div>` : ''}
            </div>
        `;

        // Mettre en évidence l'élément ciblé
        if (step.target) {
            this.highlightElement(step.target);
        }
    }

    updateTutorialNavigation(tutorial) {
        const prevBtn = document.getElementById('tutorialPrev');
        const nextBtn = document.getElementById('tutorialNext');
        const progress = document.getElementById('tutorialProgress');

        prevBtn.style.display = this.currentStep > 0 ? 'block' : 'none';
        nextBtn.textContent = this.currentStep === tutorial.steps.length - 1 ? 'Terminer' : 'Suivant';
        progress.textContent = `${this.currentStep + 1} / ${tutorial.steps.length}`;
    }

    highlightElement(selector) {
        // Supprimer les anciens highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });

        // Ajouter le nouveau highlight
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('tutorial-highlight');
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // AIDE CONTEXTUELLE
    showContextualTip(element) {
        const tip = element.dataset.helpTip;
        const tooltip = document.createElement('div');
        tooltip.className = 'contextual-tooltip';
        tooltip.textContent = tip;

        document.body.appendChild(tooltip);

        // Positionner le tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    }

    hideContextualTip() {
        const tooltip = document.querySelector('.contextual-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    showContextualGuidance(formType) {
        const guidance = this.getFormGuidance(formType);
        if (guidance) {
            setTimeout(() => {
                this.showGuidancePopup(guidance);
            }, 500);
        }
    }

    getFormGuidance(formType) {
        const guidances = {
            'event-form': {
                title: 'Ajouter un Événement',
                message: 'Remplissez ce formulaire pour ajouter un spectacle ou événement à votre agenda.',
                tips: [
                    'Commencez par choisir le type d\'événement',
                    'Donnez un titre accrocheur',
                    'N\'oubliez pas la date et l\'heure',
                    'Décrivez brièvement l\'événement'
                ]
            },
            'contact-form': {
                title: 'Modifier les Contacts',
                message: 'Mettez à jour vos informations de contact pour que vos élèves puissent vous joindre.',
                tips: [
                    'Vérifiez que l\'adresse est complète',
                    'Le téléphone doit être au bon format',
                    'L\'email sera visible sur le site',
                    'Précisez vos horaires d\'ouverture'
                ]
            }
        };

        return guidances[formType];
    }

    showGuidancePopup(guidance) {
        const popup = document.createElement('div');
        popup.className = 'guidance-popup';
        popup.innerHTML = `
            <div class="guidance-content">
                <div class="guidance-header">
                    <h4><i class="fas fa-lightbulb"></i> ${guidance.title}</h4>
                    <button class="guidance-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p>${guidance.message}</p>
                <ul class="guidance-tips">
                    ${guidance.tips.map(tip => `<li><i class="fas fa-check"></i> ${tip}</li>`).join('')}
                </ul>
                <button class="guidance-btn" onclick="this.parentElement.parentElement.remove()">
                    J'ai compris
                </button>
            </div>
        `;

        document.body.appendChild(popup);

        // Auto-suppression après 10 secondes
        setTimeout(() => {
            if (popup.parentElement) {
                popup.remove();
            }
        }, 10000);
    }

    // RECHERCHE FAQ
    searchFAQ(query) {
        const faqItems = document.querySelectorAll('.faq-item');
        const searchTerm = query.toLowerCase();

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question h5').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();

            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // CONTRÔLES GÉNÉRAUX
    toggleHelpPanel() {
        const panel = document.getElementById('helpPanel');
        panel.classList.toggle('active');
        this.isActive = !this.isActive;
    }

    closeHelp() {
        const panel = document.getElementById('helpPanel');
        panel.classList.remove('active');
        this.isActive = false;
    }

    closeTutorial() {
        const overlay = document.querySelector('.tutorial-overlay');
        if (overlay) {
            overlay.remove();
        }
        this.currentTutorial = null;
        this.currentStep = 0;

        // Supprimer les highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
    }

    // DONNÉES DES TUTORIELS
    getFirstStepsTutorial() {
        return {
            title: 'Premiers Pas dans l\'Interface',
            steps: [
                {
                    title: 'Bienvenue !',
                    description: 'Cette interface a été conçue pour être simple et intuitive. Vous allez pouvoir modifier votre site sans aucune connaissance technique.',
                    icon: 'fas fa-hand-peace'
                },
                {
                    title: 'Le Tableau de Bord',
                    description: 'Voici votre tableau de bord. Chaque carte colorée représente une action que vous pouvez faire : modifier vos cours, gérer vos photos, etc.',
                    icon: 'fas fa-th-large',
                    target: '.dashboard-simple'
                },
                {
                    title: 'Sauvegarde Automatique',
                    description: 'Vos modifications sont automatiquement sauvegardées. Regardez en haut à droite : cet indicateur vous dit que tout est bien enregistré.',
                    icon: 'fas fa-save',
                    target: '.auto-save-indicator'
                },
                {
                    title: 'Aide Toujours Disponible',
                    description: 'Si vous avez besoin d\'aide, cliquez sur ce bouton bleu. Il est toujours accessible depuis n\'importe quelle page.',
                    icon: 'fas fa-question-circle',
                    target: '#helpButton'
                }
            ]
        };
    }

    getEditCourseTutorial() {
        return {
            title: 'Modifier un Cours',
            steps: [
                {
                    title: 'Choisir le Cours',
                    description: 'Cliquez sur la carte "Mes Cours" pour commencer. Vous verrez alors tous vos cours disponibles.',
                    icon: 'fas fa-graduation-cap'
                },
                {
                    title: 'Sélectionner le Cours à Modifier',
                    description: 'Cliquez sur le cours que vous voulez modifier. Par exemple, "Théâtre Adultes".',
                    icon: 'fas fa-mouse-pointer'
                },
                {
                    title: 'Modifier les Informations',
                    description: 'Remplissez les champs comme dans un document Word. Vous pouvez mettre du texte en gras, italique, etc.',
                    icon: 'fas fa-edit'
                },
                {
                    title: 'Aperçu et Sauvegarde',
                    description: 'Cliquez sur "Aperçu" pour voir le résultat, puis "Sauvegarder" pour enregistrer vos modifications.',
                    icon: 'fas fa-eye'
                }
            ]
        };
    }

    getManagePhotosTutorial() {
        return {
            title: 'Gérer les Photos',
            steps: [
                {
                    title: 'Accéder aux Photos',
                    description: 'Cliquez sur la carte "Mes Photos" pour gérer vos images.',
                    icon: 'fas fa-camera'
                },
                {
                    title: 'Ajouter une Photo',
                    description: 'Glissez votre photo depuis votre ordinateur vers la zone pointillée, ou cliquez dessus pour choisir un fichier.',
                    icon: 'fas fa-upload'
                },
                {
                    title: 'Redimensionnement Automatique',
                    description: 'Votre photo est automatiquement redimensionnée pour le web. Pas besoin de vous en occuper !',
                    icon: 'fas fa-magic'
                },
                {
                    title: 'Organiser la Galerie',
                    description: 'Vos photos apparaissent dans la galerie. Survolez une photo pour la modifier ou la supprimer.',
                    icon: 'fas fa-images'
                }
            ]
        };
    }

    getHelpData() {
        return {
            quickActions: [
                { id: 'modify-course', label: 'Modifier un cours', icon: 'fas fa-graduation-cap' },
                { id: 'add-photo', label: 'Ajouter une photo', icon: 'fas fa-camera' },
                { id: 'add-event', label: 'Ajouter un spectacle', icon: 'fas fa-calendar-plus' },
                { id: 'change-contact', label: 'Changer les contacts', icon: 'fas fa-phone' }
            ]
        };
    }
}

// Initialisation du système d'aide
let helpSystem;
document.addEventListener('DOMContentLoaded', () => {
    helpSystem = new HelpSystem();
});

// Ajout des attributs d'aide contextuelle aux éléments
document.addEventListener('DOMContentLoaded', () => {
    // Ajouter des tips contextuels aux éléments importants
    const helpTips = {
        '.action-card-button': 'Cliquez pour commencer cette action',
        '.form-input-simple': 'Tapez votre texte ici comme dans Word',
        '.wysiwyg-btn': 'Utilisez ces boutons pour mettre en forme votre texte',
        '.upload-zone': 'Glissez vos photos ici ou cliquez pour en choisir',
        '.nav-button': 'Naviguez entre les étapes avec ces boutons'
    };

    Object.entries(helpTips).forEach(([selector, tip]) => {
        document.querySelectorAll(selector).forEach(element => {
            element.dataset.helpTip = tip;
        });
    });
});
