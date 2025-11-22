/* Menu Module - Mobile Navigation & More Options Menu */

/**
 * Toggle mobile sidebar navigation
 */
function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const body = document.body;
    
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
    
    if (overlay) {
        overlay.classList.toggle('show');
    }
    
    if (body) {
        body.classList.toggle('sidebar-open');
    }
}

/**
 * Close mobile sidebar
 */
function closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const body = document.body;
    
    if (sidebar) {
        sidebar.classList.remove('open');
    }
    
    if (overlay) {
        overlay.classList.remove('show');
    }
    
    if (body) {
        body.classList.remove('sidebar-open');
    }
}

/**
 * Toggle more options dropdown menu
 */
function toggleMoreOptions(event) {
    if (event) {
        event.stopPropagation();
    }
    
    const dropdown = document.getElementById('moreOptionsDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

/**
 * Close more options dropdown
 */
function closeMoreOptions() {
    const dropdown = document.getElementById('moreOptionsDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

/**
 * Navigate to help page
 */
function navigateToHelp() {
    window.location.href = 'help.html';
}

/**
 * Navigate to legal notice page
 */
function navigateToLegalNotice() {
    window.location.href = 'legal-notice.html';
}

/**
 * Navigate to privacy policy page
 */
function navigateToPrivacyPolicy() {
    window.location.href = 'privacy-policy.html';
}

/**
 * Toggle user profile dropdown menu
 */
function toggleUserMenu(event) {
    if (event) {
        event.stopPropagation();
    }
    
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

/**
 * Close user dropdown
 */
function closeUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

/**
 * Initialize menu functionality
 */
function initializeMenu() {
    // Close more options dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const moreOptionsBtn = document.querySelector('.more-options-btn');
        const moreOptionsDropdown = document.getElementById('moreOptionsDropdown');
        const userProfile = document.getElementById('userProfile');
        const userDropdown = document.getElementById('userDropdown');
        
        // Close more options if clicked outside
        if (moreOptionsBtn && moreOptionsDropdown) {
            if (!moreOptionsBtn.contains(event.target) && !moreOptionsDropdown.contains(event.target)) {
                closeMoreOptions();
            }
        }
        
        // Close user dropdown if clicked outside
        if (userProfile && userDropdown) {
            if (!userProfile.contains(event.target) && !userDropdown.contains(event.target)) {
                closeUserDropdown();
            }
        }
    });
    
    // Close sidebar when clicking on overlay
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeMobileSidebar);
    }
    
    // Close sidebar when clicking on nav items on mobile
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeMobileSidebar();
            }
        });
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                closeMobileSidebar();
            }
        }, 250);
    });
}

// Initialize menu when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeMenu);
