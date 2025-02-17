import { describe, it, expect, vi, afterAll } from 'vitest';
import { mount } from '@vue/test-utils';
import Editor from '../Editor.vue';
import path from 'path';
import fs from 'fs';

// Mock document methods used in the component
document.querySelectorAll = vi.fn(() => []);

// Track file writes
const mockWriteFile = vi.fn((...args) => {
  console.log('🚀 mockWriteFile called with:', args);
});

// Get the test directory path relative to the current project
const testDir = path.join(process.cwd(), 'test-journal');

// Mock the Node.js 'path' module
vi.mock('path', () => ({
  default: {
    join: (...args) => args.join('/'), // Mock path joining with forward slashes
  },
}));

// Mock the Node.js 'os' module
vi.mock('os', () => ({
  default: {
    homedir: () => process.cwd(), // Return current working directory instead of home
  },
}));

// Mock the browser's localStorage API
global.localStorage = {
  getItem: vi.fn(() => testDir),
  setItem: vi.fn(),
};

describe('Editor.vue', () => {
  it('formats date correctly', () => {
    const wrapper = mount(Editor, {
      shallow: true, // Use shallow mount to avoid mounting child components
    });

    const formattedDate = wrapper.vm.formatDate('2024_03_15.md');
    expect(formattedDate).toBe('Mar 15th, 2024');
  });

  it('saves file content correctly', async () => {
    const wrapper = mount(Editor);
    await wrapper.vm.loadEntries();
    await wrapper.vm.$nextTick();

    // Create a test entry
    const testEntry = {
      date: '2024_03_15.md',
      content: 'Hello World',
    };

    console.log('🚀 Before saving entry:', testEntry);

    // Save the entry
    await wrapper.vm.saveEntry(testEntry);
    await wrapper.vm.$nextTick();
  
    const fileContent = fs.readFileSync('test-journal/2024_03_15.md', 'utf8');
    expect(fileContent).toBe('Hello World');
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
