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
    reporters: ['verbose', 'json', 'html'],
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.{test,spec}.{ts,tsx}',
        '**/test-utils/**',
        'src/mocks/**',
        'src/**/*.d.ts',
        'vite.config.ts',
        'vitest.config.ts',
        'tailwind.config.ts',
        'postcss.config.js'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // Per-file thresholds for critical components
        'src/components/auth/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'src/contexts/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        },
        'src/hooks/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    // Enhanced test configuration for Phase 9
    testTimeout: 30000, // 30 seconds for comprehensive tests
    hookTimeout: 10000, // 10 seconds for setup/teardown
    
    // Test categorization patterns
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'src/**/__tests__/**/*.{test,spec}.{ts,tsx}'
    ],
    
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.nyc_output/**'
    ],
    
    // Performance and memory settings
    isolate: true, // Run tests in isolation for better performance measurement
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
        useAtomics: true
      }
    },
    
    // Browser testing support (for visual tests)
    browser: {
      enabled: false, // Enable when running browser tests
      name: 'chromium',
      provider: 'playwright',
      headless: true,
      viewport: {
        width: 1280,
        height: 720
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Optimize for test performance
  esbuild: {
    target: 'node14'
  },
  optimizeDeps: {
    include: [
      '@testing-library/react',
      '@testing-library/user-event',
      '@testing-library/jest-dom',
      'vitest',
      'jsdom'
    ]
  }
})