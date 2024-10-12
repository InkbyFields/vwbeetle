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
        const response = await fetch('https://vwbeetle-backend.onrender.com/api/users/logbook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Add token here
            },
            body: JSON.stringify({ entry: entryContent })
        });

        if (response.ok) {
            const data = await response.json();
            const newEntry = document.createElement('p');
            newEntry.textContent = data.entry;
            logContainer.appendChild(newEntry);
            textarea.value = ''; // Clear the textarea
            alert('Log entry posted successfully!');
        } else {
            const errorData = await response.json();
            console.error('Failed to post log entry:', errorData);
            alert('Failed to post log entry: ' + errorData.message);
        }
    } catch (error) {
        console.error('Client-side error during logbook entry:', error);
        alert('Error posting log entry: ' + error.message);
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
        formData.append('images', file); // Append each file to the form data
    });

    try {
        // Send the images to the backend
        const response = await fetch('https://vwbeetle-backend.onrender.com/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Add token here if needed
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json(); // Get the uploaded image URLs from the backend
            data.files.forEach(imageUrl => {
                const img = new Image();
                img.src = `https://vwbeetle-backend.onrender.com${imageUrl}`; // Adjust based on how you serve the uploaded images
                gallery.appendChild(img);
            });
            alert('Images uploaded successfully!');
        } else {
            const errorData = await response.json();
            console.error('Server response error:', errorData);  // Log error from the server
            alert('Failed to upload images: ' + errorData.message);
        }
    } catch (error) {
        console.error('Client-side error during image upload:', error);  // Catch and log client-side errors
        alert('Error uploading images: ' + error.message);
    }
}

// Function to handle user registration
async function registerUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

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
            alert('Failed to register: ' + errorData.message);
        }
    } catch (error) {
        console.error('Client-side error during registration:', error);
        alert('Error during registration: ' + error.message);
    }
}

// Function to handle user login
async function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

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
        } else {
            const errorData = await response.json();
            alert('Failed to login: ' + errorData.message);
        }
    } catch (error) {
        console.error('Client-side error during login:', error);
        alert('Error during login: ' + error.message);
    }
}

// Debugging to ensure that the script runs
console.log('Script loaded successfully');
