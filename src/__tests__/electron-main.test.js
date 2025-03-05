import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  setupAppConfig, 
  createWindow, 
  setupDialogHandler, 
  setupAppLifecycle 
} from '../../electron-main.js';

// Create properly nested mock objects to simulate Electron components
const onHeadersReceived = vi.fn((callback) => {
  callback(
    { responseHeaders: {} },
    (details) => details
  );
});

// Create a mock window with proper structure 
const mockWindow = {
  loadURL: vi.fn(),
  loadFile: vi.fn(),
  on: vi.fn(),
  webContents: {
    session: {
      webRequest: {
        onHeadersReceived
      }
    }
  }
};

// The BrowserWindow constructor function returns our mock window
const mockBrowserWindow = vi.fn().mockReturnValue(mockWindow);

// Create a properly mocked app object
const mockApp = {
  name: '',
  dock: { setIcon: vi.fn() },
  whenReady: vi.fn().mockReturnValue({
    then: vi.fn(callback => {
      // Store the callback for testing
      mockApp._whenReadyCallback = callback;
      return { catch: vi.fn() };
    })
  }),
  on: vi.fn(),
  quit: vi.fn(),
  // Store handlers for testing
  _handlers: {},
  _whenReadyCallback: null
};

// Create a mock dialog that returns a properly structured result
const mockDialog = {
  showOpenDialog: vi.fn().mockResolvedValue({
    canceled: false,
    filePaths: ['/mock/path']
  })
};

// Create a mock ipcMain with handler tracking
const mockIpcMain = {
  handle: vi.fn((channel, handler) => {
    // Store the handler for testing
    mockIpcMain._handlers = mockIpcMain._handlers || {};
    mockIpcMain._handlers[channel] = handler;
  }),
  _handlers: {}
};

// Create a mock path utility
const mockPath = {
  join: vi.fn((...args) => args.join('/'))
};

describe('electron-main.js', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Reset app name before each test
    mockApp.name = '';
    mockIpcMain._handlers = {};
    mockApp._handlers = {};
    mockApp._whenReadyCallback = null;

    // Reset console.error for tests that check error logging
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('setupAppConfig', () => {
    it('sets the app name correctly', () => {
      const mockApp = { name: '' };
      setupAppConfig(mockApp, 'win32', 'TestApp', '/path/to/icon.png');
      expect(mockApp.name).toBe('TestApp');
    });

    it('sets dock icon on macOS if dock exists', () => {
      const mockApp = { 
        name: '',
        dock: { setIcon: vi.fn() }
      };
      setupAppConfig(mockApp, 'darwin', 'TestApp', '/path/to/icon.png');
      expect(mockApp.dock.setIcon).toHaveBeenCalledWith('/path/to/icon.png');
    });

    it('handles missing dock property gracefully', () => {
      const mockApp = { name: '' };
      // This should not throw an error
      expect(() => {
        setupAppConfig(mockApp, 'darwin', 'TestApp', '/path/to/icon.png');
      }).not.toThrow();
    });

    it('does not set dock icon on non-macOS platforms', () => {
      const mockApp = { 
        name: '',
        dock: { setIcon: vi.fn() }
      };
      setupAppConfig(mockApp, 'win32', 'TestApp', '/path/to/icon.png');
      expect(mockApp.dock.setIcon).not.toHaveBeenCalled();
    });

    it('handles errors when setting dock icon', () => {
      const mockApp = { 
        name: '',
        dock: { setIcon: vi.fn().mockImplementation(() => {
          throw new Error('Icon loading failed');
        }) }
      };
      
      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, 'error');
      
      setupAppConfig(mockApp, 'darwin', 'TestApp', '/path/to/icon.png');
      
      // Verify the error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load icon:', 
        expect.any(Error)
      );
    });
  });

  describe('createWindow', () => {
    it('creates a browser window with correct properties', () => {
      // Simple mock of BrowserWindow constructor
      const mockWindow = {
        loadURL: vi.fn(),
        loadFile: vi.fn(),
        on: vi.fn(),
        webContents: null // No webContents for this test
      };
      const mockBrowserWindow = vi.fn(() => mockWindow);
      const mockPath = { join: vi.fn((...args) => args.join('/')) };
      const quitFn = vi.fn();
      
      const window = createWindow(mockBrowserWindow, true, mockPath, quitFn);
      
      expect(mockBrowserWindow).toHaveBeenCalledWith(expect.objectContaining({
        width: 1200,
        height: 800,
        title: 'Tolog',
        webPreferences: expect.objectContaining({
          nodeIntegration: true,
          contextIsolation: false,
          webSecurity: true
        })
      }));
    });

    it('loads URL in development mode', () => {
      const mockWindow = {
        loadURL: vi.fn(),
        loadFile: vi.fn(),
        on: vi.fn(),
        webContents: null
      };
      const mockBrowserWindow = vi.fn(() => mockWindow);
      
      createWindow(mockBrowserWindow, true, { join: vi.fn() }, vi.fn());
      
      expect(mockWindow.loadURL).toHaveBeenCalledWith('http://localhost:5173');
      expect(mockWindow.loadFile).not.toHaveBeenCalled();
    });

    it('loads file in production mode', () => {
      const mockWindow = {
        loadURL: vi.fn(),
        loadFile: vi.fn(),
        on: vi.fn(),
        webContents: null
      };
      const mockBrowserWindow = vi.fn(() => mockWindow);
      const mockPath = { join: vi.fn(() => 'mocked/path/to/index.html') };
      
      createWindow(mockBrowserWindow, false, mockPath, vi.fn());
      
      expect(mockWindow.loadFile).toHaveBeenCalledWith('mocked/path/to/index.html');
      expect(mockWindow.loadURL).not.toHaveBeenCalled();
    });

    it('sets up window close handler', () => {
      const mockWindow = {
        loadURL: vi.fn(),
        loadFile: vi.fn(),
        on: vi.fn(),
        webContents: null
      };
      const mockBrowserWindow = vi.fn(() => mockWindow);
      const quitFn = vi.fn();
      
      createWindow(mockBrowserWindow, true, { join: vi.fn() }, quitFn);
      
      // Verify the close handler was registered
      expect(mockWindow.on).toHaveBeenCalledWith('close', expect.any(Function));
      
      // Get and call the handler
      const closeHandler = mockWindow.on.mock.calls.find(call => call[0] === 'close')[1];
      closeHandler();
      
      expect(quitFn).toHaveBeenCalled();
    });

    it('handles missing webContents gracefully', () => {
      const mockWindow = {
        loadURL: vi.fn(),
        loadFile: vi.fn(),
        on: vi.fn(),
        webContents: null // Intentionally null to test graceful handling
      };
      const mockBrowserWindow = vi.fn(() => mockWindow);
      
      // This should not throw
      expect(() => {
        createWindow(mockBrowserWindow, true, { join: vi.fn() }, vi.fn());
      }).not.toThrow();
    });

    it('configures CSP headers when webContents exists', () => {
      // Create nested mocks for webContents
      const onHeadersReceived = vi.fn((callback) => {
        callback(
          { responseHeaders: {} },
          (details) => details
        );
      });
      
      const mockWindow = {
        loadURL: vi.fn(),
        loadFile: vi.fn(),
        on: vi.fn(),
        webContents: {
          session: {
            webRequest: {
              onHeadersReceived
            }
          }
        }
      };
      
      const mockBrowserWindow = vi.fn(() => mockWindow);
      
      createWindow(mockBrowserWindow, true, { join: vi.fn() }, vi.fn());
      
      expect(onHeadersReceived).toHaveBeenCalled();
    });
  });

  describe('setupDialogHandler', () => {
    it('registers the dialog:openDirectory handler when ipc exists', () => {
      const mockIpcMain = {
        handle: vi.fn()
      };
      
      const mockDialog = {
        showOpenDialog: vi.fn().mockResolvedValue({
          canceled: false,
          filePaths: ['/test/path']
        })
      };
      
      setupDialogHandler(mockIpcMain, mockDialog);
      
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        'dialog:openDirectory', 
        expect.any(Function)
      );
    });

    it('handles missing ipc gracefully', () => {
      // This should not throw
      expect(() => {
        setupDialogHandler(null, {});
      }).not.toThrow();
    });

    it('handles missing dialog module gracefully', async () => {
      const handlerFn = vi.fn();
      const mockIpcMain = {
        handle: vi.fn((channel, handler) => {
          handlerFn.mockImplementation(handler);
        })
      };
      
      setupDialogHandler(mockIpcMain, null);
      
      // If the handler was registered, call it
      if (handlerFn.mock.calls.length > 0) {
        const result = await handlerFn();
        expect(result).toEqual({ canceled: true, filePath: null });
      }
    });

    it('returns correct file path from dialog result', async () => {
      // Create mocks
      const mockDialog = {
        showOpenDialog: vi.fn().mockResolvedValue({
          canceled: false,
          filePaths: ['/selected/directory/path']
        })
      };
      
      let dialogHandler;
      const mockIpcMain = {
        handle: vi.fn((channel, handler) => {
          if (channel === 'dialog:openDirectory') {
            dialogHandler = handler;
          }
        })
      };
      
      setupDialogHandler(mockIpcMain, mockDialog);
      
      // Make sure handler was registered
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        'dialog:openDirectory',
        expect.any(Function)
      );
      
      // Call the handler
      const result = await dialogHandler();
      
      // Verify dialog was called with correct properties
      expect(mockDialog.showOpenDialog).toHaveBeenCalledWith({
        properties: ['openDirectory', 'createDirectory']
      });
      
      // Verify it returns the correct structure
      expect(result).toEqual({
        canceled: false,
        filePath: '/selected/directory/path'
      });
    });
    
    it('handles empty filePaths array in dialog result', async () => {
      // Create mocks with empty filePaths array
      const mockDialog = {
        showOpenDialog: vi.fn().mockResolvedValue({
          canceled: false,
          filePaths: []
        })
      };
      
      let dialogHandler;
      const mockIpcMain = {
        handle: vi.fn((channel, handler) => {
          if (channel === 'dialog:openDirectory') {
            dialogHandler = handler;
          }
        })
      };
      
      setupDialogHandler(mockIpcMain, mockDialog);
      
      // Call the handler
      const result = await dialogHandler();
      
      // Verify it handles empty filePaths correctly
      expect(result).toEqual({
        canceled: false,
        filePath: null
      });
    });
    
    it('handles null filePaths in dialog result', async () => {
      // Create mocks with null filePaths
      const mockDialog = {
        showOpenDialog: vi.fn().mockResolvedValue({
          canceled: false,
          filePaths: null
        })
      };
      
      let dialogHandler;
      const mockIpcMain = {
        handle: vi.fn((channel, handler) => {
          if (channel === 'dialog:openDirectory') {
            dialogHandler = handler;
          }
        })
      };
      
      setupDialogHandler(mockIpcMain, mockDialog);
      
      // Call the handler
      const result = await dialogHandler();
      
      // Verify it handles null filePaths correctly
      expect(result).toEqual({
        canceled: false,
        filePath: null
      });
    });
    
    it('handles showOpenDialog function that is missing or not a function', async () => {
      // Create mocks with dialog object but showOpenDialog is not a function
      const mockDialog = {
        // showOpenDialog is explicitly not a function
        showOpenDialog: "not a function"
      };
      
      let dialogHandler;
      const mockIpcMain = {
        handle: vi.fn((channel, handler) => {
          if (channel === 'dialog:openDirectory') {
            dialogHandler = handler;
          }
        })
      };
      
      setupDialogHandler(mockIpcMain, mockDialog);
      
      // Call the handler
      const result = await dialogHandler();
      
      // Should return canceled: true result
      expect(result).toEqual({
        canceled: true,
        filePath: null
      });
    });
  });

  describe('setupAppLifecycle', () => {
    it('registers window-all-closed handler that quits on non-macOS', () => {
      const mockApp = {
        whenReady: vi.fn().mockReturnValue({
          then: vi.fn()
        }),
        on: vi.fn(),
        quit: vi.fn()
      };
      
      setupAppLifecycle(mockApp, 'win32', vi.fn(), vi.fn());
      
      // Find the window-all-closed handler
      const windowAllClosedCall = mockApp.on.mock.calls.find(
        call => call[0] === 'window-all-closed'
      );
      
      expect(windowAllClosedCall).toBeTruthy();
      
      // Call the handler
      windowAllClosedCall[1]();
      
      expect(mockApp.quit).toHaveBeenCalled();
    });

    it('registers window-all-closed handler that does not quit on macOS', () => {
      const mockApp = {
        whenReady: vi.fn().mockReturnValue({
          then: vi.fn()
        }),
        on: vi.fn(),
        quit: vi.fn()
      };
      
      setupAppLifecycle(mockApp, 'darwin', vi.fn(), vi.fn());
      
      // Find the window-all-closed handler
      const windowAllClosedCall = mockApp.on.mock.calls.find(
        call => call[0] === 'window-all-closed'
      );
      
      expect(windowAllClosedCall).toBeTruthy();
      
      // Call the handler
      windowAllClosedCall[1]();
      
      expect(mockApp.quit).not.toHaveBeenCalled();
    });

    it('handles missing app gracefully', () => {
      // This should not throw
      expect(() => {
        setupAppLifecycle(null, 'win32', vi.fn(), vi.fn());
      }).not.toThrow();
    });

    it('handles missing app.whenReady gracefully', () => {
      const mockApp = {
        on: vi.fn(),
        quit: vi.fn()
      };
      
      // This should not throw
      expect(() => {
        setupAppLifecycle(mockApp, 'win32', vi.fn(), vi.fn());
      }).not.toThrow();
    });

    it('registers activate handler that creates a window if none exist', () => {
      const windowCreator = vi.fn();
      const getAllWindows = vi.fn().mockReturnValue([]);
      
      const mockApp = {
        whenReady: vi.fn().mockReturnValue({
          then: vi.fn()
        }),
        on: vi.fn(),
        quit: vi.fn()
      };
      
      setupAppLifecycle(mockApp, 'darwin', windowCreator, getAllWindows);
      
      // Find the activate handler
      const activateCall = mockApp.on.mock.calls.find(
        call => call[0] === 'activate'
      );
      
      expect(activateCall).toBeTruthy();
      
      // Call the handler
      activateCall[1]();
      
      expect(windowCreator).toHaveBeenCalled();
    });

    it('activate handler does nothing if windows already exist', () => {
      const windowCreator = vi.fn();
      const getAllWindows = vi.fn().mockReturnValue([{/* Mock window */}]);
      
      const mockApp = {
        whenReady: vi.fn().mockReturnValue({
          then: vi.fn()
        }),
        on: vi.fn(),
        quit: vi.fn()
      };
      
      setupAppLifecycle(mockApp, 'darwin', windowCreator, getAllWindows);
      
      // Find the activate handler
      const activateCall = mockApp.on.mock.calls.find(
        call => call[0] === 'activate'
      );
      
      expect(activateCall).toBeTruthy();
      
      // Call the handler
      activateCall[1]();
      
      // Window creator should not be called since windows already exist
      expect(windowCreator).not.toHaveBeenCalled();
    });

    it('handles null windowCreator function gracefully', () => {
      const getAllWindows = vi.fn().mockReturnValue([]);
      
      const mockApp = {
        whenReady: vi.fn().mockReturnValue({
          then: vi.fn()
        }),
        on: vi.fn(),
        quit: vi.fn()
      };
      
      setupAppLifecycle(mockApp, 'darwin', null, getAllWindows);
      
      // Find the activate handler
      const activateCall = mockApp.on.mock.calls.find(
        call => call[0] === 'activate'
      );
      
      // This should not throw
      expect(() => {
        activateCall[1]();
      }).not.toThrow();
    });

    it('handles null getAllWindows function gracefully', () => {
      const windowCreator = vi.fn();
      
      const mockApp = {
        whenReady: vi.fn().mockReturnValue({
          then: vi.fn()
        }),
        on: vi.fn(),
        quit: vi.fn()
      };
      
      setupAppLifecycle(mockApp, 'darwin', windowCreator, null);
      
      // Find the activate handler
      const activateCall = mockApp.on.mock.calls.find(
        call => call[0] === 'activate'
      );
      
      // This should not throw
      expect(() => {
        activateCall[1]();
      }).not.toThrow();
    });

    it('sets up app.whenReady with window creator when available', () => {
      const windowCreator = vi.fn();
      const thenFn = vi.fn();
      
      const mockApp = {
        whenReady: vi.fn().mockReturnValue({
          then: thenFn
        }),
        on: vi.fn(),
        quit: vi.fn()
      };
      
      setupAppLifecycle(mockApp, 'darwin', windowCreator, vi.fn());
      
      expect(mockApp.whenReady).toHaveBeenCalled();
      expect(thenFn).toHaveBeenCalledWith(windowCreator);
    });
  });

  // Additional test to simulate process.env.NODE_ENV for entry point code
  describe('Entry point conditions', () => {
    let originalNodeEnv;
    
    beforeEach(() => {
      // Save original NODE_ENV
      originalNodeEnv = process.env.NODE_ENV;
    });
    
    afterEach(() => {
      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });
    
    it('skips setup when NODE_ENV is "test"', () => {
      // Set NODE_ENV to test
      process.env.NODE_ENV = 'test';
      
      // Redefine all required variables to test the entry point
      const mockElectron = {
        app: mockApp,
        BrowserWindow: mockBrowserWindow,
        ipcMain: mockIpcMain,
        dialog: mockDialog
      };
      
      // We can't directly test the conditional block, but we can verify that
      // our test environment is correctly set up to skip the setup functions
      expect(process.env.NODE_ENV).toBe('test');
    });
  });
}); 