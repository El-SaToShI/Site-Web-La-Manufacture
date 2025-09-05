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
    
    // Initialiser le mode sombre/clair pour desktop
    initThemeToggle();
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

// Gestion du mode sombre/clair - Desktop uniquement
function initThemeToggle() {
    console.log('initThemeToggle appelé, largeur écran:', window.innerWidth); // Debug
    
    // Temporairement: montrer le bouton sur mobile ET desktop pour debug
    // if (window.innerWidth <= 768) {
    //     console.log('Mobile détecté, pas de bouton thème'); // Debug
    //     return;
    // }
    
    console.log('Création du bouton thème pour tous les écrans (debug)'); // Debug
    
    // Créer le bouton de bascule
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Basculer entre mode clair et sombre');
    themeToggle.setAttribute('title', 'Changer le thème');
    
    // Récupérer le thème sauvegardé ou utiliser le thème clair par défaut
    const savedTheme = localStorage.getItem('theme') || 'light';
    console.log('Thème sauvegardé:', savedTheme); // Debug
    
    setTheme(savedTheme);
    updateToggleIcon(themeToggle, savedTheme);
    
    // Ajouter le bouton à la page
    document.body.appendChild(themeToggle);
    console.log('Bouton thème ajouté au DOM'); // Debug
    
    // Événement de clic
    themeToggle.addEventListener('click', function() {
        console.log('Bouton thème cliqué'); // Debug
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        console.log('Changement de thème:', currentTheme, '→', newTheme); // Debug
        setTheme(newTheme);
        updateToggleIcon(themeToggle, newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Gérer le redimensionnement - supprimer le bouton sur mobile
    window.addEventListener('resize', function() {
        console.log('Redimensionnement détecté, largeur:', window.innerWidth); // Debug
        if (window.innerWidth <= 768 && themeToggle.parentNode) {
            console.log('Suppression du bouton sur mobile'); // Debug
            themeToggle.remove();
        } else if (window.innerWidth > 768 && !themeToggle.parentNode) {
            console.log('Ajout du bouton sur desktop'); // Debug
            document.body.appendChild(themeToggle);
        }
    });
}

function setTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

function updateToggleIcon(button, theme) {
    if (theme === 'dark') {
        button.innerHTML = '☀️'; // Icône soleil pour passer au mode clair
        button.setAttribute('aria-label', 'Passer au mode clair');
        button.setAttribute('title', 'Passer au mode clair');
    } else {
        button.innerHTML = '🌙'; // Icône lune pour passer au mode sombre
        button.setAttribute('aria-label', 'Passer au mode sombre');
        button.setAttribute('title', 'Passer au mode sombre');
    }
}
