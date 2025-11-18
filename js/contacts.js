
/* Contacts Page JavaScript */

// Global variables
let currentContacts = [];
let selectedContact = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeContactsPage();
});

/**
 * Initialize contacts page
 */
async function initializeContactsPage() {
    updateUserProfile();
    await loadContacts();
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
 * Load and display contacts
 */
async function loadContacts() {
    currentContacts = await getContacts();
    await renderContacts();
}

/**
 * Render contacts in alphabetical groups
 */
async function renderContacts() {
    const contactsList = document.getElementById('contactsList');
    if (!contactsList) return;
    
    contactsList.innerHTML = '';
    
    const groupedContacts = await getContactsGrouped();
    const sortedLetters = Object.keys(groupedContacts).sort();
    
    sortedLetters.forEach(letter => {
        const contacts = groupedContacts[letter];
        
        const groupDiv = document.createElement('div');
        groupDiv.className = 'contacts-group';
        
        groupDiv.innerHTML = `
            <div class="group-letter">${letter}</div>
            <div class="contacts-group-list">
                ${contacts.map(contact => createContactItemHTML(contact)).join('')}
            </div>
        `;
        
        contactsList.appendChild(groupDiv);
    });
    
    // Add click event listeners
    addContactEventListeners();
}

/**
 * Create contact item HTML
 * @param {Object} contact - Contact object
 * @returns {string} Contact item HTML
 */
function createContactItemHTML(contact) {
    const isSelected = selectedContact && selectedContact.id === contact.id;
    
    return `
        <div class="contact-item ${isSelected ? 'active' : ''}" data-contact-id="${contact.id}">
            <div class="avatar" style="background-color: ${contact.color};">
                ${contact.initials}
            </div>
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-email">${contact.email}</div>
            </div>
        </div>
    `;
}

/**
 * Add event listeners to contact items
 */
function addContactEventListeners() {
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.addEventListener('click', function() {
            const contactId = this.dataset.contactId;
            selectContact(contactId);
        });
    });
}

/**
 * Select and display contact
 * @param {string} contactId - Contact ID
 */
function selectContact(contactId) {
    const contact = getContactById(contactId);
    if (!contact) return;
    
    selectedContact = contact;
    
    // Update selected state in list
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.classList.toggle('active', item.dataset.contactId === contactId);
    });
    
    // Show contact details
    showContactDetails(contact);
}

/**
 * Show contact details
 * @param {Object} contact - Contact object
 */
function showContactDetails(contact) {
    const emptyState = document.getElementById('contactDetailEmpty');
    const contentState = document.getElementById('contactDetailContent');
    const avatarEl = document.getElementById('detailAvatar');
    const initialsEl = document.getElementById('detailInitials');
    const nameEl = document.getElementById('detailName');
    const emailEl = document.getElementById('detailEmail');
    const phoneEl = document.getElementById('detailPhone');
    
    if (!emptyState || !contentState) return;
    
    // Hide empty state, show content
    emptyState.style.display = 'none';
    contentState.style.display = 'block';
    
    // Update content
    if (avatarEl) {
        avatarEl.style.backgroundColor = contact.color;
    }
    
    if (initialsEl) {
        initialsEl.textContent = contact.initials;
    }
    
    if (nameEl) {
        nameEl.textContent = contact.name;
    }
    
    if (emailEl) {
        emailEl.textContent = contact.email;
        emailEl.href = `mailto:${contact.email}`;
    }
    
    if (phoneEl) {
        phoneEl.textContent = contact.phone || 'No phone number';
    }
}

/**
 * Open add contact modal
 */
function openAddContactModal() {
    const modal = document.getElementById('addContactModal');
    if (modal) {
        modal.classList.add('show');
        
        // Clear form
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        
        // Focus first input
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

/**
 * Close add contact modal
 */
function closeAddContactModal() {
    const modal = document.getElementById('addContactModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Add new contact
 * @param {Event} event - Form submit event
 */
function addContact(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('addContactName');
    const emailInput = document.getElementById('addContactEmail');
    const phoneInput = document.getElementById('addContactPhone');
    
    if (!nameInput || !emailInput || !phoneInput) return;
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    
    // Validation
    if (!name || name.length < 2) {
        showToast('Name must be at least 2 characters long', 'error');
        return;
    }
    
    if (!email || !isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    if (!phone) {
        showToast('Phone number is required', 'error');
        return;
    }
    
    // Check for duplicate email
    const existingContact = currentContacts.find(contact => contact.email === email);
    if (existingContact) {
        showToast('A contact with this email already exists', 'error');
        return;
    }
    
    try {
        const newContact = createContact({
            name: name,
            email: email,
            phone: phone
        });
        
        closeAddContactModal();
        loadContacts();
        selectContact(newContact.id);
        
        showToast('Contact successfully created!', 'success');
        
    } catch (error) {
        console.error('Error creating contact:', error);
        showToast('Error creating contact', 'error');
    }
}

/**
 * Edit contact
 */
function editContact() {
    if (!selectedContact) return;
    
    const modal = document.getElementById('editContactModal');
    const avatarEl = document.getElementById('editContactAvatar');
    const initialsEl = document.getElementById('editContactInitials');
    const nameInput = document.getElementById('editContactName');
    const emailInput = document.getElementById('editContactEmail');
    const phoneInput = document.getElementById('editContactPhone');
    
    if (!modal) return;
    
    // Update modal content
    if (avatarEl) {
        avatarEl.style.backgroundColor = selectedContact.color;
    }
    
    if (initialsEl) {
        initialsEl.textContent = selectedContact.initials;
    }
    
    if (nameInput) nameInput.value = selectedContact.name;
    if (emailInput) emailInput.value = selectedContact.email;
    if (phoneInput) phoneInput.value = selectedContact.phone;
    
    modal.classList.add('show');
    
    // Focus first input
    setTimeout(() => nameInput?.focus(), 100);
}

/**
 * Close edit contact modal
 */
function closeEditContactModal() {
    const modal = document.getElementById('editContactModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Save edited contact
 * @param {Event} event - Form submit event
 */
function saveEditContact(event) {
    event.preventDefault();
    
    if (!selectedContact) return;
    
    const nameInput = document.getElementById('editContactName');
    const emailInput = document.getElementById('editContactEmail');
    const phoneInput = document.getElementById('editContactPhone');
    
    if (!nameInput || !emailInput || !phoneInput) return;
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    
    // Validation
    if (!name || name.length < 2) {
        showToast('Name must be at least 2 characters long', 'error');
        return;
    }
    
    if (!email || !isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    if (!phone) {
        showToast('Phone number is required', 'error');
        return;
    }
    
    // Check for duplicate email (excluding current contact)
    const existingContact = currentContacts.find(contact => 
        contact.email === email && contact.id !== selectedContact.id
    );
    
    if (existingContact) {
        showToast('A contact with this email already exists', 'error');
        return;
    }
    
    try {
        const updatedContact = updateContact(selectedContact.id, {
            name: name,
            email: email,
            phone: phone
        });
        
        if (updatedContact) {
            selectedContact = updatedContact;
            closeEditContactModal();
            loadContacts();
            showContactDetails(updatedContact);
            
            showToast('Contact successfully edited!', 'success');
        } else {
            showToast('Error updating contact', 'error');
        }
        
    } catch (error) {
        console.error('Error updating contact:', error);
        showToast('Error updating contact', 'error');
    }
}

/**
 * Confirm delete contact
 */
function confirmDeleteContact() {
    if (!selectedContact) return;
    
    const confirmMessage = `Are you sure you want to delete ${selectedContact.name}? This contact will also be removed from all tasks.`;
    
    if (confirm(confirmMessage)) {
        deleteContactData();
    }
}

/**
 * Delete contact
 */
function deleteContact() {
    confirmDeleteContact();
}

/**
 * Delete contact data
 */
function deleteContactData() {
    if (!selectedContact) return;
    
    try {
        const result = deleteContactById(selectedContact.id);
        
        if (result) {
            closeEditContactModal();
            
            // Hide contact details
            const emptyState = document.getElementById('contactDetailEmpty');
            const contentState = document.getElementById('contactDetailContent');
            
            if (emptyState && contentState) {
                emptyState.style.display = 'block';
                contentState.style.display = 'none';
            }
            
            selectedContact = null;
            loadContacts();
            
            showToast('Contact deleted successfully!', 'success');
        } else {
            showToast('Error deleting contact', 'error');
        }
        
    } catch (error) {
        console.error('Error deleting contact:', error);
        showToast('Error deleting contact', 'error');
    }
}

/**
 * Delete contact by ID wrapper
 * @param {string} contactId - Contact ID
 * @returns {boolean} Success status
 */
function deleteContactById(contactId) {
    return deleteContact(contactId);
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

// Close modals when clicking outside
document.addEventListener('click', function(event) {
    const addModal = document.getElementById('addContactModal');
    const editModal = document.getElementById('editContactModal');
    
    if (addModal && event.target === addModal) {
        closeAddContactModal();
    }
    
    if (editModal && event.target === editModal) {
        closeEditContactModal();
    }
});
