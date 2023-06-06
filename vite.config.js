import { defineConfig } from 'vite'
import Unfonts from 'unplugin-fonts/vite'
import families from './fonts'

export default defineConfig({
  define: {
    global: {
      window: {}
    },
  },
  plugins: [
    Unfonts({
      google: {
        families
      }
    }),
  ],
})
