import { describe, it, expect, vi, beforeEach } from 'vitest';
import router from '../index.js';

// Mock the Vue Router createWebHistory
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    createWebHistory: vi.fn(() => ({
      location: '',
      state: {},
      push: vi.fn(),
      replace: vi.fn(),
      go: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      listen: vi.fn(),
      createHref: vi.fn(to => to),
    }))
  };
});

describe('Router Guards', () => {
  beforeEach(() => {
    // Reset router's current route before each test
    router.replace('/');
    
    // Clear all router guards before each test
    router.beforeEach(() => {});
    router.afterEach(() => {});
  });

  it('should allow adding a global before guard', () => {
    // Create a mock guard function
    const guardFn = vi.fn();
    
    // Add the guard
    const unregisterGuard = router.beforeEach(guardFn);
    
    // The router should return a function to unregister the guard
    expect(typeof unregisterGuard).toBe('function');
  });

  it('should allow adding a global after guard', () => {
    // Create a mock guard function
    const guardFn = vi.fn();
    
    // Add the guard
    const unregisterGuard = router.afterEach(guardFn);
    
    // The router should return a function to unregister the guard
    expect(typeof unregisterGuard).toBe('function');
  });

  it('should support navigation with guards', async () => {
    // Create a mock guard that allows navigation
    const beforeGuard = vi.fn((to, from, next) => {
      next();
    });
    
    // Add the guard
    router.beforeEach(beforeGuard);
    
    // Navigate to root
    await router.push('/');
    
    // Verify guard was called
    expect(beforeGuard).toHaveBeenCalled();
    
    // Verify current route
    expect(router.currentRoute.value.path).toBe('/');
  });
}); 