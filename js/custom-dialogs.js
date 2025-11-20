/**
 * Custom Dialog System
 * Replaces native alert(), confirm(), and prompt() with beautiful custom overlays
 */

/**
 * Show custom alert dialog
 * @param {string} message - Alert message
 * @param {string} type - Dialog type ('success', 'error', 'warning', 'info')
 * @returns {Promise<void>}
 */
function showAlert(message, type = 'info') {
    return new Promise((resolve) => {
        // Remove any existing dialogs
        removeExistingDialogs();
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-dialog-overlay';
        
        // Create dialog container
        const dialog = document.createElement('div');
        dialog.className = `custom-dialog custom-alert ${type}`;
        
        // Get icon based on type
        const icon = getDialogIcon(type);
        
        // Dialog content
        dialog.innerHTML = `
            <div class="dialog-header">
                <div class="dialog-icon ${type}">
                    ${icon}
                </div>
            </div>
            <div class="dialog-body">
                <p class="dialog-message">${message}</p>
            </div>
            <div class="dialog-footer">
                <button class="dialog-btn dialog-btn-primary" id="alertOkBtn">OK</button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Trigger animation
        setTimeout(() => {
            overlay.classList.add('show');
            dialog.classList.add('show');
        }, 10);
        
        // Handle OK button
        const okBtn = dialog.querySelector('#alertOkBtn');
        okBtn.addEventListener('click', () => {
            closeDialog(overlay, dialog, resolve);
        });
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeDialog(overlay, dialog, resolve);
            }
        });
        
        // Close on ESC key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', escHandler);
                closeDialog(overlay, dialog, resolve);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // Focus OK button
        setTimeout(() => okBtn.focus(), 100);
    });
}

/**
 * Show custom confirm dialog
 * @param {string} message - Confirm message
 * @param {Function} onConfirm - Callback for confirm action
 * @param {Function} onCancel - Callback for cancel action (optional)
 * @returns {Promise<boolean>}
 */
function showConfirm(message, onConfirm = null, onCancel = null) {
    return new Promise((resolve) => {
        // Remove any existing dialogs
        removeExistingDialogs();
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-dialog-overlay';
        
        // Create dialog container
        const dialog = document.createElement('div');
        dialog.className = 'custom-dialog custom-confirm';
        
        // Dialog content
        dialog.innerHTML = `
            <div class="dialog-header">
                <div class="dialog-icon warning">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
            </div>
            <div class="dialog-body">
                <p class="dialog-message">${message}</p>
            </div>
            <div class="dialog-footer">
                <button class="dialog-btn dialog-btn-secondary" id="confirmCancelBtn">Cancel</button>
                <button class="dialog-btn dialog-btn-primary" id="confirmOkBtn">Confirm</button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Trigger animation
        setTimeout(() => {
            overlay.classList.add('show');
            dialog.classList.add('show');
        }, 10);
        
        // Handle Cancel button
        const cancelBtn = dialog.querySelector('#confirmCancelBtn');
        cancelBtn.addEventListener('click', () => {
            if (onCancel) onCancel();
            closeDialog(overlay, dialog, () => resolve(false));
        });
        
        // Handle Confirm button
        const okBtn = dialog.querySelector('#confirmOkBtn');
        okBtn.addEventListener('click', () => {
            if (onConfirm) onConfirm();
            closeDialog(overlay, dialog, () => resolve(true));
        });
        
        // Close on overlay click (acts as cancel)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                if (onCancel) onCancel();
                closeDialog(overlay, dialog, () => resolve(false));
            }
        });
        
        // Close on ESC key (acts as cancel)
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', escHandler);
                if (onCancel) onCancel();
                closeDialog(overlay, dialog, () => resolve(false));
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // Focus Confirm button
        setTimeout(() => okBtn.focus(), 100);
    });
}

/**
 * Show custom prompt dialog
 * @param {string} message - Prompt message
 * @param {string} defaultValue - Default input value
 * @returns {Promise<string|null>}
 */
function showPrompt(message, defaultValue = '') {
    return new Promise((resolve) => {
        // Remove any existing dialogs
        removeExistingDialogs();
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-dialog-overlay';
        
        // Create dialog container
        const dialog = document.createElement('div');
        dialog.className = 'custom-dialog custom-prompt';
        
        // Dialog content
        dialog.innerHTML = `
            <div class="dialog-header">
                <h3 class="dialog-title">${message}</h3>
            </div>
            <div class="dialog-body">
                <input type="text" class="dialog-input" id="promptInput" value="${defaultValue}" placeholder="Enter value...">
            </div>
            <div class="dialog-footer">
                <button class="dialog-btn dialog-btn-secondary" id="promptCancelBtn">Cancel</button>
                <button class="dialog-btn dialog-btn-primary" id="promptOkBtn">OK</button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Trigger animation
        setTimeout(() => {
            overlay.classList.add('show');
            dialog.classList.add('show');
        }, 10);
        
        const input = dialog.querySelector('#promptInput');
        const cancelBtn = dialog.querySelector('#promptCancelBtn');
        const okBtn = dialog.querySelector('#promptOkBtn');
        
        // Handle Cancel button
        cancelBtn.addEventListener('click', () => {
            closeDialog(overlay, dialog, () => resolve(null));
        });
        
        // Handle OK button
        okBtn.addEventListener('click', () => {
            const value = input.value.trim();
            closeDialog(overlay, dialog, () => resolve(value || null));
        });
        
        // Handle Enter key in input
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = input.value.trim();
                closeDialog(overlay, dialog, () => resolve(value || null));
            }
        });
        
        // Close on overlay click (acts as cancel)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeDialog(overlay, dialog, () => resolve(null));
            }
        });
        
        // Close on ESC key (acts as cancel)
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', escHandler);
                closeDialog(overlay, dialog, () => resolve(null));
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // Focus input and select text
        setTimeout(() => {
            input.focus();
            input.select();
        }, 100);
    });
}

/**
 * Close dialog with animation
 * @param {HTMLElement} overlay - Overlay element
 * @param {HTMLElement} dialog - Dialog element
 * @param {Function} callback - Callback function
 */
function closeDialog(overlay, dialog, callback) {
    overlay.classList.remove('show');
    dialog.classList.remove('show');
    
    setTimeout(() => {
        overlay.remove();
        if (callback) callback();
    }, 300);
}

/**
 * Remove any existing dialogs
 */
function removeExistingDialogs() {
    const existingOverlays = document.querySelectorAll('.custom-dialog-overlay');
    existingOverlays.forEach(overlay => overlay.remove());
}

/**
 * Get icon SVG based on dialog type
 * @param {string} type - Dialog type
 * @returns {string} SVG icon
 */
function getDialogIcon(type) {
    const icons = {
        success: `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        `,
        error: `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
        `,
        warning: `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
        `,
        info: `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
        `
    };
    
    return icons[type] || icons.info;
}
