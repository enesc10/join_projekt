/**
 * Mobile Navigation Script
 * Handles active state for mobile bottom navigation
 */

/**
 * Sets the active navigation item based on current page
 */
function setActiveNav() {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'summary.html';
    
    // Get all bottom nav items
    const navItems = document.querySelectorAll('.bottom-nav-item');
    
    // Remove active class from all items
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to current page nav item
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('active');
        }
    });
}

/**
 * Initialize mobile navigation on page load
 */
document.addEventListener('DOMContentLoaded', setActiveNav);
