// AUTO-DETECTION DEVICE - Redirection intelligente
(function() {
    'use strict';
    
    // Fonction pour détecter si l'utilisateur est sur mobile
    function isMobileDevice() {
        // Détection par largeur d'écran
        const isMobileWidth = window.innerWidth <= 768;
        
        // Détection par User Agent (plus précise)
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Détection par support tactile
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Combinaison des critères (au moins 2 sur 3)
        const mobileScore = (isMobileWidth ? 1 : 0) + (isMobileUA ? 1 : 0) + (isTouchDevice ? 1 : 0);
        
        return mobileScore >= 2;
    }
    
    // Fonction pour détecter si l'utilisateur a déjà fait un choix
    function hasUserChoice() {
        return localStorage.getItem('la-manufacture-version-choice') !== null;
    }
    
    // Fonction pour sauvegarder le choix de l'utilisateur
    function saveUserChoice(version) {
        localStorage.setItem('la-manufacture-version-choice', version);
        localStorage.setItem('la-manufacture-choice-date', new Date().getTime());
    }
    
    // Fonction pour vérifier si le choix est encore valide (7 jours)
    function isChoiceValid() {
        const choiceDate = localStorage.getItem('la-manufacture-choice-date');
        if (!choiceDate) return false;
        
        const daysSinceChoice = (new Date().getTime() - parseInt(choiceDate)) / (1000 * 60 * 60 * 24);
        return daysSinceChoice < 7; // Choix valide pendant 7 jours
    }
    
    // Fonction principale de redirection AMÉLIORÉE
    function autoRedirect() {
        const currentPage = window.location.pathname;
        const isIndexPage = currentPage.endsWith('index.html') || currentPage.endsWith('/') || currentPage === '';
        const isMobilePage = currentPage.includes('-mobile.html');
        const isChoicePage = currentPage.includes('choose-version.html');
        
        // Ne pas rediriger si on est déjà sur la page de choix
        if (isChoicePage) return;
        
        // NOUVEAU: Détecter si c'est un lien partagé (première visite ou pas de choix récent)
        const isFirstVisit = !localStorage.getItem('la-manufacture-ever-visited');
        const hasRecentChoice = hasUserChoice() && isChoiceValid();
        
        // Marquer la visite pour les futures fois
        if (isFirstVisit) {
            localStorage.setItem('la-manufacture-ever-visited', 'true');
        }
        
        // Vérifier si l'utilisateur a déjà fait un choix valide
        if (hasRecentChoice) {
            const userChoice = localStorage.getItem('la-manufacture-version-choice');
            
            if (userChoice === 'mobile' && !isMobilePage) {
                // Rediriger vers la version mobile
                console.log('Redirection selon préférence: vers mobile');
                redirectToMobileVersion();
            } else if (userChoice === 'desktop' && isMobilePage) {
                // Rediriger vers la version desktop
                console.log('Redirection selon préférence: vers desktop');
                redirectToDesktopVersion();
            }
            return;
        }
        
        // AMÉLIORATION: Pour les liens partagés ou première visite, toujours rediriger selon l'appareil
        const isMobile = isMobileDevice();
        
        // Redirection pour TOUTES les pages, pas seulement index
        if (isMobile && !isMobilePage) {
            // Utilisateur mobile sur page desktop -> rediriger vers mobile
            console.log('Lien partagé/Première visite - Mobile détecté - Redirection vers version mobile');
            redirectToMobileVersion();
        } else if (!isMobile && isMobilePage) {
            // Utilisateur desktop sur page mobile -> rediriger vers desktop
            console.log('Lien partagé/Première visite - Desktop détecté - Redirection vers version desktop');
            redirectToDesktopVersion();
        }
    }
    
    // Fonction pour rediriger vers la version mobile
    function redirectToMobileVersion() {
        const currentPage = window.location.pathname;
        let mobilePage = '';
        
        if (currentPage.endsWith('index.html') || currentPage.endsWith('/') || currentPage === '') {
            mobilePage = 'index-mobile.html';
        } else if (currentPage.includes('a-propos.html')) {
            mobilePage = 'a-propos-mobile.html';
        } else if (currentPage.includes('cours.html')) {
            mobilePage = 'cours-mobile.html';
        } else if (currentPage.includes('pedagogues.html')) {
            mobilePage = 'pedagogues-mobile.html';
        } else if (currentPage.includes('contact.html')) {
            mobilePage = 'contact-mobile.html';
        } else if (currentPage.includes('pedagogue-laurence.html')) {
            mobilePage = 'pedagogue-laurence-mobile.html';
        } else {
            mobilePage = 'index-mobile.html';
        }
        
        if (mobilePage) {
            window.location.href = mobilePage;
        }
    }
    
    // Fonction pour rediriger vers la version desktop
    function redirectToDesktopVersion() {
        const currentPage = window.location.pathname;
        let desktopPage = '';
        
        if (currentPage.includes('index-mobile.html')) {
            desktopPage = 'index.html';
        } else if (currentPage.includes('a-propos-mobile.html')) {
            desktopPage = 'a-propos.html';
        } else if (currentPage.includes('cours-mobile.html')) {
            desktopPage = 'cours.html';
        } else if (currentPage.includes('pedagogues-mobile.html')) {
            desktopPage = 'pedagogues.html';
        } else if (currentPage.includes('contact-mobile.html')) {
            desktopPage = 'contact.html';
        } else if (currentPage.includes('pedagogue-laurence-mobile.html')) {
            desktopPage = 'pedagogue-laurence.html';
        } else {
            desktopPage = 'index.html';
        }
        
        if (desktopPage) {
            window.location.href = desktopPage;
        }
    }
    
    // Exposer les fonctions pour les boutons de choix
    window.LaManufactureAutoDetect = {
        saveUserChoice: saveUserChoice,
        redirectToMobile: function() {
            saveUserChoice('mobile');
            redirectToMobileVersion();
        },
        redirectToDesktop: function() {
            saveUserChoice('desktop');
            redirectToDesktopVersion();
        },
        showChoicePage: function() {
            window.location.href = 'choose-version.html';
        }
    };
    
    // Lancer la détection quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoRedirect);
    } else {
        autoRedirect();
    }
})();
