// ======= AGENDA INTERACTIF - LA MANUFACTURE DE LAURENCE =======

let currentDate = new Date();
let events = [
    // Liste vide - prête pour de nouveaux événements
];

const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const eventTypeColors = {
    cours: "#2c3e50",
    spectacle: "#8b0000", 
    audition: "#b87333",
    atelier: "#4a4a4a",
    reunion: "#6c7b7f",
    autre: "#2f2f2f"
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initCalendar();
    displayEvents();
    
    // Event listeners
    document.getElementById('prevMonth').addEventListener('click', previousMonth);
    document.getElementById('nextMonth').addEventListener('click', nextMonth);
    document.getElementById('eventForm').addEventListener('submit', addEvent);
});

function initCalendar() {
    updateCalendarDisplay();
}

function updateCalendarDisplay() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Mettre à jour le titre du mois
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Générer les jours du calendrier
    generateCalendarDays(year, month);
}

function generateCalendarDays(year, month) {
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    // Premier jour du mois et nombre de jours
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Ajuster pour commencer par lundi (1 = lundi, 0 = dimanche)
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    // Ajouter les jours vides du mois précédent
    for (let i = 0; i < startDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarDays.appendChild(emptyDay);
    }
    
    // Ajouter les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Vérifier s'il y a des événements ce jour
        const dayEvents = events.filter(event => event.date === currentDateStr);
        if (dayEvents.length > 0) {
            dayElement.classList.add('has-events');
            
            // Ajouter des indicateurs d'événements
            dayEvents.forEach(event => {
                const indicator = document.createElement('span');
                indicator.className = 'event-indicator';
                indicator.style.backgroundColor = eventTypeColors[event.type];
                indicator.title = event.title;
                dayElement.appendChild(indicator);
            });
        }
        
        // Marquer le jour actuel
        const today = new Date();
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Ajouter l'événement de clic
        dayElement.addEventListener('click', () => showDayEvents(currentDateStr));
        
        calendarDays.appendChild(dayElement);
    }
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendarDisplay();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendarDisplay();
}

function showDayEvents(dateStr) {
    const dayEvents = events.filter(event => event.date === dateStr);
    
    if (dayEvents.length === 0) {
        return;
    }
    
    // Afficher une modal avec les événements du jour
    const modal = document.createElement('div');
    modal.className = 'day-events-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h4>Événements du ${new Date(dateStr).toLocaleDateString('fr-FR')}</h4>
                <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="modal-body">
                ${dayEvents.map(event => `
                    <div class="day-event-item">
                        <div class="event-time">${event.time}</div>
                        <div class="event-details">
                            <h5>${event.title}</h5>
                            <p><strong>Lieu:</strong> ${event.location}</p>
                            <p>${event.description}</p>
                            <button class="btn-add-to-calendar" onclick="addToCalendar('${event.id}')">
                                📅 Ajouter à mon calendrier
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function displayEvents() {
    const eventsList = document.getElementById('eventsList');
    
    // Trier les événements par date
    const sortedEvents = events.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
    
    // Afficher les prochains événements (les 5 suivants)
    const now = new Date();
    const upcomingEvents = sortedEvents.filter(event => {
        const eventDate = new Date(event.date + ' ' + event.time);
        return eventDate > now;
    }).slice(0, 5);
    
    eventsList.innerHTML = upcomingEvents.map(event => `
        <div class="event-item" data-event-id="${event.id}">
            <div class="event-date">
                <span class="day">${new Date(event.date).getDate()}</span>
                <span class="month">${monthNames[new Date(event.date).getMonth()].substring(0, 3)}</span>
            </div>
            <div class="event-info">
                <h5>${event.title}</h5>
                <p class="event-time">🕐 ${event.time} - ${event.location}</p>
                <p class="event-description">${event.description}</p>
                <span class="event-type ${event.type}">${event.type}</span>
                <button class="btn-add-to-calendar" onclick="addToCalendar('${event.id}')">
                    📅 Ajouter à mon calendrier
                </button>
            </div>
        </div>
    `).join('');
}

function addToCalendar(eventId) {
    const event = events.find(e => e.id == eventId);
    if (!event) return;
    
    // Créer les dates pour le calendrier
    const startDate = new Date(event.date + ' ' + event.time);
    const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // +2 heures par défaut
    
    // Format pour les calendriers (YYYYMMDDTHHMMSS)
    const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const startFormatted = formatDate(startDate);
    const endFormatted = formatDate(endDate);
    
    // Créer l'URL pour Google Calendar
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    // Créer l'URL pour Outlook
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${startFormatted}&enddt=${endFormatted}&body=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    // Créer le fichier ICS pour les autres calendriers
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//La Manufacture de Laurence//Agenda//FR
BEGIN:VEVENT
UID:${event.id}@lamanufacture.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${startFormatted}
DTEND:${endFormatted}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
    
    // Afficher un modal de choix
    const modal = document.createElement('div');
    modal.className = 'calendar-choice-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h4>Ajouter à votre calendrier</h4>
                <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="calendar-options">
                    <a href="${googleCalendarUrl}" target="_blank" class="calendar-option">
                        <span class="calendar-icon">📅</span>
                        Google Calendar
                    </a>
                    <a href="${outlookUrl}" target="_blank" class="calendar-option">
                        <span class="calendar-icon">📅</span>
                        Outlook
                    </a>
                    <button class="calendar-option" onclick="downloadICS('${event.id}')">
                        <span class="calendar-icon">📅</span>
                        Télécharger (.ics)
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function downloadICS(eventId) {
    const event = events.find(e => e.id == eventId);
    if (!event) return;
    
    const startDate = new Date(event.date + ' ' + event.time);
    const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000));
    
    const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//La Manufacture de Laurence//Agenda//FR
BEGIN:VEVENT
UID:${event.id}@lamanufacture.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
}

// ======= INTERFACE D'ADMINISTRATION =======
function toggleAdminPanel() {
    const password = prompt("Mot de passe pédagogue:");
    if (password === "manufacture2025") { // Mot de passe simple pour l'exemple
        const panel = document.getElementById('adminPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    } else if (password !== null) {
        alert("Mot de passe incorrect");
    }
}

function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('eventForm').reset();
}

function addEvent(e) {
    e.preventDefault();
    
    const newEvent = {
        id: Date.now(), // ID simple basé sur le timestamp
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        description: document.getElementById('eventDescription').value,
        type: document.getElementById('eventType').value
    };
    
    events.push(newEvent);
    
    // Mettre à jour l'affichage
    updateCalendarDisplay();
    displayEvents();
    
    // Fermer le panel et réinitialiser le formulaire
    closeAdminPanel();
    
    alert("Événement ajouté avec succès!");
}
