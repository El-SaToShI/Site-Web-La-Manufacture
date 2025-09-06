// ============================================
// GESTIONNAIRE DE CONTENU AVANCÉ
// ============================================

class ContentManager {
    constructor() {
        this.currentPage = 'index';
        this.isDirty = false;
        this.autoSaveInterval = null;
        this.editor = null;
        this.fileManager = new FileManager();
        
        this.init();
    }
    
    init() {
        this.initializeEditor();
        this.bindEvents();
        this.startAutoSave();
        this.loadCurrentPage();
    }
    
    initializeEditor() {
        // Configuration de l'éditeur WYSIWYG
        const editorContainer = document.getElementById('contentEditor');
        if (!editorContainer) return;
        
        // Créer la toolbar de l'éditeur
        this.createEditorToolbar(editorContainer);
        
        // Créer la zone d'édition
        const editArea = document.createElement('div');
        editArea.id = 'editArea';
        editArea.contentEditable = true;
        editArea.className = 'edit-area';
        editArea.style.cssText = `
            min-height: 300px;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            font-family: inherit;
            line-height: 1.6;
            outline: none;
        `;
        
        editorContainer.appendChild(editArea);
        
        this.editor = editArea;
        
        // Événements de l'éditeur
        this.editor.addEventListener('input', () => {
            this.isDirty = true;
            this.updatePreview();
            this.showUnsavedChanges();
        });
        
        this.editor.addEventListener('paste', (e) => {
            this.handlePaste(e);
        });
    }
    
    createEditorToolbar(container) {
        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar-content';
        toolbar.style.cssText = `
            display: flex;
            gap: 8px;
            padding: 12px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-bottom: none;
            border-radius: 8px 8px 0 0;
            flex-wrap: wrap;
        `;
        
        const tools = [
            { icon: 'fas fa-bold', command: 'bold', title: 'Gras' },
            { icon: 'fas fa-italic', command: 'italic', title: 'Italique' },
            { icon: 'fas fa-underline', command: 'underline', title: 'Souligné' },
            { separator: true },
            { icon: 'fas fa-heading', command: 'formatBlock', value: 'h3', title: 'Titre' },
            { icon: 'fas fa-paragraph', command: 'formatBlock', value: 'p', title: 'Paragraphe' },
            { separator: true },
            { icon: 'fas fa-list-ul', command: 'insertUnorderedList', title: 'Liste à puces' },
            { icon: 'fas fa-list-ol', command: 'insertOrderedList', title: 'Liste numérotée' },
            { separator: true },
            { icon: 'fas fa-link', command: 'createLink', title: 'Lien' },
            { icon: 'fas fa-image', command: 'insertImage', title: 'Image' },
            { separator: true },
            { icon: 'fas fa-undo', command: 'undo', title: 'Annuler' },
            { icon: 'fas fa-redo', command: 'redo', title: 'Rétablir' }
        ];
        
        tools.forEach(tool => {
            if (tool.separator) {
                const separator = document.createElement('div');
                separator.style.cssText = 'width: 1px; background: #d1d5db; margin: 0 4px;';
                toolbar.appendChild(separator);
            } else {
                const button = document.createElement('button');
                button.type = 'button';
                button.innerHTML = `<i class="${tool.icon}"></i>`;
                button.title = tool.title;
                button.style.cssText = `
                    padding: 8px;
                    border: 1px solid #d1d5db;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                `;
                
                button.addEventListener('click', () => {
                    this.executeCommand(tool.command, tool.value);
                });
                
                button.addEventListener('mouseenter', () => {
                    button.style.background = '#f3f4f6';
                });
                
                button.addEventListener('mouseleave', () => {
                    button.style.background = 'white';
                });
                
                toolbar.appendChild(button);
            }
        });
        
        container.appendChild(toolbar);
    }
    
    bindEvents() {
        // Sélecteur de page
        const pageSelector = document.getElementById('pageSelector');
        if (pageSelector) {
            pageSelector.addEventListener('change', (e) => {
                if (this.isDirty) {
                    if (confirm('Vous avez des modifications non sauvegardées. Voulez-vous les perdre ?')) {
                        this.loadPage(e.target.value);
                    } else {
                        e.target.value = this.currentPage;
                    }
                } else {
                    this.loadPage(e.target.value);
                }
            });
        }
        
        // Bouton nouvelle page
        const newPageBtn = document.querySelector('.btn-new-page');
        if (newPageBtn) {
            newPageBtn.addEventListener('click', () => {
                this.createNewPage();
            });
        }
        
        // Sauvegarde avec Ctrl+S
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.savePage();
            }
        });
    }
    
    executeCommand(command, value = null) {
        this.editor.focus();
        
        if (command === 'createLink') {
            const url = prompt('Entrez l\'URL du lien:');
            if (url) {
                document.execCommand(command, false, url);
            }
        } else if (command === 'insertImage') {
            this.insertImage();
        } else {
            document.execCommand(command, false, value);
        }
        
        this.isDirty = true;
        this.updatePreview();
    }
    
    async insertImage() {
        // Créer un modal pour l'upload d'image
        const modal = this.createImageModal();
        document.body.appendChild(modal);
    }
    
    createImageModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 24px;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
        `;
        
        content.innerHTML = `
            <h3 style="margin-bottom: 16px;">Ajouter une Image</h3>
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">
                    Sélectionner un fichier:
                </label>
                <input type="file" id="imageInput" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">
                    Texte alternatif:
                </label>
                <input type="text" id="altText" placeholder="Description de l'image" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button id="cancelImage" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 4px; cursor: pointer;">
                    Annuler
                </button>
                <button id="insertImageBtn" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Insérer
                </button>
            </div>
        `;
        
        modal.appendChild(content);
        
        // Événements du modal
        content.querySelector('#cancelImage').addEventListener('click', () => {
            modal.remove();
        });
        
        content.querySelector('#insertImageBtn').addEventListener('click', () => {
            this.handleImageInsert(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }
    
    async handleImageInsert(modal) {
        const imageInput = modal.querySelector('#imageInput');
        const altText = modal.querySelector('#altText').value;
        
        if (!imageInput.files[0]) {
            alert('Veuillez sélectionner une image.');
            return;
        }
        
        try {
            // Upload de l'image
            const imageUrl = await this.fileManager.uploadImage(imageInput.files[0]);
            
            // Insérer l'image dans l'éditeur
            const img = `<img src="${imageUrl}" alt="${altText}" style="max-width: 100%; height: auto; border-radius: 8px;">`;
            document.execCommand('insertHTML', false, img);
            
            this.isDirty = true;
            this.updatePreview();
            
            modal.remove();
        } catch (error) {
            alert('Erreur lors de l\'upload de l\'image: ' + error.message);
        }
    }
    
    handlePaste(e) {
        e.preventDefault();
        
        // Récupérer le texte collé et le nettoyer
        const paste = (e.clipboardData || window.clipboardData).getData('text/html') || 
                     (e.clipboardData || window.clipboardData).getData('text/plain');
        
        if (paste) {
            // Nettoyer le HTML collé
            const cleanHtml = this.cleanPastedContent(paste);
            document.execCommand('insertHTML', false, cleanHtml);
            
            this.isDirty = true;
            this.updatePreview();
        }
    }
    
    cleanPastedContent(html) {
        // Créer un élément temporaire pour nettoyer le HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Supprimer les styles inline et attributs indésirables
        const elements = temp.querySelectorAll('*');
        elements.forEach(el => {
            // Garder seulement certains attributs
            const allowedAttrs = ['href', 'src', 'alt'];
            const attrs = [...el.attributes];
            attrs.forEach(attr => {
                if (!allowedAttrs.includes(attr.name)) {
                    el.removeAttribute(attr.name);
                }
            });
        });
        
        return temp.innerHTML;
    }
    
    updatePreview() {
        const previewFrame = document.getElementById('previewFrame');
        if (!previewFrame) return;
        
        // Créer le HTML de prévisualisation
        const content = this.editor.innerHTML;
        const previewHtml = this.generatePreviewHtml(content);
        
        // Mettre à jour l'iframe
        const blob = new Blob([previewHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        previewFrame.src = url;
        
        // Nettoyer l'URL après chargement
        previewFrame.onload = () => {
            URL.revokeObjectURL(url);
        };
    }
    
    generatePreviewHtml(content) {
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aperçu</title>
    <link rel="stylesheet" href="../css/style.css">
    <style>
        body { padding: 20px; font-family: 'Work Sans', sans-serif; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    <div class="preview-content">
        ${content}
    </div>
</body>
</html>`;
    }
    
    async loadPage(pageId) {
        try {
            this.currentPage = pageId;
            
            // Charger le contenu de la page
            const content = await this.fileManager.loadPageContent(pageId);
            
            if (this.editor) {
                this.editor.innerHTML = content;
                this.updatePreview();
            }
            
            this.isDirty = false;
            this.hideUnsavedChanges();
            
            // Mettre à jour le sélecteur
            const pageSelector = document.getElementById('pageSelector');
            if (pageSelector) {
                pageSelector.value = pageId;
            }
            
        } catch (error) {
            console.error('Erreur lors du chargement de la page:', error);
            alert('Erreur lors du chargement de la page.');
        }
    }
    
    loadCurrentPage() {
        this.loadPage(this.currentPage);
    }
    
    async savePage() {
        if (!this.isDirty) {
            this.showMessage('Aucune modification à sauvegarder.', 'info');
            return;
        }
        
        try {
            const content = this.editor.innerHTML;
            await this.fileManager.savePageContent(this.currentPage, content);
            
            this.isDirty = false;
            this.hideUnsavedChanges();
            this.showMessage('Page sauvegardée avec succès!', 'success');
            
            // Log de l'activité
            if (window.adminAuth) {
                window.adminAuth.logActivity(`Page "${this.currentPage}" sauvegardée`);
            }
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showMessage('Erreur lors de la sauvegarde: ' + error.message, 'error');
        }
    }
    
    startAutoSave() {
        // Sauvegarde automatique toutes les 2 minutes
        this.autoSaveInterval = setInterval(() => {
            if (this.isDirty) {
                this.savePage();
            }
        }, 120000);
    }
    
    showUnsavedChanges() {
        const saveBtn = document.querySelector('.btn-save');
        if (saveBtn) {
            saveBtn.style.background = '#f59e0b';
            saveBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Sauvegarder*';
        }
    }
    
    hideUnsavedChanges() {
        const saveBtn = document.querySelector('.btn-save');
        if (saveBtn) {
            saveBtn.style.background = '#10b981';
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Sauvegarder';
        }
    }
    
    showMessage(text, type = 'info') {
        // Supprimer les anciens messages
        const existingMessages = document.querySelectorAll('.admin-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Créer le nouveau message
        const message = document.createElement('div');
        message.className = `admin-message message ${type}`;
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1001;
            max-width: 300px;
        `;
        
        document.body.appendChild(message);
        
        // Animation d'entrée
        message.style.transform = 'translateX(100%)';
        setTimeout(() => {
            message.style.transition = 'transform 0.3s ease';
            message.style.transform = 'translateX(0)';
        }, 10);
        
        // Supprimer après 5 secondes
        setTimeout(() => {
            message.style.transform = 'translateX(100%)';
            setTimeout(() => message.remove(), 300);
        }, 5000);
    }
    
    createNewPage() {
        const pageName = prompt('Nom de la nouvelle page:');
        if (!pageName) return;
        
        const pageId = pageName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        // Ajouter au sélecteur
        const pageSelector = document.getElementById('pageSelector');
        if (pageSelector) {
            const option = document.createElement('option');
            option.value = pageId;
            option.textContent = pageName;
            pageSelector.appendChild(option);
        }
        
        // Charger la nouvelle page
        this.editor.innerHTML = `<h3>${pageName}</h3><p>Commencez à écrire le contenu de votre nouvelle page...</p>`;
        this.currentPage = pageId;
        this.isDirty = true;
        this.updatePreview();
        this.showUnsavedChanges();
        
        if (pageSelector) {
            pageSelector.value = pageId;
        }
    }
}

// ============================================
// GESTIONNAIRE DE FICHIERS
// ============================================

class FileManager {
    constructor() {
        this.baseUrl = '../';
    }
    
    async loadPageContent(pageId) {
        // Simuler le chargement de contenu depuis les fichiers existants
        const pageContents = {
            'index': `
                <h3>Bienvenue à La Manufacture de Laurence</h3>
                <p>École professionnelle de théâtre dirigée par Laurence Mercier.</p>
                <p>Découvrez notre pédagogie unique et notre équipe de professionnels passionnés.</p>
            `,
            'a-propos': `
                <h3>À Propos de La Manufacture</h3>
                <p>Une école de théâtre unique qui forme les artistes de demain.</p>
                <h4>Notre Histoire</h4>
                <p>Fondée par Laurence Mercier, La Manufacture s'appuie sur une pédagogie innovante...</p>
            `,
            'cours': `
                <h3>Nos Cours</h3>
                <p>Une offre complète pour explorer toutes les facettes de l'art dramatique.</p>
                <h4>Modules Disponibles</h4>
                <ul>
                    <li>Théâtre</li>
                    <li>Voix</li>
                    <li>Corps</li>
                    <li>Danse</li>
                    <li>Musique</li>
                </ul>
            `,
            'contact': `
                <h3>Nous Contacter</h3>
                <p>Pour toute question ou inscription, n'hésitez pas à nous contacter.</p>
                <p><strong>Email:</strong> lamanufacturedelaurence@gmail.com</p>
                <p><strong>Instagram:</strong> @laurencevoreux</p>
            `
        };
        
        return pageContents[pageId] || '<p>Contenu de la page à définir...</p>';
    }
    
    async savePageContent(pageId, content) {
        // Dans une vraie application, ceci sauvegarderait dans une base de données
        // ou dans les fichiers HTML correspondants
        
        // Pour la démo, on sauvegarde dans localStorage
        const savedPages = JSON.parse(localStorage.getItem('adminSavedPages') || '{}');
        savedPages[pageId] = {
            content: content,
            lastModified: Date.now()
        };
        localStorage.setItem('adminSavedPages', JSON.stringify(savedPages));
        
        // Simuler un délai de sauvegarde
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return true;
    }
    
    async uploadImage(file) {
        // Validation du fichier
        if (!file.type.startsWith('image/')) {
            throw new Error('Le fichier doit être une image.');
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB max
            throw new Error('L\'image ne peut pas dépasser 5MB.');
        }
        
        // Créer un nom de fichier unique
        const fileName = `${Date.now()}-${file.name}`;
        
        // Dans une vraie application, on uploadrait sur le serveur
        // Ici, on crée une URL blob locale pour la démo
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Sauvegarder dans localStorage pour la démo
                const savedImages = JSON.parse(localStorage.getItem('adminUploadedImages') || '{}');
                savedImages[fileName] = e.target.result;
                localStorage.setItem('adminUploadedImages', JSON.stringify(savedImages));
                
                resolve(e.target.result);
            };
            reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier.'));
            reader.readAsDataURL(file);
        });
    }
}

// Exporter pour utilisation globale
window.ContentManager = ContentManager;
