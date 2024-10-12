document.getElementById('loginBtn').addEventListener('click', loginUser);
document.getElementById('registerBtn').addEventListener('click', registerUser);
document.getElementById('uploadBtn').addEventListener('click', uploadImages);

// Function to handle user login
async function loginUser() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

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
    window.location.href = '/profile.html'; // Redirect to profile page
  } else {
    alert('Login failed, please check your credentials.');
  }
}

// Function to handle user registration
async function registerUser() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('https://vwbeetle-backend.onrender.com/api/users/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  if (response.ok) {
    alert('Registration successful!');
  } else {
    alert('Registration failed, please try again.');
  }
}

// Function to handle image uploads to S3
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
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const img = new Image();
      img.src = data.fileUrl;
      gallery.appendChild(img);
    } else {
      const errorData = await response.json();
      console.error('Failed to upload images:', errorData);
      alert('Failed to upload images');
    }
  } catch (error) {
    console.error('Error during image upload:', error);
  }
}


