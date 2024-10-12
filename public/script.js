document.getElementById('loginBtn').addEventListener('click', loginUser);
document.getElementById('registerBtn').addEventListener('click', registerUser);
document.getElementById('uploadBtn').addEventListener('click', uploadImages);

// Function to handle user login
async function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Check if username or password is missing
    if (!username || !password) {
        alert('Please enter both username and password');
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
            localStorage.setItem('token', data.token); // Store the token in localStorage
            alert('Login successful!');
            window.location.href = '/profile.html'; // Redirect to the user's profile page after successful login
        } else {
            const errorData = await response.json();
            alert('Login failed: ' + errorData.message);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again.');
    }
}

// Function to handle user registration
async function registerUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Check if username or password is missing
    if (!username || !password) {
        alert('Please enter both username and password');
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
            alert('Registration failed: ' + errorData.message);
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred during registration. Please try again.');
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

    try {
        const response = await fetch('https://vwbeetle-backend.onrender.com/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Include token in the header
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            data.files.forEach(imageUrl => {
                const img = new Image();
                img.src = `/uploads/${imageUrl}`; // Adjust based on how you serve the uploaded images
                gallery.appendChild(img);
            });
            alert('Images uploaded successfully!');
        } else {
            const errorData = await response.json();
            alert('Failed to upload images: ' + errorData.message);
        }
    } catch (error) {
        console.error('Error during image upload:', error);
        alert('An error occurred during image upload. Please try again.');
    }
}

// Debugging to ensure that the script runs
console.log('Script loaded successfully');


