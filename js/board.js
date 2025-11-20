
/* Board Page JavaScript */

// Global variables
let currentTasks = [];
let filteredTasks = [];
let draggedTask = null;
let currentTaskDetail = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeBoardPage();
});

/**
 * Initialize board page
 */
async function initializeBoardPage() {
    updateUserProfile();
    
    // Load and cache contacts
    window.contactsCache = await getContacts();
    
    await loadTasks();
    setupDragAndDrop();
    
    // Check for filter parameter
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get('filter');
    if (filter) {
        applyFilter(filter);
    }
}

/**
 * Update user profile display
 */
function updateUserProfile() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const userInitialsEl = document.getElementById('userInitials');
        if (userInitialsEl) {
            userInitialsEl.textContent = currentUser.initials;
            userInitialsEl.parentElement.style.backgroundColor = currentUser.color;
        }
    }
}

/**
 * Load and display tasks
 */
async function loadTasks() {
    currentTasks = await getTasks();
    filteredTasks = [...currentTasks];
    renderTasks();
}

/**
 * Render tasks on the board
 */
function renderTasks() {
    const columns = {
        'to-do': document.getElementById('todoColumn'),
        'in-progress': document.getElementById('inProgressColumn'),
        'await-feedback': document.getElementById('awaitFeedbackColumn'),
        'done': document.getElementById('doneColumn')
    };
    
    // Clear all columns
    Object.values(columns).forEach(column => {
        if (column) column.innerHTML = '';
    });
    
    // Render tasks in appropriate columns
    filteredTasks.forEach(task => {
        const column = columns[task.status];
        if (column) {
            const taskCard = createTaskCard(task);
            column.appendChild(taskCard);
        }
    });
}

/**
 * Create task card element
 * @param {Object} task - Task object
 * @returns {HTMLElement} Task card element
 */
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.taskId = task.id;
    
    // Task category
    const categoryClass = task.category === 'User Story' ? 'user-story' : 'technical-task';
    
    // Assignees HTML (synchronous version using cached contacts)
    let assigneesHTML = '';
    if (task.assignedTo && task.assignedTo.length > 0) {
        // Get contacts from cache (we'll preload them)
        const contactsCache = window.contactsCache || [];
        const contacts = task.assignedTo.slice(0, 3)
            .map(contactId => contactsCache.find(c => c.id === contactId))
            .filter(Boolean);
        
        assigneesHTML = contacts.map(contact => `
            <div class="avatar" style="background-color: ${contact.color};">
                ${contact.initials}
            </div>
        `).join('');
        
        if (task.assignedTo.length > 3) {
            assigneesHTML += `<div class="avatar" style="background-color: #999;">+${task.assignedTo.length - 3}</div>`;
        }
    }
    
    // Subtasks progress
    let progressHTML = '';
    if (task.subtasks && task.subtasks.length > 0) {
        const completed = task.subtasks.filter(st => st.completed).length;
        const total = task.subtasks.length;
        const percentage = (completed / total) * 100;
        
        progressHTML = `
            <div class="task-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="progress-text">${completed}/${total} Subtasks</div>
            </div>
        `;
    }
    
    // Priority icon
    const priorityIcon = `assets/img/${task.priority}.png`;
    
    card.innerHTML = `
        <div class="task-category ${categoryClass}">${task.category}</div>
        <h4 class="task-title">${task.title}</h4>
        <p class="task-description">${task.description || ''}</p>
        ${progressHTML}
        <div class="task-footer">
            <div class="task-assignees">${assigneesHTML}</div>
            <div class="task-priority">
                <img src="${priorityIcon}" alt="${task.priority} priority">
            </div>
        </div>
    `;
    
    // Add click event to open task detail
    card.addEventListener('click', () => openTaskDetail(task.id));
    
    return card;
}

/**
 * Setup drag and drop functionality
 */
function setupDragAndDrop() {
    // Add drag event listeners to task cards
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    
    // Add drop zone event listeners
    const columns = document.querySelectorAll('.kanban-column');
    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
        column.addEventListener('dragenter', handleDragEnter);
        column.addEventListener('dragleave', handleDragLeave);
    });
    
    // Add touch event listeners for mobile drag and drop
    setupMobileDragAndDrop();
}

/**
 * Setup mobile drag and drop with touch events
 */
function setupMobileDragAndDrop() {
    let longPressTimer;
    let isDraggingTouch = false;
    let touchDraggedTask = null;
    
    document.addEventListener('touchstart', function(event) {
        const taskCard = event.target.closest('.task-card');
        if (!taskCard) return;
        
        // Start long press timer
        longPressTimer = setTimeout(() => {
            taskCard.classList.add('long-press-active');
            isDraggingTouch = true;
            touchDraggedTask = taskCard;
            navigator.vibrate && navigator.vibrate(50); // Haptic feedback if available
        }, 500); // 500ms long press
    });
    
    document.addEventListener('touchmove', function(event) {
        if (!isDraggingTouch || !touchDraggedTask) return;
        
        event.preventDefault();
        const touch = event.touches[0];
        const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
        const column = elementAtPoint?.closest('.kanban-column');
        
        // Highlight drop zone
        document.querySelectorAll('.kanban-column').forEach(col => {
            col.classList.remove('drag-over');
        });
        
        if (column && column !== touchDraggedTask.closest('.kanban-column')) {
            column.classList.add('drag-over');
        }
    });
    
    document.addEventListener('touchend', async function(event) {
        clearTimeout(longPressTimer);
        
        if (!isDraggingTouch || !touchDraggedTask) {
            return;
        }
        
        const touch = event.changedTouches[0];
        const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
        const column = elementAtPoint?.closest('.kanban-column');
        
        if (column && column !== touchDraggedTask.closest('.kanban-column')) {
            const newStatus = column.dataset.status;
            const taskId = touchDraggedTask.dataset.taskId;
            
            // Update task status
            const result = await updateTask(taskId, { status: newStatus });
            
            if (result) {
                // Update local tasks array
                const task = currentTasks.find(t => t.id === taskId);
                if (task) {
                    task.status = newStatus;
                }
                
                // Re-render tasks
                renderTasks();
                
                showToast(`Task moved to ${newStatus.replace('-', ' ')}!`, 'success');
            }
        }
        
        // Clean up
        touchDraggedTask?.classList.remove('long-press-active');
        document.querySelectorAll('.kanban-column').forEach(col => {
            col.classList.remove('drag-over');
        });
        
        isDraggingTouch = false;
        touchDraggedTask = null;
    });
    
    document.addEventListener('touchcancel', function() {
        clearTimeout(longPressTimer);
        touchDraggedTask?.classList.remove('long-press-active');
        isDraggingTouch = false;
        touchDraggedTask = null;
    });
}

/**
 * Handle drag start
 * @param {Event} event - Drag event
 */
function handleDragStart(event) {
    if (event.target.classList.contains('task-card')) {
        draggedTask = event.target;
        event.target.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
    }
}

/**
 * Handle drag end
 * @param {Event} event - Drag event
 */
function handleDragEnd(event) {
    if (event.target.classList.contains('task-card')) {
        event.target.classList.remove('dragging');
        
        // Remove drag-over class from all columns
        const columns = document.querySelectorAll('.kanban-column');
        columns.forEach(col => col.classList.remove('drag-over'));
        
        draggedTask = null;
    }
}

/**
 * Handle drag over
 * @param {Event} event - Drag event
 */
function handleDragOver(event) {
    if (draggedTask) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }
}

/**
 * Handle drag enter
 * @param {Event} event - Drag event
 */
function handleDragEnter(event) {
    if (draggedTask && event.target.classList.contains('kanban-column')) {
        event.target.classList.add('drag-over');
    }
}

/**
 * Handle drag leave
 * @param {Event} event - Drag event
 */
function handleDragLeave(event) {
    if (!event.target.contains(event.relatedTarget)) {
        event.target.classList.remove('drag-over');
    }
}

/**
 * Handle drop
 * @param {Event} event - Drag event
 */
async function handleDrop(event) {
    event.preventDefault();
    
    if (!draggedTask) return;
    
    const column = event.target.closest('.kanban-column');
    if (!column) return;
    
    const newStatus = column.dataset.status;
    const taskId = draggedTask.dataset.taskId;
    
    // Update task status
    const result = await updateTask(taskId, { status: newStatus });
    
    if (result) {
        // Update local tasks array
        const task = currentTasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
        }
        
        // Re-render tasks
        renderTasks();
        
        showToast(`Task moved to ${newStatus.replace('-', ' ')}!`, 'success');
    }
    
    column.classList.remove('drag-over');
}

/**
 * Search tasks
 */
function searchTasksInBoard() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        filteredTasks = [...currentTasks];
    } else {
        filteredTasks = currentTasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            (task.description && task.description.toLowerCase().includes(searchTerm))
        );
    }
    
    renderTasks();
}

/**
 * Apply filter from URL parameter
 * @param {string} filter - Filter type
 */
function applyFilter(filter) {
    switch (filter) {
        case 'urgent':
            filteredTasks = currentTasks.filter(task => task.priority === 'urgent');
            break;
        case 'to-do':
            filteredTasks = currentTasks.filter(task => task.status === 'to-do');
            break;
        case 'in-progress':
            filteredTasks = currentTasks.filter(task => task.status === 'in-progress');
            break;
        case 'await-feedback':
            filteredTasks = currentTasks.filter(task => task.status === 'await-feedback');
            break;
        case 'done':
            filteredTasks = currentTasks.filter(task => task.status === 'done');
            break;
        default:
            filteredTasks = [...currentTasks];
    }
    
    renderTasks();
}

/**
 * Add task to specific column
 * @param {string} status - Column status
 */
function addTaskToColumn(status) {
    window.location.href = `add-task.html?status=${status}`;
}

/**
 * Open task detail modal
 * @param {string} taskId - Task ID
 */
function openTaskDetail(taskId) {
    const task = currentTasks.find(t => t.id === taskId);
    if (!task) return;
    
    currentTaskDetail = task;
    
    const modal = document.getElementById('taskDetailModal');
    const categoryEl = document.getElementById('modalTaskCategory');
    const titleEl = document.getElementById('modalTaskTitle');
    const descriptionEl = document.getElementById('modalTaskDescription');
    const dueDateEl = document.getElementById('modalTaskDueDate');
    const priorityEl = document.getElementById('modalTaskPriority');
    const assignedToEl = document.getElementById('modalAssignedTo');
    const subtasksEl = document.getElementById('modalSubtasks');
    
    if (!modal) return;
    
    // Update modal content
    if (categoryEl) {
        categoryEl.textContent = task.category;
        categoryEl.className = `task-category ${task.category === 'User Story' ? 'user-story' : 'technical-task'}`;
    }
    
    if (titleEl) titleEl.textContent = task.title;
    if (descriptionEl) descriptionEl.textContent = task.description || 'No description';
    if (dueDateEl) dueDateEl.textContent = formatDate(new Date(task.dueDate));
    
    if (priorityEl) {
        priorityEl.innerHTML = `
            <img src="assets/img/${task.priority}.png" alt="${task.priority}" style="width: 16px; height: 16px;">
            ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        `;
    }
    
    // Assigned users
    if (assignedToEl) {
        let assignedHTML = '<h4>Assigned To</h4><div class="assigned-users">';
        
        if (task.assignedTo && task.assignedTo.length > 0) {
            const contactsCache = window.contactsCache || [];
            task.assignedTo.forEach(contactId => {
                const contact = contactsCache.find(c => c.id === contactId);
                if (contact) {
                    assignedHTML += `
                        <div class="assigned-user">
                            <div class="avatar" style="background-color: ${contact.color};">
                                ${contact.initials}
                            </div>
                            <span>${contact.name}</span>
                        </div>
                    `;
                }
            });
        } else {
            assignedHTML += '<p>No one assigned</p>';
        }
        
        assignedHTML += '</div>';
        assignedToEl.innerHTML = assignedHTML;
    }
    
    // Subtasks
    if (subtasksEl && task.subtasks && task.subtasks.length > 0) {
        let subtasksHTML = '<h4>Subtasks</h4><div class="subtask-list-modal">';
        
        task.subtasks.forEach((subtask, index) => {
            subtasksHTML += `
                <div class="subtask-item-modal ${subtask.completed ? 'completed' : ''}">
                    <div class="subtask-check">
                        <input type="checkbox" id="subtask_${subtask.id}" ${subtask.completed ? 'checked' : ''} onchange="toggleSubtaskInModal('${task.id}', '${subtask.id}')">
                        <label for="subtask_${subtask.id}">${subtask.title}</label>
                    </div>
                    <div class="subtask-actions">
                        <button type="button" class="icon-btn" onclick="editSubtaskInModal('${task.id}', ${index})" title="Edit">
                            <img src="assets/img/pencil.png" alt="Edit" style="width: 16px; height: 16px;">
                        </button>
                        <button type="button" class="icon-btn" onclick="deleteSubtaskInModal('${task.id}', ${index})" title="Delete">
                            <img src="assets/img/delete.png" alt="Delete" style="width: 16px; height: 16px;">
                        </button>
                    </div>
                </div>
            `;
        });
        
        subtasksHTML += '</div>';
        subtasksEl.innerHTML = subtasksHTML;
    } else if (subtasksEl) {
        subtasksEl.innerHTML = '<h4>Subtasks</h4><p>No subtasks</p>';
    }
    
    modal.classList.add('show');
}

/**
 * Close task detail modal
 */
function closeTaskDetailModal() {
    const modal = document.getElementById('taskDetailModal');
    if (modal) {
        modal.classList.remove('show');
        currentTaskDetail = null;
    }
}

/**
 * Toggle subtask in modal
 * @param {string} taskId - Task ID
 * @param {string} subtaskId - Subtask ID
 */
async function toggleSubtaskInModal(taskId, subtaskId) {
    const result = await toggleSubtask(taskId, subtaskId);
    
    if (result) {
        // Update current task detail
        currentTaskDetail = result;
        
        // Update tasks and re-render
        await loadTasks();
        
        showToast('Subtask updated!', 'success');
    }
}

/**
 * Edit subtask in modal
 * @param {string} taskId - Task ID
 * @param {number} subtaskIndex - Index of subtask
 */
async function editSubtaskInModal(taskId, subtaskIndex) {
    const task = currentTasks.find(t => t.id === taskId);
    if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) return;
    
    const subtask = task.subtasks[subtaskIndex];
    const newTitle = await showPrompt('Edit subtask:', subtask.title);
    
    if (newTitle && newTitle.trim() !== '' && newTitle.trim() !== subtask.title) {
        task.subtasks[subtaskIndex].title = newTitle.trim();
        
        const result = await updateTask(taskId, { subtasks: task.subtasks });
        
        if (result) {
            currentTaskDetail = result;
            await loadTasks();
            openTaskDetail(taskId);
            showToast('Subtask updated!', 'success');
        }
    }
}

/**
 * Delete subtask in modal
 * @param {string} taskId - Task ID
 * @param {number} subtaskIndex - Index of subtask
 */
async function deleteSubtaskInModal(taskId, subtaskIndex) {
    const confirmed = await showConfirm('Are you sure you want to delete this subtask?');
    if (!confirmed) return;
    
    const task = currentTasks.find(t => t.id === taskId);
    if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) return;
    
    task.subtasks.splice(subtaskIndex, 1);
    
    const result = await updateTask(taskId, { subtasks: task.subtasks });
    
    if (result) {
        currentTaskDetail = result;
        await loadTasks();
        openTaskDetail(taskId);
        showToast('Subtask deleted!', 'success');
    }
}

/**
 * Edit task
 */
function editTask() {
    if (!currentTaskDetail) return;
    
    // For now, just show a placeholder
    showToast('Edit functionality will be implemented in next version', 'info');
    closeTaskDetailModal();
}

/**
 * Delete task from board
 */
async function deleteTaskFromBoard() {
    if (!currentTaskDetail) return;
    
    const confirmed = await showConfirm('Are you sure you want to delete this task?');
    if (confirmed) {
        const result = await deleteTask(currentTaskDetail.id);
        
        if (result) {
            closeTaskDetailModal();
            await loadTasks();
            await showAlert('Task deleted successfully!', 'success');
        } else {
            await showAlert('Error deleting task', 'error');
        }
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

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('taskDetailModal');
    if (modal && event.target === modal) {
        closeTaskDetailModal();
    }
});
