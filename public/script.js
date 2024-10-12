document.getElementById('uploadBtn').addEventListener('click', uploadImages);

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
    formData.append('images', file);
  });

  try {
    const response = await fetch('https://vwbeetle-backend.onrender.com/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      data.files.forEach(filename => {
        const img = new Image();
        img.src = `https://vwbeetle-backend.onrender.com/uploads/${filename}`;
        img.alt = filename;

        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteImage(filename, img, deleteBtn));

        const container = document.createElement('div');
        container.appendChild(img);
        container.appendChild(deleteBtn);
        gallery.appendChild(container);
      });
    } else {
      const errorData = await response.json();
      console.error('Failed to upload images:', errorData);
      alert('Failed to upload images');
    }
  } catch (error) {
    console.error('Error during image upload:', error);
    alert('Error during image upload');
  }
}

// Function to delete images
async function deleteImage(filename, imgElement, deleteButton) {
  try {
    const response = await fetch(`https://vwbeetle-backend.onrender.com/upload/${filename}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      imgElement.remove();
      deleteButton.remove();
      alert('Image deleted successfully');
    } else {
      const errorData = await response.json();
      console.error('Failed to delete image:', errorData);
      alert('Failed to delete image');
    }
  } catch (error) {
    console.error('Error during image deletion:', error);
    alert('Error during image deletion');
  }
}
