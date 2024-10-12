// Event listeners
document.getElementById('postEntryBtn').addEventListener('click', postUpdate);
document.getElementById('uploadBtn').addEventListener('click', uploadImages);
document.getElementById('registerBtn')?.addEventListener('click', registerUser);  // Register button
document.getElementById('loginBtn')?.addEventListener('click', loginUser);        // Login button
document.getElementById('logoutBtn')?.addEventListener('click', logoutUser);      // Logout button

// Redirect to the home page after login
function redirectToProfile() {
    document.getElementById('profile').style.display = 'block'; // Show profile section
    document.getElementById('gallery').style.display = 'none';  // Hide gallery
    document.getElementById('logbook').style.display = 'none';  // Hide logbook
}

// Function to handle user registration
async function registerUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('https://vwbeetle-backend.onrender.com/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        alert('User registered successfully!');
    } else {
        const errorData = await response.json();
        alert(errorData.message);
    }
}

// Function to handle user login
async function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('https://vwbeetle-backend.onrender.com/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);  // Store token
        localStorage.setItem('username', username); // Store username for profile
        redirectToProfile();
        loadUserProfile();
        alert('Login successful!');
    } else {
        const errorData = await response.json();
        alert(errorData.message);
    }
}

// Function to handle logging out
function logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.reload(); // Refresh the page to log out
}

// Function to load user profile data
function loadUserProfile() {
    const username = localStorage.getItem('username');
    document.getElementById('profileUsername').textContent = username;

    // Fetch user's images and logbook entries
    // You need to implement endpoints in the backend to retrieve user-specific images and logbook entries
    // Example:
    // fetch(`/api/users/${username}/images`);
    // fetch(`/api/users/${username}/logbook`);
}

// Function to handle posting a logbook entry
async function postUpdate() {
    const logContainer = document.querySelector('.logbook-entries');
    const textarea = document.getElementById('logInput');
    const entryContent = textarea.value;

    if (!entryContent) {
        alert('Please enter a log entry.');
        return;
    }

    const response = await fetch('https://vwbeetle-backend.onrender.com/api/users/logbook', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`  // Add token here
        },
        body: JSON.stringify({ entry: entryContent })
    });

    if (response.ok) {
        const newEntry = document.createElement('p');
        newEntry.textContent = entryContent;
        logContainer.appendChild(newEntry);
        textarea.value = '';  // Clear the textarea
    } else {
        console.error('Failed to save log entry:', await response.json());
        alert('Failed to save log entry');
    }
}

// Function to handle image uploads
async function uploadImages() {
    const imageInput = document.getElementById('imageInput');
    const gallery = document.querySelector('.image-gallery');
    const files = imageInput.files;
    const formData = new FormData();

    if (files.length === 0) {
        alert('Please select at least one image to upload.');
        return;
    }

    Array.from(files).forEach(file => {
        formData.append('images', file);  // Append each file to the form data
    });

    const response = await fetch('https://vwbeetle-backend.onrender.com/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`  // Add token here
        },
        body: formData
    });

    if (response.ok) {
        const data = await response.json();  // Get the uploaded image URLs from the backend
        data.files.forEach(imageUrl => {
            const img = new Image();
            img.src = `/uploads/${imageUrl}`;  // Adjust based on how you serve the uploaded images
            gallery.appendChild(img);
        });
    } else {
        console.error('Failed to upload images:', await response.json());
        alert('Failed to upload images');
    }
}

// Debugging to ensure that the script runs
console.log('Script loaded successfully');

