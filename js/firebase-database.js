/**
 * Firebase Database Helper Functions
 * This file provides utility functions for Firebase Realtime Database operations
 */

/**
 * Save data to Firebase
 * @param {string} path - Path in the database
 * @param {any} data - Data to save
 * @returns {Promise} Promise that resolves when data is saved
 */
async function firebaseSave(path, data) {
    try {
        const ref = getDatabaseRef(path);
        await ref.set(data);
        console.log(`✅ Data saved to Firebase: ${path}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Error saving to Firebase (${path}):`, error);
        return { success: false, error: error };
    }
}

/**
 * Get data from Firebase
 * @param {string} path - Path in the database
 * @returns {Promise<any>} Promise that resolves with the data
 */
async function firebaseGet(path) {
    try {
        const ref = getDatabaseRef(path);
        const snapshot = await ref.once('value');
        const data = snapshot.val();
        console.log(`✅ Data retrieved from Firebase: ${path}`);
        return data;
    } catch (error) {
        console.error(`❌ Error getting from Firebase (${path}):`, error);
        return null;
    }
}

/**
 * Update data in Firebase
 * @param {string} path - Path in the database
 * @param {Object} updates - Object containing fields to update
 * @returns {Promise} Promise that resolves when data is updated
 */
async function firebaseUpdate(path, updates) {
    try {
        const ref = getDatabaseRef(path);
        await ref.update(updates);
        console.log(`✅ Data updated in Firebase: ${path}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Error updating Firebase (${path}):`, error);
        return { success: false, error: error };
    }
}

/**
 * Delete data from Firebase
 * @param {string} path - Path in the database
 * @returns {Promise} Promise that resolves when data is deleted
 */
async function firebaseDelete(path) {
    try {
        const ref = getDatabaseRef(path);
        await ref.remove();
        console.log(`✅ Data deleted from Firebase: ${path}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Error deleting from Firebase (${path}):`, error);
        return { success: false, error: error };
    }
}

/**
 * Push new data to Firebase (generates unique key)
 * @param {string} path - Path in the database
 * @param {any} data - Data to push
 * @returns {Promise<string>} Promise that resolves with the generated key
 */
async function firebasePush(path, data) {
    try {
        const ref = getDatabaseRef(path);
        const newRef = await ref.push(data);
        console.log(`✅ Data pushed to Firebase: ${path}`);
        return { success: true, key: newRef.key };
    } catch (error) {
        console.error(`❌ Error pushing to Firebase (${path}):`, error);
        return { success: false, error: error };
    }
}

/**
 * Listen for changes to data in Firebase
 * @param {string} path - Path in the database
 * @param {Function} callback - Callback function to handle data changes
 */
function firebaseListen(path, callback) {
    try {
        const ref = getDatabaseRef(path);
        ref.on('value', function(snapshot) {
            const data = snapshot.val();
            callback(data);
        });
        console.log(`👂 Listening to Firebase: ${path}`);
    } catch (error) {
        console.error(`❌ Error listening to Firebase (${path}):`, error);
    }
}

/**
 * Stop listening to Firebase changes
 * @param {string} path - Path in the database
 */
function firebaseStopListening(path) {
    try {
        const ref = getDatabaseRef(path);
        ref.off();
        console.log(`🔇 Stopped listening to Firebase: ${path}`);
    } catch (error) {
        console.error(`❌ Error stopping Firebase listener (${path}):`, error);
    }
}

/**
 * Get all items from a collection in Firebase
 * @param {string} path - Path to the collection
 * @returns {Promise<Array>} Promise that resolves with array of items
 */
async function firebaseGetCollection(path) {
    try {
        const data = await firebaseGet(path);
        if (!data) {
            return [];
        }
        
        // Convert object to array
        const items = Object.keys(data).map(key => ({
            ...data[key],
            firebaseKey: key
        }));
        
        return items;
    } catch (error) {
        console.error(`❌ Error getting collection from Firebase (${path}):`, error);
        return [];
    }
}

/**
 * Save a collection to Firebase
 * @param {string} path - Path to save the collection
 * @param {Array} items - Array of items to save
 * @returns {Promise} Promise that resolves when collection is saved
 */
async function firebaseSaveCollection(path, items) {
    try {
        // Convert array to object with IDs as keys
        const dataObject = {};
        items.forEach(item => {
            const itemId = item.id || item.firebaseKey;
            if (itemId) {
                const { firebaseKey, ...itemData } = item;
                dataObject[itemId] = itemData;
            }
        });
        
        return await firebaseSave(path, dataObject);
    } catch (error) {
        console.error(`❌ Error saving collection to Firebase (${path}):`, error);
        return { success: false, error: error };
    }
}

/**
 * Migrate data from localStorage to Firebase
 * @param {string} localStorageKey - Key in localStorage
 * @param {string} firebasePath - Path in Firebase
 * @returns {Promise} Promise that resolves when migration is complete
 */
async function migrateToFirebase(localStorageKey, firebasePath) {
    try {
        // Get data from localStorage
        const localData = localStorage.getItem(localStorageKey);
        
        if (localData) {
            const parsedData = JSON.parse(localData);
            
            // Check if Firebase already has data
            const firebaseData = await firebaseGet(firebasePath);
            
            if (!firebaseData || Object.keys(firebaseData).length === 0) {
                // Firebase is empty, migrate from localStorage
                await firebaseSave(firebasePath, parsedData);
                console.log(`✅ Migrated ${localStorageKey} to Firebase: ${firebasePath}`);
            } else {
                console.log(`ℹ️  Firebase already has data at ${firebasePath}, skipping migration`);
            }
        }
        
        return { success: true };
    } catch (error) {
        console.error(`❌ Error migrating to Firebase:`, error);
        return { success: false, error: error };
    }
}

/**
 * Initialize Firebase with localStorage fallback
 * This ensures the app works even if Firebase is not available
 */
function initFirebaseWithFallback() {
    // Check if Firebase is initialized
    if (!isFirebaseInitialized) {
        console.warn('⚠️  Firebase not initialized, using localStorage as fallback');
        return false;
    }
    return true;
}

/**
 * Check if Firebase is available and connected
 * @returns {Promise<boolean>} Promise that resolves with connection status
 */
async function checkFirebaseConnection() {
    try {
        const connectedRef = getDatabaseRef('.info/connected');
        const snapshot = await connectedRef.once('value');
        return snapshot.val() === true;
    } catch (error) {
        console.error('❌ Error checking Firebase connection:', error);
        return false;
    }
}
