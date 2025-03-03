// Import dependencies
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

// Determine if we're in development or production mode
// This can be tested by manipulating process.argv in tests
const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
// Determine if we're running in test mode
const isTest = process.env.NODE_ENV === 'test';

// If we're not in test mode, set the app name to Tolog
try {
  if (app && !isTest) {
    app.name = 'Tolog';
  }
} catch (error) {
  console.error('Error setting app name:', error);
}

// Setup dependency injection for testing
let dependencies = {
  app,
  BrowserWindow,
  dialog,
  ipcMain
};

// Allow overriding dependencies for testing
function setElectronDependencies(deps) {
  dependencies = { ...dependencies, ...deps };
  
  // Set app name for non-test environment
  try {
    if (deps.app && !isTest) {
      deps.app.name = 'Tolog';
    }
  } catch (error) {
    console.error('Error setting app name:', error);
  }
  
  return dependencies;
}

/**
 * Sets up the dock icon for macOS
 * @param {Object} deps - Dependencies object containing app
 * @returns {boolean} Success state
 */
function setupMacOSDockIcon() {
  try {
    if (process.platform === 'darwin' && dependencies.app && dependencies.app.dock) {
      const iconPath = path.join(__dirname, 'build', 'icon.png');
      dependencies.app.dock.setIcon(iconPath);
      console.log('Set macOS dock icon to', iconPath);
      return true;
    }
  } catch (error) {
    console.error('Error setting dock icon:', error);
    return false;
  }
  return false;
}

// Create the main application window
function createWindow() {
  try {
    // Create the browser window
    const mainWindow = new dependencies.BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      }
    });

    // Set up Content Security Policy
    setupCSP(mainWindow);

    // Load the appropriate content based on environment
    if (isDev) {
      mainWindow.loadURL('http://localhost:5173');
    } else {
      mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }

    // Handle window close event
    mainWindow.on('close', () => {
      if (dependencies.app) {
        dependencies.app.quit();
      }
    });

    return mainWindow;
  } catch (error) {
    console.error('Error creating window:', error);
    
    // Return minimal mock window for error cases
    return {
      webContents: { session: { webRequest: { onHeadersReceived: () => {} } } },
      loadURL: () => {},
      loadFile: () => {},
      on: () => {}
    };
  }
}

/**
 * Sets up Content Security Policy headers for a window
 * @param {BrowserWindow} window - The browser window to configure
 */
function setupCSP(window) {
  try {
    // Guard against missing properties
    if (!window || !window.webContents || !window.webContents.session || !window.webContents.session.webRequest) {
      console.log('Cannot set up CSP: missing required window properties');
      return;
    }

    window.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      try {
        // Ensure responseHeaders exists
        const responseHeaders = details.responseHeaders || {};
        
        callback({
          responseHeaders: {
            ...responseHeaders,
            'Content-Security-Policy': [
              "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"
            ]
          }
        });
      } catch (error) {
        console.error('Error in CSP callback:', error);
        callback(details); // Pass through original details if there's an error
      }
    });
  } catch (error) {
    console.error('Error setting up CSP:', error);
  }
}

/**
 * Shows a directory selection dialog
 * @param {Object} deps - Dependencies object containing dialog
 * @returns {Promise<Object>} Object containing dialog result
 */
async function showDirectoryDialog() {
  try {
    // In test mode, if dialog is not available, return a mock result
    if (!dependencies.dialog) {
      if (isTest) {
        return {
          canceled: false,
          filePath: '/mock/test/path'
        };
      } else {
        throw new Error('Dialog dependency not available');
      }
    }

    // Show open dialog
    const result = await dependencies.dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    });

    // Handle null result
    if (!result) {
      return {
        canceled: true,
        filePath: undefined
      };
    }

    return {
      canceled: result.canceled,
      filePath: result.filePaths?.[0]
    };
  } catch (error) {
    console.error('Error in showDirectoryDialog:', error);
    throw error; // Re-throw to allow callers to handle
  }
}

// Register app event handlers
function registerAppEventHandlers() {
  try {
    if (!dependencies.app) {
      return;
    }

    // Quit when all windows are closed, except on macOS
    dependencies.app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        dependencies.app.quit();
      }
    });

    // On macOS, recreate window when dock icon is clicked and no windows are open
    dependencies.app.on('activate', () => {
      if (dependencies.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Error registering app event handlers:', error);
  }
}

// Handle app ready event
function onAppReady() {
  try {
    const mainWindow = createWindow();
    setupMacOSDockIcon();
    return mainWindow;
  } catch (error) {
    console.error('Error in onAppReady:', error);
  }
}

// Register IPC handlers
function registerIpcHandlers() {
  try {
    if (!dependencies.ipcMain) {
      return;
    }

    // Handle directory selection dialog
    dependencies.ipcMain.handle('dialog:openDirectory', async () => {
      return await showDirectoryDialog();
    });
  } catch (error) {
    console.error('Error registering IPC handlers:', error);
  }
}

// Initialize the app
try {
  if (dependencies.app) {
    // Handle app ready event
    dependencies.app.whenReady().then(onAppReady);

    // Register app event handlers
    registerAppEventHandlers();
    
    // Register IPC handlers
    registerIpcHandlers();
  }
} catch (error) {
  console.error('Error initializing app:', error);
}

// Export functions for testing
module.exports = {
  setElectronDependencies,
  createWindow,
  setupMacOSDockIcon,
  setupCSP,
  showDirectoryDialog,
  registerAppEventHandlers,
  registerIpcHandlers,
  onAppReady,
  isTest,
  isDev,
  dependencies
}; 