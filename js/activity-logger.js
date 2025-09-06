/**
 * 🔍 SYSTÈME DE SUIVI DES MODIFICATIONS - LA MANUFACTURE
 * 📅 Logging et historique des actions admin
 * 🎯 Traçabilité complète des modifications
 */

class ActivityLogger {
    constructor() {
        this.storageKey = 'la_manufacture_activity_log';
        this.maxEntries = 500; // Limite d'entrées stockées
        this.init();
    }

    /**
     * 🚀 Initialisation du logger
     */
    init() {
        this.setupSessionInfo();
        this.logActivity('system', 'Session démarrée', 'Connexion au panel admin');
        console.log('✅ ActivityLogger initialisé');
    }

    /**
     * 👤 Configuration des informations de session
     */
    setupSessionInfo() {
        this.sessionInfo = {
            sessionId: this.generateSessionId(),
            startTime: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            ip: null // Sera récupérée si possible
        };

        // Tentative de récupération de l'IP
        this.getUserIP();
    }

    /**
     * 🌐 Récupération de l'adresse IP
     */
    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            this.sessionInfo.ip = data.ip;
        } catch (error) {
            console.log('IP non récupérée:', error.message);
            this.sessionInfo.ip = 'Non disponible';
        }
    }

    /**
     * 🆔 Génération d'un ID de session unique
     */
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 📝 Enregistrement d'une activité
     */
    logActivity(category, action, details = '', data = null) {
        const entry = {
            id: this.generateEntryId(),
            timestamp: new Date().toISOString(),
            sessionId: this.sessionInfo.sessionId,
            category: category, // 'content', 'user', 'system', 'file', 'config'
            action: action,
            details: details,
            data: data,
            url: window.location.href,
            userAgent: navigator.userAgent.substring(0, 100) // Tronqué pour l'espace
        };

        this.saveEntry(entry);
        this.notifyActivity(entry);
        
        console.log('🔍 Activity logged:', entry);
        return entry.id;
    }

    /**
     * 🆔 Génération d'un ID d'entrée unique
     */
    generateEntryId() {
        return 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    /**
     * 💾 Sauvegarde d'une entrée
     */
    saveEntry(entry) {
        try {
            let log = this.getLog();
            log.unshift(entry); // Ajouter au début

            // Limiter le nombre d'entrées
            if (log.length > this.maxEntries) {
                log = log.slice(0, this.maxEntries);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(log));
        } catch (error) {
            console.error('❌ Erreur sauvegarde log:', error);
        }
    }

    /**
     * 📊 Récupération du log complet
     */
    getLog() {
        try {
            const log = localStorage.getItem(this.storageKey);
            return log ? JSON.parse(log) : [];
        } catch (error) {
            console.error('❌ Erreur lecture log:', error);
            return [];
        }
    }

    /**
     * 🔔 Notification d'activité (pour UI en temps réel)
     */
    notifyActivity(entry) {
        // Dispatch d'un événement personnalisé
        window.dispatchEvent(new CustomEvent('activityLogged', {
            detail: entry
        }));
    }

    /**
     * 📋 Récupération des activités par catégorie
     */
    getActivitiesByCategory(category, limit = 50) {
        const log = this.getLog();
        return log
            .filter(entry => entry.category === category)
            .slice(0, limit);
    }

    /**
     * 📅 Récupération des activités par période
     */
    getActivitiesByDate(startDate, endDate = new Date()) {
        const log = this.getLog();
        const start = new Date(startDate);
        const end = new Date(endDate);

        return log.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= start && entryDate <= end;
        });
    }

    /**
     * 👤 Récupération des activités par session
     */
    getActivitiesBySession(sessionId) {
        const log = this.getLog();
        return log.filter(entry => entry.sessionId === sessionId);
    }

    /**
     * 📊 Génération de statistiques
     */
    getStats() {
        const log = this.getLog();
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        return {
            total: log.length,
            today: log.filter(entry => new Date(entry.timestamp) >= yesterday).length,
            thisWeek: log.filter(entry => new Date(entry.timestamp) >= lastWeek).length,
            byCategory: this.getStatsByCategory(log),
            sessions: this.getSessionsCount(log),
            lastActivity: log[0]?.timestamp || null
        };
    }

    /**
     * 📊 Statistiques par catégorie
     */
    getStatsByCategory(log) {
        const stats = {};
        log.forEach(entry => {
            stats[entry.category] = (stats[entry.category] || 0) + 1;
        });
        return stats;
    }

    /**
     * 🔢 Nombre de sessions uniques
     */
    getSessionsCount(log) {
        const sessions = new Set(log.map(entry => entry.sessionId));
        return sessions.size;
    }

    /**
     * 🗑️ Nettoyage du log
     */
    clearLog() {
        localStorage.removeItem(this.storageKey);
        this.logActivity('system', 'Log vidé', 'Suppression de l\'historique');
    }

    /**
     * 📤 Export du log
     */
    exportLog(format = 'json') {
        const log = this.getLog();
        const timestamp = new Date().toISOString().split('T')[0];
        
        if (format === 'json') {
            const dataStr = JSON.stringify(log, null, 2);
            this.downloadFile(dataStr, `activity_log_${timestamp}.json`, 'application/json');
        } else if (format === 'csv') {
            const csv = this.convertToCSV(log);
            this.downloadFile(csv, `activity_log_${timestamp}.csv`, 'text/csv');
        }
    }

    /**
     * 📊 Conversion en CSV
     */
    convertToCSV(log) {
        if (log.length === 0) return '';

        const headers = ['Timestamp', 'Category', 'Action', 'Details', 'Session ID', 'URL'];
        const csvRows = [headers.join(',')];

        log.forEach(entry => {
            const row = [
                entry.timestamp,
                entry.category,
                entry.action,
                `"${entry.details.replace(/"/g, '""')}"`, // Échapper les guillemets
                entry.sessionId,
                entry.url
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    /**
     * 💾 Téléchargement de fichier
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.logActivity('system', 'Export log', `Fichier: ${filename}`);
    }

    /**
     * 🔍 Recherche dans le log
     */
    searchLog(query, category = null) {
        const log = this.getLog();
        const searchTerm = query.toLowerCase();

        return log.filter(entry => {
            const matchesCategory = !category || entry.category === category;
            const matchesQuery = 
                entry.action.toLowerCase().includes(searchTerm) ||
                entry.details.toLowerCase().includes(searchTerm) ||
                entry.timestamp.includes(searchTerm);
            
            return matchesCategory && matchesQuery;
        });
    }
}

// 🌟 Auto-initialisation
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin')) {
        window.activityLogger = new ActivityLogger();
        
        // Log automatique des changements de page
        window.addEventListener('beforeunload', () => {
            window.activityLogger.logActivity('system', 'Session fermée', 'Fermeture du panel admin');
        });
    }
});

// 📤 Export global pour utilisation
window.ActivityLogger = ActivityLogger;
