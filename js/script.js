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
    
    // ======= SUPPRESSION INITTHEMETOGGLE() =======
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
    
    // EVENT LISTENER GLOBAL - Délégation d'événements pour la fermeture du menu
    // Cela fonctionne sur TOUTES les pages mobiles
    document.addEventListener('click', function(e) {
        // Fermeture par la croix - Multiple vérifications pour fiabilité maximale
        if (e.target.classList.contains('mobile-nav-close') || 
            e.target.closest('.mobile-nav-close') ||
            e.target.textContent === '×' ||
            (e.target.tagName === 'SPAN' && e.target.textContent === '×')) {
            
            closeMobileMenu();
            return;
        }
        
        // Fermeture par clic sur l'overlay (zone sombre)
        if (e.target.classList.contains('mobile-nav-overlay')) {
            closeMobileMenu();
            return;
        }
    });
    
    // Fermeture avec la touche Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

// Fonction de fermeture du menu mobile - AVEC LOGGING
function closeMobileMenu() {
    const mobileOverlay = document.querySelector('.mobile-nav-overlay');
    if (mobileOverlay && mobileOverlay.classList.contains('active')) {
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
        console.log('Menu mobile fermé'); // Pour debug
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

// Fonction pour gérer l'expansion des pédagogues sur mobile - Version adaptée mobile
function togglePedagogueMobile(pedagogueId) {
    console.log('togglePedagogueMobile appelé avec:', pedagogueId); // Debug
    
    // Vérifications de sécurité
    if (!pedagogueId) {
        console.log('pedagogueId manquant');
        return;
    }
    
    const detailsElement = document.querySelector(`#${pedagogueId}-details-mobile`);
    if (!detailsElement) {
        console.log('Élément details non trouvé:', `#${pedagogueId}-details-mobile`);
        return;
    }
    
    const expandable = detailsElement.parentElement;
    if (!expandable) {
        console.log('Parent expandable non trouvé');
        return;
    }
    
    const isCurrentlyExpanded = detailsElement.style.display === 'block';
    console.log('Actuellement expanded:', isCurrentlyExpanded);
    
    // Fermer tous les profils ouverts
    const allDetailsMobile = document.querySelectorAll('.pedagogue-details-mobile');
    allDetailsMobile.forEach(item => {
        item.style.display = 'none';
    });
    
    // Si le profil n'était pas ouvert, l'ouvrir
    if (!isCurrentlyExpanded) {
        detailsElement.style.display = 'block';
        console.log('Profil ouvert pour:', pedagogueId);
        
        // Scroll vers le profil ouvert après un petit délai
        setTimeout(() => {
            expandable.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
        }, 100);
    } else {
        console.log('Profil fermé pour:', pedagogueId);
    }
}

// Fermeture avec la touche Escape - Version sécurisée pour desktop et mobile
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // Fermeture version desktop
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
        
        // Fermeture version mobile
        const openDetailsMobile = document.querySelector('.pedagogue-details-mobile[style*="display: block"]');
        if (openDetailsMobile && openDetailsMobile.id) {
            const pedagogueId = openDetailsMobile.id.replace('-details-mobile', '');
            if (pedagogueId) {
                togglePedagogueMobile(pedagogueId);
            }
        }
    }
});

// ======= TOUTES LES FONCTIONS THEME SUPPRIMÉES =======
