document.getElementById('postEntryBtn').addEventListener('click', postUpdate);
document.getElementById('uploadBtn').addEventListener('click', uploadImages);
document.getElementById('registerBtn').addEventListener('click', registerUser);
document.getElementById('loginBtn').addEventListener('click', loginUser);

// Function to handle posting a logbook entry
async function postUpdate() {
    const logContainer = document.querySelector('.logbook-entries');
    const textarea = document.getElementById('logInput');
    const entryContent = textarea.value;

    // Validate input
    if (!entryContent) {
        alert('Please enter a log entry.');
        return;
    }

    try {
        // Send the log entry to the backend
        const response = await fetch('https://vwbeetle-backend.onrender.com/api/users/logbook', {  // Replace with backend URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Add token
            },
            body: JSON.stringify({ entry: entryContent })
        });

        if (response.ok) {
            const newEntry = document.createElement('p');
            newEntry.textContent = entryContent;
            logContainer.appendChild(newEntry);
            textarea.value = '';  // Clear the textarea
            alert('Log entry posted successfully!');
        } else {
            const errorData = await response.json();
            alert('Failed to save log entry: ' + errorData.message);
        }
    } catch (error) {
        console.error('Failed to save log entry:', error);
        alert('An error occurred while posting the log entry.');
    }
}

// Function to handle image uploads
async function uploadImages() {
    const imageInput = document.getElementById('imageInput');
    const gallery = document.querySelector('.image-gallery');
    const files = imageInput.files;
    const formData = new FormData();

    // Validate file input
    if (files.length === 0) {
        alert('Please select at least one image to upload.');
        return;
    }

    Array.from(files).forEach(file => {
        formData.append('images', file);  // Append each file to the form data
    });

    try {
        // Send the images to the backend
        const response = await fetch('https://vwbeetle-backend.onrender.com/upload', {  // Replace with backend URL
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Add token
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();  // Get the uploaded image URLs
            data.files.forEach(imageUrl => {
                const img = new Image();
                img.src = imageUrl;  // Show the uploaded image in the gallery
                gallery.appendChild(img);
            });
            alert('Images uploaded successfully!');
        } else {
            const errorData = await response.json();
            alert('Failed to upload images: ' + errorData.message);
        }
    } catch (error) {
        console.error('Failed to upload images:', error);
        alert('An error occurred while uploading images.');
    }
}

// Function to handle user registration
async function registerUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://vwbeetle-backend.onrender.com/api/users/register', {  // Replace with backend URL
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
            alert('Failed to register: ' + errorData.message);
        }
    } catch (error) {
        console.error('Registration failed:', error);
        alert('An error occurred during registration.');
    }
}

// Function to handle user login
async function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://vwbeetle-backend.onrender.com/api/users/login', {  // Replace with backend URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);  // Store token
            alert('Login successful!');
        } else {
            const errorData = await response.json();
            alert('Login failed: ' + errorData.message);
        }
    } catch (error) {
        console.error('Login failed:', error);
        alert('An error occurred during login.');
    }
}
