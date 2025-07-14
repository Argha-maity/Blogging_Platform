// Shared state
let currentUser = JSON.parse(localStorage.getItem("user")) || null;

// DOM Elements
let authPage, mainApp, loginPage, signupPage, usernameDisplay, userMenu, userMenuBtn;

// Initialize auth module
export function initAuth() {
  authPage = document.getElementById('auth-page');
  mainApp = document.getElementById('main-app');
  loginPage = document.getElementById('login-page');
  signupPage = document.getElementById('signup-page');
  usernameDisplay = document.getElementById('username-display');
  userMenu = document.getElementById('user-menu');
  userMenuBtn = document.getElementById('user-menu-btn');

  // Setup auth toggle buttons
  document.querySelectorAll('[data-auth-toggle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.dataset.authToggle;
      if (target === 'signup') showSignup();
      else if (target === 'login') showLogin();
    });
  });

  // Setup user menu
  if (userMenuBtn && userMenu) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent immediate document click handler
      toggleUserMenu();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target) && e.target !== userMenuBtn) {
        userMenu.classList.add('hidden');
      }
    });
  }

  document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
}

// Toggle user menu
export function toggleUserMenu() {
  userMenu.classList.toggle('show');
}

// Show login page
export function showLogin() {
  authPage?.classList.remove('hidden');
  mainApp?.classList.add('hidden');
  loginPage?.classList.remove('hidden');
  signupPage?.classList.add('hidden');
}

// Show signup page
export function showSignup() {
  authPage?.classList.remove('hidden');
  mainApp?.classList.add('hidden');
  signupPage?.classList.remove('hidden');
  loginPage?.classList.add('hidden');
}

// Show main app
export function showMainApp() {
  authPage?.classList.add('hidden');
  mainApp?.classList.remove('hidden');
}

// Get current user
export function getCurrentUser() {
  return currentUser;
}

// Set current user
export function setCurrentUser(user) {
  const normalizedUser = {
    id: user._id || user.id,
    name: user.username || user.name || 'Unknown',
    email: user.email,
  };

  currentUser = normalizedUser;
  localStorage.setItem("user", JSON.stringify(normalizedUser));

  if (usernameDisplay) usernameDisplay.textContent = normalizedUser.name;
}

export function getToken() {
  return localStorage.getItem('token');
}

// Logout handler
export function handleLogout() {
  currentUser = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showLogin();
  if (userMenu) userMenu.classList.add('hidden');
  // Clear any form data
  document.getElementById('login-form')?.reset();
  document.getElementById('signup-form')?.reset();
  
  // Reset any active tabs
  document.getElementById('all-posts-tab')?.classList.add('active');
  document.getElementById('my-posts-tab')?.classList.remove('active');
}