// var server = 'https://onetechzquad.tech/etryc';
var server = 'http://localhost/tricycle_rental/backend/';

// Default City Location (Cadiz City)
var latitude = 10.9561;
var longitude = 123.3110;

// Live password validation
document.addEventListener('input', function (e) {
  if (e.target.id === 'register_password') {
    const password = e.target.value;
    const validationTarget = document.getElementById(e.target.dataset.validationTarget);

    const checks = {
      length: password.length > 8,
      capital: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      underscore: /_/.test(password),
    };

    validationTarget.innerHTML = `
      <li>Password must:</li>
      <li style="color: ${checks.length ? 'green' : 'red'}">
        ${checks.length ? '✓' : '✗'} Contains more than 8 characters.
      </li>
      <li style="color: ${checks.capital ? 'green' : 'red'}">
        ${checks.capital ? '✓' : '✗'} Contains a capital letter.
      </li>
      <li style="color: ${checks.lowercase ? 'green' : 'red'}">
        ${checks.lowercase ? '✓' : '✗'} Contains a lowercase letter.
      </li>
      <li style="color: ${checks.number ? 'green' : 'red'}">
        ${checks.number ? '✓' : '✗'} Contains a number.
      </li>
      <li style="color: ${checks.underscore ? 'green' : 'red'}">
        ${checks.underscore ? '✓' : '✗'} Contains an underscore.
      </li>
    `;
  }
});

// Function to show snackbar
function showSnackbar(message, time = 5) {
  const snackbar = document.getElementById('snackbar');
  snackbar.textContent = message;
  snackbar.className = 'show';

  // Hide snackbar after 3 seconds
  setTimeout(function () {
    snackbar.className = snackbar.className.replace('show', '');
  }, time * 1000);
}

// Account Registration
document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const firstname = document.getElementById('firstname').value;
  const lastname = document.getElementById('lastname').value;
  const mobile_number = document.getElementById('register_mobile_number').value;
  const email = document.getElementById('register_email').value;
  const password = document.getElementById('register_password').value;

  // Password validation
  const isValidPassword = password.length > 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /_/.test(password);

  if (!isValidPassword) {
    return;
  }

  try {
    const response = await fetch(`${server}/register_account.php?step=1`, {
      method: 'POST',
      body: new URLSearchParams({ firstname, lastname, mobile_number, email, password }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const result = await response.json();

    if (result.status === 200) {

      document.getElementById('logo-wrapper').style.display = 'none';
      document.getElementById('register').classList.remove('active');

      if (setDataWithExpiry('user_id', result.user_id)) {
        document.getElementById('setup-profile').classList.add('active');
        initProfileMap();
      }

    } else if (result.status === 400) {
      document.getElementById('register_email_validation').innerHTML = result.message;
      return;

    } else {
      showSnackbar(result.message);
    }
  } catch (error) {
    console.log(error);
    showSnackbar('An unexpected error occurred. Please try again.');
  }
});

// Setup Profile Information
document.getElementById('setupProfileForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const address = document.getElementById('address').value;
  const latitude = document.getElementById('latitude').value;
  const longitude = document.getElementById('longitude').value;
  const user_type = document.getElementById('user_type').value;

  const email = document.getElementById('register_email').value;
  const password = document.getElementById('register_password').value;

  const user_id = getDataWithExpiryCheck('user_id');

  if (user_id) {

    try {
      const response = await fetch(`${server}/register_account.php?step=2`, {
        method: 'POST',
        body: new URLSearchParams({ address, latitude, longitude, user_type, user_id }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const result = await response.json();

      if (response.status === 200) {
        if (setDataWithExpiry('user_type', result.user_type)) {
          login(email, password);
        }
      } else {
        showSnackbar(result.message);
      }
    } catch (error) {
      showSnackbar('An unexpected error occurred. Please try again.');
    }
  } else {
    showSnackbar('User Session Expired!');
  }
});

// Account Login
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('login_email').value;
  const password = document.getElementById('login_password').value;

  login(email, password); // Proceed to login

});

// Check Login
async function login(email, password) {
  const response = await fetch(`${server}/login.php`, {
    method: 'POST',
    body: new URLSearchParams({ email, password }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  document.getElementById('login_email_validation').innerHTML = '';
  document.getElementById('login_password_validation').innerHTML = '';

  const result = await response.json();

  if (result.status === 200) {
    setDataWithExpiry('user_id', result.user_id);
    setDataWithExpiry('user_type', result.user_type);
    setDataWithExpiry('role', result.role);
    location.reload();
  } else if (result.status === 404) {
    document.getElementById('login_email_validation').innerHTML = result.message;
    return;
  } else if (result.status === 401) {
    document.getElementById('login_password_validation').innerHTML = result.message;
    return;
  } else {
    showSnackbar(result.message);
  }
}

// Account Logout
function logout() {
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_type');
  localStorage.removeItem('role');
  resetAllForms();
  location.reload();
}

async function populateProfile(userId) {

  const profileObject = await fetchAccounts(userId);

  const profile = profileObject[0];

  if (userId == profile.user_id) {
    const profileWrapper = document.getElementById('profile-wrapper');
    profileWrapper.innerHTML = `
      <div class="w-100 mb-10 flex jc-center ai-center" style="height: 100px; background-color: rgba(179, 179, 179, 0.5);">
        <h4>${profile.first_name} ${profile.last_name}</h4>
      </div>

      <div class="flex col">
        <div class="form-group flex col mb-20">
          <label>Mobile Number</label>
          <h5>${profile.mobile_number}</h5>
        </div>

        <div class="form-group flex col mb-20">
          <label>Email</label>
          <h5>${profile.email}</h5>
        </div>

        <div class="form-group flex col mb-20">
          <label>Address</label>
          <h5>${profile.address}</h5>
        </div>
      </div>
    `;
  }

}

// Get Accounts
async function fetchAccounts(userId = '') {
  try {
    const url = `${server}/get_accounts.php${userId ? '?user_id=' + userId : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result = await response.json();

    if (result.status === 200) {
      return result.data;
    } else {
      showSnackbar(result.message || 'No vehicles found');
    }
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    showSnackbar('An error occurred while fetching data.');
  }
}

// Vehicle Registration
document.getElementById('registerVehicleForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const user_id = getDataWithExpiryCheck('user_id');
  const number = document.getElementById('number').value;
  const make = document.getElementById('make').value;
  const model = document.getElementById('model').value;
  const price = document.getElementById('price').value;
  const location = document.getElementById('location').value;
  const latitude = document.getElementById('vehicle-latitude').value;
  const longitude = document.getElementById('vehicle-longitude').value;
  const status = 'Available';

  if (user_id) {
    try {
      const response = await fetch(`${server}/register_vehicle.php`, {
        method: 'POST',
        body: new URLSearchParams({ user_id, number, make, model, price, location, latitude, longitude, status }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const result = await response.json();

      if (result.status === 200) {

        showSnackbar(result.message);
        fetchVehicles(getDataWithExpiryCheck('user_id'));

        resetAllForms();

        document.getElementById('add-vehicle').classList.remove('active');
        document.getElementById('view-vehicles').classList.add('active');

      } else {
        showSnackbar(result.message);
      }
    } catch (error) {
      showSnackbar('An unexpected error occurred. Please try again.');
    }
  } else {
    showSnackbar('User Session Expired!');
  }
});

// Vehicle Update
document.getElementById('updateVehicleForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const vehicle_id = document.getElementById('update-vehicle-id').value;
  const number = document.getElementById('update-vehicle-number').value;
  const make = document.getElementById('update-vehicle-make').value;
  const model = document.getElementById('update-vehicle-model').value;
  const price = document.getElementById('update-vehicle-price').value;

  if (vehicle_id) {
    try {
      const response = await fetch(`${server}/update_vehicle_info.php`, {
        method: 'POST',
        body: new URLSearchParams({ vehicle_id, number, make, model, price, status }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const result = await response.json();

      if (result.status === 200) {
        showSnackbar(result.message);

        // Refresh vehicle list
        fetchVehicles(getDataWithExpiryCheck('user_id'));

        // Reset form and switch views
        resetAllForms();
        document.getElementById('edit-vehicle').classList.remove('active');
        document.getElementById('view-vehicles').classList.add('active');
      } else {
        showSnackbar(result.message);
      }
    } catch (error) {
      showSnackbar('An unexpected error occurred. Please try again.');
    }
  } else {
    showSnackbar('Invalid vehicle ID.');
  }
});

// List of Vehicles
function populateVehiclesList(vehicles, parentElementId) {

  const user_type = getDataWithExpiryCheck('user_type');

  const list = document.querySelector(parentElementId);
  list.innerHTML = ''; // Clear existing data

  if (vehicles.length === 0) {

    const row = document.createElement('li');
    row.innerHTML = `
        <div class="flex pr-10">
          <div class="w-100">
            <h5>No results found!</h5>
          </div>
        </div>
      `;
    list.appendChild(row);

  } else {

    vehicles.forEach(vehicle => {

      const distance = calculateDistance(latitude, longitude, parseFloat(vehicle.latitude), parseFloat(vehicle.longitude));

      const viewVehiclesPanel = document.getElementById('view-vehicles').classList.contains("active");

      const row = document.createElement('li');
      row.innerHTML = `
        <div class="mt-10">
          <div class="w-100 flex">

            <div class="w-85">
              <h5>Tricycle no: <span>${vehicle.number ? vehicle.number : 'N/A'}</span></h5>
              <h5>Make: <span>${vehicle.make ? vehicle.make : 'N/A'}</span></h5>
              <h5>Year Model: <span>${vehicle.model ? vehicle.model : 'N/A'}</span></h5>
              <h5>Price: ₱ <span>${vehicle.price ? vehicle.price : 'N/A'}</span></h5>
              <div class="flex gap-10">
                <h5>Status: </h5>
                <div class="badge ${badgeColor(vehicle.status)}">
                  ${vehicle.status}
                </div>
              </div>

              ${user_type != 1 ? `<h5>Owner: <span>${vehicle.first_name} ${vehicle.last_name}</span></h5>` : ``}
              
              ${user_type != 1 ? `<h5>Distance: <span>${distance.toFixed(2)} km</span></h5>` : ``}
            </div>

            <div class="w-15 action-btns flex col ai-end gap-5">
              ${(user_type == 1 && viewVehiclesPanel) ? `
                <button class="vehicle-action edit green" data-id="${vehicle.vehicle_id}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/>
                  </svg>
                </button>

                <button class="vehicle-action delete red" data-id="${vehicle.vehicle_id}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M8 6v14"></path>
                    <path d="M16 6v14"></path>
                    <path d="M10 6v14"></path>
                    <path d="M14 6v14"></path>
                    <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"></path>
                    <path d="M9 6V3h6v3"></path>
                  </svg>
                </button>

                <button class="vehicle-action history yellow" data-id="${vehicle.vehicle_id}">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L15 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21C8.74 21 5.86 19.19 4.29 16.44" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 12H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>

                ${vehicle.status == 'Not Available'
                  ? `<button id="track-vehicle" class="vehicle-action track" data-id="${vehicle.vehicle_id}">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill="#fff" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                        </svg>
                      </button>`
                  : ``
                }
              ` : ``}
            </div>
            
          </div>

          ${vehicle.status == 'On-Rent' && user_type == 1 ? `
            <button onclick="updateVehicleStatus(${vehicle.vehicle_id}, 'Available')" class="return mt-10 btn primary w-100">Return</button>
          ` : ``}

          ${user_type != 1 && (vehicle.status != 'Not Available' && vehicle.status != 'On-Rent') ? `<button data-id="${vehicle.vehicle_id}" class="rent btn primary w-100">Rent</button>` : ``}
        </div>
      `;

      list.appendChild(row);
    });
  }
}

// Get Vehicles
async function fetchVehicles(userId = '') {

  try {
    const url = `${server}/get_vehicles.php${userId ? '?owner_id=' + userId : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result = await response.json();

    if (result.status === 200) {
      populateVehiclesList(result.data, '#user-vehicles');
    } else {
      showSnackbar(result.message || 'No vehicles found');
    }
  } catch (error) {
    showSnackbar('An error occurred while fetching data.');
  }
}

// Fetch Users
const usersList = document.getElementById("users-list");

async function fetchUsers() {
  
  const user_id = getDataWithExpiryCheck('user_id');

  try {
    const response = await fetch(`${server}/get_users.php`);

    const result = await response.json();

    if (result.status === 200) {
      usersList.innerHTML = ""; // Clear list

      // Append users
      result.data.forEach(user => {
        if (user.user_id != user_id) {
          appendUser(user);
        }
      });
    
    }
  } catch (error) {
      console.log("Error fetching users:", error);
  }
}

// Append user to the list
function appendUser(user) {
  const li = document.createElement("li");

  li.innerHTML = `
    <div class="user flex ai-center jc-space-between gap-10 pt-10 pb-5">
      <label>${user.first_name} ${user.last_name}</label>
      ${user.vehicle_owner == 1 ? `
        <div class="badge green">
          Owner
        </div>
        ` : ``}
    </div>
  `;

  usersList.prepend(li); // Add to top
}

function setDataWithExpiry(key, value, ttl = 60 * 60 * 1000) {
  const now = new Date();

  // Create an item object with the value and expiry timestamp
  const item = {
    value: value,
    expiry: now.getTime() + ttl, // ttl is in milliseconds
  };

  try {

    localStorage.setItem(key, JSON.stringify(item));

    // Verify the item was successfully set
    const storedItem = localStorage.getItem(key);
    return storedItem !== null && storedItem === JSON.stringify(item);

  } catch (error) {

    console.error("Error setting item in localStorage:", error);
    return false;
  }
}


function getDataWithExpiryCheck(key) {

  const itemStr = localStorage.getItem(key);

  if (!itemStr) {
    return null;
  }

  try {
    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      location.reload();
    }

    return item.value;

  } catch (error) {
    console.error(`Error parsing LocalStorage key "${key}":`, error);
    return null;
  }
}


function openPanel(evt, panel) {

  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("panel");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].classList.remove('active');
  }

  tablinks = document.getElementsByClassName("link");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(panel).classList.add('active');
  evt.currentTarget.className += " active";
}

async function populateData() {

  const userObject = await fetchAccounts(getDataWithExpiryCheck('user_id'));

  const user = userObject[0];

  // Set Data in forms
  document.getElementById('location').value = user.address;

  // Set Navigation
  const navigation = document.querySelector('#navigation .wrapper');
  navigation.innerHTML = `

    <li id="home-btn">
      <button class="link icon" onclick="openPanel(event, 'home')" id="defaultOpenTransaction">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 10L12 3l9 7" />
          <path d="M4 10v11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h2v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V10" />
        </svg>
      </button>
    </li>

    <li id="search-btn">
      <button class="link icon" onclick="openPanel(event, 'search')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none" />
          <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </li>

    ${user.vehicle_owner == 1 ? `
      <li class="rounded-nav-btn flex jc-center ai-center">
        <button class="link flex jc-center ai-center" style="color: var(--white);" onclick="openPanel(event, 'add-vehicle')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" stroke-linecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" stroke-linecap="round" />
          </svg>
        </button>
      </li>
    ` : ''}

    <li id="notifications-btn" class="relative">
      <button class="link" onclick="openPanel(event, 'notifications')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
          <!-- Bell Body -->
          <path d="M12 2C9 2 7 4 7 7v5c0 1.7-1.3 3-3 3h16c-1.7 0-3-1.3-3-3V7c0-3-2-5-5-5z" />
          <!-- Clapper -->
          <circle cx="12" cy="18" r="1.5" />
        </svg>
      </button>
    </li>

    <li id="profile-btn">
      <button id="profile-btn" class="link" onclick="openPanel(event, 'profile')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
          <!-- Head -->
          <circle cx="12" cy="8" r="4" />
          <!-- Body -->
          <path d="M6 20c0-3.33 2.67-6 6-6s6 2.67 6 6" />
        </svg>
      </button>
    </li>
  `;
}

function resetAllForms() {
  // Get all the forms on the page
  const forms = document.querySelectorAll('form');

  // Loop through each form and reset it
  forms.forEach(form => form.reset());
}

function initializeElements() {

  const user_id = getDataWithExpiryCheck('user_id');
  const role = getDataWithExpiryCheck('role');

  if(role != 1) {
    document.getElementById('admin').style.display = 'none';
  }

  if (!user_id) {
    document.getElementById("defaultOpenAuth").click();
    document.getElementById('logo-wrapper').style.display = 'block';
    document.getElementById('auth-wrapper').style.display = 'block';
    document.getElementById('transction-wrapper').style.display = 'none';
    document.getElementById('navigation').style.display = 'none';
  } else {
    document.getElementById("defaultOpenTransaction").click();
    document.getElementById('logo-wrapper').style.display = 'none';
    document.getElementById('auth-wrapper').style.display = 'none';
    document.getElementById('transction-wrapper').style.display = 'block';
    document.getElementById('navigation').style.display = 'block';
    setInterval(loadNotifications, 5000);
  }
}

function initializeButtons() {

  const buttonNavigations = document.querySelectorAll('.link');

  buttonNavigations.forEach((button) => {
    button.addEventListener('click', () => {

      const user_id = getDataWithExpiryCheck('user_id');
      const user_type = getDataWithExpiryCheck('user_type');

      if (user_type != 1) {
        document.getElementById('view-my-vehicles').style.display = 'none';
      }

      const activePanel = document.querySelector('.panel.active');

      switch (activePanel.id) {
        case 'add-vehicle':
          if (user_id) initVehicleRegistrationMap();
          break;

        case 'view-vehicles':
          if (user_id) {
            fetchVehicles(user_id);
          }

          break;

        case 'search':
          if (user_id) initSearchVehicleMap();
          break;

        case 'notifications':
          setLastViewedNotifications();
          break;

        case 'all-users':
          fetchUsers();
          break;

        case 'all-rent':
          fetchRent();
          break;

        case 'profile':
          if (user_id) populateProfile(user_id);
          break;

        default:
          break;
      }
    });
  });
}

async function init() {
  if (getDataWithExpiryCheck('user_id')) {
    await populateData();
  }
  initializeElements();
  initializeButtons();
}

init();

// calculate distance between two coordinates in kilometers using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

// Initialize Search Vehicle Map
async function initSearchVehicleMap() {

  // Initialize the map
  const map = new google.maps.Map(document.getElementById('map-search'), {
    center: { lat: latitude, lng: longitude }, // Initially center on default values
    zoom: 13,
  });

  let markers = [];
  let searchLocationMarker = null; // Marker for searched location

  // Add markers for vehicles
  function addMarkers(data) {
    markers.forEach(marker => marker.setMap(null)); // Clear old markers
    markers = [];

    data.forEach(vehicle => {

      const distance = calculateDistance(latitude, longitude, parseFloat(vehicle.latitude), parseFloat(vehicle.longitude));

      const marker = new google.maps.Marker({
        position: { lat: parseFloat(vehicle.latitude), lng: parseFloat(vehicle.longitude) },
        map: map,
        title: `${vehicle.make} ${vehicle.model}`,
      });

      const user_type = getDataWithExpiryCheck('user_type');

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="vehicles-wrapper mb-10">
            <h5>Trycicle no: <span>${vehicle.number ? vehicle.number : 'N/A'}</span></h5>
            <h5>Make: <span>${vehicle.make ? vehicle.make : 'N/A'}</span></h5>
            <h5>Year Model: <span>${vehicle.model ? vehicle.model : 'N/A'}</span></h5>
            <h5>Price: ₱ <span>${vehicle.price ? vehicle.price : 'N/A'}</span></h5>
            <div class="flex gap-10">
              <h5>Status: </h5>
              <div class="badge ${badgeColor(vehicle.status)}">
                ${vehicle.status}
              </div>
            </div>
            <h5>Owner: <span>${vehicle.first_name} ${vehicle.last_name}</span></h5>
            <h5>Distance: <span>${distance.toFixed(2)} km</span></h5>
          </div>
          
          ${user_type == 0 && (vehicle.status != 'Not Available' && vehicle.status != 'On-Rent') ? `<button data-id="${vehicle.vehicle_id}" class="rent btn primary w-100">Rent</button>` : ``}
          
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markers.push(marker);
      
    });
  }

  // Add marker for the searched location
  function addSearchLocationMarker(lat, lng) {
    if (searchLocationMarker) {
      searchLocationMarker.setMap(null); // Clear the old marker
    }
    searchLocationMarker = new google.maps.Marker({
      position: { lat, lng },
      map: map,
      title: "Searched Location",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      },
    });
  }

  // Function to search for vehicles based on location
  async function searchVehiclesByLocation(locationQuery) {
    try {
      const url = `${server}/get_vehicles.php?location=${encodeURIComponent(locationQuery)}&latitude=${latitude}&longitude=${longitude}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const result = await response.json();

      if (result.status === 200) {
        addMarkers(result.data);
        populateVehiclesList(result.data, '#vehicle-list-result');
      } else {
        showSnackbar(result.message || 'No vehicles found for this location');
      }
    } catch (error) {
      showSnackbar('An error occurred while fetching vehicles.');
      console.error(error);
    }
  }

  // Initialize autocomplete for location search
  const addressInput = document.getElementById('search-location');
  const autocomplete = new google.maps.places.Autocomplete(addressInput);
  autocomplete.bindTo('bounds', map);

  // Handle selected place from autocomplete
  autocomplete.addListener('place_changed', function () {
    const place = autocomplete.getPlace();

    if (!place.geometry) {
      showSnackbar("No details available for the selected location!");
      return;
    }

    const location = place.geometry.location;
    latitude = location.lat(); // Update latitude
    longitude = location.lng(); // Update longitude

    // Update map center and zoom
    map.setCenter(location);
    map.setZoom(15);

    // Add a marker for the searched location
    addSearchLocationMarker(latitude, longitude);

    // Search for vehicles in the selected location
    searchVehiclesByLocation(place.formatted_address);
  });
}

// Initialize Profile Map
function initProfileMap() {

  const map = new google.maps.Map(document.getElementById('map-registration'), {
    center: { lat: latitude, lng: longitude },
    zoom: 13,
  });

  const marker = new google.maps.Marker({
    position: { lat: latitude, lng: longitude },
    map: map,
    draggable: true,
  });

  google.maps.event.addListener(marker, 'dragend', function () {
    const position = marker.getPosition();
    document.getElementById('latitude').value = position.lat();
    document.getElementById('longitude').value = position.lng();
  });

  google.maps.event.addListener(map, 'click', function (event) {
    const position = event.latLng;
    marker.setPosition(position);
    document.getElementById('latitude').value = position.lat();
    document.getElementById('longitude').value = position.lng();
  });

  // Initialize the Autocomplete for the address input
  const addressInput = document.getElementById('address');
  const autocomplete = new google.maps.places.Autocomplete(addressInput);
  autocomplete.bindTo('bounds', map);

  autocomplete.addListener('place_changed', function () {
    const place = autocomplete.getPlace();

    if (!place.geometry) {
      showSnackbar("No details available for the selected location!");
      return;
    }

    // Update map center and marker position
    const location = place.geometry.location;
    map.setCenter(location);
    map.setZoom(15);
    marker.setPosition(location);

    // Update hidden input values
    document.getElementById('latitude').value = location.lat();
    document.getElementById('longitude').value = location.lng();
  });
}

// Initialize Vehicle Registration Map
async function initVehicleRegistrationMap() {

  try {
    const userObject = await fetchAccounts(getDataWithExpiryCheck('user_id'));

    // Ensure userObject exists and contains valid data
    if (!userObject || userObject.length === 0) {
      throw new Error('User data not found');
    }

    const user = userObject[0];

    document.getElementById('vehicle-latitude').value = user.latitude;
    document.getElementById('vehicle-longitude').value = user.longitude;

    // Validate user latitude and longitude
    const userLat = parseFloat(user.latitude);
    const userLng = parseFloat(user.longitude);

    if (isNaN(userLat) || isNaN(userLng)) {
      throw new Error('Invalid user coordinates');
    }

    const user_location = { lat: userLat, lng: userLng };

    const map = new google.maps.Map(document.getElementById('map-vehicle-registration'), {
      center: user_location,
      zoom: 13,
    });

    const marker = new google.maps.Marker({
      position: user_location,
      map: map,
      draggable: true,
    });

    // Update hidden fields on marker drag
    google.maps.event.addListener(marker, 'dragend', function () {
      const position = marker.getPosition();
      document.getElementById('vehicle-latitude').value = position.lat();
      document.getElementById('vehicle-longitude').value = position.lng();
    });

    // Allow map clicks to update marker position
    google.maps.event.addListener(map, 'click', function (event) {
      const position = event.latLng;
      marker.setPosition(position);
      document.getElementById('vehicle-latitude').value = position.lat();
      document.getElementById('vehicle-longitude').value = position.lng();
    });

    // Initialize the Autocomplete for the location input
    const addressInput = document.getElementById('location');
    const autocomplete = new google.maps.places.Autocomplete(addressInput);
    autocomplete.bindTo('bounds', map);

    autocomplete.addListener('place_changed', function () {
      const place = autocomplete.getPlace();

      if (!place.geometry) {
        showSnackbar("No details available for the selected location!");
        return;
      }

      // Update map center and marker position
      const location = place.geometry.location;
      map.setCenter(location);
      map.setZoom(15);
      marker.setPosition(location);

      // Update hidden input values
      document.getElementById('vehicle-latitude').value = position.lat();
      document.getElementById('vehicle-longitude').value = position.lng();
    });

  } catch (error) {
    console.error('Error initializing vehicle map:', error.message);
    showSnackbar('An error occurred while initializing the map. Please check the coordinates.');
  }
}

// Update a Vehicle
document.addEventListener('click', async function (event) {

  const actionBtn = event.target.closest(".vehicle-action.edit"); // Ensure it's an edit button

  if (!actionBtn) return; // Exit if not found

  const vehicleId = actionBtn.getAttribute("data-id");

  try {
    const url = `${server}/get_vehicles.php?vehicle_id=${vehicleId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result = await response.json();
    console.log(result); // Debug API response

    if (result.status === 200 && result.data) { // Ensure result contains data
      const vehicle = result.data; // Assuming API returns data in `result.data`

      // Populate fields
      document.getElementById('update-vehicle-id').value = vehicleId;
      document.getElementById('update-vehicle-number').value = vehicle.number || '';
      document.getElementById('update-vehicle-make').value = vehicle.make || '';
      document.getElementById('update-vehicle-model').value = vehicle.model || '';
      document.getElementById('update-vehicle-price').value = vehicle.price || '';

      // Open edit panel
      document.getElementById('view-vehicles')?.classList.remove('active'); // Use optional chaining
      document.getElementById('edit-vehicle').classList.add('active');

    } else {
      showSnackbar('Vehicle not found.');
    }
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
    showSnackbar('An unexpected error occurred. Please try again.');
  }
});

// Vehicle Delete
document.addEventListener('click', async function (event) {
  const user_id = getDataWithExpiryCheck('user_id');
  const actionBtn = event.target.closest(".vehicle-action.delete");

  if (!actionBtn) return;

  const vehicle_id = actionBtn.getAttribute("data-id");

  if (!confirm("Are you sure you want to delete this Vehicle?")) return;

  try {
    const response = await fetch(`${server}/delete_vehicle.php`, {
      method: "POST", // Change to POST (or GET if you want to keep the original)
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ vehicle_id: vehicle_id }),
    });

    const result = await response.json();
    console.log(result); // Debug API response

    if (result.status === 200) {
      showSnackbar("Vehicle deleted successfully.", 3);
      fetchVehicles(user_id); // Refresh the list
    } else {
      showSnackbar(result.message || "Failed to delete Vehicle.", 3);
    }
  } catch (error) {
    showSnackbar("An unexpected error occurred. Please try again.", 3);
  }
});

// Vehicle History
document.addEventListener('click', async function (event) {

  const actionBtn = event.target.closest(".vehicle-action.history");

  if (!actionBtn) return; // Exit if not found

  const vehicleId = actionBtn.getAttribute("data-id");

  try {
    const url = `${server}/get_vehicles.php?get_history=true&vehicle_id=${vehicleId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result = await response.json();

    if (result.status === 200 && result.data) { // Ensure result contains data
      const histories = result.data; // Assuming API returns data in `result.data`

      document.getElementById('history-tricycle-number').textContent = histories[0].number;

      populateVehicleHistoryList(histories, '#vehicle-history');

      // Open edit panel
      document.getElementById('view-vehicles')?.classList.remove('active'); // Use optional chaining
      document.getElementById('view-vehicle-history').classList.add('active');

    } else {
      showSnackbar('No history found for this vehicle.');
    }
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
    showSnackbar('An unexpected error occurred. Please try again.');
  }
});

// List of Vehicle History
function populateVehicleHistoryList(histories, parentElementId) {

  const user_type = getDataWithExpiryCheck('user_type');

  const list = document.querySelector(parentElementId);
  list.innerHTML = ''; // Clear existing data

  if (histories.length === 0) {

    const row = document.createElement('li');
    row.innerHTML = `
        <div class="flex pr-10">
          <div class="w-100">
            <h5>No results found!</h5>
          </div>
        </div>
      `;
    list.appendChild(row);

  } else {

    histories.forEach(history => {

      const row = document.createElement('li');
      row.innerHTML = `
        <div class="w-100 mt-10">
          <h5>Name: <span>${history.first_name + ' ' + history.last_name}</span></h5>
          <h5>Mobile: <span>${history.mobile_number}</span></h5>
          <h5>Email: <span>${history.email}</span></h5>
          <h5>Date: <span>${formatTimestamp(history.timestamp)}</span></h5>
          <div class="flex gap-10">
            <h5>Status: </h5>
            <div class="badge ${badgeColor(history.status)}">
              ${history.status}
            </div>
            
          </div>
        </div>
      `;
      list.appendChild(row);
    });

  }
}


// Rent a Vehicle init
document.addEventListener('click', async function (event) {
  if (event.target.classList.contains('rent')) {

    document.getElementById('search').classList.remove('active');
    document.getElementById('rent-vehicle').classList.add('active');

    const vehicleId = event.target.attributes['data-id'].nodeValue;

    try {
      const url = `${server}/get_vehicles.php?vehicle_id=${vehicleId}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();

      if (result.status === 200) {

        const user_id = getDataWithExpiryCheck('user_id');
        const vehicle = result.data;
        const distance = calculateDistance(latitude, longitude, parseFloat(vehicle.latitude), parseFloat(vehicle.longitude));

        // Populate data
        document.getElementById('vehicle-id').value = vehicle.vehicle_id;
        document.getElementById('renter-id').value = user_id;
        document.getElementById('vehicle-number').innerHTML = vehicle.number;
        document.getElementById('vehicle-make').innerHTML = vehicle.make;
        document.getElementById('vehicle-model').innerHTML = vehicle.model;
        document.getElementById('vehicle-price').innerHTML = vehicle.price;
        document.getElementById('vehicle-distance').innerHTML = distance.toFixed(2) + ' km';

      } else {
        showSnackbar('Vehicle not found.');
      }
    } catch (error) {
      console.log(error);
      showSnackbar('An unexpected error occurred. Please try again.');
    }
  }
});

// Rent a Vehicle
document.getElementById('rentForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const vehicle_id = document.getElementById('vehicle-id').value;
  const renter_id = document.getElementById('renter-id').value;
  const duration = document.getElementById('rent-duration').value;
  const status = 'Pending';

  try {
    const response = await fetch(`${server}/rentals.php?action=rent_vehicle`, {
      method: 'POST',
      body: new URLSearchParams({ vehicle_id, renter_id, duration, status }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const result = await response.json();

    if (result.status === 200) {
      document.getElementById('rent-vehicle').classList.remove('active');
      document.getElementById('search').classList.add('active');

      showSnackbar(result.message, 10);

    } else {
      showSnackbar(result.message);
    }
  } catch (error) {
    showSnackbar('An unexpected error occurred. Please try again.');
  }
});

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function loadNotifications() {

  const user_id = getDataWithExpiryCheck('user_id');
  const user_type = getDataWithExpiryCheck('user_type');

  fetch(`${server}/rentals.php?action=load_rental_notifications&user_id=${user_id}&user_type=${user_type}`)
    .then(response => response.json())
    .then(rentals => {
      const notificationWrapper = document.getElementById("notification-wrapper");
      const notificationBtn = document.getElementById("notifications-btn");
      notificationWrapper.innerHTML = "";

      const lastViewed = localStorage.getItem("lastViewedNotifications") || 0;

      const hasNewNotifications = rentals.data.some(rental => new Date(rental.timestamp).getTime() > lastViewed);

      // Clear previous notifications
      notificationBtn.querySelector(".badge")?.remove();

      // Add a new badge if there are notifications
      if (rentals.data.length > 0) {
        if (hasNewNotifications) {
          const badge = document.createElement("span");
          badge.classList.add("badge");
          badge.classList.add("absolute");
          badge.textContent = rentals.data.length;
          notificationBtn.appendChild(badge);
        }
      } else {
        notificationWrapper.innerHTML += `<h5>Nothing here!</h5>`;
      }

      rentals.data.forEach((rental, index) => {

        notificationWrapper.innerHTML += `
          <div class="notification-item" 
            ${(rental.rental_status == 'Agreement Confirmed' && user_type == 1) ||
            rental.rental_status == 'Pending' ||
            rental.rental_status == 'Approved'
            ? `onclick="fetchRental(${rental.rental_id}, '${rental.rental_status}')"`
            : ``}
            >
            <div class="flex gap-5">
              <div class="badge yellow">Rental Vehicle</div>
              <div class="badge ${badgeColor(rental.rental_status)}">${rental.rental_status}</div>
            </div>
            <h5>
              <span>${rental.first_name} ${rental.last_name} | Vehicle ${rental.number}
            </h5>
            <h5></span>${formatTimestamp(rental.timestamp)}</h5>
          </div>`;
      });
    })
    .catch(error => console.error("Error fetching rentals:", error));
}

function setLastViewedNotifications() {
  localStorage.setItem("lastViewedNotifications", Date.now());

  document.getElementById("notifications-btn").querySelector(".badge")?.remove();
}

function badgeColor(status) {
  let badgeColor = "";

  switch (status) {
    case 'Available':
    case 'Approved':
    case 'Confirmed':
    case 'Agreement Confirmed':
    case 'Turnover':
      badgeColor = "green";
      break;

    case 'Declined':
      badgeColor = "red";
      break;

    default:
      badgeColor = "yellow";
      break;
  }

  return badgeColor;
}

async function fetchRental(rentalId, status) {
  document.getElementById('approve-rental-btn').style.display = 'block';
  document.getElementById('decline-rental-btn').style.display = 'block';
  try {
    const url = `${server}/rentals.php?action=get_rental&rental_id=${rentalId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result = await response.json();

    if (result.status === 200 && result.data.length > 0) {
      const user_id = getDataWithExpiryCheck('user_id');
      const vehicle = result.data[0]; // First rental entry
      const distance = calculateDistance(latitude, longitude, parseFloat(vehicle.latitude), parseFloat(vehicle.longitude));

      // Populate data
      document.getElementById('vehicle-id').value = vehicle.vehicle_id;
      document.getElementById('renter-id').value = user_id;
      document.getElementById('vehicle-number').innerHTML = vehicle.number;
      document.getElementById('vehicle-make').innerHTML = vehicle.make;
      document.getElementById('vehicle-model').innerHTML = vehicle.model;
      document.getElementById('vehicle-price').innerHTML = vehicle.price;
      document.getElementById('vehicle-distance').innerHTML = distance.toFixed(2) + ' km';
      document.getElementById('vehicle-duration').innerHTML = vehicle.duration + ' days';

      document.getElementById('ad-make-model').innerHTML = vehicle.make + ' - ' + vehicle.model;
      document.getElementById('ad-rental-period').innerHTML = vehicle.duration + ' days';
      document.getElementById('ad-price').innerHTML = vehicle.price;

      document.getElementById('renter-name').innerHTML = vehicle.renter_first_name + ' ' + vehicle.renter_last_name;
      document.getElementById('renter-number').innerHTML = vehicle.renter_mobile_number ? vehicle.renter_mobile_number : 'N/A';
      document.getElementById('renter-address').innerHTML = vehicle.renter_address ? vehicle.renter_address : 'N/A';

      document.getElementById('ad-renter-name').innerHTML = vehicle.renter_first_name + ' ' + vehicle.renter_last_name;
      document.getElementById('ad-renter-contact').innerHTML = vehicle.renter_mobile_number ? vehicle.renter_mobile_number : 'N/A';
      document.getElementById('ad-renter-email').innerHTML = vehicle.renter_address ? vehicle.renter_address : 'N/A';

      document.getElementById('owner-name').innerHTML = vehicle.owner_first_name + ' ' + vehicle.owner_last_name;
      document.getElementById('owner-number').innerHTML = vehicle.owner_mobile_number ? vehicle.owner_mobile_number : 'N/A';
      document.getElementById('owner-address').innerHTML = vehicle.owner_address ? vehicle.owner_address : 'N/A';

      document.getElementById('ad-owner-name').innerHTML = vehicle.owner_first_name + ' ' + vehicle.owner_last_name;
      document.getElementById('ad-owner-contact').innerHTML = vehicle.owner_mobile_number ? vehicle.owner_mobile_number : 'N/A';
      document.getElementById('ad-owner-email').innerHTML = vehicle.owner_address ? vehicle.owner_address : 'N/A';

      document.getElementById('confirm-rental-btn').setAttribute('data-id', vehicle.rental_id);
      document.getElementById('turnover-rental-btn').setAttribute('data-id', vehicle.rental_id);
      document.getElementById('approve-rental-btn').setAttribute('data-id', vehicle.rental_id);
      document.getElementById('decline-rental-btn').setAttribute('data-id', vehicle.rental_id);
      document.getElementById('confirmAgreement').setAttribute('data-id', vehicle.rental_id);

      if (getDataWithExpiryCheck('user_type') != 1) {
        document.getElementById('turnover-rental-btn').style.display = 'none';
      }

      if (status == 'Pending' || status == 'Approved' && getDataWithExpiryCheck('user_type') == 1) {
        document.getElementById('turnover-rental-btn').style.display = 'none';
      }

      if (status == 'Agreement Confirmed' && getDataWithExpiryCheck('user_type') == 1) {
        document.getElementById('approve-rental-btn').style.display = 'none';
        document.getElementById('decline-rental-btn').style.display = 'none';
        document.getElementById('turnover-rental-btn').style.display = 'block';
      }

      if (getDataWithExpiryCheck('user_type') == 1) {
        document.getElementById('confirm-rental-btn').style.display = 'none';
      } else {
        document.getElementById('approve-rental-btn').style.display = 'none';
        document.getElementById('decline-rental-btn').style.display = 'none';
      }

      document.getElementById('notifications').classList.remove('active');
      document.getElementById('rent-vehicle').classList.add('active');
      document.getElementById('rental-form').style.display = 'none';

    } else {
      showSnackbar('Rental not found.');
    }
  } catch (error) {
    console.log(error);
    showSnackbar('An unexpected error occurred. Please try again.');
  }
}

// Return Vehicle
async function updateVehicleStatus(vehicleId, status) {
  const user_id = getDataWithExpiryCheck('user_id');
  try {
    const formData = new FormData();
    formData.append('vehicle_id', vehicleId);
    formData.append('status', status); // Add status

    const response = await fetch(`${server}/update_vehicle_status.php`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.status === 200) {
      showSnackbar(result.message);
      fetchVehicles(user_id); // Refresh the vehicle list
    } else {
      showSnackbar(result.message || 'Failed to update vehicle status');
    }
  } catch (error) {
    showSnackbar('An error occurred while updating the vehicle status.');
  }
}


// Approve, Decline, Confirm Rental
document.addEventListener("DOMContentLoaded", function () {

  const confirmBtn = document.getElementById("confirm-rental-btn");
  const turnoverBtn = document.getElementById("turnover-rental-btn");
  const approveBtn = document.getElementById("approve-rental-btn");
  const declineBtn = document.getElementById("decline-rental-btn");
  const confirmAgreementBtn = document.getElementById("confirmAgreement");

  async function updateRentalStatus(rental_id, status, action) {
    try {
      const url = `${server}/rentals.php?action=${action}&rental_id=${rental_id}&status=${status}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();

      if (result.status === 200) {
        showSnackbar(result.message, 15);
      } else {
        showSnackbar(result.message);
      }
    } catch (error) {
      // showSnackbar('An unexpected error occurred. Please try again.');
    }
  }

  turnoverBtn.addEventListener('click', function () {
    const user_id = getDataWithExpiryCheck('user_id');
    const rentalId = this.getAttribute("data-id");
    if (confirm("Are you sure you want to turnover vehicle?")) {
      updateRentalStatus(rentalId, "Turnover", "update_status");
      fetchVehicles(user_id);
      document.getElementById('rent-vehicle').classList.remove('active');
      document.getElementById('view-vehicles').classList.add('active');
    }
  });

  confirmAgreementBtn.addEventListener('click', function () {
    const rentalId = this.getAttribute("data-id");
    if (confirm("Are you sure you want to confirm agreement and documentation?")) {
      updateRentalStatus(rentalId, "Agreement Confirmed", "update_status");
      confirmAgreementBtn.style.display = 'none';
    }
  });

  confirmBtn.addEventListener("click", function () {
    const rentalId = this.getAttribute("data-id");
    if (confirm("Are you sure you want to confirm this rental?")) {
      // updateRentalStatus(rentalId, "Confirmed", "update_status");
      openAgreementDocumentation();
    }
  });

  approveBtn.addEventListener("click", function () {
    const rentalId = this.getAttribute("data-id");
    if (confirm("Are you sure you want to approve this rental?")) {
      updateRentalStatus(rentalId, "Approved", "update_status");
      approveBtn.style.display = 'none';
      declineBtn.style.display = 'none';
    }
  });

  declineBtn.addEventListener("click", function () {
    const rentalId = this.getAttribute("data-id");
    if (confirm("Are you sure you want to decline this rental?")) {
      updateRentalStatus(rentalId, "Declined", "update_status");
      approveBtn.style.display = 'none';
      declineBtn.style.display = 'none';
    }
  });
});

function openAgreementDocumentation() {
  document.getElementById('rent-vehicle').classList.remove('active');
  document.getElementById('agreement-documentation').classList.add('active');
}

document.addEventListener("DOMContentLoaded", function () {
  const rentDuration = document.getElementById("rent-duration");
  const vehiclePrice = document.getElementById("vehicle-price");
  const totalPrice = document.getElementById("total-price");

  if (!rentDuration) {
    return;
  }

  rentDuration.addEventListener("input", function () {
    let days = parseInt(rentDuration.value) || 0;
    let pricePerDay = parseFloat(vehiclePrice.innerText) || 0;
    let total = days * pricePerDay;
    totalPrice.innerText = total.toLocaleString(); // Adds comma separators
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const startTourBtn = document.getElementById("startTour");

  const user_id = getDataWithExpiryCheck('user_id');

  if (!localStorage.getItem("hasSeenTour") && user_id) {
    startTourBtn.style.display = "block";
    document.body.classList.add("tour-show");
  } else {
    startTourBtn.style.display = "none";
  }

  startTourBtn.addEventListener("click", function () {
    introJs().setOptions({
      showProgress: true,
      showBullets: false,
      exitOnOverlayClick: false,
      steps: [
        {
          element: "#home-btn",
          intro: "This is your home where you can check your activity."
        },
        {
          element: "#search-btn",
          intro: "Click here to search vehicles to rent."
        },
        {
          element: "#notifications-btn",
          intro: "Click here to check your notifications and updates."
        },
        {
          element: "#profile-btn",
          intro: "Click here to view your profile information."
        }
      ]
    })
      .oncomplete(function () {
        localStorage.setItem("hasSeenTour", "true");
        startTourBtn.style.display = "none";
        document.body.classList.remove("tour-show");
      })
      .start();
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const agreeCheckbox = document.getElementById("agreeCheckbox");
  const confirmAgreement = document.getElementById("confirmAgreement");

  agreeCheckbox.addEventListener("change", function () {
    confirmAgreement.disabled = !this.checked;
  });
});

document.querySelectorAll(".toggle-password").forEach(toggle => {
  toggle.addEventListener("click", function () {
    const passwordInput = this.previousElementSibling;

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      this.innerHTML = `<svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.92 10.92 0 0 1 12 20c-6.07 0-11-8-11-8a18.72 18.72 0 0 1 3.23-3.92M8.24 8.24A4 4 0 0 1 15.76 15.76M3 3l18 18"/>
      </svg>`; // Eye-off SVG
    } else {
      passwordInput.type = "password";
      this.innerHTML = `<svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z"/>
          <circle cx="12" cy="12" r="3"/>
      </svg>`; // Eye SVG
    }
  });
});

// GLOBAL INITMAP FUNCTION (Outside DOMContentLoaded)
let map;
let polyline;

function initMap() {
  map = new google.maps.Map(document.getElementById("map-tracking"), {
    zoom: 15,
    center: { lat: 10.9553, lng: 123.4280 }, // Default center
    mapTypeId: "roadmap",
  });

  polyline = new google.maps.Polyline({
    path: [],
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 3,
    map: map
  });
}

// 🚀 OWNER'S TRACKING SCRIPT
let vehicleMarker = null; // Store marker globally

function trackVehicle() {
  const user_type = getDataWithExpiryCheck('user_type');

  if (user_type == 1) {

    let trackingEnabled = false;
    let trackingInterval;
    let vehicleId = null;

    document.getElementById("track-vehicle").addEventListener("click", function () {
      vehicleId = this.getAttribute("data-id");

      if (!vehicleId) {
        console.error("Vehicle ID is missing!");
        return;
      }

      toggleTracking(vehicleId);
    });

    function toggleTracking() {
      const enable = trackingEnabled ? 0 : 1;

      fetch(`${server}/toggle_tracking.php`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `vehicle_id=${vehicleId}&enable=${enable}`
      })
        .then(response => response.json())
        .then(data => {
          trackingEnabled = enable === 1;
          document.getElementById('vehicle-tracking').style.display = 'block';
          document.getElementById('view-vehicles').classList.remove('active');
          document.getElementById('home').classList.add('active');

          if (trackingEnabled) {
            fetchTrackingData();
            trackingInterval = setInterval(fetchTrackingData, 10000);
          } else {
            clearInterval(trackingInterval);
          }
        });
    }

    function fetchTrackingData() {
      fetch(`${server}/get_tracking.php?vehicle_id=${vehicleId}`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.data.length > 0) {
            updateMap(data.data);
          }
        });
    }

    function updateMap(trackingData) {
      let path = trackingData.map(point => ({
        lat: parseFloat(point.latitude),
        lng: parseFloat(point.longitude)
      }));

      if (path.length > 0) {
        polyline.setPath(path);
        map.setCenter(path[path.length - 1]);

        // 🟢 Add marker at latest coordinate
        const latestPosition = path[path.length - 1];

        // Remove the previous marker
        if (vehicleMarker) {
          vehicleMarker.setMap(null);
        }

        // Create a new marker
        vehicleMarker = new google.maps.Marker({
          position: latestPosition,
          map: map,
          title: "Vehicle Location",
          icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png" // Customize icon if needed
        });
      }
    }
  }
}

// 🚗 RENTER'S TRACKING SCRIPT
document.addEventListener("DOMContentLoaded", function () {
  const user_id = getDataWithExpiryCheck('user_id');
  const user_type = getDataWithExpiryCheck('user_type');

  if (user_type == 0) {
    document.getElementById('vehicle-tracking').style.display = 'none';

    let rentId = null;
    let trackingInterval = null;

    // Fetch rent ID dynamically
    fetch(`${server}/get_active_rent.php?user_id=${user_id}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.rent_id) {
          rentId = data.rent_id;
          checkTrackingStatus(); // Start tracking status check
          setInterval(checkTrackingStatus, 15000);
        } else {
          console.error("No active rent found!");
        }
      });

    function sendLocation() {
      if (!rentId) return;

      navigator.geolocation.getCurrentPosition(function (position) {
        let data = `rent_id=${rentId}&latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`;

        fetch(`${server}/update_location.php`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: data
        });
      }, function (error) {
        console.error("Geolocation error:", error);
      }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    }

    function checkTrackingStatus() {
      if (!rentId) return;

      fetch(`${server}/get_tracking_status.php?rent_id=${rentId}`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.tracking_enabled) {
            if (!trackingInterval) {
              trackingInterval = setInterval(sendLocation, 10000);
            }
          } else {
            clearInterval(trackingInterval);
            trackingInterval = null;
          }
        });
    }
  }
});

// Carousel
let currentIndex = 0;
const totalSlides = document.querySelectorAll(".carousel-item").length;
const carousel = document.getElementById("carousel");

function showSlide(index) {
  if (index >= totalSlides) {
    currentIndex = 0;
  } else if (index < 0) {
    currentIndex = totalSlides - 1;
  } else {
    currentIndex = index;
  }
  carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
}

function nextSlide() {
  showSlide(currentIndex + 1);
}

function prevSlide() {
  showSlide(currentIndex - 1);
}

// Auto-slide every 3 seconds
setInterval(() => {
  nextSlide();
}, 3000);
