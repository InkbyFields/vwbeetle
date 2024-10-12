document.getElementById('registerBtn').addEventListener('click', registerUser);
document.getElementById('loginBtn').addEventListener('click', loginUser);

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
    alert('Login successful!');
  } else {
    const errorData = await response.json();
    alert(errorData.message);
  }
}
