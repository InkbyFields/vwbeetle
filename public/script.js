const apiUrl = 'https://vwbeetle-backend.onrender.com'; // Backend URL

document.getElementById('postEntryBtn').addEventListener('click', postUpdate);
document.getElementById('uploadBtn').addEventListener('click', uploadImages);
document.getElementById('registerBtn').addEventListener('click', registerUser);
document.getElementById('loginBtn').addEventListener('click', loginUser);

// Function to handle posting a logbook entry
async function postUpdate() {
    const logContainer = document.querySelector('.logbook-entries');
    const textarea = document.getElementById('logInput');
    const entryContent = textarea.value;

    if (!entryContent) {
        alert('Please enter a log entry.');
        return;
    }

    const response = await fetch(`${apiUrl}/api/users/logbook`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

    const response = await fetch(`${apiUrl}/upload`, {
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
            img.src = `${apiUrl}/uploads/${imageUrl}`; // Corrected path to show image
            img.alt = "Uploaded image"; // Set alt text for accessibility
            img.classList.add('uploaded-image'); // Add a class for styling
            
            img.style.width = '150px'; // Scale down the image
            img.style.cursor = 'pointer'; // Make it clickable

            // Create a container for image with delete button
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('image-container');
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => {
                deleteImage(imageUrl, imgContainer);
            });

            // Event to open the image in full size when clicked
            img.addEventListener('click', () => {
                openImageInFullSize(`${apiUrl}/uploads/${imageUrl}`);
            });

            imgContainer.appendChild(img);
            imgContainer.appendChild(deleteBtn);
            gallery.appendChild(imgContainer);
        });
    } else {
        console.error('Failed to upload images:', await response.json());
        alert('Failed to upload images');
    }
}

// Function to delete an image
async function deleteImage(imageUrl, imgContainer) {
    const response = await fetch(`${apiUrl}/upload/${imageUrl}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });

    if (response.ok) {
        imgContainer.remove(); // Remove image container (image and delete button)
        alert('Image deleted successfully');
    } else {
        console.error('Failed to delete image:', await response.json());
        alert('Failed to delete image');
    }
}

// Function to open image in full size
function openImageInFullSize(imageUrl) {
    const fullSizeOverlay = document.createElement('div');
    fullSizeOverlay.classList.add('overlay');
    fullSizeOverlay.style.position = 'fixed';
    fullSizeOverlay.style.top = '0';
    fullSizeOverlay.style.left = '0';
    fullSizeOverlay.style.width = '100vw';
    fullSizeOverlay.style.height = '100vh';
    fullSizeOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    fullSizeOverlay.style.display = 'flex';
    fullSizeOverlay.style.justifyContent = 'center';
    fullSizeOverlay.style.alignItems = 'center';
    fullSizeOverlay.style.cursor = 'pointer';
    
    const fullSizeImage = new Image();
    fullSizeImage.src = imageUrl;
    fullSizeImage.alt = "Full-size uploaded image";
    fullSizeImage.style.maxWidth = '90%';
    fullSizeImage.style.maxHeight = '90%';
    
    fullSizeOverlay.appendChild(fullSizeImage);

    // Click to close full-size image
    fullSizeOverlay.addEventListener('click', () => {
        document.body.removeChild(fullSizeOverlay);
    });

    document.body.appendChild(fullSizeOverlay);
}

// Function to handle user registration
async function registerUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${apiUrl}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
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

    const response = await fetch(`${apiUrl}/api/users/login`, {
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
        window.location.href = '/profile.html'; // Redirect to profile page after login
    } else {
        const errorData = await response.json();
        alert(errorData.message);
    }
}
