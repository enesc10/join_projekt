
/* Login Page JavaScript */

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginPage();
});

/**
 * Initialize login page
 */
function initializeLoginPage() {
    // Check if there's a success message from registration
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
        showToast('You signed up successfully!', 'success');
    }
    
    // Form validation
    setupFormValidation();
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    
    // Real-time validation
    emailInput?.addEventListener('input', validateLoginForm);
    passwordInput?.addEventListener('input', validateLoginForm);
    
    // Initial state
    validateLoginForm();
}

/**
 * Validate login form
 */
function validateLoginForm() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    
    if (!emailInput || !passwordInput || !loginBtn) return;
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    const isValid = email.length > 0 && password.length > 0 && isValidEmail(email);
    
    loginBtn.disabled = !isValid;
    
    // Visual feedback
    updateInputValidation(emailInput, email.length > 0 && isValidEmail(email));
    updateInputValidation(passwordInput, password.length > 0);
}

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
function login(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    
    if (!emailInput || !passwordInput) return;
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Clear previous error
    hideErrorMessage(errorMessage);
    
    // Validate inputs
    if (!email || !password) {
        showErrorMessage(errorMessage, 'Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        showErrorMessage(errorMessage, 'Please enter a valid email address');
        return;
    }
    
    // Show loading state
    const loginBtn = document.getElementById('login-btn');
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = 'Logging in...';
    loginBtn.disabled = true;
    
    // Simulate slight delay for better UX
    setTimeout(() => {
        // Attempt authentication
        const result = authenticateUser(email, password);
        
        if (result.success) {
            setCurrentUser(result.user);
            showToast('Login successful!', 'success');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'summary.html';
            }, 500);
        } else {
            showErrorMessage(errorMessage, result.message);
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    }, 300);
}

/**
 * Handle guest login
 */
function guestLogin() {
    const guestUser = createGuestUser();
    setCurrentUser(guestUser);
    
    showToast('Logged in as guest!', 'success');
    
    setTimeout(() => {
        window.location.href = 'summary.html';
    }, 500);
}

/**
 * Toggle password visibility
 */
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');
    
    if (!passwordInput || !toggleIcon) return;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.src = 'assets/img/visibility.png';
        toggleIcon.alt = 'Hide password';
    } else {
        passwordInput.type = 'password';
        toggleIcon.src = 'assets/img/visibility_off.png';
        toggleIcon.alt = 'Show password';
    }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Update input validation visual feedback
 * @param {HTMLElement} input - Input element
 * @param {boolean} isValid - Whether input is valid
 */
function updateInputValidation(input, isValid) {
    if (!input) return;
    
    input.classList.remove('valid', 'invalid');
    
    if (input.value.trim().length > 0) {
        input.classList.add(isValid ? 'valid' : 'invalid');
    }
}

/**
 * Show error message
 * @param {HTMLElement} errorElement - Error message element
 * @param {string} message - Error message to display
 */
function showErrorMessage(errorElement, message) {
    if (!errorElement) return;
    
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

/**
 * Hide error message
 * @param {HTMLElement} errorElement - Error message element
 */
function hideErrorMessage(errorElement) {
    if (!errorElement) return;
    
    errorElement.classList.remove('show');
    errorElement.textContent = '';
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type ('success', 'error', etc.)
 */
function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
