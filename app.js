// Load events from JSON and populate the table
async function loadEvents() {
    try {
        const response = await fetch('events.json');
        const data = await response.json();
        populateTable(data.events);
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('events-tbody').innerHTML = 
            '<tr><td colspan="4" style="text-align: center; padding: 2rem;">Error loading events. Please try again later.</td></tr>';
    }
}

// Populate the table with events
function populateTable(events) {
    const tbody = document.getElementById('events-tbody');
    tbody.innerHTML = '';

    events.forEach((event, index) => {
        const row = document.createElement('tr');
        row.dataset.eventIndex = index;
        
        // Format the schedule time
        const scheduleTime = formatTime(new Date(event.scheduleTime));
        
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
    const startTime = new Date(event.scheduleTime);
    const endTime = calculateEndTime(startTime, event.details.duration);
    
    // Populate modal content
    document.getElementById('modal-team-name').textContent = event.teamName;
    document.getElementById('modal-category').textContent = event.details.category;
    document.getElementById('modal-members').textContent = event.details.teamMembers.join(', ');
    document.getElementById('modal-start-time').textContent = formatTime(startTime);
    document.getElementById('modal-duration').textContent = `${event.details.duration} minutes`;
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

// Event listeners for modal
document.addEventListener('DOMContentLoaded', () => {
    // Load events when page loads
    loadEvents();
    
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

