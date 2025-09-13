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

// Map initialization
let map;
let markers = [];

function initMap() {
    map = L.map('map').setView([37.0902, -89.2186], 13); // SEMO coordinates

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Authentication
let isSignUp = false;

auth.onAuthStateChanged((user) => {
    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline';
        userInfo.textContent = `Welcome, ${user.email}`;
        modal.style.display = 'none';
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
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        if (isSignUp) {
            await auth.createUserWithEmailAndPassword(email, password);
            alert('Account created successfully!');
        } else {
            await auth.signInWithEmailAndPassword(email, password);
            alert('Logged in successfully!');
        }
    } catch (error) {
        alert(error.message);
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
            const marker = L.marker([shuttle.latitude, shuttle.longitude])
                .addTo(map)
                .bindPopup(`Shuttle ${key}<br>Speed: ${shuttle.speed} mph<br>Route: ${shuttle.routeID}`);
            markers.push(marker);

            const li = document.createElement('li');
            li.textContent = `Shuttle ${key}: Speed ${shuttle.speed} mph, Route ${shuttle.routeID}`;
            shuttlesList.appendChild(li);
        });
    } else {
        // Fallback data
        const fallbackShuttles = [
            { id: '1', latitude: 37.0902, longitude: -89.2186, speed: 30, routeID: 'route1' },
            { id: '2', latitude: 37.0950, longitude: -89.2200, speed: 25, routeID: 'route1' }
        ];

        fallbackShuttles.forEach(shuttle => {
            const marker = L.marker([shuttle.latitude, shuttle.longitude])
                .addTo(map)
                .bindPopup(`Shuttle ${shuttle.id}<br>Speed: ${shuttle.speed} mph<br>Route: ${shuttle.routeID}`);
            markers.push(marker);

            const li = document.createElement('li');
            li.textContent = `Shuttle ${shuttle.id}: Speed ${shuttle.speed} mph, Route ${shuttle.routeID}`;
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
            div.style.cursor = 'pointer';
            div.addEventListener('click', () => {
                if (result.location) {
                    map.setView(result.location, 15);
                }
            });
            searchResults.appendChild(div);
        });
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    getShuttles();
});
