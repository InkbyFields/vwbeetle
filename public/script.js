document.getElementById('loginBtn').addEventListener('click', loginUser);

// Function to handle user login
async function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Please fill out both fields.');
        return;
    }

    try {
        const response = await fetch('https://vwbeetle-backend.onrender.com/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            alert('Login successful!');
            window.location.href = '/profile.html';  // Redirect to profile
        } else {
            alert('Invalid username or password');
        }
    } catch (error) {
        console.error('Error during login:', error);
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
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            data.files.forEach(imageUrl => {
                const img = new Image();
                img.src = `/uploads/${imageUrl}`;
                gallery.appendChild(img);
            });
        } else {
            alert('Failed to upload images');
        }
    } catch (error) {
        console.error('Error during image upload:', error);
    }
}


