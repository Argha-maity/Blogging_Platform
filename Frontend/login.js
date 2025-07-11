import { setCurrentUser, showMainApp } from './auth.js';

const loginForm = document.getElementById('login-form');

export function initLogin() {
  if (!loginForm) return;

  loginForm.addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch("http://localhost:8006/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Login failed");
        }

        // Store auth data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
            id: data._id,
            username: data.username,
            email: data.email
        }));

        setCurrentUser({
          id: data._id,
          name : data.username,
          email : data.email
        });
        
        window.location.href = "index.html";
        
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Login failed. Please check console for details.');
    }
}