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
