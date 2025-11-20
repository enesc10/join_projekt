
/* Add Task Page JavaScript */

// Global variables
let selectedPriority = 'urgent';
let selectedAssignedContacts = [];
let selectedCategory = '';
let subtasks = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeAddTaskPage();
});

/**
 * Initialize add task page
 */
async function initializeAddTaskPage() {
    updateUserProfile();
    await loadContacts();
    setDefaultDueDate();
    setupFormValidation();
    
    // Set urgent priority as default
    selectPriority('urgent');
    
    // Setup dropdown auto-close
    setupDropdownAutoClose();
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
 * Load contacts for assignment dropdown
 */
async function loadContacts() {
    const contacts = await getContacts();
    const dropdown = document.getElementById('assignedToDropdown');
    
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    
    contacts.forEach(contact => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.style.cursor = 'pointer';
        item.innerHTML = `
            <input type="checkbox" id="contact_${contact.id}" value="${contact.id}">
            <div class="avatar" style="background-color: ${contact.color}; width: 24px; height: 24px; font-size: 10px;">
                ${contact.initials}
            </div>
            <label for="contact_${contact.id}" style="margin-left: 8px; cursor: pointer;">${contact.name}</label>
        `;
        
        // Make the entire item clickable
        item.addEventListener('click', function(event) {
            // Prevent double-toggle if clicking directly on checkbox
            if (event.target.type !== 'checkbox') {
                const checkbox = document.getElementById(`contact_${contact.id}`);
                checkbox.checked = !checkbox.checked;
            }
            toggleContactAssignment(contact.id);
        });
        
        dropdown.appendChild(item);
    });
}

/**
 * Setup dropdown auto-close behavior
 */
function setupDropdownAutoClose() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            // Check if click is outside the dropdown
            if (!dropdown.contains(event.target)) {
                dropdown.classList.remove('open');
            }
        });
    });
}

/**
 * Set default due date to today
 */
function setDefaultDueDate() {
    const dueDateInput = document.getElementById('dueDate');
    if (dueDateInput) {
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.value = today;
    }
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    // Validation will only occur on form submit
    // Remove early validation to avoid showing errors while typing
}

/**
 * Validate form on submit
 * @returns {boolean} True if form is valid
 */
function validateFormOnSubmit() {
    const title = document.getElementById('title')?.value.trim();
    const dueDate = document.getElementById('dueDate')?.value;
    
    let isValid = true;
    
    // Validate title
    if (!title || title.length === 0) {
        showFieldError('titleError', 'Title is required');
        isValid = false;
    } else {
        showFieldError('titleError', '');
    }
    
    // Validate due date
    if (!dueDate) {
        showFieldError('dueDateError', 'Due date is required');
        isValid = false;
    } else {
        showFieldError('dueDateError', '');
    }
    
    // Validate category
    if (!selectedCategory) {
        showFieldError('categoryError', 'Category is required');
        isValid = false;
    } else {
        showFieldError('categoryError', '');
    }
    
    return isValid;
}

/**
 * Show field error message
 * @param {string} errorId - Error element ID
 * @param {string} message - Error message
 */
function showFieldError(errorId, message) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = message ? 'block' : 'none';
    }
}

/**
 * Hide all validation error messages
 */
function hideAllValidationErrors() {
    showFieldError('titleError', '');
    showFieldError('dueDateError', '');
    showFieldError('categoryError', '');
}

/**
 * Select priority
 * @param {string} priority - Priority level ('urgent', 'medium', 'low')
 */
function selectPriority(priority) {
    selectedPriority = priority;
    
    // Update button states
    const buttons = document.querySelectorAll('.priority-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.priority === priority) {
            btn.classList.add('active');
        }
    });
}

/**
 * Toggle assigned dropdown
 */
function toggleAssignedDropdown() {
    const dropdown = document.querySelector('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('open');
    }
    
    // Close category dropdown if open
    const categoryDropdown = document.getElementById('categoryDropdown').parentElement;
    if (categoryDropdown) {
        categoryDropdown.classList.remove('open');
    }
}

/**
 * Toggle category dropdown
 */
function toggleCategoryDropdown() {
    const dropdown = document.getElementById('categoryDropdown').parentElement;
    if (dropdown) {
        dropdown.classList.toggle('open');
    }
    
    // Close assigned dropdown if open
    const assignedDropdown = document.querySelector('.dropdown');
    if (assignedDropdown) {
        assignedDropdown.classList.remove('open');
    }
}

/**
 * Select category
 * @param {string} category - Category name
 */
function selectCategory(category) {
    selectedCategory = category;
    const placeholder = document.getElementById('categoryPlaceholder');
    if (placeholder) {
        placeholder.textContent = category;
    }
    
    // Close dropdown
    const dropdown = document.getElementById('categoryDropdown').parentElement;
    if (dropdown) {
        dropdown.classList.remove('open');
    }
}

/**
 * Toggle contact assignment
 * @param {string} contactId - Contact ID
 */
function toggleContactAssignment(contactId) {
    const checkbox = document.getElementById(`contact_${contactId}`);
    
    if (checkbox.checked) {
        if (!selectedAssignedContacts.includes(contactId)) {
            selectedAssignedContacts.push(contactId);
        }
    } else {
        selectedAssignedContacts = selectedAssignedContacts.filter(id => id !== contactId);
    }
    
    updateAssignedContactsDisplay();
    updateAssignedToPlaceholder();
}

/**
 * Update assigned contacts display
 */
async function updateAssignedContactsDisplay() {
    const container = document.getElementById('assignedContacts');
    if (!container) return;
    
    container.innerHTML = '';
    
    const contacts = await getContacts();
    
    selectedAssignedContacts.forEach(contactId => {
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
            const contactEl = document.createElement('div');
            contactEl.className = 'assigned-contact';
            contactEl.innerHTML = `
                <div class="avatar" style="background-color: ${contact.color};">
                    ${contact.initials}
                </div>
                <span>${contact.name}</span>
                <button type="button" class="remove-btn" onclick="removeAssignedContact('${contactId}')">×</button>
            `;
            container.appendChild(contactEl);
        }
    });
}

/**
 * Update assigned to placeholder text
 */
async function updateAssignedToPlaceholder() {
    const placeholder = document.getElementById('assignedToPlaceholder');
    if (!placeholder) return;
    
    if (selectedAssignedContacts.length === 0) {
        placeholder.textContent = 'Select contacts to assign';
    } else if (selectedAssignedContacts.length === 1) {
        const contact = await getContactById(selectedAssignedContacts[0]);
        placeholder.textContent = contact ? contact.name : '1 contact selected';
    } else {
        placeholder.textContent = `${selectedAssignedContacts.length} contacts selected`;
    }
}

/**
 * Remove assigned contact
 * @param {string} contactId - Contact ID to remove
 */
function removeAssignedContact(contactId) {
    selectedAssignedContacts = selectedAssignedContacts.filter(id => id !== contactId);
    
    // Update checkbox
    const checkbox = document.getElementById(`contact_${contactId}`);
    if (checkbox) {
        checkbox.checked = false;
    }
    
    updateAssignedContactsDisplay();
    updateAssignedToPlaceholder();
}

/**
 * Handle subtask input keypress
 * @param {Event} event - Keypress event
 */
function handleSubtaskKeypress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addSubtask();
    }
}

/**
 * Add new subtask
 */
function addSubtask() {
    const input = document.getElementById('subtaskInput');
    if (!input) return;
    
    const title = input.value.trim();
    if (!title) return;
    
    const subtask = {
        id: generateId(),
        title: title,
        completed: false
    };
    
    subtasks.push(subtask);
    input.value = '';
    
    updateSubtaskList();
}

/**
 * Clear subtask input
 */
function clearSubtaskInput() {
    const input = document.getElementById('subtaskInput');
    if (input) {
        input.value = '';
        input.focus();
    }
}

/**
 * Update subtask list display
 */
function updateSubtaskList() {
    const container = document.getElementById('subtaskList');
    if (!container) return;
    
    container.innerHTML = '';
    
    subtasks.forEach((subtask, index) => {
        const subtaskEl = document.createElement('div');
        subtaskEl.className = 'subtask-item';
        subtaskEl.innerHTML = `
            <span>${subtask.title}</span>
            <div class="subtask-item-actions">
                <button type="button" onclick="editSubtask(${index})">
                    <img src="assets/img/pencil.png" alt="Edit">
                </button>
                <button type="button" onclick="deleteSubtask(${index})">
                    <img src="assets/img/delete.png" alt="Delete">
                </button>
            </div>
        `;
        container.appendChild(subtaskEl);
    });
}

/**
 * Edit subtask
 * @param {number} index - Subtask index
 */
async function editSubtask(index) {
    const subtask = subtasks[index];
    const newTitle = await showPrompt('Edit subtask:', subtask.title);
    
    if (newTitle && newTitle.trim() !== '') {
        subtasks[index].title = newTitle.trim();
        updateSubtaskList();
    }
}

/**
 * Delete subtask
 * @param {number} index - Subtask index
 */
async function deleteSubtask(index) {
    const confirmed = await showConfirm('Are you sure you want to delete this subtask?');
    if (confirmed) {
        subtasks.splice(index, 1);
        updateSubtaskList();
    }
}

/**
 * Clear form
 */
async function clearForm() {
    const confirmed = await showConfirm('Are you sure you want to clear the form?');
    if (confirmed) {
        document.getElementById('addTaskForm').reset();
        selectedPriority = 'medium';
        selectedAssignedContacts = [];
        selectedCategory = '';
        subtasks = [];
        
        selectPriority('medium');
        updateAssignedContactsDisplay();
        updateAssignedToPlaceholder();
        updateSubtaskList();
        
        const categoryPlaceholder = document.getElementById('categoryPlaceholder');
        if (categoryPlaceholder) {
            categoryPlaceholder.textContent = 'Select task category';
        }
        
        setDefaultDueDate();
        
        // Reset validation state
        hideAllValidationErrors();
    }
}

/**
 * Create task from form
 * @param {Event} event - Form submit event
 */
async function createTaskFromForm(event) {
    event.preventDefault();
    
    // Validate form - this will show error messages
    if (!validateFormOnSubmit()) {
        await showAlert('Please fill in all required fields', 'error');
        return;
    }
    
    const title = document.getElementById('title')?.value.trim();
    const description = document.getElementById('description')?.value.trim();
    const dueDate = document.getElementById('dueDate')?.value;
    
    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Creating Task...';
    submitBtn.disabled = true;
    
    setTimeout(async () => {
        try {
            const taskData = {
                title: title,
                description: description,
                category: selectedCategory,
                dueDate: dueDate,
                priority: selectedPriority,
                assignedTo: [...selectedAssignedContacts],
                subtasks: [...subtasks]
            };
            
            const task = await createTask(taskData);
            
            showToast('Task added to board!', 'success');
            
            // Ask if user wants to create another task or go to board
            setTimeout(async () => {
                const goToBoard = await showConfirm('Task created successfully! Would you like to go to the board to see it?', 
                    () => {}, // onConfirm
                    () => {}  // onCancel
                );
                
                if (goToBoard) {
                    window.location.href = 'board.html';
                } else {
                    await clearForm();
                }
                
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1000);
            
        } catch (error) {
            console.error('Error creating task:', error);
            showToast('Error creating task', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }, 300);
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
