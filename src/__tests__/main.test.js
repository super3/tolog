import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create spies
const appUseSpy = vi.fn().mockReturnThis();
const appMountSpy = vi.fn();
const createAppSpy = vi.fn(() => ({
  use: appUseSpy,
  mount: appMountSpy
}));
const createVuetifySpy = vi.fn();

// Mock dependencies
vi.mock('vue', () => ({
  createApp: createAppSpy
}));

vi.mock('../router', () => ({
  default: 'mockedRouter'
}));

// Mock CSS imports
vi.mock('vuetify/styles', () => ({}));
vi.mock('@mdi/font/css/materialdesignicons.css', () => ({}));

// Mock Vuetify
vi.mock('vuetify', () => ({
  createVuetify: createVuetifySpy
}));

vi.mock('vuetify/components', () => ({}));
vi.mock('vuetify/directives', () => ({}));
vi.mock('vuetify/iconsets/mdi', () => ({
  aliases: {},
  mdi: {}
}));

// Mock the App component
vi.mock('../App.vue', () => ({
  default: 'mockedApp'
}));

// Mock path
vi.mock('path', () => ({
  default: {
    join: vi.fn()
  }
}));

describe('main.js', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Reset modules to ensure a clean import
    vi.resetModules();
  });

  it('creates and configures the Vue app correctly', async () => {
    // Import main.js (this will execute the code)
    await import('../main.js');

    // Verify that createApp was called with the App component
    expect(createAppSpy).toHaveBeenCalledWith('mockedApp');
    
    // Verify that app.use was called twice (router and vuetify)
    expect(appUseSpy).toHaveBeenCalledTimes(2);
    expect(appUseSpy).toHaveBeenCalledWith('mockedRouter');
    
    // Verify that app.mount was called with '#app'
    expect(appMountSpy).toHaveBeenCalledWith('#app');
  });

  it('initializes Vuetify with the correct configuration', async () => {
    // Import main.js
    await import('../main.js');
    
    // Verify createVuetify was called
    expect(createVuetifySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        components: expect.any(Object),
        directives: expect.any(Object),
        icons: expect.objectContaining({
          defaultSet: 'mdi'
        })
      })
    );
  });
}); 