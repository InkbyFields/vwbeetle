document.addEventListener('DOMContentLoaded', () => {
    const postEntryBtn = document.getElementById('postEntryBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    if (postEntryBtn) postEntryBtn.addEventListener('click', postUpdate);
    if (uploadBtn) uploadBtn.addEventListener('click', uploadImages);
    if (registerBtn) registerBtn.addEventListener('click', registerUser);
    if (loginBtn) loginBtn.addEventListener('click', loginUser);
});

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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ entry: entryContent })
    });

    if (response.ok) {
        const newEntry = document.createElement('p');
        newEntry.textContent = entryContent;
        logContainer.appendChild(newEntry);
        textarea.value = ''; // Clear the textarea
    } else {
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
        formData.append('images', file); // Append each file to the form data
    });

    const response = await fetch('https://vwbeetle-backend.onrender.com/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
    });

    if (response.ok) {
        const data = await response.json(); // Get the uploaded image URLs from the backend
        data.files.forEach(imageUrl => {
            const img = new Image();
            img.src = `/uploads/${imageUrl}`;
            gallery.appendChild(img);
        });
    } else {
        alert('Failed to upload images');
    }
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
        alert('Failed to register user');
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
        localStorage.setItem('token', data.token); // Store token
        window.location.href = 'profile.html'; // Redirect to profile page after login
    } else {
        alert('Failed to log in');
    }
}


// Debugging to ensure that the script runs
console.log('Script loaded successfully');
