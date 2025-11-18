
/* Tasks Management Module - Firebase Integration */

/**
 * Get tasks from Firebase
 * @returns {Promise<Array>} Promise that resolves with array of task objects
 */
async function getTasks() {
    try {
        const tasksData = await firebaseGet('tasks');
        if (!tasksData) {
            return [];
        }
        
        // Convert Firebase object to array
        const tasksArray = Object.keys(tasksData).map(key => ({
            ...tasksData[key],
            id: tasksData[key].id || key
        }));
        
        return tasksArray;
    } catch (error) {
        console.error('Error getting tasks:', error);
        // Fallback to localStorage
        const tasksJson = localStorage.getItem('tasks');
        return tasksJson ? JSON.parse(tasksJson) : [];
    }
}

/**
 * Save tasks to Firebase
 * @param {Array} tasks - Array of task objects
 * @returns {Promise} Promise that resolves when tasks are saved
 */
async function saveTasks(tasks) {
    try {
        // Convert array to object with task IDs as keys
        const tasksObject = {};
        tasks.forEach(task => {
            tasksObject[task.id] = task;
        });
        
        await firebaseSave('tasks', tasksObject);
        
        // Also save to localStorage as backup
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks:', error);
        // Fallback to localStorage only
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

/**
 * Create a new task
 * @param {Object} taskData - Task data object
 * @returns {Promise<Object>} Promise that resolves with created task object
 */
async function createTask(taskData) {
    const task = {
        id: generateId(),
        title: taskData.title,
        description: taskData.description || '',
        category: taskData.category,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        status: taskData.status || 'to-do',
        assignedTo: taskData.assignedTo || [],
        subtasks: taskData.subtasks || [],
        createdAt: new Date().toISOString(),
        createdBy: getCurrentUser()?.id || 'guest',
        updatedAt: new Date().toISOString()
    };
    
    const tasks = await getTasks();
    tasks.push(task);
    await saveTasks(tasks);
    
    return task;
}

/**
 * Update an existing task
 * @param {string} taskId - Task ID
 * @param {Object} updates - Object containing fields to update
 * @returns {Promise<Object|null>} Promise that resolves with updated task object or null if not found
 */
async function updateTask(taskId, updates) {
    const tasks = await getTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
        return null;
    }
    
    // Update the task
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    
    await saveTasks(tasks);
    return tasks[taskIndex];
}

/**
 * Delete a task
 * @param {string} taskId - Task ID
 * @returns {Promise<boolean>} Promise that resolves with true if task was deleted, false if not found
 */
async function deleteTask(taskId) {
    const tasks = await getTasks();
    const initialLength = tasks.length;
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    
    if (filteredTasks.length !== initialLength) {
        await saveTasks(filteredTasks);
        return true;
    }
    
    return false;
}

/**
 * Get task by ID
 * @param {string} taskId - Task ID
 * @returns {Promise<Object|null>} Promise that resolves with task object or null if not found
 */
async function getTaskById(taskId) {
    const tasks = await getTasks();
    return tasks.find(task => task.id === taskId) || null;
}

/**
 * Get tasks by status
 * @param {string} status - Task status
 * @returns {Promise<Array>} Promise that resolves with array of tasks with the specified status
 */
async function getTasksByStatus(status) {
    const tasks = await getTasks();
    return tasks.filter(task => task.status === status);
}

/**
 * Search tasks by title and description
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Promise that resolves with array of matching tasks
 */
async function searchTasks(searchTerm) {
    const tasks = await getTasks();
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        return tasks;
    }
    
    return tasks.filter(task => 
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term)
    );
}

/**
 * Get task statistics for summary page
 * @returns {Promise<Object>} Promise that resolves with object containing task statistics
 */
async function getTaskStatistics() {
    const tasks = await getTasks();
    
    const stats = {
        total: tasks.length,
        todo: tasks.filter(task => task.status === 'to-do').length,
        inProgress: tasks.filter(task => task.status === 'in-progress').length,
        awaitFeedback: tasks.filter(task => task.status === 'await-feedback').length,
        done: tasks.filter(task => task.status === 'done').length,
        urgent: tasks.filter(task => task.priority === 'urgent').length,
        nextDeadline: null
    };
    
    // Find next deadline for urgent tasks
    const urgentTasks = tasks.filter(task => 
        task.priority === 'urgent' && 
        task.status !== 'done' &&
        task.dueDate
    );
    
    if (urgentTasks.length > 0) {
        const sortedByDate = urgentTasks.sort((a, b) => 
            new Date(a.dueDate) - new Date(b.dueDate)
        );
        stats.nextDeadline = sortedByDate[0].dueDate;
    }
    
    return stats;
}

/**
 * Toggle subtask completion
 * @param {string} taskId - Task ID
 * @param {string} subtaskId - Subtask ID
 * @returns {Promise<Object|null>} Promise that resolves with updated task object or null if not found
 */
async function toggleSubtask(taskId, subtaskId) {
    const tasks = await getTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task || !task.subtasks) {
        return null;
    }
    
    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) {
        return null;
    }
    
    subtask.completed = !subtask.completed;
    task.updatedAt = new Date().toISOString();
    
    await saveTasks(tasks);
    return task;
}

/**
 * Initialize demo tasks if none exist
 * @returns {Promise} Promise that resolves when initialization is complete
 */
async function initializeDemoTasks() {
    const tasks = await getTasks();
    
    if (tasks.length === 0) {
        const contacts = await getContacts();
        
        // Use actual contact IDs from the demo contacts
        const contactIds = contacts.length >= 2 ? 
            [contacts[0].id, contacts[1].id] : 
            ['contact_demo_1', 'contact_demo_2'];
        
        const demoTasks = [
            {
                id: 'task_demo_1',
                title: 'CSS Architecture Planning',
                description: 'Define CSS naming conventions, create style guide, and establish component structure for scalable styling.',
                category: 'Technical Task',
                dueDate: '2025-12-25',
                priority: 'medium',
                status: 'in-progress',
                assignedTo: contactIds,
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
                createdAt: new Date().toISOString(),
                createdBy: 'user_demo_1',
                updatedAt: new Date().toISOString()
            },
            {
                id: 'task_demo_2',
                title: 'User Registration Flow',
                description: 'Implement complete user registration with validation, email verification, and welcome sequence.',
                category: 'User Story',
                dueDate: '2025-12-20',
                priority: 'urgent',
                status: 'to-do',
                assignedTo: [contactIds[0]],
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
                createdAt: new Date().toISOString(),
                createdBy: 'user_demo_1',
                updatedAt: new Date().toISOString()
            },
            {
                id: 'task_demo_3',
                title: 'Database Optimization',
                description: 'Optimize database queries and implement caching for better performance.',
                category: 'Technical Task',
                dueDate: '2025-12-30',
                priority: 'low',
                status: 'await-feedback',
                assignedTo: contacts.length >= 2 ? [contactIds[1]] : ['contact_demo_2'],
                subtasks: [],
                createdAt: new Date().toISOString(),
                createdBy: 'user_demo_2',
                updatedAt: new Date().toISOString()
            },
            {
                id: 'task_demo_4',
                title: 'Mobile App Testing',
                description: 'Comprehensive testing of mobile app functionality across different devices and operating systems.',
                category: 'User Story',
                dueDate: '2025-12-15',
                priority: 'medium',
                status: 'done',
                assignedTo: contactIds,
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
                createdAt: new Date().toISOString(),
                createdBy: 'user_demo_2',
                updatedAt: new Date().toISOString()
            }
        ];
        
        await saveTasks(demoTasks);
        console.log('✅ Demo tasks initialized with correct contact IDs');
    }
}
