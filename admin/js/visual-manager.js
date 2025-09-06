/**
 * SYSTÈME DE GESTION DE CONTENU VISUEL
 * Interface ultra-simple pour modifier le contenu du site
 * Compatible GitHub Pages - Génère du HTML statique
 */

class VisualContentManager {
    constructor() {
        this.templates = {
            course: this.getCourseTemplate(),
            pedagogue: this.getPedagogueTemplate(),
            event: this.getEventTemplate(),
            homepage: this.getHomepageTemplate()
        };
        this.init();
    }

    init() {
        this.setupVisualEditor();
        this.setupTemplateSystem();
        this.setupExportSystem();
    }

    setupVisualEditor() {
        // Créer un éditeur visuel en temps réel
        this.createVisualPreview();
        this.setupDragAndDrop();
        this.setupColorPicker();
        this.setupFontSelector();
    }

    createVisualPreview() {
        const previewContainer = document.createElement('div');
        previewContainer.id = 'visualPreview';
        previewContainer.className = 'visual-preview-container';
        previewContainer.innerHTML = `
            <div class="preview-header">
                <h3><i class="fas fa-eye"></i> Aperçu en Temps Réel</h3>
                <div class="preview-controls">
                    <button class="preview-btn" data-device="desktop">
                        <i class="fas fa-desktop"></i> Bureau
                    </button>
                    <button class="preview-btn" data-device="tablet">
                        <i class="fas fa-tablet-alt"></i> Tablette
                    </button>
                    <button class="preview-btn" data-device="mobile">
                        <i class="fas fa-mobile-alt"></i> Mobile
                    </button>
                </div>
            </div>
            <div class="preview-frame" id="previewFrame">
                <iframe id="previewIframe" src="../index.html"></iframe>
            </div>
        `;
        
        return previewContainer;
    }

    setupDragAndDrop() {
        // Système glisser-déposer pour réorganiser les éléments
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('draggable-element')) {
                e.dataTransfer.setData('text/plain', e.target.dataset.elementId);
            }
        });

        document.addEventListener('dragover', (e) => {
            if (e.target.classList.contains('drop-zone')) {
                e.preventDefault();
                e.target.classList.add('drag-over');
            }
        });

        document.addEventListener('drop', (e) => {
            if (e.target.classList.contains('drop-zone')) {
                e.preventDefault();
                e.target.classList.remove('drag-over');
                const elementId = e.dataTransfer.getData('text/plain');
                this.handleElementDrop(elementId, e.target);
            }
        });
    }

    setupColorPicker() {
        // Sélecteur de couleurs simple
        const colorPicker = document.createElement('div');
        colorPicker.className = 'color-picker-panel';
        colorPicker.innerHTML = `
            <h4>Choisir une Couleur</h4>
            <div class="color-presets">
                <div class="color-preset" data-color="#6366f1" style="background: #6366f1;"></div>
                <div class="color-preset" data-color="#10b981" style="background: #10b981;"></div>
                <div class="color-preset" data-color="#f59e0b" style="background: #f59e0b;"></div>
                <div class="color-preset" data-color="#ef4444" style="background: #ef4444;"></div>
                <div class="color-preset" data-color="#8b5cf6" style="background: #8b5cf6;"></div>
                <div class="color-preset" data-color="#06b6d4" style="background: #06b6d4;"></div>
            </div>
            <input type="color" id="customColorPicker" />
            <label for="customColorPicker">Couleur personnalisée</label>
        `;

        return colorPicker;
    }

    setupTemplateSystem() {
        // Système de templates pour générer du HTML
        this.templateEngine = new SimpleTemplateEngine();
    }

    setupExportSystem() {
        // Système d'export vers GitHub Pages
        this.exporter = new GitHubPagesExporter();
    }

    // TEMPLATES POUR GÉNÉRATION HTML
    getCourseTemplate() {
        return `
        <div class="course-card">
            <div class="course-header">
                <h3>{{title}}</h3>
                <p class="course-subtitle">{{subtitle}}</p>
            </div>
            <div class="course-content">
                <div class="course-description">
                    {{description}}
                </div>
                <div class="course-details">
                    <div class="course-price">
                        <i class="fas fa-euro-sign"></i>
                        <span>{{price}}</span>
                    </div>
                    <div class="course-schedule">
                        <i class="fas fa-clock"></i>
                        <span>{{schedule}}</span>
                    </div>
                </div>
                <button class="course-btn">
                    S'inscrire
                </button>
            </div>
        </div>
        `;
    }

    getPedagogueTemplate() {
        return `
        <div class="pedagogue-card">
            <div class="pedagogue-photo">
                <img src="{{photo}}" alt="{{name}}" />
            </div>
            <div class="pedagogue-info">
                <h3>{{name}}</h3>
                <p class="pedagogue-role">{{role}}</p>
                <div class="pedagogue-bio">
                    {{bio}}
                </div>
                <div class="pedagogue-specialties">
                    {{#each specialties}}
                    <span class="specialty-tag">{{this}}</span>
                    {{/each}}
                </div>
            </div>
        </div>
        `;
    }

    getEventTemplate() {
        return `
        <div class="event-card">
            <div class="event-date">
                <div class="event-day">{{day}}</div>
                <div class="event-month">{{month}}</div>
            </div>
            <div class="event-info">
                <h3>{{title}}</h3>
                <p class="event-type">{{type}}</p>
                <div class="event-details">
                    <div class="event-time">
                        <i class="fas fa-clock"></i>
                        {{time}}
                    </div>
                    <div class="event-location">
                        <i class="fas fa-map-marker-alt"></i>
                        {{location}}
                    </div>
                </div>
                <p class="event-description">{{description}}</p>
            </div>
        </div>
        `;
    }

    getHomepageTemplate() {
        return `
        <section class="hero-section">
            <div class="hero-content">
                <h1>{{title}}</h1>
                <p class="hero-subtitle">{{subtitle}}</p>
                <div class="hero-text">
                    {{content}}
                </div>
                <div class="hero-actions">
                    <button class="hero-btn primary">{{primaryAction}}</button>
                    <button class="hero-btn secondary">{{secondaryAction}}</button>
                </div>
            </div>
            <div class="hero-image">
                <img src="{{heroImage}}" alt="{{title}}" />
            </div>
        </section>
        `;
    }

    // GÉNÉRATEUR DE CONTENU
    generateContent(type, data) {
        const template = this.templates[type];
        if (!template) {
            throw new Error(`Template ${type} non trouvé`);
        }

        return this.templateEngine.render(template, data);
    }

    // PRÉVISUALISATION EN TEMPS RÉEL
    updatePreview(content) {
        const iframe = document.getElementById('previewIframe');
        if (iframe) {
            iframe.contentDocument.body.innerHTML = content;
        }
    }

    // EXPORT VERS GITHUB PAGES
    exportToGitHub(content, fileName) {
        return this.exporter.export(content, fileName);
    }
}

class SimpleTemplateEngine {
    render(template, data) {
        let result = template;

        // Remplacements simples {{variable}}
        result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] || '';
        });

        // Boucles simples {{#each array}}
        result = result.replace(/\{\{#each (\w+)\}\}(.*?)\{\{\/each\}\}/gs, (match, arrayName, content) => {
            const array = data[arrayName] || [];
            return array.map(item => {
                return content.replace(/\{\{this\}\}/g, item);
            }).join('');
        });

        return result;
    }
}

class GitHubPagesExporter {
    export(content, fileName) {
        // Génère du HTML compatible GitHub Pages
        const htmlContent = this.wrapInHTML(content);
        
        // Télécharge le fichier
        this.downloadFile(htmlContent, fileName);
        
        return htmlContent;
    }

    wrapInHTML(content) {
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>La Manufacture de Laurence</title>
    <link rel="stylesheet" href="../css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <header class="main-header">
        <nav class="main-nav">
            <div class="logo">
                <h1><i class="fas fa-theater-masks"></i> La Manufacture</h1>
            </div>
            <ul class="nav-menu">
                <li><a href="../index.html">Accueil</a></li>
                <li><a href="cours.html">Cours</a></li>
                <li><a href="pedagogues.html">Équipe</a></li>
                <li><a href="a-propos.html">À Propos</a></li>
                <li><a href="contact.html">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main class="main-content">
        ${content}
    </main>

    <footer class="main-footer">
        <div class="footer-content">
            <p>&copy; 2025 La Manufacture de Laurence. Tous droits réservés.</p>
        </div>
    </footer>

    <script src="../js/script.js"></script>
</body>
</html>
        `;
    }

    downloadFile(content, fileName) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Intégration avec l'admin simple
if (typeof simpleAdmin !== 'undefined') {
    simpleAdmin.visualManager = new VisualContentManager();
}
