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

// Demo Microsoft login for SEMO students only (client-side validation)
let currentUser = null;

// DOM elements will be queried inside DOMContentLoaded

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
function showToast(message, type = 'success', container = document.getElementById('toastContainer')) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}



// Initialize app - FIXED: All DOM queries and listeners inside DOMContentLoaded
// FIXED DOMContentLoaded - All inside, no nulls, shuttles gated perfectly
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userInfo = document.getElementById('userInfo');
  const loginPage = document.getElementById('loginPage');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const authBtn = document.getElementById('authBtn');
  const shuttlesList = document.getElementById('shuttles');
  const searchSelect = document.getElementById('searchSelect');
  const searchBtn = document.getElementById('searchBtn');
  const searchResults = document.getElementById('searchResults');
  const getStartedBtn = document.getElementById('getStartedBtn');
  const backBtn = document.getElementById('backBtn');
  const toastContainer = document.getElementById('toastContainer');

  initMap();

  let markers = [];
  let shuttleInterval;

  function updateShuttles() {
    shuttlesList.innerHTML = '';
    dummyShuttles.forEach((shuttle, index) => {
      const progress = Math.floor(((Date.now() / 1000 + index * 30) % 60) / 60 * 100);
      const eta = `${Math.max(1, Math.round((100 - progress) / 20))} min`;
      const card = '<div class="shuttle-card"><h3>' + shuttle.id + ' 🚐</h3><p><strong>Route:</strong> ' + shuttle.routeID + '</p><p><strong>Speed:</strong> ' + Math.round(shuttle.speed) + ' mph</p><div class="progress-container"><div class="progress-bar" style="width: ' + progress + '%"></div></div><p><strong>Progress:</strong> ' + progress + '%</p><p><strong>ETA:</strong> ' + eta + '</p></div>';
      shuttlesList.innerHTML += card;
    });

    // Update shuttle markers on map
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    dummyShuttles.forEach(shuttle => {
      const marker = L.marker([shuttle.latitude, shuttle.longitude], {icon: shuttleIcon})
        .addTo(map)
        .bindPopup('<b>' + shuttle.id + '</b><br>Route: ' + shuttle.routeID + '<br>Speed: ' + Math.round(shuttle.speed) + ' mph');
      markers.push(marker);
    });
  }

  function showShuttlePlaceholder() {
    shuttlesList.innerHTML = '<div class="shuttle-placeholder" style="text-align: center; padding: 60px 20px; color: #666; font-style: italic;"><h3 style="color: #C8102E; margin-bottom: 10px;">🚐 Active Shuttles</h3><p>Login with your SEMO account to view live shuttle tracking!</p><button class="fun-btn" style="margin-top: 20px;" onclick="document.querySelector(\'main\').style.display=\'none\';document.querySelector(\'footer\').style.display=\'none\';document.getElementById(\'loginPage\').style.display=\'flex\';">Login Now</button></div>';
  }

  function checkAuthState() {
    const currentUser = localStorage.getItem('semoUser');
    if (currentUser) {
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      userInfo.textContent = 'Welcome, ' + currentUser.split('@')[0] + '!';
      loginPage.style.display = 'none';
      document.querySelector('main').style.display = 'block';
      document.querySelector('footer').style.display = 'block';
      shuttlesList.innerHTML = '';
      updateShuttles();
      if (shuttleInterval) clearInterval(shuttleInterval);
      shuttleInterval = setInterval(() => {
        dummyShuttles.forEach(shuttle => {
          shuttle.latitude += (Math.random() - 0.5) * 0.003;
          shuttle.longitude += (Math.random() - 0.5) * 0.003;
          shuttle.speed = 15 + Math.random() * 20;
        });
        updateShuttles();
      }, 4000);
      if (typeof confetti !== 'undefined') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      userInfo.textContent = '';
      showShuttlePlaceholder();
      if (shuttleInterval) {
        clearInterval(shuttleInterval);
        shuttleInterval = null;
      }
    }
  }

  checkAuthState();

  authBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = emailInput.value.toLowerCase().trim();
    const password = passwordInput.value;
    if (!email.endsWith('@semo.edu') && !email.endsWith('@live.semo.edu')) {
      showToast('Access restricted to SEMO students only (@semo.edu or @live.semo.edu)', 'error', toastContainer);
      return;
    }
    if (!password) {
      showToast('Please enter a password', 'error', toastContainer);
      return;
    }
    localStorage.setItem('semoUser', email);
    loginPage.style.display = 'none';
    document.querySelector('main').style.display = 'block';
    document.querySelector('footer').style.display = 'block';
    checkAuthState();
    showToast('Welcome, ' + email + '! Live shuttles unlocked. (Demo)', 'success', toastContainer);
  });

  backBtn.addEventListener('click', () => {
    loginPage.style.display = 'none';
    document.querySelector('main').style.display = 'block';
    document.querySelector('footer').style.display = 'block';
    checkAuthState();
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('semoUser');
    checkAuthState();
    showToast('Logged out! Shuttles hidden.', 'info', toastContainer);
  });

  getStartedBtn.addEventListener('click', () => {
    document.getElementById('mapSection').scrollIntoView({ behavior: 'smooth' });
    showToast('Explore the shuttle map!', 'info', toastContainer);
  });

  window.addEventListener('scroll', () => {
    const atBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 10;
    document.querySelector('footer').style.opacity = atBottom ? '1' : '0';
  });

  searchBtn.addEventListener('click', () => {
    const query = searchSelect.value;
    searchResults.innerHTML = '';
    if (query) {
      let results = [];
      if (dummyRoutes[query]) {
        results = [{ name: query, type: 'Route', stops: dummyRoutes[query] }];
      } else {
        const stop = dummyStops.find(s => s.name === query);
        if (stop) results = [{ name: query, type: 'Stop', location: [stop.lat, stop.lng] }];
      }
      results.forEach(result => {
        const div = document.createElement('div');
        div.className = 'search-result';
        div.innerHTML = result.type === 'Route' ? '<strong>Route:</strong> ' + result.name + '<br><strong>Stops:</strong> ' + result.stops.join(', ') : '<strong>Stop:</strong> ' + result.name;
        div.addEventListener('click', () => {
          if (result.location) map.setView(result.location, 16);
          else if (result.stops) {
            const firstStop = dummyStops.find(s => s.name === result.stops[0]);
            if (firstStop) map.setView([firstStop.lat, firstStop.lng], 14);
          }
          showToast('Viewing ' + result.name, 'info', toastContainer);
        });
        searchResults.appendChild(div);
      });
      if (results.length === 0) showToast('No results found', 'error', toastContainer);
    } else {
      showToast('Please select a route or stop', 'error', toastContainer);
    }
  });
});
