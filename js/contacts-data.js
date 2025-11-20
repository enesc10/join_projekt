
/* Contacts Management Module - Firebase Integration */

/**
 * Get contacts from Firebase
 * @returns {Promise<Array>} Promise that resolves with array of contact objects
 */
async function getContacts() {
    try {
        const contactsData = await firebaseGet('contacts');
        if (!contactsData) {
            return [];
        }
        
        // Convert Firebase object to array
        const contactsArray = Object.keys(contactsData).map(key => ({
            ...contactsData[key],
            id: contactsData[key].id || key
        }));
        
        return contactsArray;
    } catch (error) {
        console.error('Error getting contacts:', error);
        // Fallback to localStorage
        const contactsJson = localStorage.getItem('contacts');
        return contactsJson ? JSON.parse(contactsJson) : [];
    }
}

/**
 * Save contacts to Firebase
 * @param {Array} contacts - Array of contact objects
 * @returns {Promise} Promise that resolves when contacts are saved
 */
async function saveContacts(contacts) {
    try {
        // Convert array to object with contact IDs as keys
        const contactsObject = {};
        contacts.forEach(contact => {
            contactsObject[contact.id] = contact;
        });
        
        await firebaseSave('contacts', contactsObject);
        
        // Also save to localStorage as backup
        localStorage.setItem('contacts', JSON.stringify(contacts));
    } catch (error) {
        console.error('Error saving contacts:', error);
        // Fallback to localStorage only
        localStorage.setItem('contacts', JSON.stringify(contacts));
    }
}

/**
 * Create a new contact
 * @param {Object} contactData - Contact data object
 * @returns {Promise<Object>} Promise that resolves with created contact object
 */
async function createContact(contactData) {
    const contact = {
        id: generateId(),
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        initials: generateInitials(contactData.name),
        color: generateAvatarColor(),
        userId: null,
        createdAt: new Date().toISOString(),
        createdBy: getCurrentUser()?.id || 'guest'
    };
    
    const contacts = await getContacts();
    contacts.push(contact);
    await saveContacts(contacts);
    
    return contact;
}

/**
 * Update an existing contact
 * @param {string} contactId - Contact ID
 * @param {Object} updates - Object containing fields to update
 * @returns {Promise<Object|null>} Promise that resolves with updated contact object or null if not found
 */
async function updateContact(contactId, updates) {
    const contacts = await getContacts();
    const contactIndex = contacts.findIndex(contact => contact.id === contactId);
    
    if (contactIndex === -1) {
        return null;
    }
    
    // Update initials if name changed
    if (updates.name && updates.name !== contacts[contactIndex].name) {
        updates.initials = generateInitials(updates.name);
    }
    
    // Update the contact
    contacts[contactIndex] = {
        ...contacts[contactIndex],
        ...updates
    };
    
    await saveContacts(contacts);
    return contacts[contactIndex];
}

/**
 * Delete a contact
 * @param {string} contactId - Contact ID
 * @returns {Promise<boolean>} Promise that resolves with true if contact was deleted, false if not found
 */
async function deleteContact(contactId) {
    const contacts = await getContacts();
    const initialLength = contacts.length;
    const filteredContacts = contacts.filter(contact => contact.id !== contactId);
    
    if (filteredContacts.length !== initialLength) {
        await saveContacts(filteredContacts);
        
        // Remove contact from all task assignments
        await removeContactFromTasks(contactId);
        
        return true;
    }
    
    return false;
}

/**
 * Remove contact from all task assignments
 * @param {string} contactId - Contact ID to remove
 * @returns {Promise} Promise that resolves when operation is complete
 */
async function removeContactFromTasks(contactId) {
    const tasks = await getTasks();
    let tasksUpdated = false;
    
    tasks.forEach(task => {
        if (task.assignedTo && task.assignedTo.includes(contactId)) {
            task.assignedTo = task.assignedTo.filter(id => id !== contactId);
            task.updatedAt = new Date().toISOString();
            tasksUpdated = true;
        }
    });
    
    if (tasksUpdated) {
        await saveTasks(tasks);
    }
}

/**
 * Get contact by ID
 * @param {string} contactId - Contact ID
 * @returns {Promise<Object|null>} Promise that resolves with contact object or null if not found
 */
async function getContactById(contactId) {
    const contacts = await getContacts();
    return contacts.find(contact => contact.id === contactId) || null;
}

/**
 * Get contacts sorted alphabetically
 * @returns {Promise<Object>} Promise that resolves with contacts grouped by first letter
 */
async function getContactsGrouped() {
    const contacts = await getContacts();
    const sorted = contacts.sort((a, b) => a.name.localeCompare(b.name));
    
    const grouped = {};
    sorted.forEach(contact => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (!grouped[firstLetter]) {
            grouped[firstLetter] = [];
        }
        grouped[firstLetter].push(contact);
    });
    
    return grouped;
}
