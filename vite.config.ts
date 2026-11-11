import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Spicetify loads an extension as one classic <script>, so the build is a
// single self-contained IIFE: Vue, CSS, icons and the font are all inlined.
export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __VUE_OPTIONS_API__: 'false',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
  build: {
    target: 'chrome116',
    cssCodeSplit: false,
    lib: {
      entry: 'src/main.ts',
      formats: ['iife'],
      name: 'FloatExtension',
      fileName: () => 'float.js',
    },
  },
})
