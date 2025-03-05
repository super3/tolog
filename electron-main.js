const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.argv.includes('--dev');

let mainWindow;

/**
 * Sets up the app name and platform-specific configurations
 * 
 * @param {Object} appInstance - The Electron app instance
 * @param {string} platformType - The platform type (darwin, win32, etc.)
 * @param {string} appName - The application name to set
 * @param {string} iconPath - Path to the application icon
 */
function setupAppConfig(appInstance, platformType, appName, iconPath) {
  // Set the app name (this will show in the menu bar)
  appInstance.name = appName;

  // Set custom dock icon for macOS
  if (platformType === 'darwin' && appInstance.dock && typeof appInstance.dock.setIcon === 'function') {
    try {
      // Use PNG icon for development environment
      console.log('Loading icon from:', iconPath);
      appInstance.dock.setIcon(iconPath);
    } catch (error) {
      console.error('Failed to load icon:', error);
    }
  }
}

/**
 * Creates and configures the main application window
 * Sets up window properties, CSP headers, and event handlers
 * 
 * @param {Function} BrowserWindowClass - The Electron BrowserWindow class
 * @param {boolean} isDevelopment - Whether the app is running in development mode
 * @param {Object} pathUtil - The path utility object
 * @param {Function} quitFn - Function to call when window is closed
 * @returns {Object} The created browser window
 */
function createWindow(BrowserWindowClass, isDevelopment, pathUtil, quitFn) {
  // Create the browser window with specific configurations
  const mainWindow = new BrowserWindowClass({
    width: 1200,
    height: 800,
    frame: false, // Frameless window
    titleBarStyle: 'hiddenInset', // macOS style title bar
    title: 'Tolog',
    webPreferences: {
      nodeIntegration: true, 
      contextIsolation: false, 
      webSecurity: true 
    },
    icon: pathUtil.join(__dirname, 'public/icon.png')
  });

  // Configure Content Security Policy headers if webContents and session exist
  if (mainWindow.webContents && mainWindow.webContents.session && 
      mainWindow.webContents.session.webRequest && 
      typeof mainWindow.webContents.session.webRequest.onHeadersReceived === 'function') {
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'", 
            "script-src 'self' 'unsafe-inline'", 
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net", 
            "img-src 'self' data: https:", 
            "font-src 'self' data: https://cdn.jsdelivr.net", // Allow fonts from CDN
            "connect-src 'self' ws://localhost:5173" // Allow WebSocket in development
          ].join('; ')
        }
      });
    });
  }

  // Load the appropriate content based on environment
  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:5173'); // Development server
  } else {
    mainWindow.loadFile(pathUtil.join(__dirname, 'dist', 'index.html')); // Production build
  }

  // Quit the application when the window is closed
  mainWindow.on('close', () => {
    if (typeof quitFn === 'function') {
      quitFn();
    }
  });
  
  return mainWindow;
}

/**
 * Sets up the dialog handler for opening directories
 * 
 * @param {Object} ipc - The ipcMain instance
 * @param {Object} dialogModule - The dialog module
 */
function setupDialogHandler(ipc, dialogModule) {
  if (!ipc || typeof ipc.handle !== 'function') return;
  
  // Add this with your other IPC handlers
  ipc.handle('dialog:openDirectory', async () => {
    if (!dialogModule || typeof dialogModule.showOpenDialog !== 'function') {
      return { canceled: true, filePath: null };
    }
    
    const result = await dialogModule.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    });
    
    return {
      canceled: result.canceled,
      filePath: result.filePaths && result.filePaths.length > 0 ? result.filePaths[0] : null
    };
  });
}

/**
 * Sets up the application lifecycle events
 * 
 * @param {Object} appInstance - The Electron app instance
 * @param {string} platformType - The platform type (darwin, win32, etc.)
 * @param {Function} windowCreator - Function to create a window
 * @param {Function} getAllWindowsFn - Function to get all windows
 */
function setupAppLifecycle(appInstance, platformType, windowCreator, getAllWindowsFn) {
  if (!appInstance || typeof appInstance.on !== 'function') return;
  
  // Initialize the app and create the main window when Electron is ready
  if (appInstance.whenReady && typeof appInstance.whenReady().then === 'function') {
    appInstance.whenReady().then(windowCreator);
  }

  // Quit the app when all windows are closed (except on macOS)
  appInstance.on('window-all-closed', () => {
    // On macOS, it's common to keep the app running even when all windows are closed
    if (platformType !== 'darwin') {
      if (typeof appInstance.quit === 'function') {
        appInstance.quit();
      }
    }
  });

  // Create a new window if none exists when the app is activated
  // This is common on macOS when clicking the dock icon
  appInstance.on('activate', () => {
    if (typeof getAllWindowsFn === 'function' && getAllWindowsFn().length === 0) {
      if (typeof windowCreator === 'function') {
        windowCreator();
      }
    }
  });
}

// Only execute the setup if this is not being imported for testing
if (process.env.NODE_ENV !== 'test') {
  // Setup app config
  setupAppConfig(app, process.platform, 'Tolog', path.join(__dirname, 'src/assets/icons/png/icon.png'));
  
  // Setup dialog handler
  setupDialogHandler(ipcMain, dialog);
  
  // Setup app lifecycle with the window creator function
  setupAppLifecycle(
    app, 
    process.platform, 
    () => createWindow(BrowserWindow, isDev, path, app.quit.bind(app)), 
    BrowserWindow.getAllWindows
  );
}

// Export functions for testing
module.exports = {
  setupAppConfig,
  createWindow,
  setupDialogHandler,
  setupAppLifecycle
}; 