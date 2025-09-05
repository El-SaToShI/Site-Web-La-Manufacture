// Note: Code preloader supprimé car non utilisé dans ce site

// Gestion des animations fade-in - Version sécurisée
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.fade-in-section');

    // Vérifier qu'il y a des sections à animer
    if (sections.length > 0) {
        const observer = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Gestion du menu hamburger mobile - Version sécurisée
    initMobileMenu();
});

// Fonction pour initialiser le menu mobile - VERSION RENFORCÉE
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileOverlay = document.querySelector('.mobile-nav-overlay');
    
    // Vérifier que les éléments existent
    if (!mobileToggle || !mobileOverlay) {
        return;
    }
    
    // Ouvrir le menu
    mobileToggle.addEventListener('click', function(e) {
        e.preventDefault();
        mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // CORRECTION CROIX - Event listener direct sur le document
    document.addEventListener('click', function(e) {
        // Si on clique sur le bouton de fermeture (croix)
        if (e.target.classList.contains('mobile-nav-close') || 
            e.target.closest('.mobile-nav-close')) {
            e.preventDefault();
            e.stopPropagation();
            closeMobileMenu();
            return;
        }
        
        // Si on clique sur l'overlay (en dehors du menu)
        if (e.target === mobileOverlay) {
            closeMobileMenu();
        }
    });
    
    // Fermer le menu avec la touche Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileOverlay.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Fermer le menu quand on clique sur un lien
    const mobileLinks = document.querySelectorAll('.mobile-nav-menu a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
}

// Fonction pour fermer le menu mobile
function closeMobileMenu() {
    const mobileOverlay = document.querySelector('.mobile-nav-overlay');
    if (mobileOverlay) {
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Rétablir le scroll
    }
}

// Fonction améliorée pour gérer l'expansion/contraction des profils de pédagogues - Version sécurisée
function togglePedagogue(pedagogueId) {
    // Vérifications de sécurité
    if (!pedagogueId) return;
    
    const detailsElement = document.querySelector(`#${pedagogueId}-details`);
    if (!detailsElement) return;
    
    const expandable = detailsElement.parentElement;
    if (!expandable) return;
    
    const isCurrentlyExpanded = expandable.classList.contains('expanded');
    
    // Fermer tous les profils ouverts avec animation
    const allExpandables = document.querySelectorAll('.pedagogue-expandable');
    allExpandables.forEach(item => {
        if (item.classList.contains('expanded')) {
            item.classList.remove('expanded');
            const otherDetails = item.querySelector('.pedagogue-details');
            if (otherDetails) {
                otherDetails.classList.remove('expanded');
            }
        }
    });
    
    // Si le profil n'était pas ouvert, l'ouvrir
    if (!isCurrentlyExpanded) {
        // Petit délai pour permettre la fermeture des autres
        setTimeout(() => {
            expandable.classList.add('expanded');
            detailsElement.classList.add('expanded');
            
            // Scroll vers le profil ouvert après l'animation
            setTimeout(() => {
                expandable.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
            }, 300);
        }, 100);
    }
}

// Fermeture avec la touche Escape - Version sécurisée
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const openPedagogue = document.querySelector('.pedagogue-expandable.expanded');
        if (openPedagogue) {
            const detailsElement = openPedagogue.querySelector('.pedagogue-details');
            if (detailsElement && detailsElement.id) {
                const pedagogueId = detailsElement.id.replace('-details', '');
                if (pedagogueId) {
                    togglePedagogue(pedagogueId);
                }
            }
        }
    }
});

// Amélioration de l'accessibilité - focus management - Version sécurisée
document.addEventListener('DOMContentLoaded', function() {
    const pedagogueCards = document.querySelectorAll('.pedagogue-card.clickable');
    
    if (pedagogueCards.length > 0) {
        pedagogueCards.forEach(card => {
            // Rendre les cartes accessibles au clavier
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-expanded', 'false');
            
            // Support clavier
            card.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    const onclickAttr = this.getAttribute('onclick');
                    if (onclickAttr) {
                        const match = onclickAttr.match(/'([^']+)'/);
                        if (match && match[1]) {
                            togglePedagogue(match[1]);
                        }
                    }
                }
            });
            
            // Mise à jour de l'état aria-expanded
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const expandableParent = mutation.target.closest('.pedagogue-expandable');
                        if (expandableParent) {
                            const isExpanded = expandableParent.classList.contains('expanded');
                            card.setAttribute('aria-expanded', isExpanded.toString());
                        }
                    }
                });
            });
            
            const parentExpandable = card.closest('.pedagogue-expandable');
            if (parentExpandable) {
                observer.observe(parentExpandable, { attributes: true });
            }
        });
    }
});

// MENU HAMBURGER MODERNE - Version Simplifiée et Sécurisée
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si on est sur mobile et si le bouton existe
    if (window.innerWidth <= 480) {
        initMobileMenu();
    }
    
    // Gérer le redimensionnement
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 480) {
            initMobileMenu();
        }
    });
});

function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (!mobileToggle) return;
    
    // Vérifier si le menu overlay existe déjà
    let overlay = document.querySelector('.mobile-nav-overlay');
    
    if (!overlay) {
        // Créer le menu overlay seulement s'il n'existe pas
        overlay = createMobileMenuOverlay();
    }
    
    // Ajouter les événements seulement une fois
    if (!mobileToggle.dataset.initialized) {
        mobileToggle.addEventListener('click', openMobileMenu);
        mobileToggle.dataset.initialized = 'true';
    }
}

function createMobileMenuOverlay() {
    const nav = document.querySelector('header nav');
    if (!nav) return null;
    
    // Créer le menu overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-nav-menu';
    
    // Bouton fermer
    const closeBtn = document.createElement('button');
    closeBtn.className = 'mobile-nav-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Fermer le menu');
    closeBtn.setAttribute('type', 'button');
    
    // Copier la navigation
    const navClone = nav.cloneNode(true);
    
    // Assembler le menu
    mobileMenu.appendChild(closeBtn);
    mobileMenu.appendChild(navClone);
    overlay.appendChild(mobileMenu);
    document.body.appendChild(overlay);
    
    // Ajouter les événements
    closeBtn.addEventListener('click', closeMobileMenu);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeMobileMenu();
        }
    });
    
    // Fermeture avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    return overlay;
}

function openMobileMenu() {
    const overlay = document.querySelector('.mobile-nav-overlay');
    
    if (overlay) {
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Animation d'entrée
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
        
        // Focus sur le premier lien
        const firstLink = overlay.querySelector('a');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 300);
        }
    }
}

function closeMobileMenu() {
    const overlay = document.querySelector('.mobile-nav-overlay');
    
    if (overlay) {
        overlay.classList.remove('active');
        
        setTimeout(() => {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
        
        // Remettre le focus sur le bouton hamburger
        const toggle = document.querySelector('.mobile-menu-toggle');
        if (toggle) {
            toggle.focus();
        }
    }
}
