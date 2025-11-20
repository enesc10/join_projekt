
/* Authentication Module */

/**
 * Initialize authentication when page loads
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

/**
 * Initialize authentication system
 */
function initializeAuth() {
    const currentUser = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop();
    
    // Pages that don't require authentication
    const publicPages = ['index.html', 'signup.html', 'privacy-policy.html', 'legal-notice.html'];
    
    // Check if current page requires authentication
    if (!publicPages.includes(currentPage) && currentPage !== '') {
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }
        
        // Update user profile display
        updateUserProfile(currentUser);
    }
    
    // If user is logged in and on login page, redirect to summary
    if (currentUser && currentPage === 'index.html') {
        window.location.href = 'summary.html';
    }
}

/**
 * Get current logged in user
 * @returns {Object|null} Current user object or null
 */
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

/**
 * Set current logged in user
 * @param {Object} user - User object to set as current
 */
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Clear current user session
 */
function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

/**
 * Get all users from Firebase
 * @returns {Promise<Array>} Promise that resolves with array of user objects
 */
async function getUsers() {
    try {
        const usersData = await firebaseGet('users');
        if (!usersData) {
            return [];
        }
        
        // Convert Firebase object to array
        const usersArray = Object.keys(usersData).map(key => ({
            ...usersData[key],
            id: usersData[key].id || key
        }));
        
        return usersArray;
    } catch (error) {
        console.error('Error getting users:', error);
        // Fallback to localStorage
        const usersJson = localStorage.getItem('users');
        return usersJson ? JSON.parse(usersJson) : [];
    }
}

/**
 * Save users to Firebase
 * @param {Array} users - Array of user objects to save
 * @returns {Promise} Promise that resolves when users are saved
 */
async function saveUsers(users) {
    try {
        // Convert array to object with user IDs as keys
        const usersObject = {};
        users.forEach(user => {
            usersObject[user.id] = user;
        });
        
        await firebaseSave('users', usersObject);
        
        // Also save to localStorage as backup
        localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
        console.error('Error saving users:', error);
        // Fallback to localStorage only
        localStorage.setItem('users', JSON.stringify(users));
    }
}

/**
 * Register a new user
 * @param {Object} userData - User data object
 * @returns {Promise<Object>} Promise that resolves with result object containing success status and message
 */
async function registerUser(userData) {
    try {
        const users = await getUsers();
        
        // Check if email already exists
        const existingUser = users.find(user => user.email === userData.email);
        if (existingUser) {
            return {
                success: false,
                message: 'An account with this email already exists'
            };
        }
        
        // Create new user object
        const newUser = {
            id: generateId(),
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: userData.password, // In production, this should be hashed
            initials: generateInitials(userData.name),
            color: generateAvatarColor(),
            isGuest: false,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        // Save user
        users.push(newUser);
        await saveUsers(users);
        
        // Also add user as a contact
        await addUserAsContact(newUser);
        
        return {
            success: true,
            message: 'Account created successfully',
            user: newUser
        };
        
    } catch (error) {
        console.error('Error registering user:', error);
        return {
            success: false,
            message: 'An error occurred during registration'
        };
    }
}

/**
 * Authenticate user login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Promise that resolves with result object containing success status and user data
 */
async function authenticateUser(email, password) {
    try {
        const users = await getUsers();
        const user = users.find(u => u.email === email.toLowerCase() && u.password === password);
        
        if (user) {
            // Update last login
            user.lastLogin = new Date().toISOString();
            await saveUsers(users);
            
            return {
                success: true,
                message: 'Login successful',
                user: user
            };
        } else {
            return {
                success: false,
                message: 'Invalid email or password'
            };
        }
        
    } catch (error) {
        console.error('Error authenticating user:', error);
        return {
            success: false,
            message: 'An error occurred during login'
        };
    }
}

/**
 * Create guest user session
 * @returns {Object} Guest user object
 */
function createGuestUser() {
    const guestUser = {
        id: 'guest',
        name: 'Guest User',
        email: 'guest@join.com',
        initials: 'GU',
        color: '#FF7A00',
        isGuest: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };
    
    return guestUser;
}

/**
 * Logout current user
 */
function logout() {
    clearCurrentUser();
    window.location.href = 'index.html';
}

/**
 * Update user profile display in header
 * @param {Object} user - Current user object
 */
function updateUserProfile(user) {
    const userInitialsEl = document.getElementById('userInitials');
    if (userInitialsEl) {
        userInitialsEl.textContent = user.initials;
        userInitialsEl.parentElement.style.backgroundColor = user.color;
    }
}

/**
 * Toggle user dropdown menu
 */
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

/**
 * Close user dropdown when clicking outside
 */
document.addEventListener('click', function(event) {
    const userProfile = document.getElementById('userProfile');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userProfile && userDropdown && !userProfile.contains(event.target)) {
        userDropdown.classList.remove('show');
    }
});

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
function generateInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
}

/**
 * Generate random avatar color
 * @returns {string} Hex color code
 */
function generateAvatarColor() {
    const colors = [
        '#FF7A00', // orange
        '#9327FF', // purple
        '#FF5EB3', // pink
        '#FFBB2B', // yellow
        '#1FD7C1', // teal
        '#462F8A', // blue
        '#FF3D00', // red
        '#7AE229'  // green
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Add user as contact when they register
 * @param {Object} user - User object
 * @returns {Promise} Promise that resolves when user is added as contact
 */
async function addUserAsContact(user) {
    try {
        const contacts = await getContacts();
        
        const userContact = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: '', // Users can add their phone later
            initials: user.initials,
            color: user.color,
            userId: user.id,
            createdAt: user.createdAt,
            createdBy: user.id
        };
        
        contacts.push(userContact);
        await saveContacts(contacts);
        
    } catch (error) {
        console.error('Error adding user as contact:', error);
    }
}

/**
 * Initialize demo data if none exists
 * @returns {Promise} Promise that resolves when initialization is complete
 */
async function initializeDemoData() {
    const users = await getUsers();
    
    if (users.length === 0) {
        // Create demo users
        const demoUsers = [
            {
                id: 'user_demo_1',
                name: 'Anton Mayer',
                email: 'anton@gmail.com',
                password: 'demo123',
                initials: 'AM',
                color: '#FF7A00',
                isGuest: false,
                createdAt: new Date().toISOString(),
                lastLogin: null
            },
            {
                id: 'user_demo_2',
                name: 'Anja Schulz',
                email: 'anja@gmail.com',
                password: 'demo123',
                initials: 'AS',
                color: '#9327FF',
                isGuest: false,
                createdAt: new Date().toISOString(),
                lastLogin: null
            }
        ];
        
        await saveUsers(demoUsers);
        
        // Add demo users as contacts
        for (const user of demoUsers) {
            await addUserAsContact(user);
        }
        
        console.log('Demo users initialized');
    }
}

// Initialize demo data on first load
(async function() {
    try {
        await initializeDemoData();
        console.log('✅ Demo users initialized');
    } catch (error) {
        console.error('❌ Error initializing demo users:', error);
    }
})();
