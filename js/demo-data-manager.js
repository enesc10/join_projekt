/**
 * Demo Data Manager
 * Manages demo data for contacts and tasks in Firebase
 * Provides functions to upload, reset, and check demo data
 */

/**
 * Demo Contacts Data Definition
 */
const DEMO_CONTACTS = [
    {
        id: 'contact_demo_1',
        name: 'Sofia Müller',
        email: 'sofia@gmail.com',
        phone: '+49 1111 11 111',
        initials: 'SM',
        color: '#FF5EB3',
        userId: null,
        createdAt: '2024-01-01T10:00:00.000Z',
        createdBy: 'user_demo_1'
    },
    {
        id: 'contact_demo_2',
        name: 'Marcel Bauer',
        email: 'marcel@gmail.com',
        phone: '+49 2222 22 222',
        initials: 'MB',
        color: '#1FD7C1',
        userId: null,
        createdAt: '2024-01-01T10:00:00.000Z',
        createdBy: 'user_demo_1'
    },
    {
        id: 'contact_demo_3',
        name: 'Benedikt Ziegler',
        email: 'benedikt@gmail.com',
        phone: '+49 3333 33 333',
        initials: 'BZ',
        color: '#462F8A',
        userId: null,
        createdAt: '2024-01-01T10:00:00.000Z',
        createdBy: 'user_demo_2'
    },
    {
        id: 'contact_demo_4',
        name: 'Laura Schmidt',
        email: 'laura@gmail.com',
        phone: '+49 4444 44 444',
        initials: 'LS',
        color: '#FF7A00',
        userId: null,
        createdAt: '2024-01-01T10:00:00.000Z',
        createdBy: 'user_demo_1'
    },
    {
        id: 'contact_demo_5',
        name: 'Thomas Weber',
        email: 'thomas@gmail.com',
        phone: '+49 5555 55 555',
        initials: 'TW',
        color: '#9327FF',
        userId: null,
        createdAt: '2024-01-01T10:00:00.000Z',
        createdBy: 'user_demo_1'
    },
    {
        id: 'contact_demo_6',
        name: 'Nina Fischer',
        email: 'nina@gmail.com',
        phone: '+49 6666 66 666',
        initials: 'NF',
        color: '#7AE229',
        userId: null,
        createdAt: '2024-01-01T10:00:00.000Z',
        createdBy: 'user_demo_1'
    },
    {
        id: 'contact_demo_7',
        name: 'Felix Wagner',
        email: 'felix@gmail.com',
        phone: '+49 7777 77 777',
        initials: 'FW',
        color: '#FF3D00',
        userId: null,
        createdAt: '2024-01-01T10:00:00.000Z',
        createdBy: 'user_demo_2'
    },
    {
        id: 'contact_demo_8',
        name: 'Sarah Meyer',
        email: 'sarah@gmail.com',
        phone: '+49 8888 88 888',
        initials: 'SM',
        color: '#FFBB2B',
        userId: null,
        createdAt: '2024-01-01T10:00:00.000Z',
        createdBy: 'user_demo_2'
    },
    {
        id: 'contact_demo_9',
        name: 'Max Hoffmann',
        email: 'max@gmail.com',
        phone: '+49 9999 99 999',
        initials: 'MH',
        color: '#0038FF',
        userId: null,
        createdAt: '2024-01-01T10:00:00.000Z',
        createdBy: 'user_demo_2'
    },
    {
        id: 'contact_demo_10',
        name: 'Julia Becker',
        email: 'julia@gmail.com',
        phone: '+49 1010 10 101',
        initials: 'JB',
        color: '#FF5EB3',
        userId: null,
        createdAt: '2024-01-01T10:00:00.000Z',
        createdBy: 'user_demo_1'
    }
];

/**
 * Demo Tasks Data Definition
 */
const DEMO_TASKS = [
    {
        id: 'task_demo_1',
        title: 'CSS Architecture Planning',
        description: 'Define CSS naming conventions, create style guide, and establish component structure for scalable styling.',
        category: 'Technical Task',
        dueDate: '2025-12-25',
        priority: 'medium',
        status: 'in-progress',
        assignedTo: ['contact_demo_1', 'contact_demo_2'],
        subtasks: [
            {
                id: 'subtask_1',
                title: 'Research CSS methodologies',
                completed: true
            },
            {
                id: 'subtask_2',
                title: 'Create style guide document',
                completed: false
            },
            {
                id: 'subtask_3',
                title: 'Set up component library',
                completed: false
            }
        ],
        createdAt: '2024-01-01T10:00:00.000Z',
        createdBy: 'user_demo_1',
        updatedAt: '2024-01-01T10:00:00.000Z'
    },
    {
        id: 'task_demo_2',
        title: 'User Registration Flow',
        description: 'Implement complete user registration with validation, email verification, and welcome sequence.',
        category: 'User Story',
        dueDate: '2025-12-20',
        priority: 'urgent',
        status: 'to-do',
        assignedTo: ['contact_demo_1'],
        subtasks: [
            {
                id: 'subtask_4',
                title: 'Design registration form',
                completed: false
            },
            {
                id: 'subtask_5',
                title: 'Add form validation',
                completed: false
            }
        ],
        createdAt: '2024-01-01T10:00:00.000Z',
        createdBy: 'user_demo_1',
        updatedAt: '2024-01-01T10:00:00.000Z'
    },
    {
        id: 'task_demo_3',
        title: 'Database Optimization',
        description: 'Optimize database queries and implement caching for better performance.',
        category: 'Technical Task',
        dueDate: '2025-12-30',
        priority: 'low',
        status: 'await-feedback',
        assignedTo: ['contact_demo_2'],
        subtasks: [],
        createdAt: '2024-01-01T10:00:00.000Z',
        createdBy: 'user_demo_2',
        updatedAt: '2024-01-01T10:00:00.000Z'
    },
    {
        id: 'task_demo_4',
        title: 'Mobile App Testing',
        description: 'Comprehensive testing of mobile app functionality across different devices and operating systems.',
        category: 'User Story',
        dueDate: '2025-12-15',
        priority: 'medium',
        status: 'done',
        assignedTo: ['contact_demo_1', 'contact_demo_2'],
        subtasks: [
            {
                id: 'subtask_6',
                title: 'iOS testing',
                completed: true
            },
            {
                id: 'subtask_7',
                title: 'Android testing',
                completed: true
            }
        ],
        createdAt: '2024-01-01T10:00:00.000Z',
        createdBy: 'user_demo_2',
        updatedAt: '2024-01-01T10:00:00.000Z'
    },
    {
        id: 'task_demo_5',
        title: 'API Documentation',
        description: 'Create comprehensive API documentation with examples and best practices guide.',
        category: 'Technical Task',
        dueDate: '2025-12-18',
        priority: 'urgent',
        status: 'to-do',
        assignedTo: ['contact_demo_4', 'contact_demo_5'],
        subtasks: [
            {
                id: 'subtask_8',
                title: 'Write endpoint descriptions',
                completed: false
            },
            {
                id: 'subtask_9',
                title: 'Add code examples',
                completed: false
            }
        ],
        createdAt: '2024-01-01T10:00:00.000Z',
        createdBy: 'user_demo_1',
        updatedAt: '2024-01-01T10:00:00.000Z'
    }
];

/**
 * Check if demo data exists in Firebase
 * @returns {Promise<Object>} Promise that resolves with status object
 */
async function checkDemoDataExists() {
    try {
        const contacts = await firebaseGet('contacts');
        const tasks = await firebaseGet('tasks');
        
        const contactsExist = contacts && Object.keys(contacts).length > 0;
        const tasksExist = tasks && Object.keys(tasks).length > 0;
        
        return {
            contactsExist,
            tasksExist,
            allExist: contactsExist && tasksExist,
            contactsCount: contactsExist ? Object.keys(contacts).length : 0,
            tasksCount: tasksExist ? Object.keys(tasks).length : 0
        };
    } catch (error) {
        console.error('❌ Error checking demo data:', error);
        return {
            contactsExist: false,
            tasksExist: false,
            allExist: false,
            contactsCount: 0,
            tasksCount: 0,
            error: error.message
        };
    }
}

/**
 * Upload demo contacts to Firebase
 * @returns {Promise<Object>} Promise that resolves with result object
 */
async function uploadDemoContacts() {
    try {
        // Convert array to object with contact IDs as keys
        const contactsObject = {};
        DEMO_CONTACTS.forEach(contact => {
            contactsObject[contact.id] = contact;
        });
        
        await firebaseSave('contacts', contactsObject);
        console.log('✅ Demo contacts uploaded to Firebase');
        return { success: true, count: DEMO_CONTACTS.length };
    } catch (error) {
        console.error('❌ Error uploading demo contacts:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Upload demo tasks to Firebase
 * @returns {Promise<Object>} Promise that resolves with result object
 */
async function uploadDemoTasks() {
    try {
        // Convert array to object with task IDs as keys
        const tasksObject = {};
        DEMO_TASKS.forEach(task => {
            tasksObject[task.id] = task;
        });
        
        await firebaseSave('tasks', tasksObject);
        console.log('✅ Demo tasks uploaded to Firebase');
        return { success: true, count: DEMO_TASKS.length };
    } catch (error) {
        console.error('❌ Error uploading demo tasks:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Upload all demo data to Firebase
 * @param {boolean} forceUpload - Force upload even if data exists
 * @returns {Promise<Object>} Promise that resolves with result object
 */
async function uploadAllDemoData(forceUpload = false) {
    try {
        console.log('🚀 Starting demo data upload...');
        
        // Check if data already exists
        if (!forceUpload) {
            const existsCheck = await checkDemoDataExists();
            if (existsCheck.allExist) {
                console.log('ℹ️  Demo data already exists in Firebase');
                return {
                    success: true,
                    message: 'Demo data already exists',
                    skipped: true,
                    ...existsCheck
                };
            }
        }
        
        // Upload contacts
        const contactsResult = await uploadDemoContacts();
        if (!contactsResult.success) {
            throw new Error('Failed to upload contacts: ' + contactsResult.error);
        }
        
        // Upload tasks
        const tasksResult = await uploadDemoTasks();
        if (!tasksResult.success) {
            throw new Error('Failed to upload tasks: ' + tasksResult.error);
        }
        
        console.log('✅ All demo data uploaded successfully');
        return {
            success: true,
            message: 'All demo data uploaded successfully',
            contacts: contactsResult.count,
            tasks: tasksResult.count
        };
    } catch (error) {
        console.error('❌ Error uploading demo data:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Reset database to demo data
 * This deletes all existing data and uploads fresh demo data
 * @returns {Promise<Object>} Promise that resolves with result object
 */
async function resetDatabaseToDemoData() {
    try {
        console.log('🔄 Resetting database to demo data...');
        
        // Delete existing data
        await firebaseDelete('contacts');
        await firebaseDelete('tasks');
        console.log('🗑️  Existing data deleted');
        
        // Upload fresh demo data
        const result = await uploadAllDemoData(true);
        
        if (result.success) {
            console.log('✅ Database reset to demo data successfully');
            return {
                success: true,
                message: 'Database reset to demo data successfully',
                contacts: result.contacts,
                tasks: result.tasks
            };
        } else {
            throw new Error('Failed to upload demo data after reset');
        }
    } catch (error) {
        console.error('❌ Error resetting database:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Initialize demo data on first load
 * Only uploads if no data exists
 * @returns {Promise<Object>} Promise that resolves with result object
 */
async function initializeDemoDataOnce() {
    try {
        const existsCheck = await checkDemoDataExists();
        
        if (existsCheck.allExist) {
            console.log('✅ Demo data already exists in Firebase');
            console.log(`   - Contacts: ${existsCheck.contactsCount}`);
            console.log(`   - Tasks: ${existsCheck.tasksCount}`);
            return {
                success: true,
                message: 'Demo data already exists',
                skipped: true,
                ...existsCheck
            };
        }
        
        console.log('📦 No demo data found, initializing...');
        return await uploadAllDemoData(false);
    } catch (error) {
        console.error('❌ Error initializing demo data:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Admin function to manage demo data
 * Can be called from browser console
 */
window.demoDataAdmin = {
    check: checkDemoDataExists,
    upload: uploadAllDemoData,
    reset: resetDatabaseToDemoData,
    initialize: initializeDemoDataOnce,
    
    // Helper function to display status
    async status() {
        const status = await checkDemoDataExists();
        console.log('📊 Demo Data Status:');
        console.log('   Contacts:', status.contactsExist ? `✅ ${status.contactsCount}` : '❌ None');
        console.log('   Tasks:', status.tasksExist ? `✅ ${status.tasksCount}` : '❌ None');
        return status;
    },
    
    // Helper function to show available commands
    help() {
        console.log('🛠️  Demo Data Admin Commands:');
        console.log('   demoDataAdmin.status()       - Check current demo data status');
        console.log('   demoDataAdmin.check()        - Check if demo data exists');
        console.log('   demoDataAdmin.upload(force)  - Upload demo data (force=true to overwrite)');
        console.log('   demoDataAdmin.reset()        - Delete all and reset to demo data');
        console.log('   demoDataAdmin.initialize()   - Initialize demo data if not exists');
        console.log('   demoDataAdmin.help()         - Show this help');
    }
};

// Auto-initialize demo data on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Wait a bit for Firebase to be ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const result = await initializeDemoDataOnce();
        
        if (result.success) {
            if (result.skipped) {
                console.log('✅ Demo data loaded from Firebase');
            } else {
                console.log('✅ Demo data initialized in Firebase');
            }
        } else {
            console.warn('⚠️  Failed to initialize demo data:', result.error);
        }
        
        // Show admin commands in console
        console.log('💡 Use demoDataAdmin.help() to see available commands');
    } catch (error) {
        console.error('❌ Error during demo data initialization:', error);
    }
});
