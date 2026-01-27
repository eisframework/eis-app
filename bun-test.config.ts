export default {
  test: {
    include: ['tests/**/*.{test,spec}.{js,ts,svelte}'],
    exclude: ['node_modules', 'dist', '.svelte-kit'],
    setupFiles: ['./tests/setup.ts'],
    // Disable cache for development
    cache: false,
    // Force sequential execution for database tests
    maxConcurrency: 1
  }
}
