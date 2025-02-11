import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Editor from '../Editor.vue'

// Mock document methods used in component
document.querySelectorAll = vi.fn(() => [])

// Mock the Node.js 'fs' (filesystem) module
// This creates a mock object with commonly used fs methods
// All methods are mocked using vi.fn() to track calls
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(), // Mock checking if file/directory exists
    promises: {
      mkdir: vi.fn(), // Mock directory creation
      writeFile: vi.fn(), // Mock file writing
      readdir: vi.fn().mockResolvedValue([]), // Mock directory reading, returns empty array
      readFile: vi.fn() // Mock file reading
    },
    watch: vi.fn() // Mock file watching functionality
  }
}))

// Mock the Node.js 'path' module
// Provides a simplified version of path.join that concatenates with forward slashes
vi.mock('path', () => ({
  default: {
    join: (...args) => args.join('/'), // Mock path joining with forward slashes
  }
}))

// Mock the Node.js 'os' module
// Provides a mock homedir function that returns a consistent path
vi.mock('os', () => ({
  default: {
    homedir: () => '/home/user' // Mock home directory path
  }
}))

// Mock the browser's localStorage API
// This is needed because we're running in a Node.js environment where localStorage doesn't exist
global.localStorage = {
  getItem: vi.fn(), // Mock retrieving items from localStorage
  setItem: vi.fn() // Mock saving items to localStorage
}

describe('Editor.vue', () => {
  // Test the date formatting functionality
  it('formats date correctly', () => {
    const wrapper = mount(Editor, {
      shallow: true // Use shallow mount to avoid mounting child components
    })
    // Test with a specific date string in the format YYYY_MM_DD.md
    const formattedDate = wrapper.vm.formatDate('2024_03_15.md')
    // Expect the date to be formatted as "Month DDth, YYYY"
    expect(formattedDate).toBe('Mar 15th, 2024')
  })
}) 