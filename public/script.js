const apiUrl = 'https://vwbeetle-backend.onrender.com'; // Backend URL

document.addEventListener('DOMContentLoaded', () => {
    // Check if the user is logged in and load profile data
    if (localStorage.getItem('token')) {
        loadProfile();
    } else {
        alert('You need to log in first');
        window.location.href = '/index.html'; // Redirect to login if not authenticated
    }

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/index.html'; // Redirect to login page
    });
});

document.getElementById('postEntryBtn').addEventListener('click', postUpdate);
document.getElementById('uploadBtn').addEventListener('click', uploadImages);

// Function to load user profile data (images and logbook entries)
async function loadProfile() {
    const gallery = document.querySelector('.image-gallery');
    gallery.innerHTML = ''; // Clear the gallery

    // Fetch user images (replace with your API if different)
    const response = await fetch(`${apiUrl}/api/users/profile`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (response.ok) {
        const data = await response.json();

        // Display user's images in the gallery
        data.images.forEach(imageUrl => {
            const img = new Image();
            img.src = `${apiUrl}/uploads/${imageUrl}`;
            img.alt = "Uploaded image";
            img.classList.add('uploaded-image');

            img.style.width = '150px'; // Scaled-down size
            img.style.cursor = 'pointer'; // Make clickable

            // Create a container for the image and delete button
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('image-container');

            // Add delete button for each image
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => {
                deleteImage(imageUrl, imgContainer);
            });

            // Open full-size image when clicked
            img.addEventListener('click', () => {
                openImageInFullSize(`${apiUrl}/uploads/${imageUrl}`);
            });

            imgContainer.appendChild(img);
            imgContainer.appendChild(deleteBtn);
            gallery.appendChild(imgContainer);
        });

    } else {
        alert('Failed to load profile data');
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

    const response = await fetch(`${apiUrl}/api/users/logbook`, {
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
        formData.append('images', file);
    });

    const response = await fetch(`${apiUrl}/upload`, {
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
            img.src = `${apiUrl}/uploads/${imageUrl}`;
            img.alt = "Uploaded image";
            img.classList.add('uploaded-image');

            img.style.width = '150px'; // Scaled-down size
            img.style.cursor = 'pointer';

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
        alert('Failed to upload images');
    }
}

// Function to delete an image
async function deleteImage(imageUrl, imgContainer) {
    const response = await fetch(`${apiUrl}/upload/${imageUrl}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (response.ok) {
        imgContainer.remove(); // Remove image container (image and delete button)
        alert('Image deleted successfully');
    } else {
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

