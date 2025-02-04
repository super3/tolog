const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.argv.includes('--dev');

// Set the app name (this will show in the menu bar)
app.name = 'Tolog';

if (process.platform === 'darwin') {
  try {
    // Use PNG for development
    const iconPath = path.join(__dirname, 'src/assets/icons/png/icon.png')
    console.log('Loading icon from:', iconPath) // Debug log
    app.dock.setIcon(iconPath)
  } catch (error) {
    console.error('Failed to load icon:', error) // Error handling
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    titleBarStyle: 'hiddenInset',
    title: 'Tolog',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true
    },
    icon: path.join(__dirname, 'public/icon.png')
  });

  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
          "img-src 'self' data: https:",
          "font-src 'self' data: https://cdn.jsdelivr.net",
          "connect-src 'self' ws://localhost:5173"
        ].join('; ')
      }
    });
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Handle window close event
  mainWindow.on('close', () => {
    app.quit();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

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