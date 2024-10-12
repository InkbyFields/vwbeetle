document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('loginSection');
    const profileSection = document.getElementById('profileSection');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const postEntryBtn = document.getElementById('postEntryBtn');

    loginBtn.addEventListener('click', loginUser);
    registerBtn.addEventListener('click', registerUser);
    uploadBtn.addEventListener('click', uploadImages);
    postEntryBtn.addEventListener('click', postUpdate);

    function showProfilePage() {
        loginSection.style.display = 'none';
        profileSection.style.display = 'block';
    }

    async function loginUser() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

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
                localStorage.setItem('token', data.token);
                showProfilePage();
            } else {
                alert('Invalid login credentials');
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    }

    async function registerUser() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('https://vwbeetle-backend.onrender.com/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                alert('User registered successfully. Please log in.');
            } else {
                alert('Error registering user');
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
    }

    async function uploadImages() {
        const imageInput = document.getElementById('imageInput');
        const files = imageInput.files;
        const formData = new FormData();

        Array.from(files).forEach(file => {
            formData.append('images', file);
        });

        try {
            const response = await fetch('https://vwbeetle-backend.onrender.com/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                const gallery = document.querySelector('.image-gallery');
                data.files.forEach(imageUrl => {
                    const img = new Image();
                    img.src = `https://vwbeetle-backend.onrender.com/uploads/${imageUrl}`;
                    gallery.appendChild(img);
                });
            } else {
                alert('Failed to upload images');
            }
        } catch (error) {
            console.error('Error during image upload:', error);
        }
    }

    async function postUpdate() {
        const entryContent = document.getElementById('logInput').value;

        try {
            const response = await fetch('https://vwbeetle-backend.onrender.com/api/users/logbook', {
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
                document.querySelector('.logbook-entries').appendChild(newEntry);
            } else {
                alert('Failed to post logbook entry');
            }
        } catch (error) {
            console.error('Error during posting logbook entry:', error);
        }
    }
});

