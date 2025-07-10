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
});