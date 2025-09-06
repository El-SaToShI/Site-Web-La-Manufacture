/**
 * 🌟 SYSTÈME DE GESTION DE CONTENU - LA MANUFACTURE
 * 📅 Version adaptée GitHub Pages
 * 🎯 Gestion dynamique du contenu sans PHP
 */

class ContentManager {
    constructor() {
        this.data = null;
        this.apiUrl = './data/site-data.json';
        this.init();
    }

    /**
     * 🚀 Initialisation du système
     */
    async init() {
        try {
            await this.loadData();
            this.initializePages();
            console.log('✅ ContentManager initialisé avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
        }
    }

    /**
     * 📊 Chargement des données
     */
    async loadData() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            this.data = await response.json();
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données:', error);
            // Fallback avec données par défaut
            this.data = { pedagogues: [], lastUpdate: new Date().toISOString() };
        }
    }

    /**
     * 🎯 Initialisation basée sur la page courante
     */
    initializePages() {
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'pedagogues':
                this.renderPedagoguesList();
                break;
            case 'pedagogue-detail':
                this.renderPedagogueDetail();
                break;
            case 'home':
                this.renderHomeContent();
                break;
            default:
                console.log('Page non gérée par le ContentManager');
        }
    }

    /**
     * 🔍 Détection de la page courante
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().toLowerCase();
        
        if (filename.includes('pedagogues') && !filename.includes('adrien') && !filename.includes('laurence') && !filename.includes('ilan')) {
            return 'pedagogues';
        } else if (filename.includes('adrien') || filename.includes('laurence') || filename.includes('ilan')) {
            return 'pedagogue-detail';
        } else if (filename.includes('index') || path === '/') {
            return 'home';
        }
        
        return 'other';
    }

    /**
     * 👥 Rendu de la liste des pédagogues
     */
    renderPedagoguesList() {
        const container = document.querySelector('.pedagogues-grid, .team-grid, #pedagogues-list');
        if (!container || !this.data.pedagogues) return;

        container.innerHTML = this.data.pedagogues.map(pedagogue => `
            <div class="pedagogue-card" data-pedagogue="${pedagogue.id}">
                <div class="pedagogue-image">
                    <img src="${pedagogue.image}" alt="${pedagogue.name}" loading="lazy">
                </div>
                <div class="pedagogue-info">
                    <h3>${pedagogue.name}</h3>
                    <p class="subtitle">${pedagogue.subtitle}</p>
                    <p class="description">${pedagogue.description.substring(0, 120)}...</p>
                    <a href="./pedagogues/${pedagogue.id}.html" class="btn-more">En savoir plus</a>
                </div>
            </div>
        `).join('');

        this.addCardAnimations();
    }

    /**
     * 📋 Rendu du détail d'un pédagogue
     */
    renderPedagogueDetail() {
        const pedagogueId = this.getPedagogueIdFromUrl();
        const pedagogue = this.data.pedagogues.find(p => p.id === pedagogueId);
        
        if (!pedagogue) {
            console.error('Pédagogue non trouvé:', pedagogueId);
            return;
        }

        // Mise à jour du titre de la page
        document.title = `${pedagogue.name} - La Manufacture de Laurence`;

        // Mise à jour du contenu principal
        this.updatePedagogueHeader(pedagogue);
        this.updatePedagogueContent(pedagogue);
        this.updatePedagogueTimeline(pedagogue);
    }

    /**
     * 🏠 Rendu du contenu d'accueil
     */
    renderHomeContent() {
        // Mise à jour de la section équipe sur la page d'accueil
        const teamSection = document.querySelector('.team-preview, .home-team');
        if (teamSection && this.data.pedagogues) {
            const featuredTeam = this.data.pedagogues.slice(0, 3); // 3 premiers
            
            teamSection.innerHTML = `
                <h2>Notre Équipe</h2>
                <div class="team-grid">
                    ${featuredTeam.map(pedagogue => `
                        <div class="team-member">
                            <img src="${pedagogue.image}" alt="${pedagogue.name}">
                            <h3>${pedagogue.name}</h3>
                            <p>${pedagogue.subtitle}</p>
                        </div>
                    `).join('')}
                </div>
                <a href="./pages/desktop/pedagogues.html" class="btn-team">Découvrir toute l'équipe</a>
            `;
        }
    }

    /**
     * 🆔 Extraction de l'ID du pédagogue depuis l'URL
     */
    getPedagogueIdFromUrl() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().toLowerCase();
        
        if (filename.includes('laurence')) return 'laurence';
        if (filename.includes('adrien')) return 'adrien';
        if (filename.includes('ilan')) return 'ilan';
        
        return null;
    }

    /**
     * 📝 Mise à jour de l'en-tête du pédagogue
     */
    updatePedagogueHeader(pedagogue) {
        const nameElement = document.querySelector('h1, .pedagogue-name, .hero-title');
        const subtitleElement = document.querySelector('.pedagogue-subtitle, .hero-subtitle');
        const imageElement = document.querySelector('.pedagogue-image img, .hero-image img');

        if (nameElement) nameElement.textContent = pedagogue.name;
        if (subtitleElement) subtitleElement.textContent = pedagogue.subtitle;
        if (imageElement) {
            imageElement.src = pedagogue.image;
            imageElement.alt = pedagogue.name;
        }
    }

    /**
     * 📄 Mise à jour du contenu du pédagogue
     */
    updatePedagogueContent(pedagogue) {
        const descriptionElement = document.querySelector('.pedagogue-description, .content-description, .bio');
        if (descriptionElement) {
            descriptionElement.textContent = pedagogue.description;
        }
    }

    /**
     * ⏰ Mise à jour de la timeline
     */
    updatePedagogueTimeline(pedagogue) {
        const timelineContainer = document.querySelector('.timeline, .career-timeline');
        if (!timelineContainer || !pedagogue.timeline) return;

        timelineContainer.innerHTML = `
            <h3>Parcours</h3>
            <div class="timeline-items">
                ${pedagogue.timeline.map(item => `
                    <div class="timeline-item">
                        <div class="timeline-year">${item.year}</div>
                        <div class="timeline-event">${item.event}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * ✨ Ajout d'animations aux cartes
     */
    addCardAnimations() {
        const cards = document.querySelectorAll('.pedagogue-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    }

    /**
     * 🔄 Rechargement des données
     */
    async reload() {
        await this.loadData();
        this.initializePages();
    }

    /**
     * 📊 Obtenir les statistiques
     */
    getStats() {
        return {
            totalPedagogues: this.data.pedagogues?.length || 0,
            lastUpdate: this.data.lastUpdate,
            version: this.data.version
        };
    }
}

// 🌟 Auto-initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.contentManager = new ContentManager();
});

// 🔄 Rechargement automatique en cas de mise à jour des données
setInterval(() => {
    if (window.contentManager) {
        window.contentManager.reload();
    }
}, 300000); // Toutes les 5 minutes
