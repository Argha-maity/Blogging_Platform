import { initAuth, showLogin, setCurrentUser, showMainApp, getCurrentUser, getToken } from './auth.js';
import { initLogin } from './login.js';
import { initSignup } from './signup.js';
import { initPosts } from './posts.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initLogin();
  initSignup();
  initPosts();

  // Check for existing auth
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (token && userData) {
    setCurrentUser(JSON.parse(userData));
    showMainApp();
  } else {
    showLogin();
  }

  // Setup create post button
  document.getElementById('create-post-btn')?.addEventListener('click', () => {
    document.getElementById('create-post-modal').classList.remove('hidden');
  });

  // Setup modal close buttons
  document.getElementById('close-modal-btn')?.addEventListener('click', () => {
    document.getElementById('create-post-modal').classList.add('hidden');
  });

  //setup cancel button
  document.getElementById('cancel-post-btn')?.addEventListener('click', () => {
    document.getElementById('create-post-modal').classList.add('hidden');
  });

  // Toggle user dropdown menu
  const userBtn = document.getElementById("user-menu-btn");
  const dropdown = document.getElementById("user-menu");

  if (userBtn && dropdown) {
    userBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("hidden");
    });

    // Hide dropdown if click outside
    document.addEventListener("click", (e) => {
      if (!userBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add("hidden");
      }
    });
  }

  // Hide dropdown when clicking any dropdown item
  dropdown.querySelectorAll(".dropdown-item").forEach(item => {
    item.addEventListener("click", () => {
      dropdown.classList.add("hidden");
    });
  });

  const profileBtn = document.getElementById('profile-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const profilePanel = document.getElementById('profile-panel');
  const settingsPanel = document.getElementById('settings-panel');
  const dashboardSection = document.querySelector('.dashboard');

  function hideAllSections() {
    profilePanel?.classList.add('hidden');
    settingsPanel?.classList.add('hidden');
    dashboardSection?.classList.add('hidden');
  }

  // Profile button click
  profileBtn?.addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) return alert("You are not logged in.");

    hideAllSections();
    profilePanel.classList.remove('hidden');
    document.getElementById('profile-username').textContent = user.username || user.name;
    document.getElementById('profile-email').textContent = user.email;
  });

  // Settings button click
  settingsBtn?.addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) return alert("You are not logged in.");

    hideAllSections();
    settingsPanel.classList.remove('hidden');
    document.getElementById('new-username').value = user.username || user.name;
  });

  // Settings form submission
  document.getElementById('settings-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newUsername = document.getElementById('new-username').value;
    try {
      const res = await fetch('http://localhost:8006/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ username: newUsername })
      });

      if (!res.ok) throw new Error('Update failed');

      const updated = await res.json();
      setCurrentUser(updated);
      alert("Username updated!");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update profile.");
    }
  });
});