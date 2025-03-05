import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.js',
        '**/*.d.ts',
        'coverage/**'
      ],
      include: [
        'electron-main.js',
        'src/**/*.{js,ts,vue}'
      ],
      all: true,
      extension: ['.js', '.ts', '.vue']
    }
  }
}) 