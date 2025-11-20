
/* Sign Up Page JavaScript */

document.addEventListener('DOMContentLoaded', function() {
    initializeSignupPage();
});

/**
 * Initialize signup page
 */
function initializeSignupPage() {
    setupFormValidation();
    setupPasswordToggles();
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const privacyCheckbox = document.getElementById('privacyPolicy');
    const signupBtn = document.getElementById('signup-btn');
    
    // Real-time validation
    nameInput?.addEventListener('input', validateSignupForm);
    emailInput?.addEventListener('input', validateSignupForm);
    passwordInput?.addEventListener('input', validateSignupForm);
    confirmPasswordInput?.addEventListener('input', validateSignupForm);
    privacyCheckbox?.addEventListener('change', validateSignupForm);
    
    // Initial state
    validateSignupForm();
}

/**
 * Setup password toggle functionality
 */
function setupPasswordToggles() {
    const toggles = document.querySelectorAll('.toggle-password');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const inputId = this.closest('.input-group').querySelector('input').id;
            togglePassword(inputId);
        });
    });
}

/**
 * Validate signup form
 */
function validateSignupForm() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const privacyCheckbox = document.getElementById('privacyPolicy');
    const signupBtn = document.getElementById('signup-btn');
    
    if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput || !privacyCheckbox || !signupBtn) {
        return;
    }
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const privacyAccepted = privacyCheckbox.checked;
    
    // Individual field validation
    const nameValid = name.length >= 2;
    const emailValid = email.length > 0 && isValidEmail(email);
    const passwordValid = password.length >= 6;
    const confirmPasswordValid = confirmPassword.length >= 6 && password === confirmPassword;
    
    // Visual feedback
    updateInputValidation(nameInput, nameValid);
    updateInputValidation(emailInput, emailValid);
    updateInputValidation(passwordInput, passwordValid);
    updateInputValidation(confirmPasswordInput, confirmPasswordValid);
    
    // Enable/disable submit button
    const allValid = nameValid && emailValid && passwordValid && confirmPasswordValid && privacyAccepted;
    signupBtn.disabled = !allValid;
}

/**
 * Handle signup form submission
 * @param {Event} event - Form submit event
 */
function signup(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const privacyCheckbox = document.getElementById('privacyPolicy');
    const errorMessage = document.getElementById('error-message');
    
    if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput || !privacyCheckbox) {
        return;
    }
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const privacyAccepted = privacyCheckbox.checked;
    
    // Clear previous error
    hideErrorMessage(errorMessage);
    
    // Validation
    if (!name || name.length < 2) {
        showErrorMessage(errorMessage, 'Name must be at least 2 characters long');
        return;
    }
    
    if (!email || !isValidEmail(email)) {
        showErrorMessage(errorMessage, 'Please enter a valid email address');
        return;
    }
    
    if (!password || password.length < 6) {
        showErrorMessage(errorMessage, 'Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        showErrorMessage(errorMessage, 'Passwords do not match');
        return;
    }
    
    if (!privacyAccepted) {
        showErrorMessage(errorMessage, 'Please accept the privacy policy');
        return;
    }
    
    // Show loading state
    const signupBtn = document.getElementById('signup-btn');
    const originalText = signupBtn.innerHTML;
    signupBtn.innerHTML = 'Creating Account...';
    signupBtn.disabled = true;
    
    // Simulate slight delay for better UX
    setTimeout(() => {
        // Attempt registration
        const result = registerUser({
            name: name,
            email: email,
            password: password
        });
        
        if (result.success) {
            showToast('Account created successfully!', 'success');
            
            // Redirect to login page with success parameter
            setTimeout(() => {
                window.location.href = 'index.html?registered=true';
            }, 1000);
        } else {
            showErrorMessage(errorMessage, result.message);
            signupBtn.innerHTML = originalText;
            signupBtn.disabled = false;
        }
    }, 300);
}

/**
 * Toggle password visibility
 * @param {string} inputId - ID of the password input
 */
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = passwordInput?.parentElement.querySelector('.toggle-password');
    
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
