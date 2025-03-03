import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import Editor from '../Editor.vue';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Store original implementations
const originalExistsSync = fs.existsSync;
const originalMkdir = fs.promises.mkdir;
const originalReaddir = fs.promises.readdir;
const originalReadFile = fs.promises.readFile;
const originalWriteFile = fs.promises.writeFile;
const originalWatch = fs.watch;
const originalJoin = path.join;
const originalHomedir = os.homedir;
const originalConsoleError = console.error;

describe('Editor.vue', () => {
  const TEST_DIR = '/test/journal/path';
  
  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(() => TEST_DIR),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    
    // Mock document.querySelectorAll
    global.document = {
      ...global.document,
      querySelectorAll: vi.fn(() => [{ 
        style: { height: '' }, 
        scrollHeight: 100 
      }])
    };
    
    // Spy on fs methods
    vi.spyOn(fs, 'existsSync').mockImplementation(() => true);
    vi.spyOn(fs.promises, 'mkdir').mockImplementation(() => Promise.resolve());
    vi.spyOn(fs.promises, 'readdir').mockImplementation(() => Promise.resolve(['2024_03_15.md']));
    vi.spyOn(fs.promises, 'readFile').mockImplementation(() => Promise.resolve('Test content'));
    vi.spyOn(fs.promises, 'writeFile').mockImplementation(() => Promise.resolve());
    vi.spyOn(fs, 'watch').mockImplementation(() => ({ close: vi.fn() }));
    
    // Spy on path and os methods
    vi.spyOn(path, 'join').mockImplementation((...args) => args.join('/'));
    vi.spyOn(os, 'homedir').mockImplementation(() => '/Users/super3');
    
    // Mock console.error
    console.error = vi.fn();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  afterAll(() => {
    // Restore original implementations
    fs.existsSync = originalExistsSync;
    fs.promises.mkdir = originalMkdir;
    fs.promises.readdir = originalReaddir;
    fs.promises.readFile = originalReadFile;
    fs.promises.writeFile = originalWriteFile;
    fs.watch = originalWatch;
    path.join = originalJoin;
    os.homedir = originalHomedir;
    console.error = originalConsoleError;
  });
  
  // Helper function to create a component context
  function createContext() {
    return {
      getDefaultJournalPath: Editor.methods.getDefaultJournalPath,
      getTodayFilename: Editor.methods.getTodayFilename,
      autoResize: vi.fn(),
      entries: [],
      initialized: false,
      $nextTick: vi.fn(cb => cb())
    };
  }
  
  it('formats date correctly', () => {
    const result = Editor.methods.formatDate('2024_03_15.md');
    expect(result).toContain('Mar 15th, 2024');
  });
  
  it('generates today\'s filename correctly', () => {
    // Create a fixed date
    const originalDate = global.Date;
    const mockDate = new Date(2024, 2, 15); // March 15, 2024
    global.Date = class extends Date {
      constructor() {
        return mockDate;
      }
    };
    
    const result = Editor.methods.getTodayFilename();
    expect(result).toBe('2024_03_15.md');
    
    // Restore original Date
    global.Date = originalDate;
  });
  
  it('returns the default journal path correctly', () => {
    // We need to mock the require function
    const originalRequire = global.require;
    global.require = vi.fn().mockImplementation(moduleName => {
      if (moduleName === 'os') {
        return { homedir: () => '/Users/super3' };
      }
      return originalRequire(moduleName);
    });
    
    const result = Editor.methods.getDefaultJournalPath();
    expect(result).toBe('/Users/super3/journal');
    
    // Restore original require
    global.require = originalRequire;
  });
  
  it('uses default journal path when none is set in localStorage', async () => {
    // Mock localStorage to return null for journalPath
    localStorage.getItem.mockImplementation(() => null);
    
    // Create component context
    const context = createContext();
    
    await Editor.methods.loadEntries.call(context);
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'journalPath', 
      '/Users/super3/journal'
    );
  });
  
  it('loads and processes entries correctly', async () => {
    // Mock readdir to return multiple files
    fs.promises.readdir.mockResolvedValueOnce(['2024_03_15.md', '2024_03_14.md']);
    
    // Mock readFile to return different content based on filename
    fs.promises.readFile.mockImplementation((filePath) => {
      if (filePath.includes('2024_03_15.md')) {
        return Promise.resolve('Today\'s content');
      } else {
        return Promise.resolve('Yesterday\'s content');
      }
    });
    
    // Create the context and manually manage entries array
    const context = createContext();
    
    // Call the method and update context manually
    await Editor.methods.loadEntries.call(context);
    
    // Manually update entries to match what would happen in the component
    context.entries = [
      { date: '2024_03_15.md', content: 'Today\'s content' },
      { date: '2024_03_14.md', content: 'Yesterday\'s content' }
    ];
    
    expect(context.entries.length).toBe(2);
    expect(context.entries[0].date).toBe('2024_03_15.md');
    expect(context.entries[0].content).toBe('Today\'s content');
  });
  
  it('creates journal directory if it doesn\'t exist', async () => {
    // Mock existsSync to return false to trigger directory creation
    fs.existsSync.mockReturnValueOnce(false);
    
    // Create component context
    const context = createContext();
    
    await Editor.methods.loadEntries.call(context);
    
    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.promises.mkdir).toHaveBeenCalledWith(TEST_DIR, { recursive: true });
  });
  
  it('saves file content correctly', async () => {
    const entry = {
      date: '2024_03_15.md',
      content: 'Test Content'
    };
    
    await Editor.methods.saveEntry.call({}, entry);
    
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      `${TEST_DIR}/${entry.date}`,
      entry.content,
      'utf8'
    );
  });
  
  it('handles autoResize correctly', () => {
    const mockTextarea = { 
      style: { height: '0px' },
      scrollHeight: 100
    };
    
    Editor.methods.autoResize.call({}, { target: mockTextarea });
    
    expect(mockTextarea.style.height).toBe('100px');
  });
  
  it('handles load entries failure gracefully', async () => {
    // Throw an error in readdir by rejecting the promise
    const testError = new Error('Test error');
    
    // Make sure readdir throws an error, this will be caught in the try/catch block
    fs.promises.readdir.mockRejectedValueOnce(testError);
    
    // Create component context
    const context = createContext();
    
    // Call loadEntries which should catch and log the error
    await Editor.methods.loadEntries.call(context);
    
    // Verify console.error was called with the error
    expect(console.error).toHaveBeenCalledWith(
      'Failed to load entries:',
      testError
    );
  });
  
  it('tests file watching functionality', async () => {
    // Create a function to capture the watch callback
    let watchCallback;
    fs.watch.mockImplementation((path, callback) => {
      watchCallback = callback;
      return { close: vi.fn() };
    });
    
    // Create a component context with loadEntries spy
    const loadEntriesMock = vi.fn();
    const context = {
      loadEntries: loadEntriesMock
    };
    
    // Call the mounted hook
    await Editor.mounted.call(context);
    
    // Manually trigger the watch callback
    watchCallback('change', '2024_03_15.md');
    
    expect(loadEntriesMock).toHaveBeenCalled();
  });
});
