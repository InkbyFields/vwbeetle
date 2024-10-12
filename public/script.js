document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const postEntryBtn = document.getElementById('postEntryBtn');

    if (loginBtn) {
        loginBtn.addEventListener('click', loginUser);
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', registerUser);
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', uploadImages);
    }

    if (postEntryBtn) {
        postEntryBtn.addEventListener('click', postUpdate);
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
                document.querySelector('.login-container').style.display = 'none';
                document.querySelector('.content-container').style.display = 'block';
            } else {
                const errorData = await response.json();
                alert(errorData.message);
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
                alert('User registered successfully');
            } else {
                const errorData = await response.json();
                alert(errorData.message);
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
                const errorData = await response.json();
                console.error('Failed to upload images:', errorData);
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
                const errorData = await response.json();
                console.error('Failed to post logbook entry:', errorData);
            }
        } catch (error) {
            console.error('Error during posting logbook entry:', error);
        }
    }
});

