const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.argv.includes('--dev');

// Set the app name (this will show in the menu bar)
app.name = 'Tolog';

// Set custom dock icon for macOS
if (process.platform === 'darwin') {
  try {
    // Use PNG icon for development environment
    const iconPath = path.join(__dirname, 'src/assets/icons/png/icon.png')
    console.log('Loading icon from:', iconPath) // Debug log
    app.dock.setIcon(iconPath)
  } catch (error) {
    console.error('Failed to load icon:', error) // Log any errors loading the icon
  }
}

/**
 * Creates and configures the main application window
 * Sets up window properties, CSP headers, and event handlers
 */
function createWindow() {
  // Create the browser window with specific configurations
  const mainWindow = new BrowserWindow({
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
    icon: path.join(__dirname, 'public/icon.png')
  });

  // Configure Content Security Policy headers
  // Restricts content sources to improve security
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

  // Load the appropriate content based on environment
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173'); // Development server
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html')); // Production build
  }

  // Quit the application when the window is closed
  mainWindow.on('close', () => {
    app.quit();
  });
}

// Initialize the app and create the main window when Electron is ready
app.whenReady().then(createWindow);

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  // On macOS, it's common to keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Create a new window if none exists when the app is activated
// This is common on macOS when clicking the dock icon
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Add this with your other IPC handlers
ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory']
  })
  
  return {
    canceled: result.canceled,
    filePath: result.filePaths[0]
  }
}) 