import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const phasermsg = () => {
  return {
    name: 'phasermsg',
    buildStart() {
      process.stdout.write(`Building for production...\n`)
    },
    buildEnd() {
      const line = '---------------------------------------------------------'
      const msg = `❤️❤️❤️ Tell us about your game! - games@phaser.io ❤️❤️❤️`
      process.stdout.write(`${line}\n${msg}\n${line}\n`)

      process.stdout.write(`✨ Done ✨\n`)
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), phasermsg(), tsconfigPaths()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  logLevel: 'warning',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 2,
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
  },
})
