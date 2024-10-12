document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', loginUser);
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', registerUser);
    }

    async function loginUser() {
        const username = document.getElementById('username');
        const password = document.getElementById('password');
        
        // Check if the elements exist
        if (!username || !password) {
            console.error('Username or password field not found');
            return;
        }

        const usernameValue = username.value;
        const passwordValue = password.value;

        // Proceed only if both fields have values
        if (!usernameValue || !passwordValue) {
            alert('Please enter both username and password');
            return;
        }

        try {
            const response = await fetch('https://vwbeetle-backend.onrender.com/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: usernameValue, password: passwordValue })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                window.location.href = '/profile.html'; // Redirect after successful login
            } else {
                const errorData = await response.json();
                alert(errorData.message);
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    }

    async function registerUser() {
        const username = document.getElementById('username');
        const password = document.getElementById('password');

        // Check if the elements exist
        if (!username || !password) {
            console.error('Username or password field not found');
            return;
        }

        const usernameValue = username.value;
        const passwordValue = password.value;

        // Proceed only if both fields have values
        if (!usernameValue || !passwordValue) {
            alert('Please enter both username and password');
            return;
        }

        try {
            const response = await fetch('https://vwbeetle-backend.onrender.com/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: usernameValue, password: passwordValue })
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
});

