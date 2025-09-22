// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyByIcBoFAxaCedcmt8t9wTLkb9Pd4euMKI",
    authDomain: "semotrack-it.firebaseapp.com",
    databaseURL: "https://semotrack-it-default-rtdb.firebaseio.com",
    projectId: "semotrack-it",
    storageBucket: "semotrack-it.firebasestorage.app",
    messagingSenderId: "116848776295",
    appId: "1:116848776295:web:a89e1a89312262026af0c2",
    measurementId: "G-Y57X0Q4H5D"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// DOM elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const modal = document.getElementById('loginModal');
const authForm = document.getElementById('authForm');
const modalTitle = document.getElementById('modalTitle');
const authBtn = document.getElementById('authBtn');
const toggleAuth = document.getElementById('toggleAuth');
const shuttlesList = document.getElementById('shuttles');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const spinner = document.getElementById('spinner');
const toastContainer = document.getElementById('toastContainer');

// Custom shuttle icon for markers
const shuttleIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="4" y="8" width="24" height="16" fill="#C8102E" rx="2"/><circle cx="8" cy="20" r="2" fill="#000"/><circle cx="24" cy="20" r="2" fill="#000"/><path d="M12 12 L20 12 L18 16 L14 16 Z" fill="#FFF"/></svg>'),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

// Map initialization
let map;
let markers = [];

function initMap() {
    map = L.map('map').setView([37.0902, -89.2186], 13); // SEMO coordinates

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3500);
}

// Authentication
let isSignUp = false;

auth.onAuthStateChanged((user) => {
    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline';
        userInfo.textContent = `Welcome, ${user.email}`;
        modal.style.display = 'none';
        // Confetti on login
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    } else {
        loginBtn.style.display = 'inline';
        logoutBtn.style.display = 'none';
        userInfo.textContent = '';
    }
});

loginBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

logoutBtn.addEventListener('click', () => {
    auth.signOut();
    showToast('Logged out successfully!', 'info');
});

document.querySelector('.close').addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

toggleAuth.addEventListener('click', () => {
    isSignUp = !isSignUp;
    modalTitle.textContent = isSignUp ? 'Sign Up' : 'Login';
    authBtn.textContent = isSignUp ? 'Sign Up' : 'Login';
    toggleAuth.textContent = isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up';
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    spinner.style.display = 'block';
    authBtn.disabled = true;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        if (isSignUp) {
            await auth.createUserWithEmailAndPassword(email, password);
            showToast('Account created successfully!', 'success');
        } else {
            await auth.signInWithEmailAndPassword(email, password);
            showToast('Logged in successfully!', 'success');
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        spinner.style.display = 'none';
        authBtn.disabled = false;
    }
});

// Real-time shuttle tracking
function getShuttles() {
    const shuttlesRef = database.ref('shuttles');
    shuttlesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        updateShuttles(data);
    });
}

function updateShuttles(data) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Clear shuttle list
    shuttlesList.innerHTML = '';

    if (data) {
        Object.keys(data).forEach(key => {
            const shuttle = data[key];
            const marker = L.marker([shuttle.latitude, shuttle.longitude], { icon: shuttleIcon })
                .addTo(map)
                .bindPopup(`Shuttle ${key}<br>Speed: ${shuttle.speed} mph<br>Route: ${shuttle.routeID}`);
            // Add pulsing class for active shuttles
            marker._icon.classList.add('pulse');
            markers.push(marker);

            const li = document.createElement('li');
            li.textContent = `🚐 Shuttle ${key}: Speed ${shuttle.speed} mph, Route ${shuttle.routeID}`;
            li.addEventListener('click', () => {
                map.setView([shuttle.latitude, shuttle.longitude], 15);
            });
            shuttlesList.appendChild(li);
        });
    } else {
        // Fallback data
        const fallbackShuttles = [
            { id: '1', latitude: 37.0902, longitude: -89.2186, speed: 30, routeID: 'route1' },
            { id: '2', latitude: 37.0950, longitude: -89.2200, speed: 25, routeID: 'route1' }
        ];

        fallbackShuttles.forEach(shuttle => {
            const marker = L.marker([shuttle.latitude, shuttle.longitude], { icon: shuttleIcon })
                .addTo(map)
                .bindPopup(`Shuttle ${shuttle.id}<br>Speed: ${shuttle.speed} mph<br>Route: ${shuttle.routeID}`);
            marker._icon.classList.add('pulse');
            markers.push(marker);

            const li = document.createElement('li');
            li.textContent = `🚐 Shuttle ${shuttle.id}: Speed ${shuttle.speed} mph, Route ${shuttle.routeID}`;
            li.addEventListener('click', () => {
                map.setView([shuttle.latitude, shuttle.longitude], 15);
            });
            shuttlesList.appendChild(li);
        });
    }
}

// Search functionality
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.toLowerCase();
    searchResults.innerHTML = '';

    if (query) {
        // Simple search - in a real app, this would query the database
        const results = [
            { name: 'Campus Center', type: 'Stop', location: [37.0902, -89.2186] },
            { name: 'Route 1', type: 'Route', stops: ['Campus Center', 'Library'] }
        ].filter(item => item.name.toLowerCase().includes(query));

        results.forEach(result => {
            const div = document.createElement('div');
            div.textContent = `${result.type}: ${result.name}`;
            div.addEventListener('click', () => {
                if (result.location) {
                    map.setView(result.location, 15);
                }
                showToast(`Viewing ${result.name}`, 'info');
            });
            searchResults.appendChild(div);
        });

        if (results.length === 0) {
            showToast('No results found', 'error');
        }
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    getShuttles();
});
