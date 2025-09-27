// Dummy data for PD1 showcase - easily reversible
const dummyRoutes = {
    "Main Campus Loop": ["SEMO Campus Center", "Kent Library", "Academic Hall", "Student Union"],
    "Downtown Connector": ["SEMO Campus Center", "Cape Girardeau Downtown", "Mississippi Riverfront", "Historic District"],
    "Residential Route": ["SEMO Campus Center", "University Apartments", "Off-Campus Housing", "Shopping Center"]
};

const dummyStops = [
    { name: "SEMO Campus Center", lat: 37.3100, lng: -89.5300 },
    { name: "Kent Library", lat: 37.3080, lng: -89.5280 },
    { name: "Academic Hall", lat: 37.3120, lng: -89.5320 },
    { name: "Student Union", lat: 37.3090, lng: -89.5290 },
    { name: "Cape Girardeau Downtown", lat: 37.3050, lng: -89.5200 },
    { name: "Mississippi Riverfront", lat: 37.3000, lng: -89.5150 },
    { name: "Historic District", lat: 37.3030, lng: -89.5180 },
    { name: "University Apartments", lat: 37.3150, lng: -89.5350 },
    { name: "Off-Campus Housing", lat: 37.3200, lng: -89.5400 },
    { name: "Shopping Center", lat: 37.3070, lng: -89.5250 }
];

const dummyShuttles = [
    { id: 'Redhawk Express', latitude: 37.3100, longitude: -89.5300, speed: 25, routeID: 'Main Campus Loop' },
    { id: 'Campus Cruiser', latitude: 37.3050, longitude: -89.5200, speed: 30, routeID: 'Downtown Connector' },
    { id: 'River Runner', latitude: 37.3150, longitude: -89.5350, speed: 20, routeID: 'Residential Route' }
];

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// DOM elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const loginPage = document.getElementById('loginPage');
const authForm = document.getElementById('authForm');
const pageTitle = document.getElementById('pageTitle');
const authBtn = document.getElementById('authBtn');
const toggleAuth = document.getElementById('toggleAuth');
const shuttlesList = document.getElementById('shuttles');
const searchSelect = document.getElementById('searchSelect');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const spinner = document.getElementById('spinner');
const toastContainer = document.getElementById('toastContainer');
const getStartedBtn = document.getElementById('getStartedBtn');
const backBtn = document.getElementById('backBtn');

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
    map = L.map('map').setView([37.3100, -89.5300], 14); // Centered on SEMO Campus Center

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add stop markers for Cape Girardeau sample map
    dummyStops.forEach(stop => {
        L.marker([stop.lat, stop.lng])
            .addTo(map)
            .bindPopup(`<b>${stop.name}</b><br>Stop Location`);
    });
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

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline';
        userInfo.textContent = `Welcome, ${user.email}`;
        loginPage.style.display = 'none';
        document.querySelector('main').style.display = 'block';
        document.querySelector('footer').style.display = 'block';
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
    document.querySelector('main').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
    loginPage.style.display = 'flex';
});

backBtn.addEventListener('click', () => {
    loginPage.style.display = 'none';
    document.querySelector('main').style.display = 'block';
    document.querySelector('footer').style.display = 'block';
});

logoutBtn.addEventListener('click', () => {
    auth.signOut();
    showToast('Logged out successfully!', 'info');
});

toggleAuth.addEventListener('click', () => {
    isSignUp = !isSignUp;
    pageTitle.textContent = isSignUp ? 'Sign Up for SEMOTrackIt' : 'Welcome to SEMOTrackIt';
    authBtn.textContent = isSignUp ? 'Sign Up' : 'Login';
    toggleAuth.textContent = isSignUp ? 'Already have an account? Login' : 'New to SEMOTrackIt? Sign Up';
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
    const shuttlesRef = ref(database, 'shuttles');
    onValue(shuttlesRef, (snapshot) => {
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

            // New: Create shuttle card instead of li
            const card = document.createElement('div');
            card.className = 'shuttle-card';
            const progress = Math.floor(Math.random() * 100) + 1; // Random progress 1-100%
            card.innerHTML = `
                <h3>🚐 Shuttle ${key}</h3>
                <p>Speed: ${shuttle.speed} mph</p>
                <p>Route: ${shuttle.routeID}</p>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                <p>ETA Progress: ${progress}% to next stop</p>
            `;
            card.addEventListener('click', () => {
                alert("Zooming to shuttle " + key);
            });
            shuttlesList.appendChild(card);
        });
    } else {
        // Fallback data - using dummy shuttles for PD1 showcase
        const fallbackShuttles = dummyShuttles;

        fallbackShuttles.forEach(shuttle => {
            const marker = L.marker([shuttle.latitude, shuttle.longitude], { icon: shuttleIcon })
                .addTo(map)
                .bindPopup(`Shuttle ${shuttle.id}<br>Speed: ${shuttle.speed} mph<br>Route: ${shuttle.routeID}`);
            marker._icon.classList.add('pulse');
            markers.push(marker);

            // New: Create shuttle card instead of li
            const card = document.createElement('div');
            card.className = 'shuttle-card';
            const progress = Math.floor(Math.random() * 100) + 1; // Random progress 1-100%
            card.innerHTML = `
                <h3>🚐 Shuttle ${shuttle.id}</h3>
                <p>Speed: ${shuttle.speed} mph</p>
                <p>Route: ${shuttle.routeID}</p>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                <p>ETA Progress: ${progress}% to next stop</p>
            `;
            card.addEventListener('click', () => {
                alert("Zooming to shuttle " + shuttle.id);
            });
            shuttlesList.appendChild(card);
        });
    }
}

// Search functionality
searchBtn.addEventListener('click', () => {
    const query = searchSelect.value;
    searchResults.innerHTML = '';

    if (query) {
        let results = [];
        if (dummyRoutes[query]) {
            // It's a route
            results = [{ name: query, type: 'Route', stops: dummyRoutes[query] }];
        } else {
            // It's a stop
            const stop = dummyStops.find(s => s.name === query);
            if (stop) {
                results = [{ name: query, type: 'Stop', location: [stop.lat, stop.lng] }];
            }
        }

        results.forEach(result => {
            const div = document.createElement('div');
            div.className = 'search-result';
            if (result.type === 'Route') {
                div.innerHTML = `<strong>Route:</strong> ${result.name}<br><strong>Stops:</strong> ${result.stops.join(', ')}`;
            } else {
                div.innerHTML = `<strong>Stop:</strong> ${result.name}`;
            }
            div.addEventListener('click', () => {
                if (result.location) {
                    map.setView(result.location, 16);
                } else if (result.stops) {
                    // Zoom to first stop of the route
                    const firstStop = dummyStops.find(s => s.name === result.stops[0]);
                    if (firstStop) {
                        map.setView([firstStop.lat, firstStop.lng], 14);
                    }
                }
                showToast(`Viewing ${result.name}`, 'info');
            });
            searchResults.appendChild(div);
        });

        if (results.length === 0) {
            showToast('No results found', 'error');
        }
    } else {
        showToast('Please select a route or stop', 'error');
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    getShuttles();

    // Hero button functionality
    getStartedBtn.addEventListener('click', () => {
        document.getElementById('mapSection').scrollIntoView({ behavior: 'smooth' });
        showToast('Explore the shuttle map below!', 'info');
    });

    // Login navigation
    loginBtn.addEventListener('click', () => {
        document.querySelector('main').style.display = 'none';
        document.querySelector('footer').style.display = 'none';
        loginPage.style.display = 'block';
    });

    backBtn.addEventListener('click', () => {
        loginPage.style.display = 'none';
        document.querySelector('main').style.display = 'block';
        document.querySelector('footer').style.display = 'block';
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        signOut(auth);
        showToast('Logged out successfully!', 'info');
    });

    // Toggle auth mode
    toggleAuth.addEventListener('click', () => {
        isSignUp = !isSignUp;
        pageTitle.textContent = isSignUp ? 'Sign Up for SEMOTrackIt' : 'Welcome to SEMOTrackIt';
        authBtn.textContent = isSignUp ? 'Sign Up' : 'Login';
        toggleAuth.textContent = isSignUp ? 'Already have an account? Login' : 'New to SEMOTrackIt? Sign Up';
    });

    // Auth form submit
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        spinner.style.display = 'block';
        authBtn.disabled = true;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
                showToast('Account created successfully!', 'success');
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                showToast('Logged in successfully!', 'success');
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            spinner.style.display = 'none';
            authBtn.disabled = false;
        }
    });

    // Search functionality
    searchBtn.addEventListener('click', () => {
        const query = searchSelect.value;
        searchResults.innerHTML = '';

        if (query) {
            let results = [];
            if (dummyRoutes[query]) {
                // It's a route
                results = [{ name: query, type: 'Route', stops: dummyRoutes[query] }];
            } else {
                // It's a stop
                const stop = dummyStops.find(s => s.name === query);
                if (stop) {
                    results = [{ name: query, type: 'Stop', location: [stop.lat, stop.lng] }];
                }
            }

            results.forEach(result => {
                const div = document.createElement('div');
                div.className = 'search-result';
                if (result.type === 'Route') {
                    div.innerHTML = `<strong>Route:</strong> ${result.name}<br><strong>Stops:</strong> ${result.stops.join(', ')}`;
                } else {
                    div.innerHTML = `<strong>Stop:</strong> ${result.name}`;
                }
                div.addEventListener('click', () => {
                    if (result.location) {
                        map.setView(result.location, 16);
                    } else if (result.stops) {
                        // Zoom to first stop of the route
                        const firstStop = dummyStops.find(s => s.name === result.stops[0]);
                        if (firstStop) {
                            map.setView([firstStop.lat, firstStop.lng], 14);
                        }
                    }
                    showToast(`Viewing ${result.name}`, 'info');
                });
                searchResults.appendChild(div);
            });

            if (results.length === 0) {
                showToast('No results found', 'error');
            }
        } else {
            showToast('Please select a route or stop', 'error');
        }
    });
});
