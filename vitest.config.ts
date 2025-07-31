import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.{test,spec}.{ts,tsx}',
        '**/test-utils.tsx',
        'src/mocks/**',
      ],
    },
    // Performance test configuration
    testTimeout: 30000, // 30 seconds for performance tests
    hookTimeout: 10000, // 10 seconds for setup/teardown
    // Separate test patterns for performance tests
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'src/**/__tests__/**/*.{test,spec}.{ts,tsx}'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})