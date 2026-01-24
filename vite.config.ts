import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { resolve } from 'path'

const input = {
  app: resolve(__dirname, 'frontend/entry/app.ts'),
  index: resolve(__dirname, 'frontend/entry/index.ts'),
  css: resolve(__dirname, 'frontend/styles/app.css'),
};

export default defineConfig({
  plugins: [
    svelte(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend'),
      '@pages': path.resolve(__dirname, './frontend/pages'),
      '@components': path.resolve(__dirname, './frontend/components')
    }
  },
  build: {
    outDir: 'public',
    emptyOutDir: false,
    rollupOptions: {
      input,
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
})
