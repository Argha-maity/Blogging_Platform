import { setCurrentUser } from './auth.js';

const signupForm = document.getElementById('signup-form');

export function initSignup() {
  if (!signupForm) return;

  signupForm.addEventListener('submit', handleSignup);
}

async function handleSignup(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const userData = {
    username: formData.get("signup-name"),
    email: formData.get("signup-email"),
    password: formData.get("signup-password")
  };

  try {
    console.log('Signup attempt:', { username: userData.username, email: userData.email });
    const response = await fetch("http://localhost:8006/api/users/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      //storing authentication tokens
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        name: userData.username,
        email: userData.email
      }));

      setCurrentUser({
        name: userData.username,
        email: userData.email
      });


      window.location.href = "index.html";
    } else {
      throw new Error(data.error || "Registration failed");
    }

    /*showMainApp();
    signupForm.reset();*/
  } catch (error) {
    console.error('Signup failed:', error);
    alert('Signup failed. Please try again.');
  }
}