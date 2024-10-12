document.getElementById('loginBtn')?.addEventListener('click', loginUser);
document.getElementById('registerBtn')?.addEventListener('click', registerUser);
document.getElementById('uploadBtn')?.addEventListener('click', uploadImages);
document.getElementById('postEntryBtn')?.addEventListener('click', postUpdate);

// Function to handle user registration
async function registerUser() {
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;

    if (!username || !password) {
        return alert('Username and password are required.');
    }

    try {
        const response = await fetch('https://vwbeetle-backend.onrender.com/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            alert('User registered successfully');
        } else {
            const errorData = await response.json();
            alert(errorData.message);
        }
    } catch (error) {
        console.error('Error during registration:', error);
    }
}

// Function to handle user login
async function loginUser() {
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;

    if (!username || !password) {
        return alert('Username and password are required.');
    }

    try {
        const response = await fetch('https://vwbeetle-backend.onrender.com/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token); // Store the token
            alert('Login successful');
        } else {
            const errorData = await response.json();
            alert(errorData.message);
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
        return alert('Please select at least one image to upload.');
    }

    Array.from(files).forEach(file => {
        formData.append('images', file); // Append each file to the form data
    });

    try {
        const response = await fetch('https://vwbeetle-backend.onrender.com/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Add token for authentication
            },
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            data.files.forEach(imageUrl => {
                const img = new Image();
                img.src = `/uploads/${imageUrl}`; // Adjust based on how you serve the uploaded images
                gallery.appendChild(img);
            });
            alert('Images uploaded successfully');
        } else {
            console.error('Failed to upload images:', await response.json());
            alert('Failed to upload images');
        }
    } catch (error) {
        console.error('Error during image upload:', error);
    }
}

// Function to handle posting a logbook entry
async function postUpdate() {
    const logContainer = document.querySelector('.logbook-entries');
    const textarea = document.getElementById('logInput');
    const entryContent = textarea?.value;

    if (!entryContent) {
        return alert('Please enter a log entry.');
    }

    try {
        const response = await fetch('https://vwbeetle-backend.onrender.com/api/users/logbook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Add token for authentication
            },
            body: JSON.stringify({ entry: entryContent }),
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
        console.error('Error during logbook entry:', error);
    }
}

