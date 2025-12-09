// State Management
let trips = [];
let currentTripId = null;

const STORAGE_KEY = 'plantrip_data_v4';

// Expanded Categories Configuration
const categoryConfig = {
    sightseeing:   { icon: 'fa-camera',       color: 'bg-pink-100 text-pink-600',       border: 'border-pink-200' },
    food:          { icon: 'fa-burger',       color: 'bg-orange-100 text-orange-600',   border: 'border-orange-200' },
    transport:     { icon: 'fa-plane-up',     color: 'bg-blue-100 text-blue-600',       border: 'border-blue-200' },
    lodging:       { icon: 'fa-bed',          color: 'bg-indigo-100 text-indigo-600',   border: 'border-indigo-200' },
    activity:      { icon: 'fa-person-hiking',color: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-200' },
    shopping:      { icon: 'fa-bag-shopping', color: 'bg-purple-100 text-purple-600',    border: 'border-purple-200' },
    nature:        { icon: 'fa-tree',         color: 'bg-green-100 text-green-600',      border: 'border-green-200' },
    relax:         { icon: 'fa-spa',          color: 'bg-teal-100 text-teal-600',        border: 'border-teal-200' },
    entertainment: { icon: 'fa-masks-theater',color: 'bg-red-100 text-red-600',          border: 'border-red-200' }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    if (trips.length === 0) {
        createNewTrip();
    } else {
        // Ensure currentTripId is the most recently accessed trip, or default to first
        const lastAccessedId = localStorage.getItem('lastAccessedTripId');
        const validTrip = trips.find(t => t.id === lastAccessedId);
        currentTripId = validTrip ? validTrip.id : trips[0].id;
    }
    renderTabs();
    renderApp();
});

// --- Data Logic ---
function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        trips = JSON.parse(data);
    }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch (e) {
        showToast("Storage full! Photos might be too big.", true);
    }
}

function createNewTrip() {
    const newTrip = {
        id: crypto.randomUUID(),
        name: 'New Adventure',
        description: '',
        events: []
    };
    trips.unshift(newTrip); 
    currentTripId = newTrip.id;
    localStorage.setItem('lastAccessedTripId', newTrip.id); // Set as most recent
    saveData();
    renderTabs();
    renderApp();
}

function deleteCurrentTrip() {
    if(!confirm("Are you sure you want to permanently delete this adventure?")) return;
    trips = trips.filter(t => t.id !== currentTripId);
    if (trips.length === 0) {
        createNewTrip();
    } else {
        currentTripId = trips[0].id; // Default to first trip
        localStorage.setItem('lastAccessedTripId', currentTripId);
    }
    saveData();
    renderTabs();
    renderApp();
}

function switchTrip(id) {
    currentTripId = id;
    localStorage.setItem('lastAccessedTripId', id); // Set as most recent
    renderTabs();
    renderApp();
    document.getElementById('mainContainer').scrollTo(0, 0); // Scroll to top on switch
}

function updateTripMeta() {
    const trip = trips.find(t => t.id === currentTripId);
    if (!trip) return;

    const nameInput = document.getElementById('tripNameInput');
    const descInput = document.getElementById('tripDescInput');
    const mobileNameInput = document.getElementById('tripNameInputMobile');
    const mobileDescInput = document.getElementById('tripDescInputMobile');

    // Sync inputs across desktop and mobile
    if(document.activeElement === mobileNameInput) nameInput.value = mobileNameInput.value;
    else mobileNameInput.value = nameInput.value;
    
    if(document.activeElement === mobileDescInput) descInput.value = mobileDescInput.value;
    else mobileDescInput.value = descInput.value;

    trip.name = nameInput.value || 'Untitled Adventure';
    trip.description = descInput.value;
    
    // Live update tab name
    const tabEl = document.getElementById(`tab-${trip.id}`);
    if(tabEl) tabEl.innerText = trip.name;

    saveData();
}

// --- Template System ---
function loadTemplate(type) {
    if(!confirm("Replace current adventure with a template?")) return;
    const trip = trips.find(t => t.id === currentTripId);
    const now = new Date();
    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
    const d1 = now.toISOString().slice(0, 16);
    const d2 = tomorrow.toISOString().slice(0, 16);

    if (type === 'paris') {
        trip.name = "Paris Getaway";
        trip.description = "Croissants, art, and city lights. 3-day budget: €1500.";
        trip.events = [
            { id: crypto.randomUUID(), location: 'Arrival at CDG', date: d1, category: 'transport', description: 'Take RER B to Châtelet.', photo: null },
            { id: crypto.randomUUID(), location: 'Hotel check-in', date: setTime(d1, 2), category: 'lodging', description: 'Le Marais Boutique Hotel. Confirmation #ABC123.', photo: null },
            { id: crypto.randomUUID(), location: 'Eiffel Tower View', date: setTime(d1, 5), category: 'sightseeing', description: 'Book tickets online 30 days ahead.', photo: null },
            { id: crypto.randomUUID(), location: 'Dinner Seine Cruise', date: setTime(d1, 8), category: 'food', description: 'Sunset boat ride with wine. Reservation: 7 PM.', photo: null },
            { id: crypto.randomUUID(), location: 'Louvre Museum', date: d2, category: 'sightseeing', description: 'Mona Lisa visit. Must arrive before 10 AM.', photo: null }
        ];
    } else if (type === 'roadtrip') {
        trip.name = "Pacific Coast Hwy";
        trip.description = "Sun, sea, and open roads. Must pack sunscreen and a good playlist.";
        trip.events = [
            { id: crypto.randomUUID(), location: 'Start: SF Golden Gate', date: d1, category: 'transport', description: 'Begin journey driving south on CA-1.', photo: null },
            { id: crypto.randomUUID(), location: 'Muir Woods', date: setTime(d1, 3), category: 'nature', description: 'Giant Redwoods hike. Need reservation for parking.', photo: null },
            { id: crypto.randomUUID(), location: 'Big Sur Camping', date: setTime(d1, 8), category: 'lodging', description: 'Campsite #14. Check in by 9 PM.', photo: null }
        ];
    }
    saveData();
    renderApp();
    showToast("Template loaded!");
}

function setTime(isoStr, hoursToAdd) {
    let d = new Date(isoStr);
    d.setHours(d.getHours() + hoursToAdd);
    return d.toISOString().slice(0, 16);
}

// --- Event Logic ---
function handleFormSubmit(e) {
    e.preventDefault();
    const trip = trips.find(t => t.id === currentTripId);
    const eventId = document.getElementById('eventId').value;
    
    // Gather values
    const formValues = {
        location: document.getElementById('locationInput').value,
        date: document.getElementById('dateInput').value,
        category: document.getElementById('categoryInput').value,
        description: document.getElementById('descInput').value,
        photo: document.getElementById('imgPreview').src
    };
    
    if (document.getElementById('imagePreviewContainer').classList.contains('hidden')) {
        formValues.photo = null;
    }

    if (eventId) {
        const idx = trip.events.findIndex(e => e.id === eventId);
        if (idx > -1) trip.events[idx] = { ...trip.events[idx], ...formValues };
    } else {
        trip.events.push({ id: crypto.randomUUID(), ...formValues });
    }

    saveData();
    closeModal('eventModal');
    renderApp();
    showToast("Added to itinerary!");
}

function deleteEvent(eventId) {
    if(!confirm("Delete this stop?")) return;
    const trip = trips.find(t => t.id === currentTripId);
    trip.events = trip.events.filter(e => e.id !== eventId);
    saveData();
    renderApp();
}

function editEvent(eventId) {
    const trip = trips.find(t => t.id === currentTripId);
    const event = trip.events.find(e => e.id === eventId);
    if (!event) return;

    document.getElementById('eventId').value = event.id;
    document.getElementById('modalTitle').innerText = "Edit Stop";
    document.getElementById('locationInput').value = event.location;
    document.getElementById('dateInput').value = event.date;
    document.getElementById('categoryInput').value = event.category;
    document.getElementById('descInput').value = event.description;
    
    if (event.photo) {
        document.getElementById('imgPreview').src = event.photo;
        document.getElementById('imagePreviewContainer').classList.remove('hidden');
        document.getElementById('uploadPrompt').classList.add('hidden');
    } else {
        clearImage();
    }

    document.getElementById('eventModal').classList.remove('hidden');
    document.getElementById('eventModal').classList.add('flex');
}

// --- Rendering ---
function renderTabs() {
    const container = document.getElementById('tripTabs');
    container.innerHTML = trips.map(trip => `
        <button id="tab-${trip.id}" onclick="switchTrip('${trip.id}')" 
            class="whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 ${trip.id === currentTripId ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}">
            ${trip.name}
        </button>
    `).join('');
}

function renderStats() {
    const trip = trips.find(t => t.id === currentTripId);
    if (!trip) return { stops: 0, duration: "1 Day" };

    const stops = trip.events.length;
    let duration = "1 Day"; // Default for single/no stop

    if (stops > 1) {
        // Ensure events are sorted for accurate duration calculation
        const sortedEvents = [...trip.events].sort((a, b) => new Date(a.date) - new Date(b.date));
        const first = new Date(sortedEvents[0].date);
        const last = new Date(sortedEvents[sortedEvents.length - 1].date);
        
        // Calculate days difference (inclusive of start and end date)
        const timeDiff = Math.abs(last.getTime() - first.getTime());
        const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; 
        duration = `${dayDiff} Day${dayDiff !== 1 ? 's' : ''}`;
    } else if (stops === 1) {
        duration = "1 Day";
    }
    
    document.getElementById('statStops').innerText = stops;
    document.getElementById('statDuration').innerText = duration;

    return { stops, duration };
}

function renderApp() {
    const trip = trips.find(t => t.id === currentTripId);
    if (!trip) return;

    // Render stats
    const stats = renderStats(); 

    // Sync inputs 
    const name = trip.name || 'Untitled Adventure';
    const description = trip.description || '';
    document.getElementById('tripNameInput').value = name;
    document.getElementById('tripNameInputMobile').value = name;
    document.getElementById('tripDescInput').value = description;
    document.getElementById('tripDescInputMobile').value = description;
    
    // Sort
    trip.events.sort((a, b) => new Date(a.date) - new Date(b.date));

    const container = document.getElementById('timelineContainer');
    const emptyState = document.getElementById('emptyState');

    if (trip.events.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    // Render Timeline with Alternating Layout (Desktop) / Linear Layout (Mobile)
    container.innerHTML = `<div class="journey-line"></div>` + trip.events.map((event, index) => {
        const dateObj = new Date(event.date);
        const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        const config = categoryConfig[event.category] || categoryConfig.sightseeing;
        
        // Logic for Alternating Layout (Desktop)
        const isLeft = index % 2 === 0;
        
        // Card Classes
        const colOrder = isLeft ? 'flex-row-reverse' : 'flex-row';
        const contentWrapperClasses = isLeft ? 'pr-6 lg:text-right' : 'pl-6 lg:text-left';
        const contentAreaClasses = isLeft ? 'timeline-content-area-left w-1/2 hidden lg:block' : 'timeline-content-area-left w-1/2';
        const dateLabelClasses = isLeft ? 'lg:ml-auto lg:text-right' : '';
        const editControlClasses = isLeft ? 'lg:left-4' : 'lg:right-4';
        
        return `
        <div class="timeline-item-wrapper relative flex ${colOrder} items-start mb-8 w-full group">
            
            <!-- Empty Spacer for one side (Desktop) -->
            <div class="${contentAreaClasses}"></div>

            <!-- Center Dot (Shifts left on mobile) -->
            <div class="timeline-dot absolute left-[30px] lg:left-1/2 transform -translate-x-1/2 flex items-center justify-center z-10 pt-1">
                <div class="w-4 h-4 rounded-full bg-white border-4 border-gray-300 group-hover:border-black transition-colors"></div>
            </div>

            <!-- Content Wrapper (Always left-aligned on mobile) -->
            <div class="timeline-content-area w-full lg:w-1/2 ${contentWrapperClasses}">
                
                <!-- Date Label (Outside Card for clean look) -->
                <div class="timeline-date-label text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide ${dateLabelClasses}">
                    ${dateStr} • ${timeStr}
                </div>

                <!-- Card -->
                <div class="bg-white rounded-2xl shadow-sm hover:shadow-xl p-5 border border-transparent hover:border-gray-200 transition-all duration-300 relative group overflow-hidden">
                    
                    <!-- Category Badge -->
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 ${config.color}">
                        <i class="fas ${config.icon}"></i> ${event.category.toUpperCase()}
                    </div>

                    <h4 class="text-xl font-black text-gray-800 leading-tight mb-2">${event.location}</h4>
                    
                    ${event.description ? `<p class="text-gray-500 text-sm mb-3 font-medium leading-relaxed">${event.description}</p>` : ''}
                    
                    ${event.photo ? `
                        <div class="mt-3 rounded-xl overflow-hidden w-full relative aspect-[4/3] bg-gray-100">
                            <img src="${event.photo}" class="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="${event.location}">
                        </div>
                    ` : ''}

                    <!-- Edit Controls -->
                    <div class="timeline-edit-controls-left absolute top-4 ${editControlClasses} opacity-0 group-hover:opacity-100 transition-opacity no-print flex gap-2">
                        <button onclick="editEvent('${event.id}')" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-black hover:text-white flex items-center justify-center text-xs transition"><i class="fas fa-pencil-alt"></i></button>
                        <button onclick="deleteEvent('${event.id}')" class="w-8 h-8 rounded-full bg-red-50 hover:bg-red-500 hover:text-white text-red-500 flex items-center justify-center text-xs transition"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// --- Utilities & Modal ---
function openModal(modalId = 'eventModal') {
        if (modalId === 'eventModal') {
        document.getElementById('eventForm').reset();
        document.getElementById('eventId').value = '';
        document.getElementById('modalTitle').innerText = "New Adventure Stop";
        clearImage();
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('dateInput').value = now.toISOString().slice(0, 16);
    }
    document.getElementById(modalId).classList.remove('hidden');
    document.getElementById(modalId).classList.add('flex');
}

function closeModal(modalId = 'eventModal') {
    document.getElementById(modalId).classList.add('hidden');
    document.getElementById(modalId).classList.remove('flex');
}

function openCreditsModal() {
    openModal('creditsModal');
}

function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').innerText = msg;
    toast.classList.remove('-translate-y-10', 'opacity-0');
    
    setTimeout(() => {
        toast.classList.add('-translate-y-10', 'opacity-0');
    }, 3000);
}

// --- Image Handling ---
function previewImage(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_SIZE = 800; // Resize images for local storage
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                
                document.getElementById('imgPreview').src = dataUrl;
                document.getElementById('imagePreviewContainer').classList.remove('hidden');
                document.getElementById('uploadPrompt').classList.add('hidden');
            }
        }
        reader.readAsDataURL(file);
    }
}

function clearImage() {
    document.getElementById('photoInput').value = "";
    document.getElementById('imgPreview').src = "";
    document.getElementById('imagePreviewContainer').classList.add('hidden');
    document.getElementById('uploadPrompt').classList.remove('hidden');
}

// --- PDF Export ---
function exportPDF() {
    const element = document.getElementById('pdfContent');
    const trip = trips.find(t => t.id === currentTripId);
    const stats = renderStats();
    
    // 1. Prepare PDF Header with Stats
    const title = trip.name || 'Untitled Itinerary';
    document.getElementById('pdfTitle').innerText = title;
    document.getElementById('pdfDesc').innerText = trip.description || 'No description provided.';
    document.querySelector('.print-header').classList.remove('hidden');

    // Inject stats into the PDF header
    document.getElementById('pdfStats').innerHTML = `
        <div class="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <i class="fas fa-list-check text-blue-500"></i>
            <span>${stats.stops} Stops</span>
        </div>
        <div class="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <i class="fas fa-clock text-pink-500"></i>
            <span>${stats.duration} Trip Duration</span>
        </div>
    `;


    const opt = {
        margin:       [10, 10, 10, 10], 
        filename:     `${title.replace(/\s+/g, '_')}_PlanTrip.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    document.body.classList.add('cursor-wait');
    
    html2pdf().set(opt).from(element).save().then(() => {
        document.body.classList.remove('cursor-wait');
        // Cleanup: Hide headers and remove injected stats after export
        document.querySelector('.print-header').classList.add('hidden');
        document.getElementById('pdfStats').innerHTML = '';
        showToast("Itinerary Exported!");
    });
}