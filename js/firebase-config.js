/**
 * Firebase Configuration and Initialization
 * This file initializes Firebase with the provided database URL
 */

// Firebase configuration object
const firebaseConfig = {
    databaseURL: "https://join-alone-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
let firebaseApp;
let database;
let isFirebaseInitialized = false;

/**
 * Initialize Firebase application and database
 */
async function initializeFirebase() {
    try {
        // Check if Firebase is already initialized
        if (isFirebaseInitialized) {
            console.log('Firebase already initialized');
            return;
        }

        // Initialize Firebase app
        firebaseApp = firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        isFirebaseInitialized = true;
        
        console.log('Firebase initialized successfully');
        console.log('Database URL:', firebaseConfig.databaseURL);
        
        // Test connection
        testFirebaseConnection();
        
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        // Use custom dialog if available, otherwise fallback to console error
        if (typeof showAlert === 'function') {
            await showAlert('Firebase initialization failed. Please check your configuration.', 'error');
        }
    }
}

/**
 * Test Firebase connection
 */
function testFirebaseConnection() {
    const testRef = database.ref('.info/connected');
    testRef.on('value', function(snapshot) {
        if (snapshot.val() === true) {
            console.log('✅ Connected to Firebase Realtime Database');
        } else {
            console.log('❌ Not connected to Firebase Realtime Database');
        }
    });
}

/**
 * Get Firebase database reference
 * @returns {firebase.database.Database} Firebase database instance
 */
function getDatabase() {
    if (!isFirebaseInitialized) {
        initializeFirebase();
    }
    return database;
}

/**
 * Get a reference to a specific path in the database
 * @param {string} path - Path in the database
 * @returns {firebase.database.Reference} Database reference
 */
function getDatabaseRef(path) {
    const db = getDatabase();
    return db.ref(path);
}

// Initialize Firebase when the script loads
if (typeof firebase !== 'undefined') {
    initializeFirebase();
} else {
    console.warn('Firebase SDK not loaded yet. Firebase will be initialized when SDK is available.');
}
