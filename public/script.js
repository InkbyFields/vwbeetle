document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const postEntryBtn = document.getElementById('postEntryBtn');

    if (loginBtn) loginBtn.addEventListener('click', loginUser);
    if (registerBtn) registerBtn.addEventListener('click', registerUser);
    if (uploadBtn) uploadBtn.addEventListener('click', uploadImages);
    if (postEntryBtn) postEntryBtn.addEventListener('click', postUpdate);
});

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
            img.src = imageUrl;
            img.alt = 'Uploaded Image';
            img.style = "max-width: 150px; max-height: 150px;";
            gallery.appendChild(img);

            // Add a delete button for each image
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = () => deleteImage(imageUrl, img, deleteBtn);
            gallery.appendChild(deleteBtn);
        });
    } else {
        console.error('Failed to upload images:', await response.json());
        alert('Failed to upload images');
    }
}

// Function to delete images
async function deleteImage(imageUrl, imgElement, deleteBtn) {
    const response = await fetch(imageUrl, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
    });

    if (response.ok) {
        imgElement.remove();  // Remove the image from the gallery
        deleteBtn.remove();   // Remove the delete button
    } else {
        console.error('Failed to delete image:', await response.json());
        alert('Failed to delete image');
    }
}

// Debugging to ensure that the script runs
console.log('Script loaded successfully');


// Debugging to ensure that the script runs
console.log('Script loaded successfully');
