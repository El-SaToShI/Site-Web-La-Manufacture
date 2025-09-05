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
                redirectToMobileVersion();
            } else if (userChoice === 'desktop' && isMobilePage) {
                // Rediriger vers la version desktop
                redirectToDesktopVersion();
            }
            return;
        }
        
        // AMÉLIORATION: Pour les liens partagés ou première visite, toujours rediriger selon l'appareil
        const isMobile = isMobileDevice();
        
        // Redirection pour TOUTES les pages, pas seulement index
        if (isMobile && !isMobilePage) {
            // Utilisateur mobile sur page desktop -> rediriger vers mobile
            redirectToMobileVersion();
        } else if (!isMobile && isMobilePage) {
            // Utilisateur desktop sur page mobile -> rediriger vers desktop
            redirectToDesktopVersion();
        }
    }
    
    // Fonction pour rediriger vers la version mobile
    function redirectToMobileVersion() {
        const currentPage = window.location.pathname;
        let mobilePage = '';
        
        // Déterminer le chemin correct selon la position actuelle
        if (currentPage.includes('/pages/desktop/')) {
            // Depuis pages/desktop/, aller vers pages/mobile/
            if (currentPage.includes('a-propos.html')) {
                mobilePage = '../mobile/a-propos-mobile.html';
            } else if (currentPage.includes('cours.html')) {
                mobilePage = '../mobile/cours-mobile.html';
            } else if (currentPage.includes('pedagogues.html')) {
                mobilePage = '../mobile/pedagogues-mobile.html';
            } else if (currentPage.includes('contact.html')) {
                mobilePage = '../mobile/contact-mobile.html';
            } else if (currentPage.includes('pedagogue-laurence.html')) {
                mobilePage = '../mobile/pedagogue-laurence-mobile.html';
            } else {
                mobilePage = '../mobile/index-mobile.html';
            }
        } else {
            // Depuis la racine
            if (currentPage.endsWith('index.html') || currentPage.endsWith('/') || currentPage === '') {
                mobilePage = 'pages/mobile/index-mobile.html';
            } else if (currentPage.includes('a-propos.html')) {
                mobilePage = 'pages/mobile/a-propos-mobile.html';
            } else if (currentPage.includes('cours.html')) {
                mobilePage = 'pages/mobile/cours-mobile.html';
            } else if (currentPage.includes('pedagogues.html')) {
                mobilePage = 'pages/mobile/pedagogues-mobile.html';
            } else if (currentPage.includes('contact.html')) {
                mobilePage = 'pages/mobile/contact-mobile.html';
            } else if (currentPage.includes('pedagogue-laurence.html')) {
                mobilePage = 'pages/mobile/pedagogue-laurence-mobile.html';
            } else {
                mobilePage = 'pages/mobile/index-mobile.html';
            }
        }
        
        if (mobilePage) {
            window.location.href = mobilePage;
        }
    }
    
    // Fonction pour rediriger vers la version desktop
    function redirectToDesktopVersion() {
        const currentPage = window.location.pathname;
        let desktopPage = '';
        
        // Déterminer le chemin correct selon la position actuelle
        if (currentPage.includes('/pages/mobile/')) {
            // Depuis pages/mobile/, aller vers pages/desktop/ ou racine
            if (currentPage.includes('index-mobile.html')) {
                desktopPage = '../../index.html';
            } else if (currentPage.includes('a-propos-mobile.html')) {
                desktopPage = '../desktop/a-propos.html';
            } else if (currentPage.includes('cours-mobile.html')) {
                desktopPage = '../desktop/cours.html';
            } else if (currentPage.includes('pedagogues-mobile.html')) {
                desktopPage = '../desktop/pedagogues.html';
            } else if (currentPage.includes('contact-mobile.html')) {
                desktopPage = '../desktop/contact.html';
            } else if (currentPage.includes('pedagogue-laurence-mobile.html')) {
                desktopPage = '../desktop/pedagogue-laurence.html';
            } else {
                desktopPage = '../../index.html';
            }
        } else {
            // Depuis la racine ou autre endroit
            if (currentPage.includes('a-propos')) {
                desktopPage = 'pages/desktop/a-propos.html';
            } else if (currentPage.includes('cours')) {
                desktopPage = 'pages/desktop/cours.html';
            } else if (currentPage.includes('pedagogues')) {
                desktopPage = 'pages/desktop/pedagogues.html';
            } else if (currentPage.includes('contact')) {
                desktopPage = 'pages/desktop/contact.html';
            } else if (currentPage.includes('pedagogue-laurence')) {
                desktopPage = 'pages/desktop/pedagogue-laurence.html';
            } else {
                desktopPage = 'index.html';
            }
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
