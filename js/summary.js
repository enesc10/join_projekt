
/* Summary Page JavaScript */

document.addEventListener('DOMContentLoaded', function() {
    initializeSummaryPage();
});

/**
 * Initialize summary page
 */
async function initializeSummaryPage() {
    updateGreeting();
    await updateMetrics();
    updateUserProfile();
    
    // Update metrics every 30 seconds
    setInterval(async () => {
        await updateMetrics();
    }, 30000);
}

/**
 * Update greeting based on time of day and user
 */
function updateGreeting() {
    const timeGreetingEl = document.getElementById('timeGreeting');
    const userNameEl = document.getElementById('userName');
    const currentUser = getCurrentUser();
    
    if (!timeGreetingEl || !userNameEl) return;
    
    // Get time-based greeting
    const now = new Date();
    const hour = now.getHours();
    let greeting;
    
    if (hour < 12) {
        greeting = 'Good morning';
    } else if (hour < 18) {
        greeting = 'Good afternoon';
    } else {
        greeting = 'Good evening';
    }
    
    timeGreetingEl.textContent = greeting;
    
    // Set user name - show full name, not just first name
    if (currentUser) {
        userNameEl.textContent = currentUser.isGuest ? 'Guest' : currentUser.name;
    } else {
        userNameEl.textContent = 'Guest';
    }
}

/**
 * Update user profile in header
 */
function updateUserProfile() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        updateUserProfileDisplay(currentUser);
    }
}

/**
 * Update user profile display
 * @param {Object} user - Current user object
 */
function updateUserProfileDisplay(user) {
    const userInitialsEl = document.getElementById('userInitials');
    if (userInitialsEl) {
        userInitialsEl.textContent = user.initials;
        userInitialsEl.parentElement.style.backgroundColor = user.color;
    }
}

/**
 * Update metrics on the summary page
 */
async function updateMetrics() {
    const stats = await getTaskStatistics();
    
    // Update metric displays
    updateMetricDisplay('tasksInBoard', stats.total);
    updateMetricDisplay('tasksInProgress', stats.inProgress);
    updateMetricDisplay('awaitingFeedback', stats.awaitFeedback);
    updateMetricDisplay('todoTasks', stats.todo);
    updateMetricDisplay('doneTasks', stats.done);
    updateMetricDisplay('urgentTasks', stats.urgent);
    
    // Update next deadline
    updateNextDeadline(stats.nextDeadline);
}

/**
 * Update individual metric display with animation
 * @param {string} elementId - Element ID to update
 * @param {number} value - New value to display
 */
function updateMetricDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    
    if (currentValue !== value) {
        animateNumber(element, currentValue, value);
    }
}

/**
 * Animate number change
 * @param {HTMLElement} element - Element to animate
 * @param {number} start - Starting number
 * @param {number} end - Ending number
 */
function animateNumber(element, start, end) {
    const duration = 500; // Animation duration in ms
    const steps = 30; // Number of animation steps
    const increment = (end - start) / steps;
    const stepDuration = duration / steps;
    
    let current = start;
    let step = 0;
    
    const timer = setInterval(() => {
        step++;
        current += increment;
        
        if (step >= steps) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, stepDuration);
}

/**
 * Update next deadline display
 * @param {string|null} deadline - Next deadline date string or null
 */
function updateNextDeadline(deadline) {
    const deadlineElement = document.getElementById('nextDeadline');
    if (!deadlineElement) return;
    
    if (deadline) {
        const date = new Date(deadline);
        const formattedDate = formatDate(date);
        deadlineElement.textContent = formattedDate;
    } else {
        deadlineElement.textContent = 'No urgent tasks';
    }
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    return date.toLocaleDateString('en-US', options);
}

/**
 * Navigate to board with optional filter
 * @param {string} filter - Optional status filter
 */
function navigateToBoard(filter = null) {
    let url = 'board.html';
    
    if (filter) {
        url += `?filter=${filter}`;
    }
    
    window.location.href = url;
}

/**
 * Show task creation modal or navigate to add task page
 */
function showAddTaskModal() {
    // For now, navigate to add task page
    window.location.href = 'add-task.html';
}

/**
 * Refresh metrics manually
 */
async function refreshMetrics() {
    await updateMetrics();
    showToast('Metrics updated!', 'success');
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
