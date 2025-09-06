// ============================================
// SYSTÈME D'AUTHENTIFICATION AVANCÉ
// ============================================

class AdminAuth {
    constructor() {
        // Utilisation de la configuration centralisée
        this.config = ADMIN_CONFIG?.auth || {};
        this.users = this.config.users || {};
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.sessionTimer = null;
        
        // Sécurité renforcée
        this.loginAttempts = 0;
        this.maxAttempts = this.config.maxLoginAttempts || 3;
        this.lockoutTime = this.config.lockoutDuration || 15 * 60 * 1000;
        this.isLockedOut = false;
        
        this.init();
    }
    
    init() {
        this.checkExistingSession();
        this.bindEvents();
        this.startSessionMonitoring();
    }
    
    bindEvents() {
        const loginForm = document.getElementById('loginForm');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        // Surveillance d'activité pour maintenir la session
        document.addEventListener('mousemove', () => this.resetSessionTimer());
        document.addEventListener('keypress', () => this.resetSessionTimer());
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const loginBtn = e.target.querySelector('button[type="submit"]');
        
        // Animation de chargement
        this.setLoadingState(loginBtn, true);
        
        // Simulation d'authentification avec délai pour effet UX
        await this.delay(1000);
        
        if (this.authenticate(username, password)) {
            this.loginSuccess(username);
        } else {
            this.loginError();
        }
        
        this.setLoadingState(loginBtn, false);
    }
    
    authenticate(username, password) {
        return this.users[username] && this.users[username] === password;
    }
    
    loginSuccess(username) {
        this.currentUser = username;
        
        // Sauvegarder la session
        const sessionData = {
            user: username,
            timestamp: Date.now(),
            expires: Date.now() + this.sessionTimeout
        };
        
        localStorage.setItem('adminSession', JSON.stringify(sessionData));
        sessionStorage.setItem('adminActive', 'true');
        
        // Afficher l'interface d'administration
        this.showAdminInterface();
        
        // Démarrer le timer de session
        this.startSessionTimer();
        
        // Log de l'activité
        this.logActivity(`Connexion réussie pour ${username}`);
        
        // Animation d'entrée
        this.animateInterfaceEntry();
    }
    
    loginError() {
        const loginForm = document.getElementById('loginForm');
        
        // Retirer les anciens messages d'erreur
        this.removeErrorMessages();
        
        // Ajouter le message d'erreur
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error';
        errorDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Nom d\'utilisateur ou mot de passe incorrect';
        
        loginForm.insertBefore(errorDiv, loginForm.firstChild);
        
        // Animation de secousse
        loginForm.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            loginForm.style.animation = '';
        }, 500);
        
        // Effacer les champs
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('username').focus();
    }
    
    logout() {
        // Demander confirmation
        if (!confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            return;
        }
        
        // Nettoyer la session
        localStorage.removeItem('adminSession');
        sessionStorage.removeItem('adminActive');
        
        // Arrêter les timers
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        // Log de l'activité
        this.logActivity(`Déconnexion de ${this.currentUser}`);
        
        this.currentUser = null;
        
        // Retour à l'écran de connexion
        this.showLoginScreen();
    }
    
    checkExistingSession() {
        const sessionData = localStorage.getItem('adminSession');
        
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                
                if (session.expires > Date.now()) {
                    this.currentUser = session.user;
                    this.showAdminInterface();
                    this.startSessionTimer();
                    return true;
                }
            } catch (e) {
                console.error('Erreur lors de la vérification de session:', e);
            }
        }
        
        this.showLoginScreen();
        return false;
    }
    
    startSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        this.sessionTimer = setTimeout(() => {
            this.sessionExpired();
        }, this.sessionTimeout);
    }
    
    resetSessionTimer() {
        if (this.currentUser) {
            // Mettre à jour l'horodatage de session
            const sessionData = localStorage.getItem('adminSession');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                session.expires = Date.now() + this.sessionTimeout;
                localStorage.setItem('adminSession', JSON.stringify(session));
            }
            
            this.startSessionTimer();
        }
    }
    
    sessionExpired() {
        alert('Votre session a expiré. Veuillez vous reconnecter.');
        this.logout();
    }
    
    startSessionMonitoring() {
        // Vérifier toutes les minutes si la session est toujours valide
        setInterval(() => {
            if (this.currentUser) {
                const sessionData = localStorage.getItem('adminSession');
                if (!sessionData) {
                    this.logout();
                    return;
                }
                
                try {
                    const session = JSON.parse(sessionData);
                    if (session.expires <= Date.now()) {
                        this.sessionExpired();
                    }
                } catch (e) {
                    this.logout();
                }
            }
        }, 60000); // Vérifier chaque minute
    }
    
    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminInterface').style.display = 'none';
        
        // Focus sur le champ username
        setTimeout(() => {
            const usernameField = document.getElementById('username');
            if (usernameField) {
                usernameField.focus();
            }
        }, 100);
    }
    
    showAdminInterface() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminInterface').style.display = 'flex';
        
        // Mettre à jour l'affichage du nom d'utilisateur
        const userDisplay = document.getElementById('currentUser');
        if (userDisplay) {
            userDisplay.textContent = this.currentUser;
        }
    }
    
    animateInterfaceEntry() {
        const adminInterface = document.getElementById('adminInterface');
        adminInterface.style.opacity = '0';
        adminInterface.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            adminInterface.style.transition = 'all 0.3s ease';
            adminInterface.style.opacity = '1';
            adminInterface.style.transform = 'scale(1)';
        }, 50);
    }
    
    setLoadingState(button, loading) {
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<div class="spinner"></div> Connexion...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Se connecter';
        }
    }
    
    removeErrorMessages() {
        const errorMessages = document.querySelectorAll('.message.error');
        errorMessages.forEach(msg => msg.remove());
    }
    
    logActivity(message) {
        const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
        activities.unshift({
            message,
            timestamp: Date.now(),
            user: this.currentUser
        });
        
        // Garder seulement les 50 dernières activités
        if (activities.length > 50) {
            activities.splice(50);
        }
        
        localStorage.setItem('adminActivities', JSON.stringify(activities));
        
        // Mettre à jour l'affichage si nécessaire
        this.updateActivityFeed();
    }
    
    updateActivityFeed() {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;
        
        const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
        
        activityFeed.innerHTML = activities.slice(0, 5).map(activity => `
            <div class="activity-item">
                <i class="fas fa-clock"></i>
                <span>${activity.message}</span>
                <time>${this.formatTime(activity.timestamp)}</time>
            </div>
        `).join('');
    }
    
    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) return 'Il y a moins d\'une minute';
        if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} minutes`;
        if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} heures`;
        
        return new Date(timestamp).toLocaleDateString('fr-FR');
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Méthodes utilitaires pour d'autres modules
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    requireAuth(callback) {
        if (this.isAuthenticated()) {
            callback();
        } else {
            alert('Vous devez être connecté pour effectuer cette action.');
            this.showLoginScreen();
        }
    }
}

// CSS pour l'animation de secousse
const shakeCSS = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}
`;

// Ajouter le CSS d'animation
const style = document.createElement('style');
style.textContent = shakeCSS;
document.head.appendChild(style);

// Exporter pour utilisation globale
window.AdminAuth = AdminAuth;
