import { initAuth, showLogin, setCurrentUser, showMainApp } from './auth.js';
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

  // Hide dropdown when create post modal opens
  document.getElementById('create-post-btn')?.addEventListener('click', () => {
    document.getElementById('create-post-modal').classList.remove('hidden');
    dropdown?.classList.add('hidden'); // hides dropdown on modal open
  });
});