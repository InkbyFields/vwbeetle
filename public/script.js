document.getElementById('registerBtn').addEventListener('click', registerUser);
document.getElementById('loginBtn').addEventListener('click', loginUser);
document.getElementById('uploadBtn').addEventListener('click', uploadImages);
document.getElementById('postEntryBtn').addEventListener('click', postUpdate);
document.getElementById('logoutBtn').addEventListener('click', logoutUser);

document.getElementById('showRegister').addEventListener('click', () => {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'block';
});
document.getElementById('showLogin').addEventListener('click', () => {
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
});

function registerUser() {
    const username = document.getElementById('usernameRegister').value;
    const password = document.getElementById('passwordRegister').value;

    fetch('https://vwbeetle-backend.onrender.com/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            alert('Registration successful!');
            showProfilePage(username);
        } else {
            document.getElementById('registerError').textContent = data.message || 'Registration failed';
        }
    })
    .catch(err => {
        console.error('Error during registration:', err);
    });
}

function loginUser() {
    const username = document.getElementById('usernameLogin').value;
    const password = document.getElementById('passwordLogin').value;

    fetch('https://vwbeetle-backend.onrender.com/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            showProfilePage(username);
        } else {
            document.getElementById('loginError').textContent = 'Invalid credentials';
        }
    })
    .catch(err => {
        console.error('Error during login:', err);
    });
}

function showProfilePage(username) {
    document.getElementById('usernameDisplay').textContent = username;
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('profileSection').style.display = 'block';
}

function logoutUser() {
    localStorage.removeItem('token');
    document.getElementById('profileSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
}

async function postUpdate() {
    const entryContent = document.getElementById('logInput').value;
    const logContainer = document.querySelector('.logbook-entries');

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
        document.getElementById('logInput').value = '';
    } else {
        console.error('Failed to save log entry:', await response.json());
        alert('Failed to save log entry');
    }
}

async function uploadImages() {
    const imageInput = document.getElementById('imageInput');
    const files = imageInput.files;
    const formData = new FormData();

    if (files.length === 0) {
        alert('Please select at least one image to upload.');
        return;
    }

    Array.from(files).forEach(file => formData.append('images', file));

    const response = await fetch('https://vwbeetle-backend.onrender.com/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
    });

    if (response.ok) {
        const data = await response.json();
        const gallery = document.querySelector('.image-gallery');
        data.files.forEach(imageUrl => {
            const img = new Image();
            img.src = `https://vwbeetle-backend.onrender.com/uploads/${imageUrl}`;
            gallery.appendChild(img);
        });
    } else {
        console.error('Failed to upload images:', await response.json());
        alert('Failed to upload images');
    }
}

