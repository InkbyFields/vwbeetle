document.addEventListener('DOMContentLoaded', function () {
    // Event listeners
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const postEntryBtn = document.getElementById('postEntryBtn');
    const uploadBtn = document.getElementById('uploadBtn');

    if (loginBtn) loginBtn.addEventListener('click', loginUser);
    if (registerBtn) registerBtn.addEventListener('click', registerUser);
    if (postEntryBtn) postEntryBtn.addEventListener('click', postUpdate);
    if (uploadBtn) uploadBtn.addEventListener('click', uploadImages);

    // If token exists, redirect to profile page
    const token = localStorage.getItem('token');
    if (token && window.location.pathname === '/') {
        window.location.href = '/profile.html'; // Redirect to profile page if already logged in
    }
});

// Function to handle user registration
async function registerUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
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
    } catch (error) {
        console.error('Error during registration:', error);
        alert('Error during registration');
    }
}

// Function to handle user login
async function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
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
            alert('Login successful!');
            window.location.href = '/profile.html'; // Redirect to profile page
        } else {
            const errorData = await response.json();
            alert(errorData.message);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Error during login');
    }
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

    try {
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
            console.error('Failed to save log entry:', await response.json());
            alert('Failed to save log entry');
        }
    } catch (error) {
        console.error('Error during log entry:', error);
        alert('Error during log entry');
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
        formData.append('images', file);
    });

    try {
        const response = await fetch('https://vwbeetle-backend.onrender.com/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            data.files.forEach(imageUrl => {
                const img = new Image();
                img.src = `/uploads/${imageUrl}`;
                gallery.appendChild(img);
            });
        } else {
            console.error('Failed to upload images:', await response.json());
            alert('Failed to upload images');
        }
    } catch (error) {
        console.error('Error during image upload:', error);
        alert('Error during image upload');
    }
}
