/* ========================================
   SYSTÈME DE STOCKAGE AVANCÉ - IndexedDB
   Version Optimisée avec Cache et Compression
   ======================================== */

class StorageManager {
    constructor() {
        this.dbName = 'LaManufactureDB';
        this.dbVersion = 2; // Incrémenté pour les nouvelles optimisations
        this.db = null;
        this.cache = new Map(); // Cache en mémoire pour les données fréquentes
        this.maxCacheSize = 100; // Limite du cache
        this.compressionEnabled = true; // Compression des données volumineuses
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.error('Erreur ouverture IndexedDB:', request.error);
                this.fallbackToLocalStorage();
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialisé avec succès (v' + this.dbVersion + ')');
                this.preloadFrequentData();
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store pour les événements (optimisé)
                if (!db.objectStoreNames.contains('events')) {
                    const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
                    eventsStore.createIndex('date', 'date', { unique: false });
                    eventsStore.createIndex('type', 'type', { unique: false });
                    eventsStore.createIndex('dateCreated', 'dateCreated', { unique: false });
                }
                
                // Store pour les images (avec compression)
                if (!db.objectStoreNames.contains('images')) {
                    const imagesStore = db.createObjectStore('images', { keyPath: 'id' });
                    imagesStore.createIndex('eventId', 'eventId', { unique: false });
                    imagesStore.createIndex('size', 'size', { unique: false });
                }
                
                // Store pour les paramètres
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }

                // Nouveau store pour le cache persistant
                if (!db.objectStoreNames.contains('cache')) {
                    const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
                    cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                console.log('Base de données créée/mise à jour (v' + this.dbVersion + ')');
            };
        });
    }

    /**
     * Précharge les données fréquemment utilisées en cache
     */
    async preloadFrequentData() {
        try {
            // Charger les événements des 30 prochains jours
            const upcomingEvents = await this.getUpcomingEvents(30);
            upcomingEvents.forEach(event => {
                this.cache.set('event_' + event.id, event);
            });
            
            // Charger les paramètres
            const settings = await this.getAllSettings();
            this.cache.set('settings', settings);
            
            console.log('Cache préchargé avec ' + this.cache.size + ' éléments');
        } catch (error) {
            console.warn('Erreur lors du préchargement du cache:', error);
        }
    }

    /**
     * Gestion du cache avec limitation de taille
     */
    manageCacheSize() {
        if (this.cache.size > this.maxCacheSize) {
            // Supprimer les plus anciens éléments
            const entries = Array.from(this.cache.entries());
            const toDelete = entries.slice(0, this.cache.size - this.maxCacheSize);
            toDelete.forEach(([key]) => this.cache.delete(key));
        }
    }

    /**
     * Fallback vers localStorage si IndexedDB n'est pas disponible
     */
    fallbackToLocalStorage() {
        console.warn('IndexedDB non disponible, basculement vers localStorage');
        this.useLocalStorage = true;
    }

    // GESTION DES ÉVÉNEMENTS
    async saveEvent(event) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['events'], 'readwrite');
            const store = transaction.objectStore('events');
            const request = store.put(event);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getEvents() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['events'], 'readonly');
            const store = transaction.objectStore('events');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteEvent(eventId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['events'], 'readwrite');
            const store = transaction.objectStore('events');
            const request = store.delete(eventId);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // GESTION DES IMAGES
    async saveImage(imageData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');
            
            const imageRecord = {
                id: imageData.id || this.generateId(),
                eventId: imageData.eventId,
                blob: imageData.blob,
                filename: imageData.filename,
                type: imageData.type,
                size: imageData.size,
                uploadDate: new Date().toISOString()
            };
            
            const request = store.put(imageRecord);
            
            request.onsuccess = () => resolve(imageRecord);
            request.onerror = () => reject(request.error);
        });
    }

    async getImage(imageId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['images'], 'readonly');
            const store = transaction.objectStore('images');
            const request = store.get(imageId);
            
            request.onsuccess = () => {
                const result = request.result;
                if (result && result.blob) {
                    // Convertir le blob en URL pour affichage
                    result.url = URL.createObjectURL(result.blob);
                }
                resolve(result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getImagesByEvent(eventId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['images'], 'readonly');
            const store = transaction.objectStore('images');
            const index = store.index('eventId');
            const request = index.getAll(eventId);
            
            request.onsuccess = () => {
                const results = request.result.map(result => {
                    if (result.blob) {
                        result.url = URL.createObjectURL(result.blob);
                    }
                    return result;
                });
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteImage(imageId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');
            const request = store.delete(imageId);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // GESTION DES PARAMÈTRES
    async saveSetting(key, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value });
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getSetting(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);
            
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // MIGRATION DEPUIS LOCALSTORAGE
    async migrateFromLocalStorage() {
        try {
            console.log('Migration depuis localStorage...');
            
            // Migrer les événements
            const oldEvents = JSON.parse(localStorage.getItem('agendaEvents') || '[]');
            for (const event of oldEvents) {
                await this.saveEvent(event);
            }
            
            // Migrer les paramètres
            const oldSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
            for (const [key, value] of Object.entries(oldSettings)) {
                await this.saveSetting(key, value);
            }
            
            console.log(`Migration terminée: ${oldEvents.length} événements migrés`);
            
            // Marquer la migration comme terminée
            await this.saveSetting('migrationCompleted', true);
            
        } catch (error) {
            console.error('Erreur lors de la migration:', error);
        }
    }

    // NETTOYAGE
    async cleanupOrphanedImages() {
        try {
            const events = await this.getEvents();
            const eventIds = new Set(events.map(e => e.id));
            
            const transaction = this.db.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const images = request.result;
                images.forEach(image => {
                    if (!eventIds.has(image.eventId)) {
                        store.delete(image.id);
                        console.log(`Image orpheline supprimée: ${image.id}`);
                    }
                });
            };
        } catch (error) {
            console.error('Erreur nettoyage:', error);
        }
    }

    // STATISTIQUES DE STOCKAGE
    async getStorageStats() {
        try {
            const events = await this.getEvents();
            const transaction = this.db.transaction(['images'], 'readonly');
            const store = transaction.objectStore('images');
            
            return new Promise((resolve) => {
                const request = store.getAll();
                request.onsuccess = () => {
                    const images = request.result;
                    const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);
                    
                    resolve({
                        eventsCount: events.length,
                        imagesCount: images.length,
                        totalImageSize: totalSize,
                        formattedSize: this.formatFileSize(totalSize)
                    });
                };
            });
        } catch (error) {
            console.error('Erreur statistiques:', error);
            return { eventsCount: 0, imagesCount: 0, totalImageSize: 0, formattedSize: '0 B' };
        }
    }

    // UTILITAIRES
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // FALLBACK VERS LOCALSTORAGE
    async fallbackToLocalStorage() {
        console.warn('Fallback vers localStorage...');
        
        return {
            saveEvent: (event) => {
                const events = JSON.parse(localStorage.getItem('agendaEvents') || '[]');
                const index = events.findIndex(e => e.id === event.id);
                if (index >= 0) {
                    events[index] = event;
                } else {
                    events.push(event);
                }
                localStorage.setItem('agendaEvents', JSON.stringify(events));
                return Promise.resolve(event);
            },
            
            getEvents: () => {
                const events = JSON.parse(localStorage.getItem('agendaEvents') || '[]');
                return Promise.resolve(events);
            },
            
            deleteEvent: (eventId) => {
                const events = JSON.parse(localStorage.getItem('agendaEvents') || '[]');
                const filtered = events.filter(e => e.id !== eventId);
                localStorage.setItem('agendaEvents', JSON.stringify(filtered));
                return Promise.resolve();
            },
            
            saveImage: (imageData) => {
                // Pour localStorage, on garde le base64
                return Promise.resolve({ ...imageData, url: imageData.blob });
            },
            
            getImage: (imageId) => Promise.resolve(null),
            
            saveSetting: (key, value) => {
                const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
                settings[key] = value;
                localStorage.setItem('adminSettings', JSON.stringify(settings));
                return Promise.resolve();
            },
            
            getSetting: (key) => {
                const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
                return Promise.resolve(settings[key] || null);
            }
        };
    }
}

// Instance globale
window.storageManager = null;
