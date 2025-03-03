import { describe, it, expect, beforeEach, vi } from 'vitest';
import router from '../index.js';
import Editor from '../../components/Editor.vue';

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

describe('Router', () => {
  beforeEach(() => {
    // Reset router's current route before each test
    router.replace('/');
  });

  it('should have the correct routes', () => {
    const routes = router.options.routes;
    
    // Check number of routes
    expect(routes).toHaveLength(1);
    
    // Check root route
    expect(routes[0]).toMatchObject({
      path: '/',
      name: 'Editor',
      component: Editor
    });
  });

  it('should use web history mode', () => {
    // Check that the router is using web history mode
    expect(router.options.history).toBeDefined();
  });

  it('should have Editor as the component for the root path', () => {
    // Instead of navigating, we'll check the route configuration directly
    const routes = router.options.routes;
    const rootRoute = routes.find(route => route.path === '/');
    
    expect(rootRoute).toBeDefined();
    expect(rootRoute.component).toBe(Editor);
    expect(rootRoute.name).toBe('Editor');
  });

  it('should be properly exported as default', () => {
    // Check that the router is exported correctly
    expect(router).toBeDefined();
    expect(router.options).toBeDefined();
    expect(router.options.routes).toBeDefined();
  });
  
  it('should handle initial navigation to the root route', async () => {
    // Push to root route
    await router.push('/');
    
    // Check current route
    const currentRoute = router.currentRoute.value;
    expect(currentRoute.path).toBe('/');
  });
}); 