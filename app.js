// Load events from JSON and populate the table
async function loadEvents() {
    try {
        // Add timestamp to prevent caching during development
        const response = await fetch(`events.json?t=${new Date().getTime()}`);
        const data = await response.json();
        allEvents = data.events;
        populateTable(allEvents);
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('events-tbody').innerHTML = 
            '<tr><td colspan="4" style="text-align: center; padding: 2rem;">Error loading events. Please try again later.</td></tr>';
    }
}

// Parse schedule time as local time
function parseLocalTime(timeString) {
    // Parse the datetime string as local time by splitting components
    const cleanTime = timeString.replace('Z', '');
    
    // If format is YYYY-MM-DDTHH:MM:SS, parse manually to ensure local timezone
    if (cleanTime.includes('T')) {
        const [datePart, timePart] = cleanTime.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute, second = 0] = timePart.split(':').map(Number);
        
        // Create date in local timezone (month is 0-indexed)
        return new Date(year, month - 1, day, hour, minute, second);
    }
    
    return new Date(cleanTime);
}

// Populate the table with events
function populateTable(events) {
    const tbody = document.getElementById('events-tbody');
    tbody.innerHTML = '';
    
    const now = new Date();
    let currentEventIndex = -1;
    let nextEventIndex = -1;
    
    console.log('Current time:', now.toString());
    
    // Find current event (in progress) and next upcoming event
    for (let i = 0; i < events.length; i++) {
        const eventTime = parseLocalTime(events[i].scheduleTime);
        const eventEndTime = calculateEndTime(eventTime, events[i].details.duration);
        
        console.log(`Event ${i + 1}:`, {
            team: events[i].teamName,
            scheduleTime: events[i].scheduleTime,
            parsedTime: eventTime.toString(),
            endTime: eventEndTime.toString(),
            isInProgress: eventTime <= now && eventEndTime > now,
            isPast: eventEndTime <= now
        });
        
        // Check if event is currently in progress
        if (eventTime <= now && eventEndTime > now) {
            currentEventIndex = i;
        }
        
        // Find next event that hasn't started yet
        if (nextEventIndex === -1 && eventTime > now) {
            nextEventIndex = i;
        }
    }
    
    console.log('Current event index:', currentEventIndex);
    console.log('Next event index:', nextEventIndex);

    events.forEach((event, index) => {
        const row = document.createElement('tr');
        row.dataset.eventIndex = index;
        
        // Format the schedule time
        const eventTime = parseLocalTime(event.scheduleTime);
        const scheduleTime = formatTime(eventTime);
        const eventEndTime = calculateEndTime(eventTime, event.details.duration);
        
        // Apply styling based on event status
        if (eventEndTime <= now) {
            // Past event - grayed out
            row.classList.add('past-event');
        } else if (index === currentEventIndex) {
            // Currently in progress - highlighted
            row.classList.add('current-event');
        } else if (index === nextEventIndex) {
            // Next upcoming event - light green
            row.classList.add('next-event');
        }
        
        row.innerHTML = `
            <td>${scheduleTime}</td>
            <td>${event.teamName}</td>
            <td>${event.arena}</td>
            <td>${event.lane}</td>
        `;
        
        // Add click event to open modal
        row.addEventListener('click', () => openModal(event));
        
        tbody.appendChild(row);
    });
}

// Format time to display only hours and minutes
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
}

// Calculate end time based on start time and duration
function calculateEndTime(startTime, durationMinutes) {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);
    return endTime;
}

// Open modal with event details
function openModal(event) {
    const modal = document.getElementById('event-modal');
    const startTime = parseLocalTime(event.scheduleTime);
    const endTime = calculateEndTime(startTime, event.details.duration);
    
    // Populate modal content
    document.getElementById('modal-team-name').textContent = event.teamName;
    document.getElementById('modal-category').textContent = event.details.category;
    document.getElementById('modal-members').textContent = event.details.teamMembers.join(', ');
    document.getElementById('modal-start-time').textContent = formatTime(startTime);
    document.getElementById('modal-duration').textContent = `${event.details.duration} minutos`;
    document.getElementById('modal-end-time').textContent = formatTime(endTime);
    document.getElementById('modal-wod').textContent = event.details.WOD;
    
    // Display the modal
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('event-modal');
    modal.style.display = 'none';
}

// Update the clock display and refresh table styling
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
    });
    document.getElementById('current-time').textContent = timeString;
}

// Store events globally to refresh table styling
let allEvents = [];

// Refresh table styling based on current time
function refreshTableStyling() {
    if (allEvents.length > 0) {
        populateTable(allEvents);
        scheduleNextUpdate(); // Reschedule after manual refresh
    }
}

// Calculate when the next status change will occur
function getNextStatusChangeTime(events) {
    const now = new Date();
    let nextChangeTime = null;
    
    events.forEach(event => {
        const eventTime = parseLocalTime(event.scheduleTime);
        const eventEndTime = calculateEndTime(eventTime, event.details.duration);
        
        // Check if event start is in the future and closer than current nextChangeTime
        if (eventTime > now) {
            if (!nextChangeTime || eventTime < nextChangeTime) {
                nextChangeTime = eventTime;
            }
        }
        
        // Check if event end is in the future and closer than current nextChangeTime
        if (eventEndTime > now) {
            if (!nextChangeTime || eventEndTime < nextChangeTime) {
                nextChangeTime = eventEndTime;
            }
        }
    });
    
    return nextChangeTime;
}

// Schedule the next automatic update
function scheduleNextUpdate() {
    if (allEvents.length === 0) return;
    
    const nextChangeTime = getNextStatusChangeTime(allEvents);
    
    if (nextChangeTime) {
        const now = new Date();
        const msUntilChange = nextChangeTime - now;
        
        // Add 1 second buffer to ensure the time has passed
        const updateDelay = msUntilChange + 1000;
        
        console.log('Next status change at:', nextChangeTime.toString());
        console.log('Scheduling update in:', Math.round(updateDelay / 1000), 'seconds');
        
        // Clear any existing timeout
        if (window.statusUpdateTimeout) {
            clearTimeout(window.statusUpdateTimeout);
        }
        
        // Schedule the update
        window.statusUpdateTimeout = setTimeout(() => {
            console.log('Auto-updating event status...');
            refreshTableStyling();
            scheduleNextUpdate(); // Schedule the next one
        }, updateDelay);
    }
}

// Event listeners for modal
document.addEventListener('DOMContentLoaded', () => {
    // Load events when page loads
    loadEvents();
    
    // Initialize and update clock
    updateClock();
    setInterval(updateClock, 1000); // Update every second
    
    // Schedule automatic status updates
    setTimeout(() => {
        scheduleNextUpdate();
    }, 1000); // Wait 1 second for events to load
    
    // Close button
    const closeBtn = document.querySelector('.close');
    closeBtn.addEventListener('click', closeModal);
    
    // Close when clicking outside the modal
    const modal = document.getElementById('event-modal');
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
});

