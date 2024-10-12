document.getElementById('loginBtn')?.addEventListener('click', loginUser);
document.getElementById('registerLink')?.addEventListener('click', () => window.location.href = '/register.html');
document.getElementById('uploadBtn')?.addEventListener('click', uploadImages);
document.getElementById('postEntryBtn')?.addEventListener('click', postUpdate);

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
        window.location.href = '/profile.html';  // Redirect to profile page
    } else {
        alert('Login failed. Please check your credentials.');
    }
}

// Function to upload images
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
        alert('Image upload failed.');
    }
}

// Function to post logbook entry
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
        textarea.value = '';  // Clear textarea
    } else {
        alert('Failed to save log entry.');
    }
}

// Function to logout the user
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
});
