import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Editor from '../Editor.vue'
import path from 'path'
import fs from 'fs'

// Mock document methods used in component
document.querySelectorAll = vi.fn(() => [])

// Get the test directory path relative to the current project
const testDir = path.join(process.cwd(), 'test-journal')

// Mock the Node.js 'fs' (filesystem) module
const mockWatch = vi.fn((path, callback) => {
  return {
    close: vi.fn()
  }
})

// Track file writes
// let mockWriteFile = vi.fn()
let mockWriteFile = new File(["Hello World1"], "2024_03_15.md", { type: "text/plain" })

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => true),
    promises: {
      mkdir: vi.fn(),
      writeFile: mockWriteFile,
      readdir: vi.fn().mockResolvedValue(['2024_03_15.md']),
      readFile: vi.fn().mockResolvedValue('')
    },
    watch: mockWatch
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
    homedir: () => process.cwd() // Return current working directory instead of home
  }
}))

// Mock the browser's localStorage API
// This is needed because we're running in a Node.js environment where localStorage doesn't exist
global.localStorage = {
  getItem: vi.fn(() => testDir),
  setItem: vi.fn()
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

  it('saves file content correctly', async () => {
    const wrapper = mount(Editor)
    await wrapper.vm.loadEntries()
    await wrapper.vm.$nextTick()

    // Create a test entry
    const testEntry = {
      date: '2024_03_15.md',
      content: 'Hello World'
    }

    // Save the entry
    await wrapper.vm.saveEntry(testEntry)
    
    // Wait for the debounce timeout
    await new Promise(resolve => setTimeout(resolve, 300))

    // Log the actual calls to help debug
    console.log('MockWriteFile calls:', mockWriteFile.mock.calls)

    // Verify the file was saved with correct content
    expect(mockWriteFile).toHaveBeenCalledWith(
      `${testDir}/2024_03_15.md`,
      'Hello World',
      'utf8'
    )
  })
}) 