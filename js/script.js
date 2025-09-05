window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    setTimeout(function() {
        preloader.style.display = 'none';
    }, 2000); // Attend la fin de l'animation de la fleur
});

document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.fade-in-section');

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
});

// Fonction améliorée pour gérer l'expansion/contraction des profils de pédagogues
function togglePedagogue(pedagogueId) {
    const expandable = document.querySelector(`#${pedagogueId}-details`).parentElement;
    const details = document.querySelector(`#${pedagogueId}-details`);
    const isCurrentlyExpanded = expandable.classList.contains('expanded');
    
    // Fermer tous les profils ouverts avec animation
    const allExpandables = document.querySelectorAll('.pedagogue-expandable');
    allExpandables.forEach(item => {
        if (item.classList.contains('expanded')) {
            item.classList.remove('expanded');
            const otherDetails = item.querySelector('.pedagogue-details');
            otherDetails.classList.remove('expanded');
        }
    });
    
    // Si le profil n'était pas ouvert, l'ouvrir
    if (!isCurrentlyExpanded) {
        // Petit délai pour permettre la fermeture des autres
        setTimeout(() => {
            expandable.classList.add('expanded');
            details.classList.add('expanded');
            
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

// Fermeture avec la touche Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const openPedagogue = document.querySelector('.pedagogue-expandable.expanded');
        if (openPedagogue) {
            const pedagogueId = openPedagogue.querySelector('.pedagogue-details').id.replace('-details', '');
            togglePedagogue(pedagogueId);
        }
    }
});

// Amélioration de l'accessibilité - focus management
document.addEventListener('DOMContentLoaded', function() {
    const pedagogueCards = document.querySelectorAll('.pedagogue-card.clickable');
    
    pedagogueCards.forEach(card => {
        // Rendre les cartes accessibles au clavier
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-expanded', 'false');
        
        // Support clavier
        card.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const pedagogueId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
                togglePedagogue(pedagogueId);
            }
        });
        
        // Mise à jour de l'état aria-expanded
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isExpanded = mutation.target.classList.contains('expanded');
                    card.setAttribute('aria-expanded', isExpanded.toString());
                }
            });
        });
        
        observer.observe(card.parentElement, { attributes: true });
    });
});

// MENU HAMBURGER MODERNE - Inspiré ERACM
document.addEventListener('DOMContentLoaded', function() {
    // Créer le bouton hamburger et le menu mobile
    createMobileMenu();
    
    // Gestion des événements
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileClose = document.querySelector('.mobile-nav-close');
    
    if (mobileToggle && mobileOverlay && mobileClose) {
        mobileToggle.addEventListener('click', openMobileMenu);
        mobileClose.addEventListener('click', closeMobileMenu);
        mobileOverlay.addEventListener('click', function(e) {
            if (e.target === mobileOverlay) {
                closeMobileMenu();
            }
        });
        
        // Fermeture avec Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileOverlay.style.display === 'block') {
                closeMobileMenu();
            }
        });
    }
});

function createMobileMenu() {
    const header = document.querySelector('header');
    const nav = document.querySelector('header nav');
    
    if (!header || !nav) return;
    
    // Créer le bouton hamburger
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-menu-toggle';
    mobileToggle.innerHTML = '☰';
    mobileToggle.setAttribute('aria-label', 'Ouvrir le menu');
    
    // Ajouter le bouton après le h1
    const h1 = header.querySelector('h1');
    h1.insertAdjacentElement('afterend', mobileToggle);
    
    // Créer le menu overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-nav-menu';
    
    // Bouton fermer
    const closeBtn = document.createElement('button');
    closeBtn.className = 'mobile-nav-close';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'Fermer le menu');
    
    // Copier la navigation
    const navClone = nav.cloneNode(true);
    
    // Assembler le menu
    mobileMenu.appendChild(closeBtn);
    mobileMenu.appendChild(navClone);
    overlay.appendChild(mobileMenu);
    document.body.appendChild(overlay);
}

function openMobileMenu() {
    const overlay = document.querySelector('.mobile-nav-overlay');
    const mobileMenu = document.querySelector('.mobile-nav-menu');
    
    if (overlay && mobileMenu) {
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Animation d'entrée
        setTimeout(() => {
            overlay.style.opacity = '1';
            mobileMenu.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
        
        // Focus sur le premier lien
        const firstLink = mobileMenu.querySelector('a');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 300);
        }
    }
}

function closeMobileMenu() {
    const overlay = document.querySelector('.mobile-nav-overlay');
    const mobileMenu = document.querySelector('.mobile-nav-menu');
    
    if (overlay && mobileMenu) {
        // Animation de sortie
        overlay.style.opacity = '0';
        mobileMenu.style.transform = 'translate(-50%, -50%) scale(0.9)';
        
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
