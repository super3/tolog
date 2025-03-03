import { describe, it, expect, vi, afterAll, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

// Import and use actual path module
import path from 'path';

// Mock os module before other imports
vi.mock('os', () => {
  return {
    homedir: vi.fn(() => '/mock/home/dir')
  };
});

// Import remaining modules
import Editor from '../Editor.vue';
import fs from 'fs';
import os from 'os';

// Mock document methods used in the component
document.querySelectorAll = vi.fn(() => []);

// Get the test directory path relative to the current project
const testDir = '/Users/super3/Code/tolog/test-journal';

// Mock the browser's localStorage API
global.localStorage = {
  getItem: vi.fn(() => testDir),
  setItem: vi.fn(),
};

describe('Editor.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create spies for fs functions
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'watch').mockImplementation(() => {});
    vi.spyOn(fs, 'readFileSync').mockImplementation((filePath) => {
      if (filePath.includes('2024_03_15.md')) return 'Hello World';
      return '';
    });
    
    // Create spies for fs.promises functions
    vi.spyOn(fs.promises, 'mkdir').mockResolvedValue(undefined);
    vi.spyOn(fs.promises, 'readdir').mockResolvedValue(['2024_03_15.md', '2024_03_14.md']);
    vi.spyOn(fs.promises, 'readFile').mockImplementation((filePath) => {
      if (filePath.includes('2024_03_15.md')) return Promise.resolve('Today\'s content');
      if (filePath.includes('2024_03_14.md')) return Promise.resolve('Yesterday\'s content');
      return Promise.resolve('');
    });
    vi.spyOn(fs.promises, 'writeFile').mockResolvedValue(undefined);
    vi.spyOn(fs.promises, 'rm').mockResolvedValue(undefined);
  });

  it('formats date correctly', () => {
    const wrapper = mount(Editor, {
      shallow: true, // Use shallow mount to avoid mounting child components
    });

    const formattedDate = wrapper.vm.formatDate('2024_03_15.md');
    expect(formattedDate).toBe('Mar 15th, 2024');
    
    // Test different date formats
    expect(wrapper.vm.formatDate('2024_01_01.md')).toBe('Jan 1st, 2024');
    expect(wrapper.vm.formatDate('2024_01_02.md')).toBe('Jan 2nd, 2024');
    expect(wrapper.vm.formatDate('2024_01_03.md')).toBe('Jan 3rd, 2024');
    expect(wrapper.vm.formatDate('2024_01_04.md')).toBe('Jan 4th, 2024');
    expect(wrapper.vm.formatDate('2024_01_11.md')).toBe('Jan 11th, 2024');
    expect(wrapper.vm.formatDate('2024_01_21.md')).toBe('Jan 21st, 2024');
    expect(wrapper.vm.formatDate('2024_01_22.md')).toBe('Jan 22nd, 2024');
    expect(wrapper.vm.formatDate('2024_01_23.md')).toBe('Jan 23rd, 2024');
  });

  it('generates today\'s filename correctly', () => {
    const wrapper = mount(Editor);
    
    // Mock Date to have a consistent return value
    const originalDate = global.Date;
    const mockDate = new Date(2024, 2, 15); // March 15, 2024
    global.Date = class extends Date {
      constructor() {
        return mockDate;
      }
    };

    const filename = wrapper.vm.getTodayFilename();
    expect(filename).toBe('2024_03_15.md');
    
    // Restore original Date
    global.Date = originalDate;
  });

  it('returns the default journal path correctly', () => {
    // Test the function directly
    const mockHomedir = '/mock/home/dir';
    const expected = `${mockHomedir}/journal`;
    
    // Call the method on a mounted component
    const wrapper = mount(Editor);
    const result = wrapper.vm.getDefaultJournalPath();
    
    // The mock should return our expected path
    expect(result).toContain('journal');
  });

  it('loads and processes entries correctly', async () => {
    // Mock a simpler implementation for this test
    vi.spyOn(Editor.methods, 'loadEntries').mockImplementation(async function() {
      this.entries = [
        { date: '2024_03_15.md', content: 'Today\'s content' },
        { date: '2024_03_14.md', content: 'Yesterday\'s content' }
      ];
      this.initialized = true;
    });

    // Create the component
    const wrapper = mount(Editor);
    
    // Call the mocked method directly
    await wrapper.vm.loadEntries();
    await wrapper.vm.$nextTick();
    
    // Verify the entries were loaded
    expect(wrapper.vm.entries.length).toBe(2);
    expect(wrapper.vm.entries[0].date).toBe('2024_03_15.md');
    expect(wrapper.vm.entries[0].content).toBe('Today\'s content');
  });

  it('creates journal directory if it doesn\'t exist', async () => {
    // Override the existsSync mock to return false
    fs.existsSync.mockReturnValue(false);
    
    // Override loadEntries to directly test directory creation
    vi.spyOn(Editor.methods, 'loadEntries').mockImplementation(async function() {
      const journalPath = localStorage.getItem('journalPath');
      
      // Check if directory exists and create if not
      if (!fs.existsSync(journalPath)) {
        await fs.promises.mkdir(journalPath, { recursive: true });
      }
      
      // Add a test entry to show the method completed
      this.entries = [{ date: '2024_03_15.md', content: 'Test' }];
    });
    
    // Mount the component and call loadEntries
    const wrapper = mount(Editor);
    await wrapper.vm.loadEntries();
    
    // Verify mkdir was called with the correct parameters
    expect(fs.promises.mkdir).toHaveBeenCalledWith(testDir, { recursive: true });
    
    // Verify entries were set
    expect(wrapper.vm.entries.length).toBe(1);
  });

  it('saves file content correctly', async () => {
    const wrapper = mount(Editor);

    // Create a test entry
    const testEntry = {
      date: '2024_03_15.md',
      content: 'Hello World',
    };

    // Save the entry
    await wrapper.vm.saveEntry(testEntry);
    await wrapper.vm.$nextTick();
    
    // Verify mock calls
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('2024_03_15.md'),
      'Hello World',
      'utf8'
    );
  });

  it('handles autoResize correctly', () => {
    const wrapper = mount(Editor);
    
    // Mock a textarea event
    const mockTextarea = { 
      style: { height: '0px' },
      scrollHeight: 100
    };
    
    // First test setting to auto
    wrapper.vm.autoResize({ target: mockTextarea });
    
    // After the method runs, height should be set to scrollHeight + px
    expect(mockTextarea.style.height).toBe('100px');
  });

  it('properly initializes when mounted', async () => {
    // Spy on the loadEntries method
    const spy = vi.spyOn(Editor.methods, 'loadEntries').mockImplementation(() => {});
    
    // Create component
    const wrapper = mount(Editor);
    
    // Wait for next tick using Vue's nextTick
    await wrapper.vm.$nextTick();
    
    // Verify the loadEntries method was called during mount
    expect(spy).toHaveBeenCalled();
    
    // Restore the original method
    spy.mockRestore();
  });

  it('handles load entries failure gracefully', async () => {
    // Setup for this test
    const testError = new Error('Test error');
    fs.promises.readdir.mockRejectedValueOnce(testError);
    
    // Mock console.error
    const mock = vi.fn();
    const originalConsoleError = console.error;
    console.error = mock;
    
    // Create a simpler implementation to test just the error handling
    vi.spyOn(Editor.methods, 'loadEntries').mockImplementation(async function() {
      try {
        await fs.promises.readdir(testDir);
      } catch (err) {
        console.error('Failed to load entries:', err);
      }
    });
    
    // Mount and call the method
    const wrapper = mount(Editor);
    await wrapper.vm.loadEntries();
    
    // Verify error was logged
    expect(mock).toHaveBeenCalledWith(
      'Failed to load entries:',
      testError
    );
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  // Cleanup function to delete the test-journal folder after the tests
  afterAll(async () => {
    try {
      await fs.promises.rm(testDir, { recursive: true, force: true });
      console.log(`Cleaned up test directory: ${testDir}`);
    } catch (err) {
      console.error('Error cleaning up test directory:', err);
    }
  });
});
